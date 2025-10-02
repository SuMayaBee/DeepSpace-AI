import { useRef, useState, useEffect, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"
import { useStarStore, type StarData, type PlanetData } from "@/lib/star-store"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { TransitChart } from "./transit-chart"

// Helper function to generate random hex color
function getRandomColor(): string {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

// Helper function to generate random color in specific hue range
function getRandomColorInHueRange(minHue: number, maxHue: number): string {
  const hue = Math.floor(Math.random() * (maxHue - minHue + 1)) + minHue
  const saturation = Math.floor(Math.random() * 30) + 70 // 70-100%
  const lightness = Math.floor(Math.random() * 30) + 40 // 40-70%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

// Convert HSL to Hex
function hslToHex(hsl: string): string {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (!match) return getRandomColor()
  
  const h = parseInt(match[1]) / 360
  const s = parseInt(match[2]) / 100
  const l = parseInt(match[3]) / 100
  
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }
  
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  
  const r = Math.round(hue2rgb(p, q, h + 1/3) * 255)
  const g = Math.round(hue2rgb(p, q, h) * 255)
  const b = Math.round(hue2rgb(p, q, h - 1/3) * 255)
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Generate a complete planet color scheme
function generatePlanetColorScheme(planetId: string): {
  baseColor: string
  surfaceColor: string
  atmosphereColor: string
  emissiveColor: string
  cloudColor: string
  name: string
} {
  // Use planet ID as seed for consistent colors
  const seed = planetId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = (min: number, max: number) => {
    const x = Math.sin(seed) * 10000
    const pseudoRandom = x - Math.floor(x)
    return Math.floor(pseudoRandom * (max - min + 1)) + min
  }
  
  // Define color palettes with different themes
  const themes = [
    { name: "Ocean World", hueRange: [180, 240] }, // Blues
    { name: "Volcanic Planet", hueRange: [0, 30] }, // Reds/Oranges
    { name: "Forest World", hueRange: [80, 140] }, // Greens
    { name: "Desert Planet", hueRange: [30, 60] }, // Yellows/Oranges
    { name: "Ice Giant", hueRange: [200, 260] }, // Light blues/Cyans
    { name: "Gas Giant", hueRange: [240, 300] }, // Purples
    { name: "Magma World", hueRange: [0, 20] }, // Deep reds
    { name: "Crystal Planet", hueRange: [280, 340] }, // Pinks/Magentas
  ]
  
  const theme = themes[random(0, themes.length - 1)]
  const baseHue = random(theme.hueRange[0], theme.hueRange[1])
  
  // Generate harmonious colors based on base hue
  const baseColor = hslToHex(`hsl(${baseHue}, ${random(60, 80)}%, ${random(25, 40)}%)`)
  const surfaceColor = hslToHex(`hsl(${baseHue}, ${random(70, 90)}%, ${random(45, 65)}%)`)
  const atmosphereColor = hslToHex(`hsl(${baseHue}, ${random(50, 70)}%, ${random(60, 80)}%)`)
  const emissiveColor = hslToHex(`hsl(${baseHue}, ${random(80, 100)}%, ${random(10, 25)}%)`)
  const cloudColor = hslToHex(`hsl(${baseHue}, ${random(20, 40)}%, ${random(85, 95)}%)`)
  
  return {
    baseColor,
    surfaceColor,
    atmosphereColor,
    emissiveColor,
    cloudColor,
    name: theme.name
  }
}

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

// Uniform orbit spacing for all planets/rings
const ORBIT_BASE = 3 // inner offset from the star
const ORBIT_SPACING = 2.5 // constant spacing between consecutive orbits
const ORBIT_FIRST_EXTRA = 1.0 // additional spacing for the very first orbit to avoid sun glow

function OrbitingPlanet({ planet, starColor, index }: { planet: PlanetData; starColor: string; index: number }) {
  const planetRef = useRef<THREE.Mesh>(null!)
  const atmosphereRef = useRef<THREE.Mesh>(null!)
  const cloudsRef = useRef<THREE.Mesh>(null!)
  const surfaceRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const [angle, setAngle] = useState(Math.random() * Math.PI * 2)
  const { focusOnObject, zoomedStar } = useStarStore()

  const isVoidstar = zoomedStar?.name === "Voidstar"
  
  // Generate dynamic colors for each planet
  const planetColorScheme = useMemo(() => {
    if (isVoidstar) {
      // For Voidstar, use the predefined planet types
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
        },
        { 
          baseColor: "#FFFFFF", // Pure white
          surfaceColor: "#F0F9FF", // Very light blue-white
          atmosphereColor: "#E0F2FE", 
          emissiveColor: "#F8FAFC",
          cloudColor: "#FFFFFF",
          name: "Frozen Ice Giant"
        },
        { 
          baseColor: "#581C87", // Deep purple
          surfaceColor: "#A855F7", // Bright purple
          atmosphereColor: "#C084FC", 
          emissiveColor: "#3B0764",
          cloudColor: "#F3E8FF",
          name: "Ammonia Cloud World"
        },
        { 
          baseColor: "#155E75", // Dark cyan
          surfaceColor: "#06B6D4", // Bright cyan
          atmosphereColor: "#22D3EE", 
          emissiveColor: "#083344",
          cloudColor: "#E0F7FA",
          name: "Methane Ice Planet"
        },
        { 
          baseColor: "#831843", // Deep pink
          surfaceColor: "#EC4899", // Bright pink
          atmosphereColor: "#F472B6", 
          emissiveColor: "#500724",
          cloudColor: "#FCE7F3",
          name: "Rose Quartz World"
        },
        { 
          baseColor: "#134E4A", // Dark teal
          surfaceColor: "#14B8A6", // Bright teal
          atmosphereColor: "#2DD4BF", 
          emissiveColor: "#064E3B",
          cloudColor: "#CCFBF1",
          name: "Jade Ocean Planet"
        },
        { 
          baseColor: "#713F12", // Dark yellow
          surfaceColor: "#EAB308", // Bright yellow
          atmosphereColor: "#FACC15", 
          emissiveColor: "#422006",
          cloudColor: "#FEF9C3",
          name: "Sulfur Desert World"
        }
      ]
      return planetTypes[index % planetTypes.length]
    } else {
      // For regular stars, generate random colors based on planet ID
      return generatePlanetColorScheme(planet.id)
    }
  }, [isVoidstar, planet.id, index])


  useFrame((state) => {
    setAngle((prev) => prev + planet.orbitSpeed * 0.01)

    if (planetRef.current) {
      // Enforce uniform orbit spacing by index, add extra for the first orbit
      const base = ORBIT_BASE + index * ORBIT_SPACING
      const orbitRadius = base + (index === 0 ? ORBIT_FIRST_EXTRA : 0)
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
        <meshStandardMaterial 
          color={planetColorScheme.baseColor}
          emissive={planetColorScheme.emissiveColor}
          emissiveIntensity={isVoidstar ? 0.8 : 0.3}
          roughness={isVoidstar ? 0.75 : 0.6}
          metalness={isVoidstar ? 0.25 : 0.4}
          envMapIntensity={isVoidstar ? 1.8 : 2.0}
        />
      </mesh>

      {/* Enhanced realistic planet layers for all planets */}
      <>
        {/* Surface terrain details with continents and oceans */}
        <mesh ref={surfaceRef}>
          <sphereGeometry args={[planet.radius * 2.01, 128, 128]} />
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
        
        {/* Ocean/liquid layer for realistic water bodies */}
        <mesh>
          <sphereGeometry args={[planet.radius * 2.005, 96, 96]} />
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
        
        {/* Continental/land mass details */}
        {isVoidstar && (
          <mesh>
            <sphereGeometry args={[planet.radius * 2.015, 64, 64]} />
            <meshStandardMaterial 
              color={planetColorScheme.surfaceColor}
              transparent
              opacity={0.6}
              emissive={planetColorScheme.surfaceColor}
              emissiveIntensity={0.15}
              roughness={0.8}
              metalness={0.2}
              envMapIntensity={1.5}
            />
          </mesh>
        )}
        
        {/* Enhanced cloud layer with realistic patterns and variations */}
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[planet.radius * 2.06, 96, 96]} />
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
        
        {/* Additional cloud detail layer for more realistic patterns */}
        {isVoidstar && (
          <mesh>
            <sphereGeometry args={[planet.radius * 2.08, 64, 64]} />
            <meshStandardMaterial 
              color={planetColorScheme.cloudColor}
              transparent
              opacity={0.3}
              emissive={planetColorScheme.cloudColor}
              emissiveIntensity={0.1}
              roughness={0.95}
              metalness={0.05}
              envMapIntensity={0.6}
            />
          </mesh>
        )}
        
        {/* Thick atmospheric glow with scattering effect */}
        <mesh ref={atmosphereRef}>
          <sphereGeometry args={[planet.radius * 2.18, 48, 48]} />
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
        
        {/* Outer atmospheric halo for realistic glow */}
        {isVoidstar && (
          <mesh>
            <sphereGeometry args={[planet.radius * 2.35, 32, 32]} />
            <meshStandardMaterial 
              color={planetColorScheme.atmosphereColor}
              transparent
              opacity={0.15}
              emissive={planetColorScheme.atmosphereColor}
              emissiveIntensity={0.8}
              side={2}
              roughness={0.0}
              metalness={0.0}
              envMapIntensity={0.3}
            />
          </mesh>
        )}
      </>

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
      {planets.map((planet, i) => {
        const base = ORBIT_BASE + i * ORBIT_SPACING
        const r = base + (i === 0 ? ORBIT_FIRST_EXTRA : 0)
        return (
          <mesh key={`ring-${planet.id}`} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r - 0.05, r + 0.05, 64]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.6} side={2} />
          </mesh>
        )
      })}
    </group>
  )
}

