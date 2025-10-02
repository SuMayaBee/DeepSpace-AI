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
  parentStar?: StarData // For planets, reference to their parent star
}

interface StarStore {
  selectedStar: StarData | null
  hoveredStar: StarData | null
  currentView: "space" | "star-system" | "focused-object" | "exoplanet-detection" | "hyperparameter-tuning"
  zoomedStar: StarData | null
  focusedObject: FocusTarget | null
  isFilterSpinning: boolean
  setSelectedStar: (star: StarData | null) => void
  setHoveredStar: (star: StarData | null) => void
  zoomToStarSystem: (star: StarData) => void
  focusOnObject: (target: FocusTarget) => void
  returnToStarSystem: () => void
  returnToSpace: () => void
  goToExoplanetDetection: () => void
  goToHyperparameterTuning: () => void
  triggerFilterSpin: () => void
}

export const useStarStore = create<StarStore>((set, get) => ({
  selectedStar: null,
  hoveredStar: null,
  currentView: "space",
  zoomedStar: null,
  focusedObject: null,
  isFilterSpinning: false,
  setSelectedStar: (star) => set({ selectedStar: star }),
  setHoveredStar: (star) => set({ hoveredStar: star }),
  zoomToStarSystem: (star) =>
    set({
      zoomedStar: star,
      currentView: "star-system",
      selectedStar: null,
      focusedObject: null,
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
      selectedStar: null,
      focusedObject: null,
    }),
  goToExoplanetDetection: () =>
    set({
      currentView: "exoplanet-detection",
      zoomedStar: null,
      selectedStar: null,
      focusedObject: null,
    }),
  goToHyperparameterTuning: () =>
    set({
      currentView: "hyperparameter-tuning",
      zoomedStar: null,
      selectedStar: null,
      focusedObject: null,
    }),
  triggerFilterSpin: () => {
    set({ isFilterSpinning: true })
    setTimeout(() => {
      set({ isFilterSpinning: false })
    }, 1500) // 1.5 second spin duration
  },
}))

export type { StarData, PlanetData, FocusTarget }
