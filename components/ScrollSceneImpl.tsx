'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { useTheme } from './ThemeProvider'

// ----------------------------------------------------------------------------
// Vial profile (revolved around Y). Single mesh → single transmission pass.
// ----------------------------------------------------------------------------
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
  new THREE.Vector2(0.66,  0.20),
  new THREE.Vector2(0.62,  0.26),
  new THREE.Vector2(0.45,  0.30),
  new THREE.Vector2(0.20,  0.31),
  new THREE.Vector2(0.00,  0.30),
]

// ----------------------------------------------------------------------------
// Deterministic PRNG so layout stays stable across renders.
// ----------------------------------------------------------------------------
function mulberry32(seed: number) {
  let s = seed
  return () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface ParticleData {
  origin: THREE.Vector3   // where the particle sits when the bottle is assembled
  scatter: THREE.Vector3  // where it ends up when fully exploded
  size: number
  color: 0 | 1            // 0 = accent, 1 = accent2
}

function useParticles(count: number): ParticleData[] {
  return useMemo(() => {
    const rand = mulberry32(7)
    const list: ParticleData[] = []
    for (let i = 0; i < count; i++) {
      // origin: random point on bottle surface (mostly cylinder, some on neck/shoulder)
      const yFrac = rand()
      const y = -1.3 + yFrac * 3.3
      const r = y < 1.3 ? 0.74 : y < 1.55 ? 0.55 : 0.42
      const a = rand() * Math.PI * 2
      const origin = new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r)

      // scatter target: outward from the Y-axis, mostly horizontal, with bounded vertical/depth
      const sa = a + (rand() - 0.5) * 0.9
      const dist = 1.8 + rand() * 2.6
      const scatter = new THREE.Vector3(
        Math.cos(sa) * dist,
        origin.y + (rand() - 0.5) * 2.2,
        Math.sin(sa) * dist * 0.55 + (rand() - 0.5) * 0.7,
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

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function Vial({
  pageRef,
  explodeRef,
  liquidColor,
  capColor,
  accent,
  accent2,
  isDark,
}: {
  pageRef: RefObject<number>
  explodeRef: RefObject<number>
  liquidColor: string
  capColor: string
  accent: string
  accent2: string
  isDark: boolean
}) {
  const groupRef = useRef<THREE.Group>(null!)
  const glassMatRef = useRef<THREE.MeshPhysicalMaterial>(null!)
  const liquidMatRef = useRef<THREE.MeshPhysicalMaterial>(null!)
  const capRefs = useRef<THREE.MeshStandardMaterial[]>([])
  const { viewport } = useThree()
  const isNarrow = viewport.width < 6

  useFrame((state) => {
    if (!groupRef.current) return
    const p = pageRef.current
    const e = explodeRef.current
    const t = state.clock.elapsedTime

    // Mobile: bottle in TOP zone (positive Y world space), text owns the bottom half.
    // Desktop: less right-offset than before for a more balanced layout.
    const baseX = isNarrow ? 0 : 1.7
    const baseY = isNarrow ? 0.9 : -0.9

    // Idle spin ONLY at the very top of the page so it feels alive on load.
    // Blends out fully by p=0.08 — after that, motion is purely scroll-driven.
    const idleFactor = Math.max(0, 1 - p / 0.08)
    const idleSpin = t * 0.35 * idleFactor

    groupRef.current.rotation.y = p * Math.PI * 1.6 + idleSpin
    groupRef.current.rotation.x = p * 0.4 + Math.sin(t * 0.4) * 0.04 * idleFactor
    groupRef.current.rotation.z = -p * 0.25
    groupRef.current.position.x = baseX - p * (isNarrow ? -0.1 : 1.2)
    groupRef.current.position.y = baseY - p * 0.4 + Math.sin(t * 0.5) * 0.04 * idleFactor
    groupRef.current.scale.setScalar((isNarrow ? 0.52 : 1) + p * 0.18)

    // Fade everything out as the bottle "shatters". Visibility done via opacity
    // so the group still casts particles' parent transform usefully.
    const vis = Math.max(0, 1 - e * 1.15)
    if (glassMatRef.current) glassMatRef.current.opacity = vis * 0.92
    if (liquidMatRef.current) liquidMatRef.current.opacity = vis * 0.88
    for (const m of capRefs.current) m.opacity = vis
  })

  const glassProps = {
    color: '#ffffff' as const,
    transmission: 0.97,
    thickness: 0.45,
    ior: 1.5,
    roughness: 0.04,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    attenuationDistance: 5,
    attenuationColor: (isDark ? '#cffafe' : '#e0f2fe') as `#${string}`,
    envMapIntensity: 1,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  }

  const collectCap = (mat: THREE.MeshStandardMaterial | null) => {
    if (mat && !capRefs.current.includes(mat)) capRefs.current.push(mat)
  }

  return (
    <group ref={groupRef}>
      <mesh>
        <latheGeometry args={[VIAL_PROFILE, 40]} />
        <meshPhysicalMaterial ref={glassMatRef} {...glassProps} />
      </mesh>
      <mesh>
        <latheGeometry args={[LIQUID_PROFILE, 40]} />
        <meshPhysicalMaterial
          ref={liquidMatRef}
          color={liquidColor}
          transmission={0.82}
          thickness={1.8}
          ior={1.34}
          roughness={0.08}
          attenuationColor={accent}
          attenuationDistance={1.6}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.88}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 1.82, 0]}>
        <cylinderGeometry args={[0.39, 0.39, 0.25, 24]} />
        <meshStandardMaterial ref={collectCap} color="#23272f" roughness={0.85} metalness={0.05} transparent opacity={1} />
      </mesh>
      {/* aluminum crimp ring — thin metal seam at base of cap */}
      <mesh position={[0, 1.99, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.07, 36]} />
        <meshStandardMaterial ref={collectCap} color="#dde3ea" metalness={0.85} roughness={0.32} transparent opacity={1} />
      </mesh>
      {/* full-cover colored flip-off cap (matches product photos) */}
      <mesh position={[0, 2.14, 0]}>
        <cylinderGeometry args={[0.40, 0.46, 0.22, 36]} />
        <meshStandardMaterial ref={collectCap} color={capColor} metalness={0.4} roughness={0.45} transparent opacity={1} />
      </mesh>
      {/* domed cap top */}
      <mesh position={[0, 2.25, 0]}>
        <sphereGeometry args={[0.40, 36, 14, 0, Math.PI * 2, 0, Math.PI / 6]} />
        <meshStandardMaterial ref={collectCap} color={capColor} metalness={0.4} roughness={0.45} transparent opacity={1} />
      </mesh>

      {/* label */}
      <mesh position={[0, -0.1, 0.75]}>
        <planeGeometry args={[1.08, 0.95]} />
        <meshStandardMaterial ref={collectCap} color="#ffffff" roughness={0.7} metalness={0.05} transparent opacity={1} />
      </mesh>
      <mesh position={[0, 0.32, 0.751]}>
        <planeGeometry args={[1.08, 0.12]} />
        <meshStandardMaterial ref={collectCap} color={accent} emissive={accent} emissiveIntensity={0.4} toneMapped={false} transparent opacity={1} />
      </mesh>
      <mesh position={[-0.25, 0.10, 0.752]}>
        <planeGeometry args={[0.5, 0.07]} />
        <meshStandardMaterial ref={collectCap} color="#0f172a" transparent opacity={1} />
      </mesh>
      <mesh position={[-0.18, -0.03, 0.752]}>
        <planeGeometry args={[0.6, 0.04]} />
        <meshStandardMaterial ref={collectCap} color="#475569" transparent opacity={1} />
      </mesh>
      <mesh position={[-0.27, -0.13, 0.752]}>
        <planeGeometry args={[0.35, 0.04]} />
        <meshStandardMaterial ref={collectCap} color="#475569" transparent opacity={1} />
      </mesh>
      <mesh position={[0.33, -0.22, 0.752]}>
        <planeGeometry args={[0.2, 0.2]} />
        <meshStandardMaterial ref={collectCap} color="#0f172a" transparent opacity={1} />
      </mesh>
      <mesh position={[0.34, 0.10, 0.752]}>
        <planeGeometry args={[0.22, 0.08]} />
        <meshStandardMaterial ref={collectCap} color={accent2} emissive={accent2} emissiveIntensity={0.3} toneMapped={false} transparent opacity={1} />
      </mesh>
    </group>
  )
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
  const isNarrow = viewport.width < 6

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

    // 1) emerge from the shattered bottle quickly (0→1 over e=0..0.33)
    // 2) slowly fade away over the second half of the page (p=0.5→0.95)
    const emerge = Math.min(1, e * 3)
    const fadeOut = 1 - Math.max(0, Math.min(1, (p - 0.5) / 0.45))
    const alpha = emerge * fadeOut
    if (matA.current) matA.current.opacity = alpha
    if (matB.current) matB.current.opacity = alpha

    // Group transform: position + rotate the whole field, mobile-scaled to fit
    if (groupRef.current) {
      const baseX = isNarrow ? 0 : 2.4
      const baseY = isNarrow ? 1.1 : -0.9
      groupRef.current.position.set(
        baseX - p * (isNarrow ? -0.1 : 1.2),
        baseY - p * 0.4,
        0,
      )
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
  const accent2 = isDark ? '#a78bfa' : '#6d28d9'
  const capColor = isDark ? '#22d3ee' : '#0891b2'
  const liquidColor = isDark ? '#7dd3fc' : '#bae6fd'

  return (
    <Canvas
      camera={{ position: [0, 0.6, 6.6], fov: 42 }}
      dpr={[1, 1.25]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop="always"
      shadows={false}
      style={{ background: 'transparent', display: 'block', width: '100%', height: '100%' }}
    >
      <ambientLight intensity={isDark ? 0.42 : 0.7} />
      <directionalLight position={[5, 6, 6]} intensity={isDark ? 1.0 : 1.3} color="#ffffff" />
      <directionalLight position={[-6, 2, 3]} intensity={0.55} color={accent} />
      <directionalLight position={[-1, -2, -5]} intensity={0.7} color={accent2} />
      <pointLight position={[0, -0.4, 0]} intensity={0.7} color={accent} distance={2.4} />
      <Vial
        pageRef={pageRef}
        explodeRef={explodeRef}
        liquidColor={liquidColor}
        capColor={capColor}
        accent={accent}
        accent2={accent2}
        isDark={isDark}
      />
      <ParticleField pageRef={pageRef} explodeRef={explodeRef} accent={accent} accent2={accent2} />
    </Canvas>
  )
}
