"use client"

import { useRef, useState, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"
import { useStarStore } from "@/lib/star-store"
import { useMissionFilter } from "./exoplanet-detection-ui"
import { generatePlanetColorScheme } from "./star-system"

interface ExoplanetData {
  id: string
  name: string
  type: string
  radius: number
  distance: number // Distance from Sun in AU
  color: string
  orbitSpeed: number
  temperature?: number
  mass?: number
  discoveryMethod: string
  discoveryYear: number
  position: [number, number, number]
  mission: string
  status: "candidate" | "confirmed"
  aiConfidence: "exoplanet" | "near-exoplanet" | "not-exoplanet" // AI classification
  aiAccuracy: number // AI accuracy percentage (0-100)
}

// Generate diverse exoplanet data with positions like deep space
const generateExoplanets = (): ExoplanetData[] => {
  const exoplanetTypes = [
    { type: "Hot Jupiter", colors: ["#FF6B35", "#FF8C42", "#D2691E"], tempMod: 1.5 },
    { type: "Super Earth", colors: ["#228B22", "#6B8E23", "#9ACD32"], tempMod: 1.0 },
    { type: "Neptune-like", colors: ["#4169E1", "#87CEEB", "#B0E0E6"], tempMod: 0.8 },
    { type: "Rocky Planet", colors: ["#8B4513", "#CD853F", "#A0522D"], tempMod: 1.2 },
    { type: "Gas Giant", colors: ["#FF6347", "#FF4500", "#DC143C"], tempMod: 0.9 },
    { type: "Ice Giant", colors: ["#87CEEB", "#B0E0E6", "#ADD8E6"], tempMod: 0.6 },
  ]

  const discoveryMethods = ["Transit", "Radial Velocity", "Direct Imaging", "Gravitational Lensing"]
  const missions = ["Kepler", "TESS"]
  
  // Real mission data: Kepler/K2 has 2955 candidates, TESS has 7703 candidates
  const totalCandidates = 10658 // 2955 + 7703
  const keplerCandidates = 2955
  const tessCandidates = 7703
  
  return Array.from({ length: 25 }, (_, index) => {
    // Make some planets voidstar planets (every 5th planet)
    const isVoidstar = index % 5 === 0
    const planetType = exoplanetTypes[Math.floor(Math.random() * exoplanetTypes.length)]
    const distance = 0.5 + (index * 0.3) + Math.random() * 0.2
    const discoveryYear = 1995 + Math.floor(Math.random() * 28) // 1995-2023

    // Generate positions like deep space stars - distributed in 3D space
    const shellIndex = Math.floor(index / 8) // Create 3 shells with 8-9 planets each
    const planetInShell = index % 8
    
    // Base radius for each shell (30, 60, 90)
    const baseRadius = 30 + shellIndex * 30
    const radiusVariation = Math.random() * 15 - 7.5 // ±7.5 variation
    const radius = baseRadius + radiusVariation
    
    // Fibonacci spiral distribution for even spacing
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)) // Golden angle in radians
    const theta = planetInShell * goldenAngle
    const phi = Math.acos(1 - 2 * (planetInShell + Math.random() * 0.5) / 8)
    
    // Add some randomness to avoid perfect patterns
    const thetaOffset = (Math.random() - 0.5) * 0.8
    const phiOffset = (Math.random() - 0.5) * 0.4
    
    const finalTheta = theta + thetaOffset
    const finalPhi = phi + phiOffset

    const x = radius * Math.sin(finalPhi) * Math.cos(finalTheta)
    const y = radius * Math.sin(finalPhi) * Math.sin(finalTheta)
    const z = radius * Math.cos(finalPhi)

    // Generate AI confidence and accuracy based on real classification
    const aiAccuracy = Math.random() * 100
    let aiConfidence: "exoplanet" | "near-exoplanet" | "not-exoplanet"
    if (aiAccuracy >= 95) {
      aiConfidence = "exoplanet"
    } else if (aiAccuracy >= 85) {
      aiConfidence = "near-exoplanet"
    } else {
      aiConfidence = "not-exoplanet"
    }

    return {
      id: `exoplanet-${index}`,
      name: isVoidstar ? `Voidstar ${String.fromCharCode(65 + index)}` : `Exoplanet ${String.fromCharCode(65 + index)}`,
      type: planetType.type,
      radius: Math.random() * 0.4 + 0.1,
      distance,
      color: planetType.colors[Math.floor(Math.random() * planetType.colors.length)],
      orbitSpeed: 0.3 / Math.sqrt(distance),
      temperature: (5778 * planetType.tempMod) / Math.sqrt(distance),
      mass: Math.random() * 3 + 0.1,
      discoveryMethod: discoveryMethods[Math.floor(Math.random() * discoveryMethods.length)],
      discoveryYear,
      position: [Math.round(x * 10) / 10, Math.round(y * 10) / 10, Math.round(z * 10) / 10] as [number, number, number],
      mission: missions[Math.floor(Math.random() * missions.length)],
      status: "candidate" as const, // All exoplanets are candidates, none confirmed
      aiConfidence,
      aiAccuracy: Math.round(aiAccuracy * 10) / 10, // Round to 1 decimal place
    }
  })
}

