import { useRef, useState, useEffect, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"
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

// Helper function to adjust color brightness
function adjustColorBrightness(color: string, amount: number): string {
  const num = parseInt(color.replace("#", ""), 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount))
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function OrbitingPlanet({ planet, starColor, index }: { planet: PlanetData; starColor: string; index: number }) {
  const planetRef = useRef<THREE.Mesh>(null!)
  const atmosphereRef = useRef<THREE.Mesh>(null!)
  const cloudsRef = useRef<THREE.Mesh>(null!)
  const surfaceRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const [angle, setAngle] = useState(Math.random() * Math.PI * 2)
  const { focusOnObject, zoomedStar } = useStarStore()

  const isVoidstar = zoomedStar?.name === "Voidstar"
  const planetColor = planetColors[index % planetColors.length]

  // Special Voidstar planet materials and colors
  const voidstarPlanetData = useMemo(() => {
    if (!isVoidstar) return null
    
    const planetTypes = [
      { 
        baseColor: "#0C4A6E", // Deep ocean blue
        surfaceColor: "#0EA5E9", // Bright cyan-blue
        atmosphereColor: "#38BDF8", 
        emissiveColor: "#082F49",
        cloudColor: "#E0F2FE",
        name: "Quantum Crystal World"
      },
      { 
        baseColor: "#991B1B", // Deep red base  
        surfaceColor: "#F97316", // Bright orange
        atmosphereColor: "#FB923C", 
        emissiveColor: "#450A0A",
        cloudColor: "#FED7AA",
        name: "Exotic Gas Giant"
      },
      { 
        baseColor: "#14532D", // Deep forest green
        surfaceColor: "#22C55E", // Bright green
        atmosphereColor: "#4ADE80", 
        emissiveColor: "#052E16",
        cloudColor: "#DCFCE7",
        name: "Helium-3 Rich World"
      },
      { 
        baseColor: "#92400E", // Deep amber
        surfaceColor: "#F59E0B", // Bright amber
        atmosphereColor: "#FbbF24", 
        emissiveColor: "#451A03",
        cloudColor: "#FEF3C7",
        name: "Quantum Field Planet"
      }
    ]
    
    return planetTypes[index % planetTypes.length]
  }, [isVoidstar, index])

  useFrame((state) => {
    setAngle((prev) => prev + planet.orbitSpeed * 0.01)

    if (planetRef.current) {
      const orbitRadius = planet.distance * 8
      const x = Math.cos(angle) * orbitRadius
      const z = Math.sin(angle) * orbitRadius
      
      planetRef.current.position.x = x
      planetRef.current.position.z = z
      planetRef.current.position.y = 0

      // Position all planet layers with main planet
      if (atmosphereRef.current) {
        atmosphereRef.current.position.x = x
        atmosphereRef.current.position.z = z
        atmosphereRef.current.position.y = 0
      }
      
      if (cloudsRef.current) {
        cloudsRef.current.position.x = x
        cloudsRef.current.position.z = z
        cloudsRef.current.position.y = 0
      }
      
      if (surfaceRef.current) {
        surfaceRef.current.position.x = x
        surfaceRef.current.position.z = z
        surfaceRef.current.position.y = 0
      }

      // Realistic planet rotation with different speeds for layers
      planetRef.current.rotation.y += 0.005
      
      if (cloudsRef.current) {
        cloudsRef.current.rotation.y += 0.008 // Clouds rotate faster
      }
      
      if (surfaceRef.current) {
        surfaceRef.current.rotation.y += 0.003 // Surface details rotate slower
      }

      if (hovered) {
        const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.1 + 1
        planetRef.current.scale.setScalar(pulse)
        if (atmosphereRef.current) {
          atmosphereRef.current.scale.setScalar(pulse)
        }
        if (cloudsRef.current) {
          cloudsRef.current.scale.setScalar(pulse)
        }
        if (surfaceRef.current) {
          surfaceRef.current.scale.setScalar(pulse)
        }
      } else {
        planetRef.current.scale.setScalar(1)
        if (atmosphereRef.current) {
          atmosphereRef.current.scale.setScalar(1)
        }
        if (cloudsRef.current) {
          cloudsRef.current.scale.setScalar(1)
        }
        if (surfaceRef.current) {
          surfaceRef.current.scale.setScalar(1)
        }
      }
    }

    // Enhanced atmospheric scattering and glow animations
    if (isVoidstar) {
      if (atmosphereRef.current) {
        const atmospherePulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.15 + 0.85
        const material = atmosphereRef.current.material as THREE.MeshStandardMaterial
        if (material) {
          material.opacity = 0.4 * atmospherePulse
          // Dynamic atmospheric scattering effect
          material.emissiveIntensity = 0.5 * atmospherePulse
        }
        atmosphereRef.current.rotation.y += 0.006
        atmosphereRef.current.rotation.x += 0.002 // Subtle wobble
      }
      
      if (cloudsRef.current) {
        const cloudPulse = Math.sin(state.clock.elapsedTime * 1.2 + 1) * 0.2 + 0.8
        const cloudMaterial = cloudsRef.current.material as THREE.MeshStandardMaterial
        if (cloudMaterial) {
          cloudMaterial.opacity = 0.6 * cloudPulse
          // Realistic cloud movement
          cloudMaterial.emissiveIntensity = 0.15 * cloudPulse
        }
        cloudsRef.current.rotation.y += 0.01
        cloudsRef.current.rotation.z += 0.003 // Cloud drift
      }
      
      if (surfaceRef.current) {
        const surfacePulse = Math.sin(state.clock.elapsedTime * 0.6) * 0.08 + 0.92
        const surfaceMaterial = surfaceRef.current.material as THREE.MeshStandardMaterial
        if (surfaceMaterial) {
          surfaceMaterial.emissiveIntensity = 0.3 * surfacePulse
          // Dynamic surface lighting
          surfaceMaterial.metalness = 0.5 + Math.sin(state.clock.elapsedTime * 0.8) * 0.1
        }
      }
    } else {
      // Enhanced animations for regular planets
      if (atmosphereRef.current) {
        const atmosphereGlow = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.9
        const material = atmosphereRef.current.material as THREE.MeshStandardMaterial
        if (material) {
          material.opacity = 0.3 * atmosphereGlow
          material.emissiveIntensity = 0.2 * atmosphereGlow
        }
        atmosphereRef.current.rotation.y += 0.004
      }
      
      if (cloudsRef.current) {
        const cloudMovement = Math.sin(state.clock.elapsedTime * 1.8) * 0.1 + 0.9
        const cloudMaterial = cloudsRef.current.material as THREE.MeshStandardMaterial
        if (cloudMaterial) {
          cloudMaterial.opacity = 0.4 * cloudMovement
        }
        cloudsRef.current.rotation.y += 0.008
      }
      
      if (surfaceRef.current) {
        const surfaceShimmer = Math.sin(state.clock.elapsedTime * 1.2) * 0.05 + 0.95
        const surfaceMaterial = surfaceRef.current.material as THREE.MeshStandardMaterial
        if (surfaceMaterial) {
          surfaceMaterial.metalness = 0.4 * surfaceShimmer
          surfaceMaterial.roughness = 0.5 + Math.sin(state.clock.elapsedTime * 0.9) * 0.1
        }
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
      {/* Main planet core with enhanced realistic materials */}
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
        <sphereGeometry args={[planet.radius * 2, 128, 128]} />
        {isVoidstar ? (
          <meshStandardMaterial 
            color={voidstarPlanetData?.baseColor}
            emissive={voidstarPlanetData?.emissiveColor}
            emissiveIntensity={0.8}
            roughness={0.75}
            metalness={0.25}
            envMapIntensity={1.8}
          />
        ) : (
          <meshStandardMaterial 
            color={planetColor} 
            roughness={0.6}
            metalness={0.4}
            envMapIntensity={2.0}
          />
        )}
      </mesh>

      {/* Enhanced realistic planet layers for all planets */}
      {isVoidstar && voidstarPlanetData ? (
        <>
          {/* Surface terrain details with continents and oceans */}
          <mesh ref={surfaceRef}>
            <sphereGeometry args={[planet.radius * 2.01, 128, 128]} />
            <meshStandardMaterial 
              color={voidstarPlanetData.surfaceColor}
              transparent
              opacity={0.9}
              emissive={voidstarPlanetData.surfaceColor}
              emissiveIntensity={0.5}
              roughness={0.5}
              metalness={0.7}
              envMapIntensity={2.5}
            />
          </mesh>
          
          {/* Ocean/liquid layer for realistic water bodies */}
          <mesh>
            <sphereGeometry args={[planet.radius * 2.005, 96, 96]} />
            <meshStandardMaterial 
              color={voidstarPlanetData.surfaceColor}
              transparent
              opacity={0.4}
              emissive={voidstarPlanetData.surfaceColor}
              emissiveIntensity={0.2}
              roughness={0.1}
              metalness={0.8}
              envMapIntensity={2.5}
            />
          </mesh>
          
          {/* Continental/land mass details */}
          <mesh>
            <sphereGeometry args={[planet.radius * 2.015, 64, 64]} />
            <meshStandardMaterial 
              color={voidstarPlanetData.surfaceColor}
              transparent
              opacity={0.6}
              emissive={voidstarPlanetData.surfaceColor}
              emissiveIntensity={0.15}
              roughness={0.8}
              metalness={0.2}
              envMapIntensity={1.5}
            />
          </mesh>
          
          {/* Enhanced cloud layer with realistic patterns and variations */}
          <mesh ref={cloudsRef}>
            <sphereGeometry args={[planet.radius * 2.06, 96, 96]} />
            <meshStandardMaterial 
              color={voidstarPlanetData.cloudColor}
              transparent
              opacity={0.55}
              emissive={voidstarPlanetData.cloudColor}
              emissiveIntensity={0.2}
              roughness={0.85}
              metalness={0.15}
              envMapIntensity={1.0}
            />
          </mesh>
          
          {/* Additional cloud detail layer for more realistic patterns */}
          <mesh>
            <sphereGeometry args={[planet.radius * 2.08, 64, 64]} />
            <meshStandardMaterial 
              color={voidstarPlanetData.cloudColor}
              transparent
              opacity={0.3}
              emissive={voidstarPlanetData.cloudColor}
              emissiveIntensity={0.1}
              roughness={0.95}
              metalness={0.05}
              envMapIntensity={0.6}
            />
          </mesh>
          
          {/* Thick atmospheric glow with scattering effect */}
          <mesh ref={atmosphereRef}>
            <sphereGeometry args={[planet.radius * 2.18, 48, 48]} />
            <meshStandardMaterial 
              color={voidstarPlanetData.atmosphereColor}
              transparent
              opacity={0.4}
              emissive={voidstarPlanetData.atmosphereColor}
              emissiveIntensity={0.5}
              side={2}
              roughness={0.0}
              metalness={0.0}
              envMapIntensity={0.6}
            />
          </mesh>
          
          {/* Outer atmospheric halo for realistic glow */}
          <mesh>
            <sphereGeometry args={[planet.radius * 2.35, 32, 32]} />
            <meshStandardMaterial 
              color={voidstarPlanetData.atmosphereColor}
              transparent
              opacity={0.15}
              emissive={voidstarPlanetData.atmosphereColor}
              emissiveIntensity={0.8}
              side={2}
              roughness={0.0}
              metalness={0.0}
              envMapIntensity={0.3}
            />
          </mesh>
        </>
      ) : (
        <>
          {/* Regular planets also get enhanced realistic layers */}
          {/* Enhanced surface details with terrain features */}
          <mesh ref={surfaceRef}>
            <sphereGeometry args={[planet.radius * 2.01, 96, 96]} />
            <meshStandardMaterial 
              color={planetColor}
              transparent
              opacity={0.85}
              roughness={0.4}
              metalness={0.6}
              envMapIntensity={2.2}
            />
          </mesh>
          
          {/* Ocean/water layer for realistic surface */}
          <mesh>
            <sphereGeometry args={[planet.radius * 2.005, 72, 72]} />
            <meshStandardMaterial 
              color={adjustColorBrightness(planetColor, -20)}
              transparent
              opacity={0.5}
              roughness={0.15}
              metalness={0.7}
              envMapIntensity={2.0}
            />
          </mesh>
          
          {/* Land mass/continental details */}
          <mesh>
            <sphereGeometry args={[planet.radius * 2.012, 48, 48]} />
            <meshStandardMaterial 
              color={adjustColorBrightness(planetColor, 15)}
              transparent
              opacity={0.4}
              roughness={0.75}
              metalness={0.25}
              envMapIntensity={1.2}
            />
          </mesh>
          
          {/* Enhanced cloud layer with realistic patterns */}
          <mesh ref={cloudsRef}>
            <sphereGeometry args={[planet.radius * 2.05, 72, 72]} />
            <meshStandardMaterial 
              color="#FFFFFF"
              transparent
              opacity={0.35}
              roughness={0.9}
              metalness={0.1}
              envMapIntensity={0.8}
            />
          </mesh>
          
          {/* Secondary cloud layer for depth and realism */}
          <mesh>
            <sphereGeometry args={[planet.radius * 2.07, 48, 48]} />
            <meshStandardMaterial 
              color="#F0F8FF"
              transparent
              opacity={0.2}
              roughness={0.95}
              metalness={0.05}
              envMapIntensity={0.5}
            />
          </mesh>
          
          {/* Atmosphere */}
          <mesh ref={atmosphereRef}>
            <sphereGeometry args={[planet.radius * 2.12, 32, 32]} />
            <meshStandardMaterial 
              color={planetColor}
              transparent
              opacity={0.3}
              emissive={planetColor}
              emissiveIntensity={0.2}
              side={2}
              roughness={0.0}
              metalness={0.0}
              envMapIntensity={0.4}
            />
          </mesh>
          
          {/* Outer glow */}
          <mesh>
            <sphereGeometry args={[planet.radius * 2.25, 24, 24]} />
            <meshStandardMaterial 
              color={planetColor}
              transparent
              opacity={0.1}
              emissive={planetColor}
              emissiveIntensity={0.4}
              side={2}
              roughness={0.0}
              metalness={0.0}
              envMapIntensity={0.2}
            />
          </mesh>
        </>
      )}

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
      const material = glowRef.current.material as THREE.MeshBasicMaterial
      if (material && "opacity" in material) {
        material.opacity = 0.4 * glowPulse * starVisuals.activity
      }
    }

    if (coronaRef.current) {
      const coronaPulse = Math.sin(state.clock.elapsedTime * 1.8) * 0.2 + 0.7
      const coronaMaterial = coronaRef.current.material as THREE.MeshBasicMaterial
      if (coronaMaterial && "opacity" in coronaMaterial) {
        coronaMaterial.opacity = 0.2 * coronaPulse * starVisuals.activity
      }
      coronaRef.current.rotation.z += 0.003 * starVisuals.activity
    }

    if (flareRef.current) {
      const flareActivity = Math.sin(state.clock.elapsedTime * 3 * starVisuals.activity) * 0.4 + 0.6
      if (flareRef.current.material) {
        const flareMaterial = flareRef.current.material as THREE.MeshBasicMaterial
        flareMaterial.opacity = 0.15 * flareActivity
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
        <meshStandardMaterial 
          color={starVisuals.core} 
          emissive={starVisuals.core}
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.0}
        />
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
