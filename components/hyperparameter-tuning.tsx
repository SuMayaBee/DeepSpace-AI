"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import * as THREE from "three"
import { useHyperparameter } from "./hyperparameter-tuning-ui"

// Central Star Component
function CentralStar() {
  const starRef = useRef<THREE.Mesh>(null!)
  const { learningRate, isTraining } = useHyperparameter()

  useFrame((state) => {
    if (starRef.current) {
      // Rotation speed based on learning rate
      const rotationSpeed = learningRate * 10
      starRef.current.rotation.y += rotationSpeed
      
      // Pulsing effect when training
      if (isTraining) {
        const pulse = Math.sin(state.clock.getElapsedTime() * 5) * 0.1 + 1
        starRef.current.scale.setScalar(pulse)
      } else {
        starRef.current.scale.setScalar(1)
      }
    }
  })

  // Color intensity based on learning rate
  const intensity = Math.min(1.0, learningRate * 1000)
  const color = `hsl(${60 + intensity * 20}, 100%, ${50 + intensity * 30}%)`

  return (
    <group>
      {/* Central Star */}
      <mesh ref={starRef} position={[0, 0, 0]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8 + intensity * 0.2}
          roughness={0.1}
          metalness={0.0}
        />
      </mesh>
      
      {/* Star Glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3 + intensity * 0.2}
        />
      </mesh>

      {/* Training Indicator - Elegant Energy Rings */}
      {isTraining && (
        <>
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[3, 3.1, 64]} />
            <meshBasicMaterial
              color="#3B82F6"
              transparent
              opacity={0.8}
            />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[4, 4.1, 64]} />
            <meshBasicMaterial
              color="#8B5CF6"
              transparent
              opacity={0.6}
            />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[5, 5.1, 64]} />
            <meshBasicMaterial
              color="#EC4899"
              transparent
              opacity={0.4}
            />
          </mesh>
        </>
      )}
    </group>
  )
}

// Orbital Ring Component
function OrbitalRing({ radius, color = "#666666" }: { radius: number; color?: string }) {
  const ringRef = useRef<THREE.Mesh>(null!)
  const { isTraining } = useHyperparameter()

  useFrame((state) => {
    if (ringRef.current && isTraining) {
      // Rotate rings when training
      ringRef.current.rotation.z += 0.01
    }
  })

  return (
    <group>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.05, radius + 0.05, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Training indicator - elegant glow */}
      {isTraining && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius - 0.08, radius + 0.08, 64]} />
          <meshBasicMaterial
            color="#3B82F6"
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}

// Planet Component with Orbital Motion
function Planet({ 
  radius, 
  color, 
  size = 0.3,
  speed = 1,
  initialAngle = 0,
  parameterType = "learningRate"
}: { 
  radius: number; 
  color: string; 
  size?: number;
  speed?: number;
  initialAngle?: number;
  parameterType?: "learningRate" | "batchSize" | "epochs" | "dropoutRate" | "regularization";
}) {
  const planetRef = useRef<THREE.Mesh>(null!)
  const { learningRate, batchSize, epochs, dropoutRate, regularization, isTraining } = useHyperparameter()

  useFrame((state) => {
    if (planetRef.current) {
      // Get the relevant parameter value
      let paramValue = learningRate
      switch (parameterType) {
        case "batchSize": paramValue = batchSize / 100; break
        case "epochs": paramValue = epochs / 1000; break
        case "dropoutRate": paramValue = dropoutRate; break
        case "regularization": paramValue = regularization * 10; break
        default: paramValue = learningRate; break
      }

      // Calculate orbital position with speed affected by parameter
      const time = state.clock.getElapsedTime()
      // Simplified speed calculation - always keep base speed + parameter influence
      const baseSpeed = 0.3 // Always moving at minimum 0.3 speed
      const paramInfluence = paramValue * 0.5 // Parameter adds up to 0.5 more speed
      const adjustedSpeed = baseSpeed + paramInfluence
      
      const angle = initialAngle + time * adjustedSpeed
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      
      planetRef.current.position.set(x, 0, z)
      
      // Enhanced rotation when training
      if (isTraining) {
        // Faster self-rotation during training
        planetRef.current.rotation.y += 0.1 * (1 + paramValue)
        planetRef.current.rotation.x += 0.05 * (1 + paramValue)
        planetRef.current.rotation.z += 0.03 * (1 + paramValue)
        
        // Size pulsing when training
        const pulse = Math.sin(state.clock.getElapsedTime() * 3 + initialAngle) * 0.1 + 1
        planetRef.current.scale.setScalar(pulse)
      } else {
        // Normal rotation when not training
        planetRef.current.rotation.y += 0.02 * (1 + paramValue)
        planetRef.current.scale.setScalar(1)
      }
    }
  })

  return (
    <mesh ref={planetRef}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color={color}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  )
}

// Main Hyperparameter Tuning Component
export function HyperparameterTuning() {
  return (
    <>
      {/* Background Stars */}
      <Stars 
        radius={200} 
        depth={100} 
        count={2000} 
        factor={4} 
        saturation={0.8} 
        fade={true} 
      />
      
      {/* Central Star */}
      <CentralStar />
      
      {/* Orbital Rings */}
      <OrbitalRing radius={8} color="#666666" />
      <OrbitalRing radius={12} color="#666666" />
      <OrbitalRing radius={16} color="#666666" />
      
      {/* Orbiting Planets - Each represents a different parameter */}
      <Planet 
        radius={8} 
        color="#FF8C00" 
        size={0.4}
        speed={1.0}
        initialAngle={0}
        parameterType="learningRate"
      />
      <Planet 
        radius={12} 
        color="#87CEEB" 
        size={0.35}
        speed={0.8}
        initialAngle={Math.PI / 2}
        parameterType="batchSize"
      />
      
      {/* Additional planets for variety */}
      <Planet 
        radius={8} 
        color="#FF6B6B" 
        size={0.3}
        speed={1.2}
        initialAngle={Math.PI}
        parameterType="epochs"
      />
      <Planet 
        radius={12} 
        color="#98FB98" 
        size={0.25}
        speed={0.6}
        initialAngle={3 * Math.PI / 2}
        parameterType="dropoutRate"
      />
      <Planet 
        radius={16} 
        color="#DDA0DD" 
        size={0.4}
        speed={0.4}
        initialAngle={Math.PI / 4}
        parameterType="regularization"
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={1} color="#FFFFFF" />
    </>
  )
}
