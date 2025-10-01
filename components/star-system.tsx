"use client"

import { useRef, useState, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import type * as THREE from "three"
import { useStarStore, type StarData, type PlanetData } from "@/lib/star-store"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

const planetColors = [
  "#FF6B35", // Orange (like in reference)
  "#FF8C42", // Orange-red
  "#D2691E", // Chocolate/brown-orange
  "#FF7F50", // Coral
  "#CD853F", // Peru/tan
  "#B22222", // Fire brick red
  "#FF4500", // Orange red
  "#DC143C", // Crimson
  "#8B4513", // Saddle brown
  "#A0522D", // Sienna
]

const starColors = [
  "#FFFFFF", // White (hot star like Sirius)
  "#87CEEB", // Light blue (hot star)
  "#FFD700", // Yellow (sun-like)
  "#FF6347", // Red (cool star)
  "#FFA500", // Orange-yellow
  "#FF4500", // Orange (cooler star)
  "#ADD8E6", // Light blue
]

function OrbitingPlanet({ planet, starColor, index }: { planet: PlanetData; starColor: string; index: number }) {
  const planetRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const [angle, setAngle] = useState(Math.random() * Math.PI * 2)
  const { focusOnObject, zoomedStar } = useStarStore()

  const planetColor = planetColors[index % planetColors.length]

  useFrame((state) => {
    setAngle((prev) => prev + planet.orbitSpeed * 0.01)

    if (planetRef.current) {
      const orbitRadius = planet.distance * 8
      planetRef.current.position.x = Math.cos(angle) * orbitRadius
      planetRef.current.position.z = Math.sin(angle) * orbitRadius
      planetRef.current.position.y = 0

      if (hovered) {
        const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.1 + 1
        planetRef.current.scale.setScalar(pulse)
      } else {
        planetRef.current.scale.setScalar(1)
      }
    }
  })

  const handlePlanetClick = () => {
    focusOnObject({
      type: "planet",
      data: planet,
      parentStar: zoomedStar || undefined,
    })
  }

  return (
    <>
      <mesh
        ref={planetRef}
        onPointerEnter={() => {
          setHovered(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerLeave={() => {
          setHovered(false)
          document.body.style.cursor = "default"
        }}
        onClick={handlePlanetClick}
      >
        <sphereGeometry args={[planet.radius * 2, 16, 16]} />
        <meshBasicMaterial color={planetColor} />
      </mesh>

      {hovered && (
        <Html
          position={[planetRef.current?.position.x || 0, planet.radius * 3, planetRef.current?.position.z || 0]}
          center
          distanceFactor={15}
        >
          <div className="bg-black/90 text-white px-3 py-2 rounded text-sm font-medium border border-white/20 backdrop-blur-sm">
            <div className="font-semibold">{planet.name}</div>
            <div className="text-xs text-white/70 mt-1">
              {planet.type} • {planet.distance.toFixed(2)} AU
            </div>
            {planet.temperature && <div className="text-xs text-white/70">~{Math.round(planet.temperature)}K</div>}
            <div className="text-xs text-blue-400 mt-1">Click to explore</div>
          </div>
        </Html>
      )}
    </>
  )
}

function OrbitRings({ planets, starColor }: { planets: PlanetData[]; starColor: string }) {
  return (
    <group>
      {planets.map((planet) => (
        <mesh key={`ring-${planet.id}`} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[planet.distance * 8 - 0.05, planet.distance * 8 + 0.05, 64]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.6} side={2} />
        </mesh>
      ))}
    </group>
  )
}

function CentralStar({ star }: { star: StarData }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const glowRef = useRef<THREE.Mesh>(null!)
  const coronaRef = useRef<THREE.Mesh>(null!)
  const flareRef = useRef<THREE.Mesh>(null!)
  const { focusOnObject } = useStarStore()
  const [hovered, setHovered] = useState(false)

  const isSun = star.name === "Sun"
  const starSize = isSun ? 3 : 2.5

  const starVisuals = useMemo(() => {
    if (star.name === "Sun") {
      return {
        core: "#FFF8DC",
        corona: "#FFD700",
        flare: "#FF6347",
        activity: 0.8,
        temperature: 5778,
      }
    } else if (star.type?.includes("Red") || star.type?.includes("M-type")) {
      return {
        core: "#FF6B47",
        corona: "#FF4500",
        flare: "#DC143C",
        activity: 0.3,
        temperature: 3500,
      }
    } else if (star.type?.includes("Blue") || star.type?.includes("B-type") || star.type?.includes("O-type")) {
      return {
        core: "#9BB0FF",
        corona: "#87CEEB",
        flare: "#4169E1",
        activity: 1.5,
        temperature: 15000,
      }
    } else if (star.type?.includes("A-type") || star.name === "Sirius") {
      return {
        core: "#FFFFFF",
        corona: "#F0F8FF",
        flare: "#E6E6FA",
        activity: 1.2,
        temperature: 9000,
      }
    } else if (star.type?.includes("K-type")) {
      return {
        core: "#FFB347",
        corona: "#FFA500",
        flare: "#FF4500",
        activity: 0.6,
        temperature: 4500,
      }
    } else {
      return {
        core: "#FFF8E7",
        corona: "#FFFF99",
        flare: "#FFD700",
        activity: 0.7,
        temperature: 5500,
      }
    }
  }, [star.type, star.name])

  useFrame((state) => {
    if (meshRef.current) {
      // Realistic stellar pulsation based on star type and mass
      const pulsationSpeed = starVisuals.activity * 1.5
      const pulsationAmount = star.type?.includes("Giant") ? 0.15 : 0.08
      const pulse = Math.sin(state.clock.elapsedTime * pulsationSpeed) * pulsationAmount + 1
      meshRef.current.scale.setScalar(starSize * pulse)

      // Surface convection rotation
      meshRef.current.rotation.y += 0.002 * starVisuals.activity
    }

    if (glowRef.current) {
      const glowPulse = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.8
      if (glowRef.current.material) {
        glowRef.current.material.opacity = 0.4 * glowPulse * starVisuals.activity
      }
    }

    if (coronaRef.current) {
      const coronaPulse = Math.sin(state.clock.elapsedTime * 1.8) * 0.2 + 0.7
      if (coronaRef.current.material) {
        coronaRef.current.material.opacity = 0.2 * coronaPulse * starVisuals.activity
      }
      coronaRef.current.rotation.z += 0.003 * starVisuals.activity
    }

    if (flareRef.current) {
      const flareActivity = Math.sin(state.clock.elapsedTime * 3 * starVisuals.activity) * 0.4 + 0.6
      if (flareRef.current.material) {
        flareRef.current.material.opacity = 0.15 * flareActivity
      }
      flareRef.current.rotation.x += 0.001
      flareRef.current.rotation.y += 0.002
    }
  })

  const handleStarClick = () => {
    focusOnObject({
      type: "star",
      data: star,
    })
  }

  return (
    <group position={[0, 0, 0]}>
      {/* Enhanced star core with realistic surface detail */}
      <mesh
        ref={meshRef}
        onPointerEnter={() => {
          setHovered(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerLeave={() => {
          setHovered(false)
          document.body.style.cursor = "default"
        }}
        onClick={handleStarClick}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial color={starVisuals.core} />
      </mesh>

      {/* Enhanced stellar atmosphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[starSize * 1.3, 32, 32]} />
        <meshBasicMaterial color={starVisuals.corona} transparent opacity={0.4} />
      </mesh>

      {/* Stellar corona with realistic dynamics */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[starSize * 2, 32, 32]} />
        <meshBasicMaterial color={starVisuals.corona} transparent opacity={0.2} side={2} />
      </mesh>

      {/* Solar flares and stellar wind */}
      <mesh ref={flareRef}>
        <sphereGeometry args={[starSize * 3, 16, 16]} />
        <meshBasicMaterial color={starVisuals.flare} transparent opacity={0.1} side={2} />
      </mesh>

      {/* Enhanced lighting for realistic illumination */}
      <pointLight position={[0, 0, 0]} intensity={starVisuals.activity * 2} color={starVisuals.core} distance={50} />

      {hovered && (
        <Html position={[0, 5, 0]} center distanceFactor={15}>
          <div className="bg-black/90 text-white px-4 py-3 rounded-lg text-sm font-medium border border-white/30 backdrop-blur-sm">
            <div className="font-bold text-lg">{star.name}</div>
            <div className="text-xs text-white/70 mt-1">{star.type}</div>
            <div className="text-xs text-white/60">Temperature: {starVisuals.temperature.toLocaleString()}K</div>
            <div className="text-xs text-blue-400 mt-2">Click to explore in detail</div>
          </div>
        </Html>
      )}
    </group>
  )
}

function StarSystemInfo({ star }: { star: StarData }) {
  const { focusOnObject } = useStarStore()

  const handleStarClick = () => {
    focusOnObject({
      type: "star",
      data: star,
    })
  }

  const handlePlanetClick = (planet: PlanetData) => {
    focusOnObject({
      type: "planet",
      data: planet,
      parentStar: star,
    })
  }

  return (
    <div className="fixed top-20 right-4 z-50 bg-black/95 text-white p-6 rounded-lg border border-white/30 backdrop-blur-sm max-w-sm">
      <div className="mb-6">
        <h2
          className="text-2xl font-bold mb-3 text-white cursor-pointer hover:text-blue-400 transition-colors"
          onClick={handleStarClick}
        >
          {star.name}
        </h2>
        <div className="text-sm text-white/80 space-y-2">
          <div>Type: {star.type}</div>
          <div>Temperature: {star.temperature.toLocaleString()}K</div>
          <div>Mass: {star.mass}M☉</div>
        </div>
      </div>

      {star.planetData && star.planetData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Planets ({star.planetData.length})</h3>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {star.planetData.map((planet, index) => (
              <div
                key={planet.id}
                className="border-l-2 border-orange-500/50 pl-4 cursor-pointer hover:bg-white/5 rounded p-2 transition-colors"
                onClick={() => handlePlanetClick(planet)}
              >
                <div className="font-medium text-base text-orange-400 mb-1">{planet.name}</div>
                <div className="text-xs text-white/70 space-y-1">
                  <div>{planet.type}</div>
                  <div>{planet.distance.toFixed(2)} AU from star</div>
                  {planet.temperature && <div>~{Math.round(planet.temperature)}K</div>}
                </div>
                <div className="text-xs text-blue-400 mt-1">Click to explore</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function StarSystem() {
  const { zoomedStar } = useStarStore()

  if (!zoomedStar || !zoomedStar.planetData) return null

  return (
    <group>
      <CentralStar star={zoomedStar} />

      <OrbitRings planets={zoomedStar.planetData} starColor={zoomedStar.color} />

      {zoomedStar.planetData.map((planet, index) => (
        <OrbitingPlanet key={planet.id} planet={planet} starColor={zoomedStar.color} index={index} />
      ))}
    </group>
  )
}

export function StarSystemUI() {
  const { zoomedStar, returnToSpace, currentView } = useStarStore()

  if (currentView !== "star-system" || !zoomedStar) return null

  return (
    <>
      <div className="fixed top-4 left-4 z-[60]">
        <Button
          onClick={returnToSpace}
          variant="outline"
          size="lg"
          className="bg-black/80 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm text-base px-6 py-3"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Space
        </Button>
      </div>

      <StarSystemInfo star={zoomedStar} />
    </>
  )
}
