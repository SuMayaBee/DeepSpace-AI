"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"
import { useStarStore, type StarData, type PlanetData } from "@/lib/star-store"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"
import { RingGeometry } from "three"

function DetailedPlanet({ planet, parentStar }: { planet: PlanetData; parentStar?: StarData }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const atmosphereRef = useRef<THREE.Mesh>(null!)
  const cloudsRef = useRef<THREE.Mesh>(null!)
  const ringsRef = useRef<THREE.Mesh>(null!)
  const surfaceRef = useRef<THREE.Mesh>(null!)

  const planetFeatures = useMemo(() => {
    switch (planet.type.toLowerCase()) {
      case "ice giant":
        return {
          surface: "#1E3A8A", // Deep blue ice
          atmosphere: "#3B82F6", // Bright blue atmosphere
          clouds: "#E0F2FE", // Ice crystal clouds
          hasRings: Math.random() > 0.6,
          surfaceRoughness: 0.1,
          metalness: 0.9,
          atmosphereThickness: 0.4,
          cloudDensity: 0.6,
          surfacePattern: "ice",
        }
      case "gas giant":
        return {
          surface: "#D97706", // Jupiter-like orange/brown
          atmosphere: "#F59E0B", // Golden atmosphere
          clouds: "#FEF3C7", // Light golden clouds
          hasRings: Math.random() > 0.4,
          surfaceRoughness: 0.3,
          metalness: 0.2,
          atmosphereThickness: 0.6,
          cloudDensity: 0.8,
          surfacePattern: "bands",
        }
      case "terrestrial":
      case "rocky":
        return {
          surface: "#059669", // Earth-like green/blue
          atmosphere: "#0EA5E9", // Blue atmosphere
          clouds: "#FFFFFF", // White clouds
          hasRings: false,
          surfaceRoughness: 0.8,
          metalness: 0.1,
          atmosphereThickness: 0.2,
          cloudDensity: 0.4,
          surfacePattern: "continents",
        }
      case "super earth":
        return {
          surface: "#16A34A", // Rich green
          atmosphere: "#2563EB", // Deep blue
          clouds: "#F8FAFC", // Bright white
          hasRings: false,
          surfaceRoughness: 0.6,
          metalness: 0.3,
          atmosphereThickness: 0.3,
          cloudDensity: 0.5,
          surfacePattern: "super_continents",
        }
      default:
        return {
          surface: "#A16207",
          atmosphere: "#0284C7",
          clouds: "#F1F5F9",
          hasRings: false,
          surfaceRoughness: 0.5,
          metalness: 0.4,
          atmosphereThickness: 0.3,
          cloudDensity: 0.4,
          surfacePattern: "generic",
        }
    }
  }, [planet.type])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05
    }

    if (surfaceRef.current) {
      surfaceRef.current.rotation.y += 0.003
    }

    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.004
      const shimmer = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.9
      if (atmosphereRef.current.material) {
        atmosphereRef.current.material.opacity = planetFeatures.atmosphereThickness * shimmer
      }
    }

    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.007
      cloudsRef.current.rotation.x += 0.001
      const cloudVariation = Math.sin(state.clock.elapsedTime * 1.5) * 0.2 + 0.8
      if (cloudsRef.current.material) {
        cloudsRef.current.material.opacity = planetFeatures.cloudDensity * cloudVariation
      }
    }

    if (ringsRef.current && planetFeatures.hasRings) {
      ringsRef.current.rotation.z += 0.002
    }
  })

  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0, -100]}>
        <sphereGeometry args={[200, 64, 64]} />
        <meshBasicMaterial color="#000033" transparent opacity={0.8} side={1} />
      </mesh>

      {Array.from({ length: 500 }, (_, i) => {
        const radius = 150 + Math.random() * 200
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)

        const x = radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.sin(phi) * Math.sin(theta)
        const z = radius * Math.cos(phi)

        const size = Math.random() * 0.4 + 0.1
        const brightness = Math.sin(Date.now() * 0.001 + i) * 0.3 + 0.7

        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[size, 8, 8]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={brightness} />
          </mesh>
        )
      })}

      <mesh ref={meshRef}>
        <sphereGeometry args={[8, 128, 128]} />
        <meshStandardMaterial
          color={planetFeatures.surface}
          roughness={planetFeatures.surfaceRoughness}
          metalness={planetFeatures.metalness}
        />
      </mesh>

      <mesh ref={surfaceRef}>
        <sphereGeometry args={[8.01, 64, 64]} />
        <meshBasicMaterial color={planetFeatures.surface} transparent opacity={0.3} />
      </mesh>

      {planetFeatures.hasRings && (
        <mesh ref={ringsRef} rotation={[Math.PI / 2 + 0.2, 0, 0]}>
          <RingGeometry args={[10, 16, 128]} />
          <meshBasicMaterial color="#D2B48C" transparent opacity={0.7} side={2} />
        </mesh>
      )}

      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[8.4, 64, 64]} />
        <meshBasicMaterial
          color={planetFeatures.atmosphere}
          transparent
          opacity={planetFeatures.atmosphereThickness}
          side={2}
        />
      </mesh>

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[8.2, 64, 64]} />
        <meshBasicMaterial color={planetFeatures.clouds} transparent opacity={planetFeatures.cloudDensity} side={2} />
      </mesh>

      <ambientLight intensity={0.2} color="#4A5568" />
      <directionalLight position={[30, 20, 10]} intensity={2} color="#FFFFFF" castShadow />
      <pointLight position={[-20, -10, 5]} intensity={0.5} color="#FFA500" />
    </group>
  )
}

