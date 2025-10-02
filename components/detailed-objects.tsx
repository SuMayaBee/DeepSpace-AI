"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
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
  const oceanRef = useRef<THREE.Mesh>(null!)
  const landRef = useRef<THREE.Mesh>(null!)

  // Planet color palette by real planet name (only colors vary)
  type Palette = { band1: string; band2: string; band3: string; atmosphere: string; ocean: string; land: string; clouds: string }
  const palette = useMemo<Palette>(() => {
    // Seeded RNG based on planet identity for stable randomness per planet
    const key = (planet.id || planet.name || "seed").toString()

    // Simple string hash to 32-bit int
    const hash = (str: string) => {
      let h = 2166136261 >>> 0
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i)
        h = Math.imul(h, 16777619)
      }
      return h >>> 0
    }

    // Mulberry32 PRNG
    const mulberry32 = (a: number) => {
      return () => {
        let t = (a += 0x6D2B79F5)
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
      }
    }

    const rnd = mulberry32(hash(key))

    // Helper: HSL to HEX
    const hslToHex = (h: number, s: number, l: number) => {
      const a = s * Math.min(l, 1 - l)
      const f = (n: number) => {
        const k = (n + h / 30) % 12
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
        return Math.round(255 * color)
          .toString(16)
          .padStart(2, "0")
      }
      return `#${f(0)}${f(8)}${f(4)}`
    }

    // Base hue and variations
    const baseHue = Math.floor(rnd() * 360)
    const hue1 = (baseHue + Math.floor(rnd() * 20) - 10 + 360) % 360
    const hue2 = (baseHue + Math.floor(rnd() * 20) - 10 + 360) % 360
    const hue3 = (baseHue + Math.floor(rnd() * 30) - 15 + 360) % 360

    const s1 = 0.65 + rnd() * 0.2
    const s2 = 0.65 + rnd() * 0.2
    const s3 = 0.6 + rnd() * 0.25

    const l1 = 0.5 + rnd() * 0.15
    const l2 = 0.55 + rnd() * 0.15
    const l3 = 0.6 + rnd() * 0.15

    const band1 = hslToHex(hue1, s1, l1)
    const band2 = hslToHex(hue2, s2, l2)
    const band3 = hslToHex(hue3, s3, l3)

    const atmosphere = hslToHex((baseHue + 15) % 360, Math.min(0.85, s2 + 0.1), Math.min(0.8, l2 + 0.15))
    const ocean = hslToHex((baseHue + 300) % 360, Math.min(0.8, s1 + 0.05), Math.max(0.35, l1 - 0.15))
    const land = hslToHex((baseHue + 10) % 360, s2, Math.max(0.45, l2 - 0.05))
    const clouds = "#FFFFFF"

    return { band1, band2, band3, atmosphere, ocean, land, clouds }
  }, [planet.id, planet.name])

  // Enhanced realistic planet features (structure unchanged; colors from palette)
  const planetFeatures = useMemo(() => {
    return {
      surface: palette.band2,
      atmosphere: palette.atmosphere,
      clouds: palette.clouds,
      ocean: palette.ocean,
      land: palette.land,
      hasRings: false,
      surfaceRoughness: 0.7,
      metalness: 0.15,
      atmosphereThickness: 0.18,
      cloudDensity: 0.0,
      surfacePattern: "stylized_bands",
      emissiveIntensity: 0.06,
      envMapIntensity: 2.0
    }
  }, [palette])

  // Create procedural planet texture
  const createPlanetTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    
    // Stylized gradient and bands (no black speckles)
    const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    if (planetFeatures.surfacePattern === "stylized_bands") {
      g.addColorStop(0.0, "#FF3B2E")
      g.addColorStop(0.5, "#FF7A3D")
      g.addColorStop(1.0, "#FFC247")
    } else if (planetFeatures.surfacePattern === "bands") {
      g.addColorStop(0.0, planetFeatures.surface)
      g.addColorStop(0.5, planetFeatures.atmosphere)
      g.addColorStop(1.0, planetFeatures.land)
    } else if (planetFeatures.surfacePattern === "ice") {
      g.addColorStop(0.0, "#1E3A8A")
      g.addColorStop(0.5, "#3B82F6")
      g.addColorStop(1.0, "#60A5FA")
    } else {
      g.addColorStop(0.0, planetFeatures.surface)
      g.addColorStop(1.0, planetFeatures.atmosphere)
    }
    ctx.fillStyle = g
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const drawBand = (baseY: number, amp: number, thickness: number, color: string, alpha = 0.35, freq = 3, phase = 0) => {
      ctx.beginPath()
      for (let x = 0; x <= canvas.width; x += 4) {
        const y = baseY + Math.sin((x / canvas.width) * Math.PI * 2 * freq + phase) * amp
        if (x === 0) ctx.moveTo(x, y - thickness / 2)
        else ctx.lineTo(x, y - thickness / 2)
      }
      for (let x = canvas.width; x >= 0; x -= 4) {
        const y = baseY + Math.sin((x / canvas.width) * Math.PI * 2 * freq + phase) * amp
        ctx.lineTo(x, y + thickness / 2)
      }
      ctx.closePath()
      ctx.fillStyle = color
      ctx.globalAlpha = alpha
      ctx.fill()
      ctx.globalAlpha = 1
    }

    if (planetFeatures.surfacePattern === "stylized_bands") {
      drawBand(canvas.height * 0.30, 18, 60, palette.band1, 0.45, 2.5, 0.0)
      drawBand(canvas.height * 0.50, 22, 80, palette.band2, 0.40, 3.0, 0.8)
      drawBand(canvas.height * 0.70, 16, 55, palette.band3, 0.35, 2.2, 1.6)
      const drawSpot = (cx: number, cy: number, r: number, color: string, alpha = 0.35) => {
        const rad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        rad.addColorStop(0, color)
        rad.addColorStop(1, "rgba(255,255,255,0)")
        ctx.fillStyle = rad
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }
      drawSpot(canvas.width * 0.28, canvas.height * 0.38, 48, palette.band3, 0.4)
      drawSpot(canvas.width * 0.18, canvas.height * 0.72, 36, palette.band2, 0.35)
    }

    // No black speckles or random noise for stylized look

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }

  // Create cloud texture
  const createCloudTexture = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    
    // Transparent base
    ctx.fillStyle = 'rgba(255, 255, 255, 0)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Create cloud patterns
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const radius = Math.random() * 40 + 20
      const opacity = Math.random() * 0.6 + 0.2
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`)
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      
      ctx.fillStyle = gradient
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
    }
    
    return new THREE.CanvasTexture(canvas)
  }

  const planetTexture = createPlanetTexture()
  const cloudTexture = createCloudTexture()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05
    }

    if (surfaceRef.current) {
      surfaceRef.current.rotation.y += 0.003
    }

    if (oceanRef.current) {
      oceanRef.current.rotation.y += 0.002
    }

    if (landRef.current) {
      landRef.current.rotation.y += 0.004
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
      {/* Enhanced starfield background */}
      <mesh position={[0, 0, -100]}>
        <sphereGeometry args={[200, 64, 64]} />
        <meshBasicMaterial color="#000033" transparent opacity={0.8} side={1} />
      </mesh>

      {Array.from({ length: 800 }, (_, i) => {
        const radius = 150 + Math.random() * 200
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)

        const x = radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.sin(phi) * Math.sin(theta)
        const z = radius * Math.cos(phi)

        const size = Math.random() * 0.6 + 0.1
        const brightness = Math.sin(Date.now() * 0.001 + i) * 0.3 + 0.7
        const starColor = Math.random() > 0.7 ? "#FFE4B5" : "#FFFFFF"

        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[size, 8, 8]} />
            <meshBasicMaterial color={starColor} transparent opacity={brightness} />
          </mesh>
        )
      })}

      {/* Main planet core with realistic texture */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[8, 256, 256]} />
        <meshStandardMaterial
          map={planetTexture}
          color={planetFeatures.surface}
          roughness={planetFeatures.surfaceRoughness}
          metalness={planetFeatures.metalness}
          emissive={planetFeatures.surface}
          emissiveIntensity={planetFeatures.emissiveIntensity}
          envMapIntensity={planetFeatures.envMapIntensity}
        />
      </mesh>

      {/* Optional ocean/land layers */}
      {planetFeatures.surfacePattern !== "stylized_bands" && (
        <>
          <mesh ref={oceanRef}>
            <sphereGeometry args={[8.005, 128, 128]} />
            <meshStandardMaterial
              color={planetFeatures.ocean}
              transparent
              opacity={0.6}
              roughness={0.1}
              metalness={0.8}
              envMapIntensity={2.5}
            />
          </mesh>
          <mesh ref={landRef}>
            <sphereGeometry args={[8.008, 96, 96]} />
            <meshStandardMaterial
              color={planetFeatures.land}
              transparent
              opacity={0.5}
              roughness={0.7}
              metalness={0.3}
              envMapIntensity={1.8}
            />
          </mesh>
        </>
      )}

      {/* Enhanced surface details */}
      <mesh ref={surfaceRef}>
        <sphereGeometry args={[8.01, 128, 128]} />
        <meshStandardMaterial
          map={planetTexture}
          color={planetFeatures.surface}
          transparent
          opacity={0.4}
          roughness={planetFeatures.surfaceRoughness * 0.8}
          metalness={planetFeatures.metalness * 1.2}
          envMapIntensity={planetFeatures.envMapIntensity * 0.8}
        />
      </mesh>

      {/* Enhanced realistic rings */}
      {planetFeatures.hasRings && (
        <group>
          <mesh ref={ringsRef} rotation={[Math.PI / 2 + 0.2, 0, 0]}>
            <RingGeometry args={[10, 16, 256]} />
            <meshStandardMaterial
              color="#D2B48C"
              transparent
              opacity={0.7}
              side={2}
              roughness={0.3}
              metalness={0.6}
              envMapIntensity={1.5}
            />
          </mesh>
          {/* Inner ring detail */}
          <mesh rotation={[Math.PI / 2 + 0.15, 0, 0]}>
            <RingGeometry args={[9.5, 10.5, 128]} />
            <meshStandardMaterial
              color="#F5DEB3"
              transparent
              opacity={0.5}
              side={2}
              roughness={0.2}
              metalness={0.8}
              envMapIntensity={2.0}
            />
          </mesh>
          {/* Outer ring detail */}
          <mesh rotation={[Math.PI / 2 + 0.25, 0, 0]}>
            <RingGeometry args={[15.5, 17, 128]} />
            <meshStandardMaterial
              color="#DEB887"
              transparent
              opacity={0.4}
              side={2}
              roughness={0.4}
              metalness={0.5}
              envMapIntensity={1.2}
            />
          </mesh>
        </group>
      )}

      {/* Enhanced realistic atmosphere */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[8.4, 128, 128]} />
        <meshStandardMaterial
          color={planetFeatures.atmosphere}
          transparent
          opacity={planetFeatures.atmosphereThickness}
          side={2}
          roughness={0.0}
          metalness={0.0}
          emissive={planetFeatures.atmosphere}
          emissiveIntensity={0.3}
          envMapIntensity={1.0}
        />
      </mesh>

      {/* Enhanced realistic clouds */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[8.2, 192, 192]} />
        <meshStandardMaterial
          map={cloudTexture}
          color={planetFeatures.clouds}
          transparent
          opacity={planetFeatures.cloudDensity}
          side={2}
          roughness={0.95}
          metalness={0.05}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* Enhanced lighting system */}
      <ambientLight intensity={0.3} color="#4A5568" />
      <directionalLight position={[30, 20, 10]} intensity={2.5} color="#FFFFFF" castShadow />
      <pointLight position={[-20, -10, 5]} intensity={0.8} color="#FFA500" />
      <pointLight position={[15, -25, 8]} intensity={0.4} color="#87CEEB" />
      <hemisphereLight args={["#87CEEB", "#4A5568", 0.3]} />
    </group>
  )
}

function DetailedStar({ star }: { star: StarData }) {
  const meshRef = useRef<THREE.Mesh>(null!)

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


      <mesh ref={meshRef}>
        <sphereGeometry args={[starFeatures.size, 128, 128]} />
        <meshBasicMaterial color={starFeatures.core} />
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
