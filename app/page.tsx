"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars, Environment } from "@react-three/drei"
import { Suspense, useEffect, useRef } from "react"
import { DeepSpace } from "@/components/deep-space"
import { StarSystem, StarSystemUI } from "@/components/star-system"
import { FocusedObject, FocusedObjectUI } from "@/components/detailed-objects"
import { CameraController } from "@/components/camera-controller"
import { StarInfoPanel } from "@/components/star-info-panel"
import { SpaceUI } from "@/components/space-ui"
import { useStarStore } from "@/lib/star-store"

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { currentView } = useStarStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleContextLost = (event: Event) => {
      console.log("[v0] WebGL context lost, preventing default behavior")
      event.preventDefault()
    }

    const handleContextRestored = () => {
      console.log("[v0] WebGL context restored")
    }

    canvas.addEventListener("webglcontextlost", handleContextLost)
    canvas.addEventListener("webglcontextrestored", handleContextRestored)

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost)
      canvas.removeEventListener("webglcontextrestored", handleContextRestored)
    }
  }, [])

  const getCameraPosition = (): [number, number, number] => {
    switch (currentView) {
      case "star-system":
        return [0, 15, 25]
      case "focused-object":
        return [0, 0, 15]
      default:
        return [0, 0, 120]
    }
  }

  const getOrbitControlsSettings = () => {
    switch (currentView) {
      case "star-system":
        return {
          minDistance: 10,
          maxDistance: 100,
          enablePan: true,
          enableZoom: true,
          enableRotate: true,
        }
      case "focused-object":
        return {
          minDistance: 8,
          maxDistance: 30,
          enablePan: true,
          enableZoom: true,
          enableRotate: true,
        }
      default:
        return {
          minDistance: 30,
          maxDistance: 800,
          enablePan: true,
          enableZoom: true,
          enableRotate: true,
        }
    }
  }

  const orbitSettings = getOrbitControlsSettings()

  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <Canvas
        ref={canvasRef}
        camera={{
          position: getCameraPosition(),
          fov: 75,
          near: 0.1,
          far: 10000,
        }}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
        }}
        performance={{ min: 0.1 }}
        dpr={[1, 1.5]}
        frameloop="demand"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.1} />
          <pointLight position={[100, 100, 100]} intensity={0.3} />

          <CameraController />

          {currentView === "space" && (
            <>
              <Environment preset="night" />
              <Stars radius={300} depth={200} count={3000} factor={6} saturation={0.8} fade={true} />
              <DeepSpace />
            </>
          )}

          {currentView === "star-system" && (
            <>
              <Environment preset="night" />
              <Stars radius={100} depth={50} count={1000} factor={3} saturation={0.6} fade={true} />
              <StarSystem />
            </>
          )}

          {currentView === "focused-object" && (
            <>
              <Environment preset="night" />
              <Stars radius={200} depth={100} count={2000} factor={4} saturation={0.7} fade={true} />
              <FocusedObject />
            </>
          )}

          <OrbitControls
            enablePan={orbitSettings.enablePan}
            enableZoom={orbitSettings.enableZoom}
            enableRotate={orbitSettings.enableRotate}
            zoomSpeed={1.2}
            panSpeed={0.8}
            rotateSpeed={0.4}
            minDistance={orbitSettings.minDistance}
            maxDistance={orbitSettings.maxDistance}
            autoRotate={false}
          />
        </Suspense>
      </Canvas>

      <StarInfoPanel />
      <SpaceUI />
      <StarSystemUI />
      <FocusedObjectUI />
    </div>
  )
}