function DetailedStar({ star }: { star: StarData }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const coronaRef = useRef<THREE.Mesh>(null!)
  const flareRef = useRef<THREE.Mesh>(null!)
  const prominenceRefs = useRef<THREE.Mesh[]>([])

  const starFeatures = useMemo(() => {
    if (star.name === "Sun") {
      return {
        core: "#FFF8DC", // Warm white
        corona: "#FFD700", // Golden corona
        flare: "#FF6347", // Solar flare red
        temperature: 5778,
        size: 6,
        activity: 0.8,
      }
    } else if (star.type?.includes("Red") || star.type?.includes("M-type")) {
      return {
        core: "#FF4500", // Red dwarf
        corona: "#FF6347", // Red corona
        flare: "#DC143C", // Deep red flares
        temperature: 3500,
        size: 4,
        activity: 0.3,
      }
    } else if (star.type?.includes("Blue") || star.type?.includes("B-type")) {
      return {
        core: "#87CEEB", // Blue giant
        corona: "#4169E1", // Royal blue corona
        flare: "#0000FF", // Blue flares
        temperature: 15000,
        size: 10,
        activity: 1.2,
      }
    } else if (star.type?.includes("A-type") || star.name === "Sirius") {
      return {
        core: "#FFFFFF", // White star
        corona: "#F0F8FF", // Alice blue corona
        flare: "#E6E6FA", // Lavender flares
        temperature: 9000,
        size: 8,
        activity: 1.0,
      }
    } else {
      return {
        core: "#FFD700", // Yellow star
        corona: "#FFA500", // Orange corona
        flare: "#FF4500", // Orange-red flares
        temperature: 5500,
        size: 6,
        activity: 0.7,
      }
    }
  }, [star.type, star.name])

  useFrame((state) => {
    if (meshRef.current) {
      const pulsation = Math.sin(state.clock.elapsedTime * starFeatures.activity) * 0.05 + 1
      meshRef.current.scale.setScalar(pulsation)
      meshRef.current.rotation.y += 0.002 * starFeatures.activity
    }

    if (coronaRef.current) {
      const coronaActivity = Math.sin(state.clock.elapsedTime * 1.5 * starFeatures.activity) * 0.3 + 0.8
      coronaRef.current.scale.setScalar(coronaActivity)
      coronaRef.current.rotation.z += 0.003

      if (coronaRef.current.material) {
        const brightness = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.7
        coronaRef.current.material.opacity = brightness * 0.6
      }
    }

    if (flareRef.current) {
      const flareIntensity = Math.sin(state.clock.elapsedTime * 3 * starFeatures.activity) * 0.4 + 0.6
      if (flareRef.current.material) {
        flareRef.current.material.opacity = 0.3 * flareIntensity
      }
      flareRef.current.rotation.x += 0.001
      flareRef.current.rotation.y += 0.002
    }

    prominenceRefs.current.forEach((prominence, i) => {
      if (prominence) {
        const offset = i * 0.5
        const activity = Math.sin(state.clock.elapsedTime * 2 + offset) * 0.2 + 0.8
        prominence.scale.setScalar(activity)
        prominence.rotation.z += 0.001 * (i + 1)
      }
    })
  })

  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0, -100]}>
        <sphereGeometry args={[200, 64, 64]} />
        <meshBasicMaterial color="#000033" side={1} />
      </mesh>

      {Array.from({ length: 300 }, (_, i) => {
        const x = (Math.random() - 0.5) * 300
        const y = (Math.random() - 0.5) * 300
        const z = (Math.random() - 0.5) * 300
        const size = Math.random() * 0.3 + 0.05
        const twinkle = Math.sin(Date.now() * 0.001 + i) * 0.5 + 0.5
        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[size, 6, 6]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={twinkle} />
          </mesh>
        )
      })}

      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2
        const x = Math.cos(angle) * (starFeatures.size + 2)
        const y = Math.sin(angle) * (starFeatures.size + 2)
        return (
          <mesh
            key={i}
            ref={(el) => {
              if (el) prominenceRefs.current[i] = el
            }}
            position={[x, y, 0]}
          >
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshBasicMaterial color={starFeatures.flare} transparent opacity={0.4} />
          </mesh>
        )
      })}

      <mesh ref={meshRef}>
        <sphereGeometry args={[starFeatures.size, 128, 128]} />
        <meshBasicMaterial color={starFeatures.core} />
      </mesh>

      <mesh ref={coronaRef}>
        <sphereGeometry args={[starFeatures.size + 2, 64, 64]} />
        <meshBasicMaterial color={starFeatures.corona} transparent opacity={0.6} side={2} />
      </mesh>

      <mesh ref={flareRef}>
        <sphereGeometry args={[starFeatures.size + 6, 32, 32]} />
        <meshBasicMaterial color={starFeatures.flare} transparent opacity={0.2} side={2} />
      </mesh>

      <pointLight position={[0, 0, 0]} intensity={starFeatures.activity * 2} color={starFeatures.core} distance={100} />
    </group>
  )
}

