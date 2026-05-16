'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment, Sphere, Line } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useTheme } from './ThemeProvider'

// Generates a stable abstract "molecule": N nodes on a sphere with edges
// between near neighbors. Looks scientific without claiming to be a real one.
function useMolecule(seed: number, nodes: number) {
  return useMemo(() => {
    const rand = mulberry32(seed)
    const positions: THREE.Vector3[] = []
    for (let i = 0; i < nodes; i++) {
      // Fibonacci sphere
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
    // a few extra long-range bonds
    for (let i = 0; i < nodes; i += 3) {
      const a = i
      const b = (i + 5) % nodes
      edges.push([a, b])
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
  const groupRef = useRef<THREE.Group>(null)
  const { positions, edges } = useMolecule(7, 18)

  useFrame((_, dt) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += dt * 0.18
    groupRef.current.rotation.x += dt * 0.05
  })

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.6}>
      <group ref={groupRef}>
        {positions.map((p, i) => (
          <Sphere key={i} args={[0.13, 24, 24]} position={p.toArray()}>
            <meshStandardMaterial
              color={i % 3 === 0 ? accent2 : accent}
              emissive={i % 3 === 0 ? accent2 : accent}
              emissiveIntensity={0.6}
              roughness={0.25}
              metalness={0.4}
            />
          </Sphere>
        ))}
        {edges.map(([a, b], i) => (
          <Line
            key={i}
            points={[positions[a].toArray(), positions[b].toArray()]}
            color={accent}
            transparent
            opacity={0.55}
            lineWidth={1}
          />
        ))}
      </group>
    </Float>
  )
}

export default function MoleculeScene() {
  const { resolved } = useTheme()
  const isDark = resolved === 'dark'
  const accent = isDark ? '#22d3ee' : '#0891b2'
  const accent2 = isDark ? '#818cf8' : '#4f46e5'

  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 45 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={isDark ? 0.35 : 0.7} />
      <directionalLight position={[5, 5, 5]} intensity={isDark ? 0.9 : 1.1} color={accent} />
      <directionalLight position={[-5, -2, -3]} intensity={0.4} color={accent2} />
      <MoleculeGroup accent={accent} accent2={accent2} />
      <Environment preset={isDark ? 'night' : 'studio'} />
    </Canvas>
  )
}
