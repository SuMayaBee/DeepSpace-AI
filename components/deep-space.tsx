"use client"

import { useRef, useState, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Text, Html } from "@react-three/drei"
import * as THREE from "three"
import { useStarStore } from "@/lib/star-store"
import { RealisticSpaceBackground } from "./realistic-background"

interface StarData {
  id: string
  name: string
  type: string
  temperature: number
  mass: number
  radius: number
  distance: number
  planets: string[]
  constellation: string
  magnitude: number
  color: string
  position: [number, number, number]
  planetData?: PlanetData[]
}

interface PlanetData {
  id: string
  name: string
  type: string
  radius: number
  distance: number
  color: string
  orbitSpeed: number
  temperature?: number
  mass?: number
}

const generatePlanetData = (star: StarData): PlanetData[] => {
  // Always generate at least 1 planet for every star to make them all clickable
  const planetCount = star.name === "Sun" ? 8 : Math.max(1, star.planets.length)

  const planetTypes = [
    { type: "Rocky", colors: ["#8B4513", "#CD853F", "#A0522D"], tempMod: 1.2 },
    { type: "Gas Giant", colors: ["#4169E1", "#FF6347", "#32CD32"], tempMod: 0.8 },
    { type: "Ice Giant", colors: ["#87CEEB", "#B0E0E6", "#ADD8E6"], tempMod: 0.6 },
    { type: "Super Earth", colors: ["#228B22", "#6B8E23", "#9ACD32"], tempMod: 1.0 },
  ]

  return Array.from({ length: planetCount }, (_, index) => {
    const planetType = planetTypes[Math.floor(Math.random() * planetTypes.length)]
    const distance =
      star.name === "Sun"
        ? [0.39, 0.72, 1.0, 1.52, 5.2, 9.5, 19.2, 30.1][index] || (index + 1) * 1.5
        : (index + 1) * 0.8 + Math.random() * 0.5

    const planetName = star.planets[index] || `${star.name} ${String.fromCharCode(98 + index)}`

    return {
      id: `${star.id}-planet-${index}`,
      name: planetName,
      type: planetType.type,
      radius: Math.random() * 0.3 + 0.1,
      distance,
      color: planetType.colors[Math.floor(Math.random() * planetType.colors.length)],
      orbitSpeed: 0.5 / Math.sqrt(distance), // Kepler's laws approximation
      temperature: (star.temperature * planetType.tempMod) / Math.sqrt(distance),
      mass: Math.random() * 2 + 0.1,
    }
  })
}