export function FocusedObject() {
  const { focusedObject } = useStarStore()

  if (!focusedObject) return null

  if (focusedObject.type === "planet") {
    return <DetailedPlanet planet={focusedObject.data as PlanetData} parentStar={focusedObject.parentStar} />
  } else if (focusedObject.type === "star") {
    return <DetailedStar star={focusedObject.data as StarData} />
  }

  return null
}

export function FocusedObjectUI() {
  const { focusedObject, returnToStarSystem, returnToSpace, currentView } = useStarStore()

  if (currentView !== "focused-object" || !focusedObject) return null

  const objectName =
    focusedObject.type === "planet" ? (focusedObject.data as PlanetData).name : (focusedObject.data as StarData).name

  const objectInfo =
    focusedObject.type === "planet"
      ? {
          type: (focusedObject.data as PlanetData).type,
          distance: `${(focusedObject.data as PlanetData).distance.toFixed(2)} AU from star`,
          temperature: (focusedObject.data as PlanetData).temperature
            ? `~${Math.round((focusedObject.data as PlanetData).temperature!)}K`
            : undefined,
        }
      : {
          type: (focusedObject.data as StarData).type,
          temperature: `${(focusedObject.data as StarData).temperature.toLocaleString()}K`,
          mass: `${(focusedObject.data as StarData).mass}M☉`,
        }

  return (
    <>
      <div className="fixed top-4 left-4 z-[60] flex gap-3">
        <Button
          onClick={returnToStarSystem}
          variant="outline"
          size="lg"
          className="bg-black/80 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm text-base px-6 py-3"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to System
        </Button>

        <Button
          onClick={returnToSpace}
          variant="outline"
          size="lg"
          className="bg-black/80 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm text-base px-4 py-3"
        >
          <Home className="w-5 h-5" />
        </Button>
      </div>

      <div className="fixed top-20 left-4 z-50 bg-black/95 text-white p-6 rounded-lg border border-white/30 backdrop-blur-sm max-w-sm">
        <h2 className="text-2xl font-bold mb-3 text-white">{objectName}</h2>
        <div className="text-sm text-white/80 space-y-2">
          <div>Type: {objectInfo.type}</div>
          {focusedObject.type === "planet" && (
            <>
              <div>{objectInfo.distance}</div>
              {objectInfo.temperature && <div>Temperature: {objectInfo.temperature}</div>}
              {focusedObject.parentStar && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="text-xs text-white/60">Parent Star:</div>
                  <div className="font-medium">{focusedObject.parentStar.name}</div>
                </div>
              )}
            </>
          )}
          {focusedObject.type === "star" && (
            <>
              <div>Temperature: {objectInfo.temperature}</div>
              <div>Mass: {objectInfo.mass}</div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