function CentralStar({ star }: { star: StarData }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const fireParticlesRef = useRef<THREE.Group>(null!)
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
      // Surface convection rotation
      meshRef.current.rotation.y += 0.002 * starVisuals.activity * (star.type?.includes("Giant") ? 0.5 : 1)

      // Add constant intense glow for Sun (no pulsing)
      if (isSun) {
        const material = meshRef.current.material as THREE.MeshStandardMaterial
        if (material) {
          // Keep constant maximum glow intensity
          material.emissiveIntensity = 2.0
        }
      }
    }

    // Animate fire particles for Sun
    if (isSun && fireParticlesRef.current) {
      const time = state.clock.elapsedTime
      const children = fireParticlesRef.current.children

      // Animate outer fire layer (first 24 particles)
      for (let i = 0; i < Math.min(24, children.length); i++) {
        const mesh = children[i] as THREE.Mesh
        const offset = i * 0.3

        // Create aggressive flickering flame motion
        const flickerX = Math.sin(time * 3.5 + offset) * 0.25
        const flickerY = Math.sin(time * 3 + offset) * 0.18
        const flickerZ = Math.cos(time * 2.8 + offset) * 0.25

        mesh.position.set(flickerX, flickerY, flickerZ)

        // Aggressive scale animation for flame size variation
        const scale = 0.85 + Math.sin(time * 5 + offset) * 0.25
        mesh.scale.setScalar(scale)

        // Faster rotation for angry flames
        mesh.rotation.y = time * 0.5 + offset * 0.7
        mesh.rotation.x = Math.sin(time * 2.5 + offset) * 0.4
      }

      // Animate inner fire layer (remaining particles)
      for (let i = 24; i < children.length; i++) {
        const mesh = children[i] as THREE.Mesh
        const offset = (i - 24) * 0.4

        // Create very intense inner flame motion
        const flickerX = Math.sin(time * 6 + offset) * 0.15
        const flickerY = Math.sin(time * 5.5 + offset) * 0.12
        const flickerZ = Math.cos(time * 4.8 + offset) * 0.15

        mesh.position.set(flickerX, flickerY, flickerZ)

        // Very aggressive scale variation for inner flames
        const scale = 0.9 + Math.sin(time * 7 + offset) * 0.2
        mesh.scale.setScalar(scale)

        // Very fast rotation for inner flames
        mesh.rotation.y = time * 0.9 + offset * 0.9
        mesh.rotation.x = Math.sin(time * 3.5 + offset) * 0.5
      }
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
        {isSun ? (
          // Sun gets fireball design
          <meshStandardMaterial
            color="#FF0000"
            emissive="#CC0000"
            emissiveIntensity={2.0}
            roughness={0.02}
            metalness={0.0}
          />
        ) : (
          // Other stars get normal design
          <meshStandardMaterial
            color={starVisuals.core}
            emissive={starVisuals.core}
            emissiveIntensity={0.8}
            roughness={0.2}
            metalness={0.0}
          />
        )}
      </mesh>

      {/* Enhanced lighting for realistic illumination */}
      <pointLight
        position={[0, 0, 0]}
        intensity={isSun ? starVisuals.activity * 6 : starVisuals.activity * 2}
        color={isSun ? "#FF0000" : starVisuals.core}
        distance={60}
      />

      {/* Fire particles for Sun */}
      {isSun && (
        <group ref={fireParticlesRef}>
          {/* Create a spherical shell of fire around the Sun */}
          {Array.from({ length: 24 }, (_, i) => {
            const phi = Math.acos(2 * Math.random() - 1) // Random spherical coordinate
            const theta = Math.random() * Math.PI * 2
            const radius = 1.8 + Math.random() * 0.4 // Fire shell radius

            const x = radius * Math.sin(phi) * Math.cos(theta)
            const y = radius * Math.sin(phi) * Math.sin(theta)
            const z = radius * Math.cos(phi)

            return (
              <mesh key={i} position={[x, y, z]}>
                <sphereGeometry args={[0.08 + Math.random() * 0.06, 6, 6]} />
                <meshStandardMaterial
                  color={`#${Math.random() > 0.5 ? 'FF' : 'EE'}${'0'}${'0'}00`}
                  emissive={`#${Math.random() > 0.5 ? 'CC' : 'AA'}${'0'}${'0'}00`}
                  emissiveIntensity={1.2}
                  transparent
                  opacity={0.8 + Math.random() * 0.2}
                />
              </mesh>
            )
          })}

          {/* Additional inner fire layer for density */}
          {Array.from({ length: 16 }, (_, i) => {
            const phi = Math.acos(2 * Math.random() - 1)
            const theta = Math.random() * Math.PI * 2
            const radius = 1.4 + Math.random() * 0.3

            const x = radius * Math.sin(phi) * Math.cos(theta)
            const y = radius * Math.sin(phi) * Math.sin(theta)
            const z = radius * Math.cos(phi)

            return (
              <mesh key={`inner-${i}`} position={[x, y, z]}>
                <sphereGeometry args={[0.06 + Math.random() * 0.04, 5, 5]} />
                <meshStandardMaterial
                  color="#EE0000"
                  emissive="#AA0000"
                  emissiveIntensity={1.5}
                  transparent
                  opacity={0.9 + Math.random() * 0.1}
                />
              </mesh>
            )
          })}
        </group>
      )}

      {/* Outer glow effect for Sun */}
      {isSun && (
        <group>
          {/* Large outer glow sphere */}
          <mesh>
            <sphereGeometry args={[2.5, 32, 32]} />
            <meshBasicMaterial
              color="#FF0000"
              transparent
              opacity={0.15}
            />
          </mesh>

          

          {/* Small inner glow */}
          <mesh>
            <sphereGeometry args={[2.0, 24, 24]} />
            <meshBasicMaterial
              color="#FF0000"
              transparent
              opacity={0.08}
            />
          </mesh>
        </group>
      )}

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

  // Calculate the radius for the green zone outside the last orbit
  const lastOrbitIndex = zoomedStar.planetData.length - 1
  const lastOrbitRadius = ORBIT_BASE + lastOrbitIndex * ORBIT_SPACING + (lastOrbitIndex === 0 ? ORBIT_FIRST_EXTRA : 0)
  const greenZoneRadius = lastOrbitRadius + 1.5 // Add some padding outside the last orbit

  return (
    <group>
      <CentralStar star={zoomedStar} />

      <OrbitRings planets={zoomedStar.planetData} starColor={zoomedStar.color} />

      {zoomedStar.planetData.map((planet, index) => (
        <OrbitingPlanet key={planet.id} planet={planet} starColor={zoomedStar.color} index={index} />
      ))}

      {/* Light green zone outside the last orbit */}
      <mesh>
        <sphereGeometry args={[greenZoneRadius, 32, 32]} />
        <meshBasicMaterial
          color="#00FF00"
          transparent
          opacity={0.08}
        />
      </mesh>
    </group>
  )
}

export function StarSystemUI() {
  const { zoomedStar, returnToSpace, currentView, navigationSource } = useStarStore()

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

      {/* Transit Chart - Only show when coming from exoplanet detection */}
      {navigationSource === "exoplanet-detection" && (
        <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-[60]">
          <TransitChart 
            planetName={zoomedStar.planetData?.[0]?.name || "Voidstar b"}
            starName={zoomedStar.name}
          />
        </div>
      )}
    </>
  )
}

// Export the color generation function for use in other components
export { generatePlanetColorScheme }
