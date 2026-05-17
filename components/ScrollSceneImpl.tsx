'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, MeshTransmissionMaterial, Sparkles } from '@react-three/drei'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { useTheme } from './ThemeProvider'

// ============================================================================
//  GEOMETRY PROFILES — outer glass + liquid (revolved around Y via lathe)
// ============================================================================
const VIAL_PROFILE: THREE.Vector2[] = [
  new THREE.Vector2(0.00, -1.35),
  new THREE.Vector2(0.10, -1.36),
  new THREE.Vector2(0.55, -1.38),
  new THREE.Vector2(0.72, -1.32),
  new THREE.Vector2(0.74, -1.20),
  new THREE.Vector2(0.74,  1.30),
  new THREE.Vector2(0.70,  1.36),
  new THREE.Vector2(0.55,  1.55),
  new THREE.Vector2(0.42,  1.68),
  new THREE.Vector2(0.42,  1.96),
  new THREE.Vector2(0.40,  1.98),
]

const LIQUID_PROFILE: THREE.Vector2[] = [
  new THREE.Vector2(0.00, -1.28),
  new THREE.Vector2(0.66, -1.28),
  new THREE.Vector2(0.66,  0.40),
  new THREE.Vector2(0.62,  0.46),
  new THREE.Vector2(0.45,  0.50),
  new THREE.Vector2(0.20,  0.51),
  new THREE.Vector2(0.00,  0.50),
]

// ============================================================================
//  PRNG
// ============================================================================
function mulberry32(seed: number) {
  let s = seed
  return () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// ============================================================================
//  DNA DOUBLE HELIX — the centerpiece inside the bottle
//  Two parametric helical curves with rung connectors. The whole thing lives
//  in the upper half of the liquid volume so it appears to be rising out.
// ============================================================================
function makeHelixCurves(turns: number, height: number, radius: number, samples: number) {
  const a: THREE.Vector3[] = []
  const b: THREE.Vector3[] = []
  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    const angle = t * Math.PI * 2 * turns
    const y = -height / 2 + t * height
    a.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius))
    b.push(new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius))
  }
  return {
    curveA: new THREE.CatmullRomCurve3(a),
    curveB: new THREE.CatmullRomCurve3(b),
  }
}

