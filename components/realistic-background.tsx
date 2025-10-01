"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"

export function RealisticSpaceBackground() {
  const starsRef = useRef<THREE.Points>(null!)
  const nebulaRef = useRef<THREE.Mesh>(null!)

  const { positions, colors, sizes } = useMemo(() => {
    const count = 2000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Distribute stars in a sphere around the scene
      const radius = 200 + Math.random() * 300
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      // Star colors based on temperature
      const temp = Math.random()
      if (temp < 0.1) {
        // Blue giants
        colors[i * 3] = 0.7
        colors[i * 3 + 1] = 0.8
        colors[i * 3 + 2] = 1.0
      } else if (temp < 0.3) {
        // White stars
        colors[i * 3] = 1.0
        colors[i * 3 + 1] = 1.0
        colors[i * 3 + 2] = 1.0
      } else if (temp < 0.6) {
        // Yellow stars
        colors[i * 3] = 1.0
        colors[i * 3 + 1] = 1.0
        colors[i * 3 + 2] = 0.7
      } else {
        // Red stars
        colors[i * 3] = 1.0
        colors[i * 3 + 1] = 0.6
        colors[i * 3 + 2] = 0.4
      }

      sizes[i] = Math.random() * 3 + 0.5
    }

    return { positions, colors, sizes }
  }, [])

  useFrame((state) => {
    if (starsRef.current) {
      // Create twinkling effect by modifying the material
      const material = starsRef.current.material as THREE.PointsMaterial
      material.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 2) * 0.2
    }

    if (nebulaRef.current) {
      nebulaRef.current.rotation.y += 0.0002
      nebulaRef.current.rotation.x += 0.0001
    }
  })

  return (
    <group>
      {/* Distant nebula background */}
      <mesh ref={nebulaRef} position={[0, 0, -400]}>
        <sphereGeometry args={[600, 32, 32]} />
        <meshBasicMaterial color="#001122" transparent opacity={0.3} side={2} />
      </mesh>

      {/* Twinkling stars */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
          <bufferAttribute attach="attributes-color" array={colors} count={colors.length / 3} itemSize={3} />
          <bufferAttribute attach="attributes-size" array={sizes} count={sizes.length} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial
          size={2}
          sizeAttenuation={true}
          transparent={true}
          opacity={0.8}
          vertexColors={true}
          blending={2} // Additive blending for glow effect
        />
      </points>
    </group>
  )
}
