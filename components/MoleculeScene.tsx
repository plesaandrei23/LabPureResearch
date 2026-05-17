'use client'

import { Canvas } from '@react-three/fiber'
import { Float, Line, Sphere } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import { useTheme } from './ThemeProvider'

function useMolecule(seed: number, nodes: number) {
  return useMemo(() => {
    const rand = mulberry32(seed)
    const positions: THREE.Vector3[] = []
    for (let i = 0; i < nodes; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / nodes)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i + rand() * 0.3
      const x = Math.sin(phi) * Math.cos(theta)
      const y = Math.sin(phi) * Math.sin(theta)
      const z = Math.cos(phi)
      positions.push(new THREE.Vector3(x, y, z).multiplyScalar(1.6))
    }
    const edges: [number, number][] = []
    for (let i = 0; i < positions.length; i++) {
      let best = -1
      let bestD = Infinity
      for (let j = 0; j < positions.length; j++) {
        if (i === j) continue
        const d = positions[i].distanceTo(positions[j])
        if (d < bestD) { bestD = d; best = j }
      }
      if (best > i) edges.push([i, best])
    }
    for (let i = 0; i < nodes; i += 3) {
      edges.push([i, (i + 5) % nodes])
    }
    return { positions, edges }
  }, [seed, nodes])
}

function mulberry32(seed: number) {
  let a = seed
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function MoleculeGroup({ accent, accent2 }: { accent: string; accent2: string }) {
  const { positions, edges } = useMolecule(7, 20)
  return (
    // Float owns the animation loop — no useFrame, no clock dependency.
    <Float speed={1.4} rotationIntensity={2.4} floatIntensity={0.9}>
      <group rotation={[0.3, 0.5, 0]}>
        {positions.map((p, i) => (
          <Sphere key={`s-${i}`} args={[0.13, 24, 24]} position={p.toArray()}>
            <meshStandardMaterial
              color={i % 3 === 0 ? accent2 : accent}
              emissive={i % 3 === 0 ? accent2 : accent}
              emissiveIntensity={0.85}
              roughness={0.25}
              metalness={0.5}
              toneMapped={false}
            />
          </Sphere>
        ))}
        {edges.map(([a, b], i) => (
          <Line
            key={`l-${i}`}
            points={[positions[a].toArray(), positions[b].toArray()]}
            color={accent}
            transparent
            opacity={0.6}
            lineWidth={1.2}
            toneMapped={false}
          />
        ))}
      </group>
    </Float>
  )
}

export default function MoleculeScene() {
  const { resolved } = useTheme()
  const isDark = resolved === 'dark'
  // Bright, theme-adaptive accents that pop on a dark hero gradient.
  const accent = isDark ? '#22d3ee' : '#67e8f9'
  const accent2 = isDark ? '#a78bfa' : '#818cf8'

  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop="always"
      style={{ background: 'transparent', display: 'block' }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 5, 5]} intensity={1.1} color={accent} />
      <directionalLight position={[-5, -2, -3]} intensity={0.55} color={accent2} />
      <pointLight position={[0, 0, 3]} intensity={0.6} color={accent} />
      <MoleculeGroup accent={accent} accent2={accent2} />
    </Canvas>
  )
}