const STAR_DATA: StarData[] = [
  {
    id: "0",
    name: "Sun",
    type: "G-type Main Sequence (Yellow Dwarf)",
    temperature: 5778,
    mass: 1.0,
    radius: 1.0,
    distance: 0.000016,
    planets: ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"],
    constellation: "Local",
    magnitude: -26.74,
    color: "#FFFF00",
    position: [0, 0, 0],
  },
  {
    id: "1",
    name: "Sirius",
    type: "A-type Main Sequence",
    temperature: 9940,
    mass: 2.063,
    radius: 1.711,
    distance: 8.6,
    planets: ["Sirius b", "Sirius c"],
    constellation: "Canis Major",
    magnitude: -1.46,
    color: "#AABFFF",
    position: [-45, 15, -30],
  },
  {
    id: "2",
    name: "Betelgeuse",
    type: "Red Supergiant",
    temperature: 3500,
    mass: 11.6,
    radius: 764,
    distance: 548,
    planets: ["Betelgeuse b", "Betelgeuse c"],
    constellation: "Orion",
    magnitude: 0.5,
    color: "#FF4500",
    position: [65, -40, 45],
  },
  {
    id: "3",
    name: "Vega",
    type: "A-type Main Sequence",
    temperature: 9602,
    mass: 2.135,
    radius: 2.362,
    distance: 25.04,
    planets: ["Vega b", "Vega c"],
    constellation: "Lyra",
    magnitude: 0.03,
    color: "#FFFFFF",
    position: [50, 60, -70],
  },
  {
    id: "4",
    name: "Rigel",
    type: "Blue Supergiant",
    temperature: 12100,
    mass: 21,
    radius: 78.9,
    distance: 860,
    planets: ["Rigel b"],
    constellation: "Orion",
    magnitude: 0.13,
    color: "#87ceeb",
    position: [-70, -50, 40],
  },
  {
    id: "5",
    name: "Proxima Centauri",
    type: "Red Dwarf",
    temperature: 3042,
    mass: 0.1221,
    radius: 0.1542,
    distance: 4.24,
    planets: ["Proxima Centauri b", "Proxima Centauri c"],
    constellation: "Centaurus",
    magnitude: 11.13,
    color: "#ff4500",
    position: [30, -65, 55],
  },
  {
    id: "6",
    name: "Arcturus",
    type: "Red Giant",
    temperature: 4286,
    mass: 1.08,
    radius: 25.4,
    distance: 36.7,
    planets: ["Arcturus b"],
    constellation: "Boötes",
    magnitude: -0.05,
    color: "#ff8c00",
    position: [-55, 70, -25],
  },
  {
    id: "7",
    name: "Capella",
    type: "Yellow Giant",
    temperature: 4970,
    mass: 2.569,
    radius: 11.98,
    distance: 42.9,
    planets: ["Capella b", "Capella c"],
    constellation: "Auriga",
    magnitude: 0.08,
    color: "#fff8dc",
    position: [80, 35, -50],
  },
  {
    id: "8",
    name: "Aldebaran",
    type: "Red Giant",
    temperature: 3910,
    mass: 1.16,
    radius: 44.13,
    distance: 65.3,
    planets: ["Aldebaran b"],
    constellation: "Taurus",
    magnitude: 0.85,
    color: "#ff6347",
    position: [-20, -15, 45],
  },
  {
    id: "9",
    name: "Alpha Centauri A",
    type: "G-type Main Sequence",
    temperature: 5790,
    mass: 1.1,
    radius: 1.22,
    distance: 4.37,
    planets: ["Proxima Centauri b", "Proxima Centauri c"],
    constellation: "Centaurus",
    magnitude: -0.01,
    color: "#fff8e7",
    position: [60, -10, 20],
  },
  {
    id: "10",
    name: "Canopus",
    type: "A-type Supergiant",
    temperature: 7350,
    mass: 8.5,
    radius: 71,
    distance: 310,
    planets: ["Canopus b"],
    constellation: "Carina",
    magnitude: -0.74,
    color: "#f8f8ff",
    position: [-60, -50, -10],
  },
  {
    id: "11",
    name: "Polaris",
    type: "F-type Supergiant",
    temperature: 6015,
    mass: 5.4,
    radius: 37.5,
    distance: 433,
    planets: ["Polaris b", "Polaris c"],
    constellation: "Ursa Minor",
    magnitude: 1.98,
    color: "#f5f5dc",
    position: [0, 70, -25],
  },
  {
    id: "12",
    name: "Antares",
    type: "Red Supergiant",
    temperature: 3660,
    mass: 12,
    radius: 883,
    distance: 550,
    planets: ["Antares b"],
    constellation: "Scorpius",
    magnitude: 0.6,
    color: "#ff4500",
    position: [35, -60, 40],
  },
  {
    id: "13",
    name: "Spica",
    type: "B-type Main Sequence",
    temperature: 22400,
    mass: 11.43,
    radius: 7.47,
    distance: 250,
    planets: ["Spica b", "Spica c"],
    constellation: "Virgo",
    magnitude: 0.97,
    color: "#b6e5ff",
    position: [-25, 25, 55],
  },
  {
    id: "14",
    name: "Deneb",
    type: "A-type Supergiant",
    temperature: 8525,
    mass: 19,
    radius: 203,
    distance: 2615,
    planets: ["Deneb b"],
    constellation: "Cygnus",
    magnitude: 1.25,
    color: "#ffffff",
    position: [80, 30, -50],
  },
  {
    id: "15",
    name: "Altair",
    type: "A-type Main Sequence",
    temperature: 7550,
    mass: 1.79,
    radius: 1.63,
    distance: 16.73,
    planets: ["Altair b", "Altair c"],
    constellation: "Aquila",
    magnitude: 0.77,
    color: "#ffffff",
    position: [45, 10, 35],
  },
  {
    id: "16",
    name: "Regulus",
    type: "B-type Main Sequence",
    temperature: 12460,
    mass: 3.8,
    radius: 3.092,
    distance: 79.3,
    planets: ["Regulus b"],
    constellation: "Leo",
    magnitude: 1.4,
    color: "#b4c7ff",
    position: [-40, 0, -35],
  },
  {
    id: "17",
    name: "Procyon",
    type: "F-type Subgiant",
    temperature: 6530,
    mass: 1.499,
    radius: 2.048,
    distance: 11.46,
    planets: ["Procyon b", "Procyon c"],
    constellation: "Canis Minor",
    magnitude: 0.34,
    color: "#fff4e6",
    position: [-15, 30, 25],
  },
  {
    id: "18",
    name: "Achernar",
    type: "B-type Main Sequence",
    temperature: 20000,
    mass: 6.7,
    radius: 7.3,
    distance: 139,
    planets: ["Achernar b"],
    constellation: "Eridanus",
    magnitude: 0.46,
    color: "#aabfff",
    position: [70, -40, -20],
  },
  {
    id: "19",
    name: "Bellatrix",
    type: "B-type Giant",
    temperature: 22000,
    mass: 8.6,
    radius: 5.75,
    distance: 245,
    planets: ["Bellatrix b", "Bellatrix c"],
    constellation: "Orion",
    magnitude: 1.64,
    color: "#92b5ff",
    position: [30, -35, -45],
  },
  {
    id: "20",
    name: "Fomalhaut",
    type: "A-type Main Sequence",
    temperature: 8590,
    mass: 1.92,
    radius: 1.842,
    distance: 25.13,
    planets: ["Fomalhaut b"],
    constellation: "Piscis Austrinus",
    magnitude: 1.16,
    color: "#a7c5ff",
    position: [-55, -25, 60],
  },
  {
    id: "21",
    name: "Castor",
    type: "A-type Main Sequence",
    temperature: 10286,
    mass: 2.76,
    radius: 2.4,
    distance: 51.6,
    planets: ["Castor b", "Castor c"],
    constellation: "Gemini",
    magnitude: 1.57,
    color: "#a1c0ff",
    position: [20, 45, -15],
  },
  {
    id: "22",
    name: "Pollux",
    type: "K-type Giant",
    temperature: 4666,
    mass: 1.91,
    radius: 8.8,
    distance: 33.78,
    planets: ["Pollux b"],
    constellation: "Gemini",
    magnitude: 1.14,
    color: "#ffb347",
    position: [25, 50, -10],
  },
  {
    id: "23",
    name: "Alnilam",
    type: "B-type Supergiant",
    temperature: 27000,
    mass: 32,
    radius: 28.6,
    distance: 2000,
    planets: ["Alnilam b"],
    constellation: "Orion",
    magnitude: 1.69,
    color: "#9bb0ff",
    position: [42, -28, 28],
  },
  {
    id: "24",
    name: "Mintaka",
    type: "O-type Giant",
    temperature: 29500,
    mass: 24,
    radius: 16.5,
    distance: 1200,
    planets: ["Mintaka b", "Mintaka c"],
    constellation: "Orion",
    magnitude: 2.23,
    color: "#92b5ff",
    position: [38, -32, 32],
  },
  {
    id: "25",
    name: "Alnitak",
    type: "O-type Supergiant",
    temperature: 29000,
    mass: 33,
    radius: 20,
    distance: 1260,
    planets: ["Alnitak b"],
    constellation: "Orion",
    magnitude: 1.79,
    color: "#9bb0ff",
    position: [44, -22, 26],
  },
  {
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
    position: [-60, 45, -35],
  },
  ...Array.from({ length: 54 }, (_, i) => {
    const starTypes = [
      { type: "M-type Red Dwarf", tempRange: [2000, 3500], color: "#FF4500", massRange: [0.08, 0.45] },
      { type: "K-type Orange Dwarf", tempRange: [3500, 5000], color: "#FF8C00", massRange: [0.45, 0.8] },
      { type: "G-type Yellow Dwarf", tempRange: [5000, 6000], color: "#FFFF00", massRange: [0.8, 1.04] },
      { type: "F-type White Dwarf", tempRange: [6000, 7500], color: "#F8F8FF", massRange: [1.04, 1.4] },
      { type: "A-type White Star", tempRange: [7500, 10000], color: "#FFFFFF", massRange: [1.4, 2.1] },
      { type: "B-type Blue-White", tempRange: [10000, 30000], color: "#AABFFF", massRange: [2.1, 16] },
      { type: "O-type Blue Giant", tempRange: [30000, 50000], color: "#9BB0FF", massRange: [16, 90] },
    ]

    const constellations = [
      "Andromeda",
      "Aquarius",
      "Aries",
      "Cancer",
      "Capricornus",
      "Gemini",
      "Leo",
      "Libra",
      "Pisces",
      "Sagittarius",
      "Scorpius",
      "Taurus",
      "Virgo",
      "Cassiopeia",
      "Cygnus",
      "Draco",
      "Hercules",
      "Lyra",
      "Orion",
      "Perseus",
      "Ursa Major",
      "Ursa Minor",
      "Centaurus",
      "Crux",
      "Eridanus",
      "Hydra",
      "Phoenix",
      "Tucana",
      "Vela",
      "Carina",
    ]

    const starType = starTypes[Math.floor(Math.random() * starTypes.length)]
    const temperature = Math.floor(
      Math.random() * (starType.tempRange[1] - starType.tempRange[0]) + starType.tempRange[0],
    )
    const mass = Math.random() * (starType.massRange[1] - starType.massRange[0]) + starType.massRange[0]
    const magnitude = Math.random() * 8 + 1
    const distance = Math.random() * 1000 + 10

    // Better distribution: Create multiple spherical shells with even distribution
    const shellIndex = Math.floor(i / 18) // Create 3 shells with 18 stars each
    const starInShell = i % 18
    
    // Base radius for each shell (40, 80, 120)
    const baseRadius = 40 + shellIndex * 40
    const radiusVariation = Math.random() * 20 - 10 // ±10 variation
    const radius = baseRadius + radiusVariation
    
    // Fibonacci spiral distribution for more even spacing
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)) // Golden angle in radians
    const theta = starInShell * goldenAngle
    const phi = Math.acos(1 - 2 * (starInShell + Math.random() * 0.5) / 18)
    
    // Add some randomness to avoid perfect patterns
    const thetaOffset = (Math.random() - 0.5) * 0.8
    const phiOffset = (Math.random() - 0.5) * 0.4
    
    const finalTheta = theta + thetaOffset
    const finalPhi = phi + phiOffset

    const x = radius * Math.sin(finalPhi) * Math.cos(finalTheta)
    const y = radius * Math.sin(finalPhi) * Math.sin(finalTheta)
    const z = radius * Math.cos(finalPhi)

    const hasExoplanets = Math.random() < 0.15
    const planetCount = hasExoplanets ? Math.min(Math.floor(Math.random() * 2) + 1, 2) : 1
    const planets = Array.from(
      { length: planetCount },
      (_, j) => `${starType.type.split("-")[0]}-${i + 26}-${String.fromCharCode(98 + j)}`,
    )

    return {
      id: (i + 26).toString(),
      name: `${starType.type.split("-")[0]}-${i + 26}`,
      type: starType.type,
      temperature,
      mass: Math.round(mass * 100) / 100,
      radius: Math.round(mass ** 0.8 * 100) / 100,
      distance: Math.round(distance * 10) / 10,
      planets,
      constellation: constellations[Math.floor(Math.random() * constellations.length)],
      magnitude: Math.round(magnitude * 100) / 100,
      color: starType.color,
      position: [Math.round(x * 10) / 10, Math.round(y * 10) / 10, Math.round(z * 10) / 10] as [number, number, number],
    }
  }),
].map((star) => {
  const typedStar = {
    ...star,
    position: star.position as [number, number, number],
  }
  return {
    ...typedStar,
    planetData: generatePlanetData(typedStar),
  }
})

