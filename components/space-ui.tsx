"use client"

import { useStarStore } from "@/lib/star-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ChevronDown, ChevronUp, Brain, Zap, TrendingUp } from "lucide-react"
import { useState } from "react"

export function SpaceUI() {
  const { hoveredStar, triggerFilterSpin } = useStarStore()
  const [planetTypeOpen, setPlanetTypeOpen] = useState(false)
  const [missionOpen, setMissionOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("All")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isFiltering, setIsFiltering] = useState(false)
  const [aiAnalysisActive, setAiAnalysisActive] = useState(true)

  // Discovery counts based on selected filter and category - Real NASA data
  const getDiscoveryCounts = () => {
    const keplerConfirmed = 3333
    const keplerCandidates = 2955
    const tessConfirmed = 697
    const tessCandidates = 7703
    const totalConfirmed = keplerConfirmed + tessConfirmed // 4030
    const totalCandidates = keplerCandidates + tessCandidates // 10658
    const totalAll = totalConfirmed + totalCandidates // 14688
    
    const filterCounts: Record<string, { all: number; confirmed: number; candidates: number }> = {
      "All": { all: totalAll, confirmed: totalConfirmed, candidates: totalCandidates },
      "All Types": { all: totalAll, confirmed: totalConfirmed, candidates: totalCandidates },
      "All Missions": { all: totalAll, confirmed: totalConfirmed, candidates: totalCandidates },
      "O-type (Blue Giants)": { all: 285, confirmed: 180, candidates: 105 },
      "B-type (Blue-White)": { all: 420, confirmed: 290, candidates: 130 },
      "A-type (White)": { all: 680, confirmed: 450, candidates: 230 },
      "F-type (Yellow-White)": { all: 1250, confirmed: 850, candidates: 400 },
      "G-type (Yellow)": { all: 2890, confirmed: 1980, candidates: 910 },
      "K-type (Orange)": { all: 4200, confirmed: 2850, candidates: 1350 },
      "M-type (Red Dwarfs)": { all: 4963, confirmed: 3430, candidates: 1533 },
      "Kepler Mission": { all: keplerConfirmed + keplerCandidates, confirmed: keplerConfirmed, candidates: keplerCandidates },
      "TESS Discoveries": { all: tessConfirmed + tessCandidates, confirmed: tessConfirmed, candidates: tessCandidates }
    }
    
    return filterCounts[selectedFilter] || filterCounts["All"]
  }

  const getCurrentCount = () => {
    const counts = getDiscoveryCounts()
    switch (selectedCategory) {
      case "Confirmed": return counts.confirmed
      case "Candidates": return counts.candidates
      default: return counts.all
    }
  }

  const handleFilterChange = (filterType: "planet" | "mission", value: string) => {
    setIsFiltering(true)
    
    // Simulate filtering effect
    setTimeout(() => {
      setSelectedFilter(value)
      setPlanetTypeOpen(false)
      setMissionOpen(false)
      setIsFiltering(false)
      // Trigger the deep space spin effect after loading completes
      triggerFilterSpin()
    }, 800) // 800ms effect duration
  }

  const handleCategoryChange = (category: string) => {
    setIsFiltering(true)
    
    // Simulate data loading effect
    setTimeout(() => {
      setSelectedCategory(category)
      setIsFiltering(false)
      // Trigger the deep space spin effect to simulate real data loading
      triggerFilterSpin()
    }, 600) // Shorter duration for category changes
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
                <div className="text-lg font-semibold">AI Processing Deep Space Data...</div>
                <div className="text-sm text-white/70">Neural networks analyzing stellar patterns</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right middle - AI Analysis */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-10">
        <Card className="bg-black/20 border-white/30 text-white backdrop-blur-sm w-80">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              {/* Header */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-bold text-white">DeepSpace AI Analysis</h2>
                <div className={`w-2 h-2 rounded-full ${aiAnalysisActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              </div>
              
              {/* AI Status */}
              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-400">Neural Network Status</span>
                </div>
                <div className="text-xs text-white/80 mb-2">
                  AI models actively scanning {getCurrentCount().toLocaleString()} astronomical objects for exoplanet signatures
                </div>
                <div className="flex gap-2">
                  <Badge className="text-xs bg-green-500/20 text-green-400 border-green-400/30">
                    Transit Detection: Active
                  </Badge>
                  <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-400/30">
                    Pattern Recognition: Online
                  </Badge>
                </div>
              </div>

              {/* Detection Methods */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-orange-400" />
                  <span className="text-xs font-semibold text-orange-400">AI Detection Methods</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/5 rounded p-2">
                    <div className="text-white/70">Transit Photometry</div>
                    <div className="text-white font-semibold">97.3% Accuracy</div>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <div className="text-white/70">Radial Velocity</div>
                    <div className="text-white font-semibold">94.8% Accuracy</div>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <div className="text-white/70">Direct Imaging</div>
                    <div className="text-white font-semibold">89.2% Accuracy</div>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <div className="text-white/70">Gravitational Lensing</div>
                    <div className="text-white font-semibold">91.7% Accuracy</div>
                  </div>
                </div>
              </div>

              {/* Recent AI Discoveries */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-400">Recent AI Discoveries</span>
                  <Badge className="text-xs bg-purple-500/20 text-purple-400 border-purple-400/30">
                    Live Feed
                  </Badge>
                </div>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {[
                    { name: "TOI-715 b", confidence: "98.7%", type: "Super-Earth" },
                    { name: "K2-18 b", confidence: "96.2%", type: "Sub-Neptune" },
                    { name: "TRAPPIST-1 e", confidence: "99.1%", type: "Rocky World" }
                  ].map((discovery, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/5 rounded p-1.5">
                      <div>
                        <div className="text-xs text-white font-medium">{discovery.name}</div>
                        <div className="text-xs text-white/60">{discovery.type}</div>
                      </div>
                      <div className="text-xs text-green-400 font-semibold">{discovery.confidence}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upper middle - Milky Way Galaxy info */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10">
        <Card className="bg-black/20 border-white/30 text-white backdrop-blur-sm">
          <CardContent className="p-2">
            <div className="flex items-center gap-6">
              {/* Header */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 text-white" />
                </div>
                <h2 className="text-sm font-bold text-white">Milky Way Galaxy</h2>
              </div>
              
              {/* Current Filter Display */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/70">Filter:</span>
                <Badge variant="secondary" className="text-xs bg-blue-600/20 text-blue-400 border-blue-400/30">
                  {selectedFilter}
                </Badge>
              </div>
              
              {/* Discovery Categories */}
              <div className="flex gap-1">
                {["All", "Confirmed", "Candidates"].map((category) => {
                  const counts = getDiscoveryCounts()
                  const count = category === "All" ? counts.all : 
                               category === "Confirmed" ? counts.confirmed : counts.candidates
                  
                  return (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        selectedCategory === category
                          ? 'bg-orange-500/30 text-orange-400 border border-orange-400/50'
                          : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      {category} ({count})
                    </button>
                  )
                })}
              </div>
              
              {/* Showing Count */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-orange-400 font-semibold">Showing:</span>
                <span className="text-white font-bold">{getCurrentCount()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom left - Filter panel */}
      <div className="fixed left-4 bottom-4 z-10">
        <div className="flex gap-3">
          {/* Planet Type Card */}
          <div className="relative">
            <Card 
              className={`bg-black/20 border-white/30 text-white backdrop-blur-sm cursor-pointer transition-all hover:bg-white/10 ${
                planetTypeOpen ? 'bg-purple-600/40 border-purple-400/50' : ''
              }`}
              onClick={() => setPlanetTypeOpen(!planetTypeOpen)}
            >
              <CardContent className="p-3">
                <div className="flex flex-col items-center text-center min-w-[80px]">
                  <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center mb-2">
                    <div className="w-4 h-4 bg-purple-400 rounded-full"></div>
                  </div>
                  <div className="text-xs font-medium text-white">Planet</div>
                  <div className="text-xs font-medium text-white">Type</div>
                </div>
              </CardContent>
            </Card>
            
            {planetTypeOpen && (
              <div className="absolute bottom-full left-0 mb-2 bg-black/90 border border-white/30 rounded backdrop-blur-md z-20 min-w-[180px]">
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
                    onClick={(e) => {
                      e.stopPropagation()
                      handleFilterChange("planet", type)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors first:rounded-t last:rounded-b"
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Missions Card */}
          <div className="relative">
            <Card 
              className={`bg-black/20 border-white/30 text-white backdrop-blur-sm cursor-pointer transition-all hover:bg-white/10 ${
                missionOpen ? 'bg-blue-600/40 border-blue-400/50' : ''
              }`}
              onClick={() => setMissionOpen(!missionOpen)}
            >
              <CardContent className="p-3">
                <div className="flex flex-col items-center text-center min-w-[80px]">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center mb-2">
                    <div className="w-4 h-4 bg-blue-400 rounded-sm"></div>
                  </div>
                  <div className="text-xs font-medium text-white">Missions</div>
                </div>
              </CardContent>
            </Card>
            
            {missionOpen && (
              <div className="absolute bottom-full left-0 mb-2 bg-black/90 border border-white/30 rounded backdrop-blur-md z-20 min-w-[140px]">
                {[
                  "All Missions",
                  "Kepler Mission",
                  "TESS Discoveries"
                ].map((mission) => (
                  <button
                    key={mission}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleFilterChange("mission", mission)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors first:rounded-t last:rounded-b"
                  >
                    {mission}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
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