function Exoplanet({ planet }: { planet: ExoplanetData }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const atmosphereRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const { zoomToStarSystemFromVoidstar } = useStarStore()
  
  // Import the STAR_DATA from deep-space component
  const voidstarData = useMemo(() => ({
    id: "26",
    name: "Voidstar",
    type: "Electric Cyan Giant",
    temperature: 15000,
    mass: 8.5,
    radius: 12.3,
    distance: 420,
    planets: ["Voidstar b", "Voidstar c"],
    constellation: "Mysticus",
    magnitude: 1.2,
    color: "#00FFFF",
    position: [-45, 15, -30],
    planetData: [
      {
        id: "26-planet-0",
        name: "Voidstar b",
        type: "Rocky",
        radius: 0.15,
        distance: 0.8,
        color: "#0C4A6E",
        orbitSpeed: 0.56,
        temperature: 18750,
        mass: 0.8
      },
      {
        id: "26-planet-1",
        name: "Voidstar c",
        type: "Gas Giant",
        radius: 0.25,
        distance: 1.6,
        color: "#7C2D12",
        orbitSpeed: 0.4,
        temperature: 13250,
        mass: 1.2
      }
    ]
  }), [])

  // Check if this is a voidstar planet
  const isVoidstar = planet.name.toLowerCase().includes("voidstar")
  
  // Generate color scheme - use voidstar specific colors if it's a voidstar planet
  const planetColorScheme = useMemo(() => {
    if (isVoidstar) {
      // For Voidstar planets, use the predefined planet types
      const planetTypes = [
        { 
          baseColor: "#0C4A6E", // Deep ocean blue
          surfaceColor: "#075985", // Darker blue
          atmosphereColor: "#0EA5E9", // Sky blue
          emissiveColor: "#0284C7", // Medium blue
          cloudColor: "#E0F2FE", // Light blue
          name: "voidstar"
        },
        { 
          baseColor: "#7C2D12", // Deep orange
          surfaceColor: "#9A3412", // Darker orange
          atmosphereColor: "#EA580C", // Bright orange
          emissiveColor: "#DC2626", // Red-orange
          cloudColor: "#FED7AA", // Light orange
          name: "voidstar"
        },
        { 
          baseColor: "#581C87", // Deep purple
          surfaceColor: "#6B21A8", // Darker purple
          atmosphereColor: "#A855F7", // Bright purple
          emissiveColor: "#9333EA", // Medium purple
          cloudColor: "#F3E8FF", // Light purple
          name: "voidstar"
        }
      ]
      return planetTypes[parseInt(planet.id.split('-')[1]) % planetTypes.length]
    } else {
      // For regular exoplanets, use AI classification colors
      const getAIColor = (confidence: "exoplanet" | "near-exoplanet" | "not-exoplanet") => {
        switch (confidence) {
          case "exoplanet":
            return "#00FF00" // Bright green for confirmed exoplanet (95%+)
          case "near-exoplanet":
            return "#8000FF" // Purple for near exoplanet (85-94%)
          case "not-exoplanet":
            return "#FFFFFF" // White for not exoplanet (<85%)
          default:
            return "#FFFFFF"
        }
      }
      
      const aiColor = getAIColor(planet.aiConfidence)
      return {
        baseColor: aiColor,
        surfaceColor: aiColor,
        atmosphereColor: aiColor,
        emissiveColor: aiColor,
        cloudColor: aiColor,
        name: "regular"
      }
    }
  }, [isVoidstar, planet.id, planet.aiConfidence, planet.name])

  useFrame((state) => {
    if (meshRef.current) {
      // Planet rotation
      meshRef.current.rotation.y += 0.005

      // Hover effect
      if (hovered) {
        const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.1 + 1
        meshRef.current.scale.setScalar(pulse)
      } else {
        meshRef.current.scale.setScalar(1)
      }
    }

    // Enhanced atmospheric scattering and glow animations
    if (isVoidstar && atmosphereRef.current) {
      const atmospherePulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.15 + 0.85
      const material = atmosphereRef.current.material as THREE.MeshStandardMaterial
      material.opacity = atmospherePulse * 0.4
      
      // Subtle atmospheric color shift
      const hueShift = Math.sin(state.clock.elapsedTime * 0.8) * 0.1
      material.emissive = new THREE.Color(planetColorScheme.atmosphereColor)
      material.emissiveIntensity = 0.5 + hueShift * 0.2
    }
  })

  return (
    <>
      {/* Main planet with enhanced visual effects */}
      <mesh
        ref={meshRef}
        position={planet.position}
        onPointerEnter={() => {
          setHovered(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerLeave={() => {
          setHovered(false)
          document.body.style.cursor = "default"
        }}
        onClick={() => {
          if (isVoidstar) {
            // When clicking on a voidstar planet, zoom to the Voidstar system
            zoomToStarSystemFromVoidstar(voidstarData)
          }
        }}
      >
        <sphereGeometry args={[planet.radius * 2, 32, 32]} />
        <meshStandardMaterial 
          color={planetColorScheme.baseColor}
          emissive={planetColorScheme.emissiveColor}
          emissiveIntensity={isVoidstar ? 0.8 : 0.3}
          roughness={isVoidstar ? 0.75 : 0.6}
          metalness={isVoidstar ? 0.25 : 0.4}
          envMapIntensity={isVoidstar ? 1.8 : 2.0}
        />
      </mesh>

      {/* Surface layer with enhanced details */}
      <mesh position={planet.position}>
        <sphereGeometry args={[planet.radius * 2.005, 64, 64]} />
        <meshStandardMaterial 
          color={planetColorScheme.surfaceColor}
          transparent
          opacity={isVoidstar ? 0.9 : 0.85}
          emissive={planetColorScheme.surfaceColor}
          emissiveIntensity={isVoidstar ? 0.5 : 0.2}
          roughness={isVoidstar ? 0.5 : 0.4}
          metalness={isVoidstar ? 0.7 : 0.6}
          envMapIntensity={isVoidstar ? 2.5 : 2.2}
        />
      </mesh>
      
      {/* Additional surface detail layer */}
      <mesh position={planet.position}>
        <sphereGeometry args={[planet.radius * 2.01, 64, 64]} />
        <meshStandardMaterial 
          color={planetColorScheme.surfaceColor}
          transparent
          opacity={isVoidstar ? 0.4 : 0.5}
          emissive={planetColorScheme.surfaceColor}
          emissiveIntensity={isVoidstar ? 0.2 : 0.1}
          roughness={isVoidstar ? 0.1 : 0.15}
          metalness={isVoidstar ? 0.8 : 0.7}
          envMapIntensity={isVoidstar ? 2.5 : 2.0}
        />
      </mesh>
      
      {/* Continental/land mass details (voidstar only) */}
      {isVoidstar && (
        <mesh position={planet.position}>
          <sphereGeometry args={[planet.radius * 2.015, 64, 64]} />
          <meshStandardMaterial 
            color={planetColorScheme.surfaceColor}
            transparent
            opacity={0.6}
            roughness={0.8}
            metalness={0.3}
            envMapIntensity={1.5}
          />
        </mesh>
      )}
      
      {/* Cloud layer */}
      <mesh position={planet.position}>
        <sphereGeometry args={[planet.radius * 2.05, 64, 64]} />
        <meshStandardMaterial 
          color={planetColorScheme.cloudColor}
          transparent
          opacity={isVoidstar ? 0.55 : 0.4}
          emissive={planetColorScheme.cloudColor}
          emissiveIntensity={isVoidstar ? 0.2 : 0.1}
          roughness={isVoidstar ? 0.85 : 0.8}
          metalness={isVoidstar ? 0.15 : 0.1}
          envMapIntensity={isVoidstar ? 1.0 : 0.8}
        />
      </mesh>
      
      {/* Additional cloud detail layer (voidstar only) */}
      {isVoidstar && (
        <mesh position={planet.position}>
          <sphereGeometry args={[planet.radius * 2.08, 64, 64]} />
          <meshStandardMaterial 
            color={planetColorScheme.cloudColor}
            transparent
            opacity={0.3}
            roughness={0.9}
            metalness={0.05}
            envMapIntensity={0.8}
          />
        </mesh>
      )}
      
      {/* Atmosphere layer */}
      <mesh 
        ref={atmosphereRef}
        position={planet.position}
      >
        <sphereGeometry args={[planet.radius * 2.2, 32, 32]} />
        <meshStandardMaterial 
          color={planetColorScheme.atmosphereColor}
          transparent
          opacity={isVoidstar ? 0.4 : 0.3}
          emissive={planetColorScheme.atmosphereColor}
          emissiveIntensity={isVoidstar ? 0.5 : 0.2}
          side={2}
          roughness={0.0}
          metalness={0.0}
          envMapIntensity={isVoidstar ? 0.6 : 0.4}
        />
      </mesh>
      
      {/* Outer atmospheric halo for realistic glow (voidstar only) */}
      {isVoidstar && (
        <mesh position={planet.position}>
          <sphereGeometry args={[planet.radius * 2.35, 32, 32]} />
          <meshStandardMaterial 
            color={planetColorScheme.atmosphereColor}
            transparent
            opacity={0.15}
            emissive={planetColorScheme.atmosphereColor}
            emissiveIntensity={0.3}
            side={2}
            roughness={0.0}
            metalness={0.0}
            envMapIntensity={0.4}
          />
        </mesh>
      )}

      {/* Hover info */}
      {hovered && (
        <Html
          position={[planet.position[0], planet.position[1] + planet.radius * 3, planet.position[2]]}
          center
          distanceFactor={15}
        >
          <div className="bg-black/90 text-white px-3 py-2 rounded text-sm font-medium border border-white/20 backdrop-blur-sm">
            <div className="font-semibold">{planet.name}</div>
            <div className="text-xs text-white/70 mt-1">
              {planet.type} • {planet.distance.toFixed(2)} AU
            </div>
            <div className="text-xs text-white/70">
              Mission: {planet.mission} • {planet.discoveryMethod}
            </div>
            <div className="text-xs text-yellow-400 font-semibold">
              Status: {planet.status.toUpperCase()}
            </div>
            <div className={`text-xs font-semibold ${
              planet.aiConfidence === "exoplanet" ? "text-green-400" :
              planet.aiConfidence === "near-exoplanet" ? "text-purple-400" :
              "text-white"
            }`}>
              AI Classification: {planet.aiConfidence.replace("-", " ").toUpperCase()} ({planet.aiAccuracy}%)
            </div>
            <div className="text-xs text-white/70">
              Discovered: {planet.discoveryYear}
            </div>
            {planet.temperature && <div className="text-xs text-white/70">~{Math.round(planet.temperature)}K</div>}
            {isVoidstar && (
              <div className="text-xs text-cyan-400 font-semibold mt-2">
                Click to explore Voidstar system
              </div>
            )}
          </div>
        </Html>
      )}
    </>
  )
}


function CentralSun() {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (meshRef.current) {
      // Sun pulsation
      const pulse = Math.sin(state.clock.elapsedTime * 0.8) * 0.05 + 1
      meshRef.current.scale.setScalar(4 * pulse)
      meshRef.current.rotation.y += 0.002
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Sun core - more yellow-orange */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial 
          color="#FFA500" 
          emissive="#FF8C00"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.0}
        />
      </mesh>

      {/* Sun corona - orange glow */}
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial 
          color="#FF8C00"
          transparent
          opacity={0.3}
          emissive="#FF8C00"
          emissiveIntensity={0.4}
          side={2}
          roughness={0.0}
          metalness={0.0}
        />
      </mesh>

      {/* Sun label */}
      <Html position={[0, -6, 0]} center distanceFactor={15} occlude={false}>
        <div className="text-orange-400 font-bold pointer-events-none select-none" 
             style={{ 
               textShadow: '0 0 10px black, 4px 4px 0 black, -4px -4px 0 black, 4px -4px 0 black, -4px 4px 0 black',
               fontSize: '80px',
               fontFamily: 'monospace',
               fontWeight: 'bold'
             }}>
          Sun
        </div>
      </Html>

      {/* Lighting - orange light */}
      <pointLight position={[0, 0, 0]} intensity={3} color="#FF8C00" distance={200} />
    </group>
  )
}

function BackgroundStars() {
  const starsRef = useRef<THREE.Group>(null!)
  const { isSpinning } = useMissionFilter()

  // Spin the stars when filtering
  useFrame((state, delta) => {
    if (starsRef.current && isSpinning) {
      starsRef.current.rotation.y += delta * 2 // Rotate stars around Y-axis
      starsRef.current.rotation.x += delta * 0.5 // Slight X-axis rotation
    }
  })

  return (
    <group ref={starsRef}>
      {Array.from({ length: 800 }, (_, i) => {
        // Generate random positions in a large sphere
        const radius = 100 + Math.random() * 300
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)

        const x = radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.sin(phi) * Math.sin(theta)
        const z = radius * Math.cos(phi)

        const size = Math.random() * 1.5 + 0.3 // Bigger stars: 0.3 to 1.8
        const brightness = Math.sin(Date.now() * 0.001 + i) * 0.2 + 0.9 // Higher brightness
        
        // Vibrant star colors that really pop
        const starColors = [
          "#FF0000", // Bright Red
          "#00FF00", // Bright Green
          "#0000FF", // Bright Blue
          "#FFFF00", // Bright Yellow
          "#FF00FF", // Bright Magenta
          "#00FFFF", // Bright Cyan
          "#FF8000", // Bright Orange
          "#8000FF", // Bright Purple
          "#FF0080", // Bright Pink
          "#80FF00", // Bright Lime
          "#0080FF", // Bright Sky Blue
          "#FF4000", // Bright Red-Orange
          "#40FF00", // Bright Yellow-Green
          "#0040FF", // Bright Blue-Purple
          "#FF0040", // Bright Red-Pink
          "#40FF80", // Bright Green-Cyan
          "#8040FF", // Bright Purple-Blue
          "#FF8040", // Bright Orange-Red
          "#80FF40", // Bright Lime-Green
          "#4080FF", // Bright Blue-Cyan
        ]
        const starColor = starColors[Math.floor(Math.random() * starColors.length)]

        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[size, 8, 8]} />
            <meshStandardMaterial 
              color={starColor} 
              emissive={starColor}
              emissiveIntensity={0.8}
              transparent 
              opacity={brightness}
              roughness={0.0}
              metalness={0.0}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export function ExoplanetDetection() {
  const exoplanets = useMemo(() => generateExoplanets(), [])
  const { selectedMission } = useMissionFilter()

  // Filter exoplanets based on selected mission
  const filteredExoplanets = useMemo(() => {
    if (selectedMission === "all") {
      return exoplanets
    }
    return exoplanets.filter(planet => planet.mission === selectedMission)
  }, [exoplanets, selectedMission])

  return (
    <group>
      <BackgroundStars />
      <CentralSun />
      {filteredExoplanets.map((planet) => (
        <Exoplanet key={planet.id} planet={planet} />
      ))}
    </group>
  )
}