function DnaHelix({
  pageRef,
  opacityRef,
  accent,
  accent2,
}: {
  pageRef: RefObject<number>
  opacityRef: RefObject<number>
  accent: string
  accent2: string
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const strandAMat = useRef<THREE.MeshStandardMaterial>(null!)
  const strandBMat = useRef<THREE.MeshStandardMaterial>(null!)
  const rungMatsRef = useRef<THREE.MeshStandardMaterial[]>([])

  const turns = 2.6
  const height = 1.55
  const radius = 0.34

  // Strand geometries (tubes along the helical curves)
  const tubeA = useMemo(() => {
    const { curveA } = makeHelixCurves(turns, height, radius, 160)
    return new THREE.TubeGeometry(curveA, 200, 0.038, 8, false)
  }, [])
  const tubeB = useMemo(() => {
    const { curveB } = makeHelixCurves(turns, height, radius, 160)
    return new THREE.TubeGeometry(curveB, 200, 0.038, 8, false)
  }, [])

  // Rung positions/orientations — placed every fraction along the helix
  const rungs = useMemo(() => {
    const { curveA, curveB } = makeHelixCurves(turns, height, radius, 160)
    const count = 20
    const list: { pos: THREE.Vector3; quat: THREE.Quaternion; length: number }[] = []
    const up = new THREE.Vector3(0, 1, 0)
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count
      const p1 = curveA.getPoint(t)
      const p2 = curveB.getPoint(t)
      const dir = p2.clone().sub(p1)
      const length = dir.length()
      dir.normalize()
      const pos = p1.clone().add(p2).multiplyScalar(0.5)
      const quat = new THREE.Quaternion().setFromUnitVectors(up, dir)
      list.push({ pos, quat, length })
    }
    return list
  }, [])

  // Collect rung material refs as they mount, for opacity control.
  const collectRungMat = (mat: THREE.MeshStandardMaterial | null) => {
    if (mat && !rungMatsRef.current.includes(mat)) rungMatsRef.current.push(mat)
  }

  useFrame(() => {
    const p = pageRef.current
    const vis = opacityRef.current
    if (!groupRef.current) return
    // Slow inner rotation tied to scroll, on top of whatever the parent does.
    groupRef.current.rotation.y = p * Math.PI * 2.6
    if (strandAMat.current) strandAMat.current.opacity = vis
    if (strandBMat.current) strandBMat.current.opacity = vis
    for (const m of rungMatsRef.current) m.opacity = vis * 0.85
  })

  return (
    <group ref={groupRef} position={[0, 0.28, 0]}>
      {/* strand A — cyan */}
      <mesh geometry={tubeA}>
        <meshStandardMaterial
          ref={strandAMat}
          color={accent}
          emissive={accent}
          emissiveIntensity={1.2}
          roughness={0.32}
          metalness={0.45}
          toneMapped={false}
          transparent
          opacity={1}
        />
      </mesh>
      {/* strand B — magenta/indigo */}
      <mesh geometry={tubeB}>
        <meshStandardMaterial
          ref={strandBMat}
          color={accent2}
          emissive={accent2}
          emissiveIntensity={1.2}
          roughness={0.32}
          metalness={0.45}
          toneMapped={false}
          transparent
          opacity={1}
        />
      </mesh>
      {/* rungs — alternating colors */}
      {rungs.map((r, i) => (
        <mesh key={i} position={r.pos.toArray()} quaternion={r.quat}>
          <cylinderGeometry args={[0.018, 0.018, r.length, 6]} />
          <meshStandardMaterial
            ref={collectRungMat}
            color={i % 2 === 0 ? accent : accent2}
            emissive={i % 2 === 0 ? accent : accent2}
            emissiveIntensity={0.9}
            roughness={0.35}
            metalness={0.3}
            toneMapped={false}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  )
}

// ============================================================================
//  SCALE MARKINGS — etched onto a flat plane positioned in front of the bottle.
//  Drawn via CanvasTexture so we get crisp numerals at any zoom.
// ============================================================================
function useScaleTexture(isDark: boolean) {
  return useMemo(() => {
    const W = 128, H = 512
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, W, H)
    const stroke = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(15,23,42,0.75)'
    ctx.strokeStyle = stroke
    ctx.fillStyle = stroke
    ctx.lineWidth = 2
    ctx.font = '600 22px monospace'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'

    const total = 100
    for (let i = 0; i <= total; i += 5) {
      const y = H - (i / total) * H + 0.5
      const isLong = i % 20 === 0
      const tickW = isLong ? 38 : 18
      ctx.beginPath()
      ctx.moveTo(W - tickW, y)
      ctx.lineTo(W - 4, y)
      ctx.stroke()
      if (isLong && i > 0 && i < total) {
        ctx.fillText(String(i), W - 48, y)
      }
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    tex.anisotropy = 4
    return tex
  }, [isDark])
}

function ScaleMarkings({ opacityRef, isDark }: { opacityRef: RefObject<number>; isDark: boolean }) {
  const tex = useScaleTexture(isDark)
  const matRef = useRef<THREE.MeshBasicMaterial>(null!)
  useFrame(() => {
    if (matRef.current) matRef.current.opacity = opacityRef.current * 0.55
  })
  return (
    // Slightly in front of the glass on the left side (matches reference)
    <mesh position={[-0.45, -0.2, 0.74]} rotation={[0, 0.05, 0]}>
      <planeGeometry args={[0.35, 1.6]} />
      <meshBasicMaterial
        ref={matRef}
        map={tex}
        transparent
        depthWrite={false}
        toneMapped={false}
        opacity={0.55}
      />
    </mesh>
  )
}

// ============================================================================
//  MOLECULE SKETCHES — small wireframe structural-formula doodles
//  near the top of the liquid, drifting gently.
// ============================================================================
function moleculeGeometry() {
  const pts: number[] = []
  const r = 0.06
  // hexagon
  for (let i = 0; i < 6; i++) {
    const a1 = (i / 6) * Math.PI * 2
    const a2 = ((i + 1) / 6) * Math.PI * 2
    pts.push(Math.cos(a1) * r, Math.sin(a1) * r, 0)
    pts.push(Math.cos(a2) * r, Math.sin(a2) * r, 0)
  }
  // pendant arms
  pts.push(r, 0, 0,             r + 0.06, 0.04, 0)
  pts.push(r + 0.06, 0.04, 0,   r + 0.12, 0.04, 0)
  pts.push(-r, 0, 0,            -r - 0.05, -0.04, 0)
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
  return g
}

function MoleculeSketches({ pageRef, opacityRef, color }: {
  pageRef: RefObject<number>
  opacityRef: RefObject<number>
  color: string
}) {
  const geo = useMemo(moleculeGeometry, [])
  const refs = useRef<THREE.LineSegments[]>([])
  const matRef = useRef<THREE.LineBasicMaterial>(null!)

  const positions: [number, number, number][] = useMemo(() => [
    [0.18, 0.36, 0.25],
    [-0.20, 0.42, 0.15],
    [0.05, 0.32, -0.18],
  ], [])

  useFrame(() => {
    const p = pageRef.current
    refs.current.forEach((r, i) => {
      if (!r) return
      r.rotation.z = p * Math.PI * (i % 2 === 0 ? 1.2 : -1.5)
      r.position.y = positions[i][1] + Math.sin(p * Math.PI * 2 + i) * 0.04
    })
    if (matRef.current) matRef.current.opacity = opacityRef.current * 0.7
  })

  return (
    <>
      {positions.map((pos, i) => (
        <lineSegments
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el
          }}
          position={pos}
          geometry={geo}
          scale={i === 1 ? 0.8 : 1}
        >
          <lineBasicMaterial
            ref={i === 0 ? matRef : undefined}
            color={color}
            transparent
            opacity={0.7}
            toneMapped={false}
          />
        </lineSegments>
      ))}
    </>
  )
}

// ============================================================================
//  PARTICLE FIELD — molecules that emerge from the shatter
// ============================================================================
interface ParticleData {
  origin: THREE.Vector3
  scatter: THREE.Vector3
  size: number
  color: 0 | 1
}

function useParticles(count: number): ParticleData[] {
  return useMemo(() => {
    const rand = mulberry32(7)
    const list: ParticleData[] = []
    for (let i = 0; i < count; i++) {
      const yFrac = rand()
      const y = -1.3 + yFrac * 3.3
      const r = y < 1.3 ? 0.74 : y < 1.55 ? 0.55 : 0.42
      const a = rand() * Math.PI * 2
      const origin = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r)
      const scatter = new THREE.Vector3(
        (rand() - 0.5) * 7.0,
        (rand() - 0.5) * 3.6,
        (rand() - 0.5) * 2.4,
      )
      list.push({
        origin,
        scatter,
        size: 0.04 + rand() * 0.06,
        color: (rand() > 0.5 ? 1 : 0) as 0 | 1,
      })
    }
    return list
  }, [count])
}

