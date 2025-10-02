"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { PointLight, DirectionalLight } from "three"
import { useStarStore } from "@/lib/star-store"

export function DynamicLighting() {
  const starLightRef = useRef<PointLight>(null!)
  const fillLightRef = useRef<PointLight>(null!)
  const rimLightRef = useRef<PointLight>(null!)
  const directionalLightRef = useRef<DirectionalLight>(null!)
  
  const { currentView, zoomedStar } = useStarStore()

  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    // Dynamic lighting based on view and time
    if (currentView === "star-system" && zoomedStar) {
      // Pulsing star light effect
      if (starLightRef.current) {
        const pulse = Math.sin(time * 0.5) * 0.2 + 1.0
        starLightRef.current.intensity = 1.2 * pulse
        
        // Slight color temperature variation
        const hue = Math.sin(time * 0.3) * 0.1
        starLightRef.current.color.setHSL(0.1 + hue, 0.3, 1.0)
      }
      
      // Dynamic fill light that responds to star position
      if (fillLightRef.current) {
        const orbitAngle = time * 0.2
        fillLightRef.current.position.x = Math.cos(orbitAngle) * 80
        fillLightRef.current.position.z = Math.sin(orbitAngle) * 60
        
        const intensity = Math.sin(time * 0.4) * 0.1 + 0.4
        fillLightRef.current.intensity = intensity
      }
      
      // Atmospheric rim lighting
      if (rimLightRef.current) {
        const rimPulse = Math.sin(time * 0.7) * 0.1 + 0.3
        rimLightRef.current.intensity = rimPulse
        
        // Color shift for atmospheric effects
        const atmosHue = Math.sin(time * 0.2) * 0.2
        rimLightRef.current.color.setHSL(0.05 + atmosHue, 0.8, 0.6)
      }
      
      // Dynamic directional light for realistic shadows
      if (directionalLightRef.current) {
        const sunAngle = time * 0.1
        directionalLightRef.current.position.x = Math.cos(sunAngle) * 100
        directionalLightRef.current.position.z = Math.sin(sunAngle) * 50
        
        const shadowIntensity = Math.sin(time * 0.3) * 0.2 + 0.8
        directionalLightRef.current.intensity = 0.8 * shadowIntensity
      }
    } else if (currentView === "focused-object") {
      // More subtle lighting for focused object view
      if (starLightRef.current) {
        starLightRef.current.intensity = 0.8
        starLightRef.current.color.setHex(0xffffff)
      }
      
      if (fillLightRef.current) {
        fillLightRef.current.intensity = 0.3
      }
      
      if (rimLightRef.current) {
        rimLightRef.current.intensity = 0.2
        rimLightRef.current.color.setHex(0x4a90e2)
      }
    } else {
      // Default space view lighting
      if (starLightRef.current) {
        starLightRef.current.intensity = 1.0
        starLightRef.current.color.setHex(0xffffff)
      }
      
      if (fillLightRef.current) {
        fillLightRef.current.intensity = 0.4
      }
      
      if (rimLightRef.current) {
        rimLightRef.current.intensity = 0.3
        rimLightRef.current.color.setHex(0xff6b35)
      }
    }
  })

  return (
    <>
      {/* Primary dynamic star light */}
      <pointLight
        ref={starLightRef}
        position={[50, 80, 100]}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Dynamic fill light */}
      <pointLight
        ref={fillLightRef}
        position={[-80, 40, -60]}
        intensity={0.4}
        color="#4a90e2"
      />
      
      {/* Dynamic atmospheric rim light */}
      <pointLight
        ref={rimLightRef}
        position={[0, -100, 50]}
        intensity={0.3}
        color="#ff6b35"
      />
      
      {/* Dynamic directional light for shadows */}
      <directionalLight
        ref={directionalLightRef}
        position={[100, 100, 50]}
        intensity={0.8}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
    </>
  )
}
