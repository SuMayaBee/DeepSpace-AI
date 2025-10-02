"use client"

import { create } from "zustand"

interface PlanetData {
  id: string
  name: string
  type: string
  radius: number
  distance: number // Distance from star in AU
  color: string
  orbitSpeed: number // Speed of orbit
  temperature?: number
  mass?: number
}

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

type FocusTarget = {
  type: "star" | "planet"
  data: StarData | PlanetData
}

interface StarStore {
  selectedStar: StarData | null
  hoveredStar: StarData | null
  focusedObject: FocusTarget | null
  currentView: "space" | "star-system" | "exoplanet-detection" | "focused-object"
  zoomedStar: StarData | null
  navigationSource: "space" | "exoplanet-detection" | null
  chartPosition: "middle" | "lower" // Track chart position
  planetInCenter: boolean // Track if any planet is in center of view
  // Track which planets are currently in the lower-middle sector
  lowerMiddlePlanetIds: string[]
  isFilterSpinning: boolean
  setHoveredStar: (star: StarData | null) => void
  setNavigationSource: (source: "space" | "exoplanet-detection" | null) => void
  zoomToStarSystem: (star: StarData) => void
  zoomToStarSystemFromVoidstar: (starData: StarData) => void
  setChartPosition: (position: "middle" | "lower") => void
  setPlanetInCenter: (inCenter: boolean) => void
  // Multi-planet aware enter/leave for lower-middle detection
  enterLowerMiddle: (planetId: string) => void
  leaveLowerMiddle: (planetId: string) => void
  focusOnObject: (target: FocusTarget) => void
  returnToStarSystem: () => void
  returnToSpace: () => void
  goToExoplanetDetection: () => void
  triggerFilterSpin: () => void
}

export const useStarStore = create<StarStore>((set, get) => ({
  selectedStar: null,
  hoveredStar: null,
  focusedObject: null,
  currentView: "space",
  zoomedStar: null,
  navigationSource: null,
  chartPosition: "middle",
  planetInCenter: false,
  lowerMiddlePlanetIds: [],
  isFilterSpinning: false,
  
  setHoveredStar: (star) => set({ hoveredStar: star }),
  setNavigationSource: (source) => set({ navigationSource: source }),
  zoomToStarSystem: (star) => {
    set({ 
      currentView: "star-system", 
      zoomedStar: star,
      navigationSource: "space",
      chartPosition: "middle",
      planetInCenter: false,
      lowerMiddlePlanetIds: []
    })
  },
  zoomToStarSystemFromVoidstar: (starData) => {
    set({ 
      currentView: "star-system", 
      zoomedStar: starData,
      navigationSource: "exoplanet-detection",
      chartPosition: "middle",
      planetInCenter: false,
      lowerMiddlePlanetIds: []
    })
  },
  setChartPosition: (position) => set({ chartPosition: position }),
  setPlanetInCenter: (inCenter) => set({ planetInCenter: inCenter }),
  enterLowerMiddle: (planetId) =>
    set((state) => {
      if (state.lowerMiddlePlanetIds.includes(planetId)) return state
      const updated = [...state.lowerMiddlePlanetIds, planetId]
      return { lowerMiddlePlanetIds: updated, planetInCenter: updated.length > 0 }
    }),
  leaveLowerMiddle: (planetId) =>
    set((state) => {
      if (!state.lowerMiddlePlanetIds.includes(planetId)) return state
      const updated = state.lowerMiddlePlanetIds.filter((id) => id !== planetId)
      return { lowerMiddlePlanetIds: updated, planetInCenter: updated.length > 0 }
    }),
  focusOnObject: (target) =>
    set({
      focusedObject: target,
      currentView: "focused-object",
    }),
  returnToStarSystem: () => {
    const { zoomedStar } = get()
    set({
      currentView: "star-system",
      focusedObject: null,
    })
  },
  returnToSpace: () =>
    set({
      currentView: "space",
      zoomedStar: null,
      navigationSource: null,
      chartPosition: "middle",
      planetInCenter: false,
      focusedObject: null,
    }),
  goToExoplanetDetection: () =>
    set({
      currentView: "exoplanet-detection",
      zoomedStar: null,
      selectedStar: null,
      focusedObject: null,
      navigationSource: null,
    }),
  triggerFilterSpin: () => {
    set({ isFilterSpinning: true })
    setTimeout(() => {
      set({ isFilterSpinning: false })
    }, 1500) // 1.5 second spin duration
  },
}))

export type { StarData, PlanetData, FocusTarget }