function ParticleField({
  pageRef,
  explodeRef,
  accent,
  accent2,
  count = 56,
}: {
  pageRef: RefObject<number>
  explodeRef: RefObject<number>
  accent: string
  accent2: string
  count?: number
}) {
  const data = useParticles(count)
  const { viewport } = useThree()
  const isNarrow = viewport.width < 7

  const idxA: number[] = [], idxB: number[] = []
  data.forEach((d, i) => (d.color === 0 ? idxA : idxB).push(i))

  const groupRef = useRef<THREE.Group>(null!)
  const refA = useRef<THREE.InstancedMesh>(null!)
  const refB = useRef<THREE.InstancedMesh>(null!)
  const matA = useRef<THREE.MeshStandardMaterial>(null!)
  const matB = useRef<THREE.MeshStandardMaterial>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    if (refA.current) refA.current.instanceMatrix.needsUpdate = true
    if (refB.current) refB.current.instanceMatrix.needsUpdate = true
  }, [])

  useFrame(() => {
    const p = pageRef.current
    const e = explodeRef.current
    const ee = easeInOutCubic(e)

    const emerge = Math.min(1, e * 3)
    const fadeOut = 1 - Math.max(0, Math.min(1, (p - 0.5) / 0.45))
    const alpha = emerge * fadeOut
    if (matA.current) matA.current.opacity = alpha
    if (matB.current) matB.current.opacity = alpha

    if (groupRef.current) {
      const bottleX = isNarrow ? 0 : 1.7
      const bottleY = isNarrow ? 0.9 : -0.9
      const cx = bottleX * (1 - ee) - p * (isNarrow ? -0.1 : 1.2) * (1 - ee)
      const cy = bottleY * (1 - ee) - p * 0.4
      groupRef.current.position.set(cx, cy, 0)
      groupRef.current.rotation.y = Math.max(0, p - 0.35) * Math.PI * 1.4
      groupRef.current.scale.setScalar(isNarrow ? 0.55 : 1)
    }

    const writeBatch = (mesh: THREE.InstancedMesh | null, indices: number[]) => {
      if (!mesh) return
      for (let k = 0; k < indices.length; k++) {
        const d = data[indices[k]]
        dummy.position.set(
          d.origin.x + (d.scatter.x - d.origin.x) * ee,
          d.origin.y + (d.scatter.y - d.origin.y) * ee,
          d.origin.z + (d.scatter.z - d.origin.z) * ee,
        )
        dummy.scale.setScalar(d.size * (0.4 + ee * 0.7))
        dummy.rotation.y = p * Math.PI * 2 * (d.size * 12)
        dummy.updateMatrix()
        mesh.setMatrixAt(k, dummy.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
    }

    writeBatch(refA.current, idxA)
    writeBatch(refB.current, idxB)
  })

  return (
    <group ref={groupRef}>
      <instancedMesh ref={refA} args={[undefined, undefined, idxA.length]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          ref={matA}
          color={accent}
          emissive={accent}
          emissiveIntensity={1.6}
          toneMapped={false}
          transparent
          opacity={0}
        />
      </instancedMesh>
      <instancedMesh ref={refB} args={[undefined, undefined, idxB.length]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          ref={matB}
          color={accent2}
          emissive={accent2}
          emissiveIntensity={1.6}
          toneMapped={false}
          transparent
          opacity={0}
        />
      </instancedMesh>
    </group>
  )
}

// ============================================================================
//  VIAL — assembled-state container that holds the glass + cap + liquid +
//  DNA helix + scale + molecule sketches. Everything fades together as
//  explodeProgress rises.
// ============================================================================
function Vial({
  pageRef,
  explodeRef,
  liquidColor,
  capColor,
  accent,
  accent2,
  isDark,
  perfTier,
}: {
  pageRef: RefObject<number>
  explodeRef: RefObject<number>
  liquidColor: string
  capColor: string
  accent: string
  accent2: string
  isDark: boolean
  perfTier: 'high' | 'low'
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const liquidMatRef = useRef<THREE.MeshPhysicalMaterial>(null!)
  const capRefs = useRef<THREE.MeshStandardMaterial[]>([])
  const meniscusMatRef = useRef<THREE.MeshPhysicalMaterial>(null!)
  const { viewport } = useThree()
  const isNarrow = viewport.width < 7

  // Opacity ref for child components (DNA, scale, molecules)
  const visRef = useRef(1)

  useFrame((state) => {
    if (!groupRef.current) return
    const p = pageRef.current
    const e = explodeRef.current
    const t = state.clock.elapsedTime

    const baseX = isNarrow ? 0 : 1.7
    const baseY = isNarrow ? 0.9 : -0.9

    const idleFactor = Math.max(0, 1 - p / 0.08)
    const idleSpin = t * 0.35 * idleFactor

    groupRef.current.rotation.y = p * Math.PI * 1.6 + idleSpin
    groupRef.current.rotation.x = p * 0.4 + Math.sin(t * 0.4) * 0.04 * idleFactor
    groupRef.current.rotation.z = -p * 0.25
    groupRef.current.position.x = baseX - p * (isNarrow ? -0.1 : 1.2)
    groupRef.current.position.y = baseY - p * 0.4 + Math.sin(t * 0.5) * 0.04 * idleFactor
    groupRef.current.scale.setScalar((isNarrow ? 0.52 : 1) + p * 0.18)

    const vis = Math.max(0, 1 - e * 1.15)
    visRef.current = vis
    if (liquidMatRef.current) liquidMatRef.current.opacity = vis * 0.85
    if (meniscusMatRef.current) meniscusMatRef.current.opacity = vis * 0.7
    for (const m of capRefs.current) m.opacity = vis
  })

  const collectCap = (mat: THREE.MeshStandardMaterial | null) => {
    if (mat && !capRefs.current.includes(mat)) capRefs.current.push(mat)
  }

  // Transmission-material quality budget — sharper on desktop, lighter on mobile
  const transmissionSamples = perfTier === 'high' ? 6 : 3
  const transmissionResolution = perfTier === 'high' ? 512 : 256

  return (
    <group ref={groupRef}>
      {/* ─── IRIDESCENT GLASS SHELL — transmission + chromatic aberration ─── */}
      <mesh>
        <latheGeometry args={[VIAL_PROFILE, 40]} />
        <MeshTransmissionMaterial
          background={undefined}
          transmission={1}
          thickness={1.8}
          roughness={0.12}
          chromaticAberration={0.08}
          anisotropicBlur={0.1}
          temporalDistortion={0.04}
          distortion={0.12}
          distortionScale={0.4}
          ior={1.45}
          samples={transmissionSamples}
          resolution={transmissionResolution}
          color={isDark ? '#cffafe' : '#a5f3fc'}
          attenuationDistance={4}
          attenuationColor={isDark ? '#67e8f9' : '#22d3ee'}
        />
      </mesh>

      {/* ─── LIQUID — sits in the lower portion; gradient tint cyan→magenta ─── */}
      <mesh>
        <latheGeometry args={[LIQUID_PROFILE, 40]} />
        <meshPhysicalMaterial
          ref={liquidMatRef}
          color={liquidColor}
          transmission={0.7}
          thickness={1.4}
          ior={1.34}
          roughness={0.1}
          attenuationColor={accent2}
          attenuationDistance={1.4}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* meniscus (slight dome on the surface) */}
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[0.65, 24, 8, 0, Math.PI * 2, 0, Math.PI / 8]} />
        <meshPhysicalMaterial
          ref={meniscusMatRef}
          color={accent}
          transmission={0.9}
          thickness={0.3}
          ior={1.34}
          roughness={0.05}
          transparent
          opacity={0.7}
          toneMapped={false}
        />
      </mesh>

      {/* ─── RUBBER STOPPER (inside neck) ─── */}
      <mesh position={[0, 1.82, 0]}>
        <cylinderGeometry args={[0.39, 0.39, 0.25, 24]} />
        <meshStandardMaterial ref={collectCap} color="#23272f" roughness={0.85} metalness={0.05} transparent opacity={1} />
      </mesh>

      {/* ─── ALUMINUM CRIMP RING ─── */}
      <mesh position={[0, 1.99, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.07, 36]} />
        <meshStandardMaterial ref={collectCap} color="#dde3ea" metalness={0.85} roughness={0.32} transparent opacity={1} />
      </mesh>
      {/* ─── COLORED CAP BODY ─── */}
      <mesh position={[0, 2.14, 0]}>
        <cylinderGeometry args={[0.40, 0.46, 0.22, 36]} />
        <meshStandardMaterial ref={collectCap} color={capColor} metalness={0.4} roughness={0.45} transparent opacity={1} />
      </mesh>
      {/* ─── DOMED CAP TOP ─── */}
      <mesh position={[0, 2.25, 0]}>
        <sphereGeometry args={[0.40, 36, 14, 0, Math.PI * 2, 0, Math.PI / 6]} />
        <meshStandardMaterial ref={collectCap} color={capColor} metalness={0.4} roughness={0.45} transparent opacity={1} />
      </mesh>

      {/* ─── DNA DOUBLE HELIX inside the bottle ─── */}
      <DnaHelix pageRef={pageRef} opacityRef={visRef} accent={accent} accent2={accent2} />

      {/* ─── SCALE MARKINGS — etched plane in front of the glass ─── */}
      <ScaleMarkings opacityRef={visRef} isDark={isDark} />

      {/* ─── FLOATING MOLECULE SKETCHES near the top of the liquid ─── */}
      <MoleculeSketches pageRef={pageRef} opacityRef={visRef} color={accent2} />
    </group>
  )
}

// ============================================================================
//  SCENE ROOT
// ============================================================================
export default function ScrollSceneImpl({
  pageRef,
  explodeRef,
}: {
  pageRef: RefObject<number>
  explodeRef: RefObject<number>
}) {
  const { resolved } = useTheme()
  const isDark = resolved === 'dark'

  const accent = isDark ? '#22d3ee' : '#0e7490'
  const accent2 = isDark ? '#c084fc' : '#a855f7'  // a bit more magenta to match reference
  const capColor = isDark ? '#c4b5fd' : '#a78bfa'
  const liquidColor = isDark ? '#67e8f9' : '#7dd3fc'

  // Coarse perf tier: lower the transmission cost on narrow viewports.
  const perfTier: 'high' | 'low' =
    typeof window !== 'undefined' && window.innerWidth < 900 ? 'low' : 'high'

  return (
    <Canvas
      camera={{ position: [0, 0.5, 6.8], fov: 42 }}
      dpr={[1, perfTier === 'high' ? 1.5 : 1.25]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop="always"
      shadows={false}
      style={{ background: 'transparent', display: 'block', width: '100%', height: '100%' }}
    >
      {/* Soft cinematic lighting — cool key + warm accent fill */}
      <ambientLight intensity={isDark ? 0.36 : 0.6} />
      <directionalLight position={[5, 6, 6]} intensity={isDark ? 1.0 : 1.3} color="#ffffff" />
      <directionalLight position={[-6, 2, 3]} intensity={0.55} color={accent} />
      <directionalLight position={[-1, -2, -5]} intensity={0.7} color={accent2} />
      <pointLight position={[0, -0.2, 0.4]} intensity={0.9} color={accent} distance={2.5} />
      <pointLight position={[0.4, 0.6, 0.6]} intensity={0.6} color={accent2} distance={2} />

      {/* Subtle sparkle dust around the cap area */}
      <Sparkles count={perfTier === 'high' ? 28 : 14} scale={[2.2, 3.5, 2.2]} position={[0, 0.6, 0]} size={2.4} speed={0.3} opacity={0.6} color={accent} />

      {/* Floor shadow underneath the bottle */}
      <ContactShadows position={[0, -1.5, 0]} opacity={0.35} blur={3} far={3} resolution={256} color={isDark ? '#000000' : '#0f172a'} />

      <Vial
        pageRef={pageRef}
        explodeRef={explodeRef}
        liquidColor={liquidColor}
        capColor={capColor}
        accent={accent}
        accent2={accent2}
        isDark={isDark}
        perfTier={perfTier}
      />

      <ParticleField pageRef={pageRef} explodeRef={explodeRef} accent={accent} accent2={accent2} />
    </Canvas>
  )
}
