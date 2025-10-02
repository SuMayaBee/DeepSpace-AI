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
import { DynamicLighting } from "@/components/dynamic-lighting"
import { ExoplanetDetection } from "@/components/exoplanet-detection"
import { ExoplanetDetectionUI } from "@/components/exoplanet-detection-ui"
import { HyperparameterTuning } from "@/components/hyperparameter-tuning"
import { HyperparameterTuningUI } from "@/components/hyperparameter-tuning-ui"
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
      case "exoplanet-detection":
        return [0, 20, 40]
      case "hyperparameter-tuning":
        return [0, 15, 30]
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
      case "exoplanet-detection":
        return {
          minDistance: 15,
          maxDistance: 80,
          enablePan: true,
          enableZoom: true,
          enableRotate: true,
        }
      case "hyperparameter-tuning":
        return {
          minDistance: 10,
          maxDistance: 60,
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
          {/* Enhanced ambient lighting for space atmosphere */}
          <ambientLight intensity={0.15} color="#1a1a2e" />
          
          {/* Dynamic lighting system that responds to planet positions */}
          <DynamicLighting />

          <CameraController />

          {currentView === "space" && (
            <>
              <Environment preset="sunset" background={false} />
              <Stars radius={400} depth={300} count={5000} factor={8} saturation={0.9} fade={true} />
              <DeepSpace />
            </>
          )}

          {currentView === "star-system" && (
            <>
              <Environment preset="city" background={false} />
              <Stars radius={150} depth={80} count={2000} factor={5} saturation={0.8} fade={true} />
              <StarSystem />
            </>
          )}

          {currentView === "focused-object" && (
            <>
              <Environment preset="dawn" background={false} />
              <Stars radius={250} depth={150} count={3000} factor={6} saturation={0.85} fade={true} />
              <FocusedObject />
            </>
          )}

          {currentView === "exoplanet-detection" && (
            <>
              <Environment preset="sunset" background={false} />
              <Stars radius={200} depth={100} count={2000} factor={4} saturation={0.8} fade={true} />
              <ExoplanetDetection />
            </>
          )}

          {currentView === "hyperparameter-tuning" && (
            <>
              <Environment preset="sunset" background={false} />
              <Stars radius={200} depth={100} count={2000} factor={4} saturation={0.8} fade={true} />
              <HyperparameterTuning />
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
      <ExoplanetDetectionUI />
      <HyperparameterTuningUI />
    </div>
  )
}
