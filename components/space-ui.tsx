"use client"

import { useStarStore } from "@/lib/star-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

export function SpaceUI() {
  const { hoveredStar, triggerFilterSpin } = useStarStore()
  const [planetTypeOpen, setPlanetTypeOpen] = useState(false)
  const [missionOpen, setMissionOpen] = useState(false)
  const [selectedPlanetType, setSelectedPlanetType] = useState("All Types")
  const [selectedMission, setSelectedMission] = useState("All Missions")
  const [isFiltering, setIsFiltering] = useState(false)

  const handleFilterChange = (filterType: "planet" | "mission", value: string) => {
    setIsFiltering(true)
    
    // Simulate filtering effect
    setTimeout(() => {
      if (filterType === "planet") {
        setSelectedPlanetType(value)
        setPlanetTypeOpen(false)
      } else {
        setSelectedMission(value)
        setMissionOpen(false)
      }
      setIsFiltering(false)
      // Trigger the deep space spin effect after loading completes
      triggerFilterSpin()
    }, 800) // 800ms effect duration
  }

  return (
    <>
      {/* Filtering overlay effect */}
      {isFiltering && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-black/90 border border-white/20 rounded-lg p-6 text-white backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <div>
                <div className="text-lg font-semibold">Filtering Deep Space...</div>
                <div className="text-sm text-white/70">Analyzing stellar classifications</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upper right - Milky Way Galaxy info */}
      <div className="fixed top-4 right-4 z-10">
        <Card className="bg-black/90 border-white/20 text-white backdrop-blur-md min-w-[280px]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Milky Way Galaxy</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col">
                <span className="text-orange-400 font-semibold">Solar Systems</span>
                <span className="text-2xl font-bold text-white">4,492</span>
              </div>
              <div className="flex flex-col">
                <span className="text-orange-400 font-semibold">Confirmed Planets</span>
                <span className="text-2xl font-bold text-white">6,013</span>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-white/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">Current View</span>
                <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                  Deep Space
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Left side - Filter panel */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-10">
        <Card className="bg-black/90 border-white/20 text-white backdrop-blur-md w-[220px]">
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-xs font-bold">F</span>
              </div>
              Filter
            </h3>
            
            <div className="space-y-4">
              {/* Planet Type Dropdown */}
              <div className="relative">
                <h4 className="text-sm font-semibold text-orange-400 mb-2">Planet Type</h4>
                <button
                  onClick={() => setPlanetTypeOpen(!planetTypeOpen)}
                  className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 rounded px-3 py-2 text-sm text-white transition-colors"
                >
                  <span>{selectedPlanetType}</span>
                  {planetTypeOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {planetTypeOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 border border-white/20 rounded backdrop-blur-md z-20">
                    {[
                      "All Types",
                      "O-type (Blue Giants)",
                      "B-type (Blue-White)",
                      "A-type (White)",
                      "F-type (Yellow-White)",
                      "G-type (Yellow)",
                      "K-type (Orange)",
                      "M-type (Red Dwarfs)"
                    ].map((type) => (
                      <button
                        key={type}
                        onClick={() => handleFilterChange("planet", type)}
                        className="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Mission Dropdown */}
              <div className="relative">
                <h4 className="text-sm font-semibold text-orange-400 mb-2">Mission</h4>
                <button
                  onClick={() => setMissionOpen(!missionOpen)}
                  className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 rounded px-3 py-2 text-sm text-white transition-colors"
                >
                  <span>{selectedMission}</span>
                  {missionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {missionOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 border border-white/20 rounded backdrop-blur-md z-20">
                    {[
                      "All Missions",
                      "TESS Discoveries",
                      "Kepler Mission", 
                      "Hubble Observations",
                      "James Webb Telescope",
                      "Ground-based Surveys",
                      "Gaia Mission"
                    ].map((mission) => (
                      <button
                        key={mission}
                        onClick={() => handleFilterChange("mission", mission)}
                        className="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        {mission}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Filter Status */}
              <div className="pt-2 border-t border-white/20">
                <div className="text-xs text-white/60">
                  <div>Active filters:</div>
                  <div className="mt-1 space-y-1">
                    {selectedPlanetType !== "All Types" && (
                      <Badge variant="secondary" className="text-xs bg-blue-600/20 text-blue-400">
                        {selectedPlanetType}
                      </Badge>
                    )}
                    {selectedMission !== "All Missions" && (
                      <Badge variant="secondary" className="text-xs bg-green-600/20 text-green-400">
                        {selectedMission}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom left hover info */}
      {hoveredStar && (
        <div className="fixed bottom-4 left-4 z-10">
          <Card className="bg-black/90 border-white/20 text-white backdrop-blur-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5" style={{ color: hoveredStar.color }} />
                <div>
                  <h3 className="font-semibold">{hoveredStar.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {hoveredStar.type}
                    </Badge>
                    <span className="text-xs text-white/70">{hoveredStar.distance} ly away</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