function InteractiveStar({ star }: { star: StarData }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const glowRef = useRef<THREE.Mesh>(null!)
  const coronaRef = useRef<THREE.Mesh>(null!)
  const twinkleRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const { setSelectedStar, setHoveredStar, zoomToStarSystem } = useStarStore()

  const isSun = star.name === "Sun"
  const baseSize = isSun ? 4 : Math.max(0.3, 2 - star.magnitude * 0.3)
  const size = hovered ? baseSize * 1.5 : baseSize

  const starVisuals = useMemo(() => {
    // Special bright cyan star - impossible to miss
    if (star.name === "Voidstar") {
      return { color: "#00FFFF", glowColor: "#00BFFF", intensity: 3.0 }
    }
    // Based on stellar classification chart: O, B, A, F, G, K, M types
    else if (star.name === "Sun" || star.type?.includes("G-type")) {
      // G-type: Yellow stars like our Sun (5,000-6,000K)
      return { color: "#FFFF00", glowColor: "#FFFF66", intensity: 1.0 }
    } else if (star.type?.includes("O-type")) {
      // O-type: Blue-white, hottest stars (>30,000K)  
      return { color: "#9BB0FF", glowColor: "#AABFFF", intensity: 2.0 }
    } else if (star.type?.includes("B-type")) {
      // B-type: Blue-white stars (10,000-30,000K)
      return { color: "#AABFFF", glowColor: "#BBCFFF", intensity: 1.8 }
    } else if (star.type?.includes("A-type")) {
      // A-type: White stars (7,500-10,000K)
      return { color: "#FFFFFF", glowColor: "#FFFFFF", intensity: 1.6 }
    } else if (star.type?.includes("F-type")) {
      // F-type: Yellow-white stars (6,000-7,500K)
      return { color: "#F8F8FF", glowColor: "#FFFFCC", intensity: 1.3 }
    } else if (star.type?.includes("K-type")) {
      // K-type: Orange stars (3,500-5,000K)
      return { color: "#FF8C00", glowColor: "#FFA500", intensity: 0.9 }
    } else if (star.type?.includes("M-type") || star.type?.includes("Red")) {
      // M-type: Red dwarf stars, coolest (<3,500K)
      return { color: "#FF4500", glowColor: "#FF6347", intensity: 0.7 }
    } else {
      // Default to G-type (Sun-like) for unknown types
      return { color: "#FFFF00", glowColor: "#FFFF66", intensity: 1.0 }
    }
  }, [star.type, star.name])

  useFrame((state) => {
    // Performance optimization: Skip frames for smoother experience
    if (Math.floor(state.clock.elapsedTime * 60) % 2 !== 0) return

    if (meshRef.current) {
      // Simplified pulsation for better performance
      const pulse = Math.sin(state.clock.elapsedTime * 0.8) * 0.02 + 1
      meshRef.current.scale.setScalar(size * pulse)
      
      // Reduced rotation frequency
      meshRef.current.rotation.y += 0.0005
    }

    // Only animate glow for important stars or when hovered
    if (glowRef.current && (isSun || hovered)) {
      const glowPulse = Math.sin(state.clock.elapsedTime) * 0.05 + 0.95
      const material = glowRef.current.material as THREE.MeshStandardMaterial
      if (material) {
        material.opacity = (isSun ? 0.2 : 0.15) * glowPulse
        material.emissiveIntensity = 0.2 * glowPulse
      }
    }

    // Simplified corona animation
    if (coronaRef.current && (isSun || hovered)) {
      const material = coronaRef.current.material as THREE.MeshStandardMaterial
      if (material) {
        material.opacity = 0.06
      }
      coronaRef.current.rotation.z += 0.001
    }

    // Only animate twinkle when hovered for performance
    if (twinkleRef.current && !isSun && hovered) {
      const twinkle = Math.sin(state.clock.elapsedTime + star.position[0]) * 0.08 + 0.92
      const material = twinkleRef.current.material as THREE.MeshStandardMaterial
      if (material) {
        material.opacity = twinkle * 0.12
      }
    }
  })

  return (
    <group position={star.position}>
      {/* Point light for realistic illumination */}
      <pointLight
        position={[0, 0, 0]}
        intensity={starVisuals.intensity * (isSun ? 2 : 0.8)}
        color={starVisuals.color}
        distance={isSun ? 100 : 50}
        decay={2}
      />

      {/* Main star core with realistic surface */}
      <mesh
        ref={meshRef}
        onPointerEnter={() => {
          setHovered(true)
          setHoveredStar(star)
          document.body.style.cursor = "pointer"
        }}
        onPointerLeave={() => {
          setHovered(false)
          setHoveredStar(null)
          document.body.style.cursor = "default"
        }}
        onClick={() => {
          zoomToStarSystem(star)
        }}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={starVisuals.color}
          emissive={starVisuals.color}
          emissiveIntensity={0.6}
          roughness={0.8}
          metalness={0.1}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Realistic atmospheric glow */}
      <mesh ref={glowRef} position={[0, 0, 0]}>
        <sphereGeometry args={[isSun ? 2.5 : 1.8, 12, 12]} />
        <meshStandardMaterial
          color={starVisuals.glowColor}
          emissive={starVisuals.glowColor}
          emissiveIntensity={0.3}
          transparent
          opacity={0.2}
          side={2}
          depthWrite={false}
        />
      </mesh>

      {/* Subtle stellar wind effect for distant stars */}
      {!isSun && (
        <mesh ref={twinkleRef} position={[0, 0, 0]}>
          <sphereGeometry args={[1.2, 8, 8]} />
          <meshStandardMaterial
            color={starVisuals.color}
            emissive={starVisuals.color}
            emissiveIntensity={0.2}
            transparent
            opacity={0.15}
            depthWrite={false}
            blending={2}
          />
        </mesh>
      )}

      {/* Enhanced corona for Sun and hovered stars */}
      {(isSun || hovered) && (
        <mesh ref={coronaRef} position={[0, 0, 0]}>
          <sphereGeometry args={[isSun ? 4 : 2.8, 16, 16]} />
          <meshStandardMaterial
            color={starVisuals.glowColor}
            emissive={starVisuals.glowColor}
            emissiveIntensity={0.1}
            transparent
            opacity={0.08}
            side={2}
            depthWrite={false}
          />
        </mesh>
      )}



      {/* Always visible Sun label with fixed size */}
      {isSun && (
        <Html position={[0, -6, 0]} center distanceFactor={15} occlude={false}>
          <div className="text-yellow-400 font-bold pointer-events-none select-none" 
               style={{ 
                 textShadow: '0 0 10px black, 4px 4px 0 black, -4px -4px 0 black, 4px -4px 0 black, -4px 4px 0 black',
                 fontSize: '80px',
                 fontFamily: 'monospace',
                 fontWeight: 'bold'
               }}>
            Sun
          </div>
        </Html>
      )}

      {hovered && !isSun && (
        <Text
          position={[0, -4, 0]}
          fontSize={0.6}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {star.constellation}
        </Text>
      )}
    </group>
  )
}

export function DeepSpace() {
  // Reduce star count for better performance
  const stars = useMemo(() => STAR_DATA.slice(0, 80), [])
  const { isFilterSpinning } = useStarStore()
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (groupRef.current && isFilterSpinning) {
      // More pronounced spinning animation during filter transition
      groupRef.current.rotation.y += 0.08
    }
  })

  return (
    <group ref={groupRef}>
      <RealisticSpaceBackground />
      {stars.map((star) => (
        <InteractiveStar key={star.id} star={star} />
      ))}
    </group>
  )
}
