"use client"

import { useStarStore } from "@/lib/star-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Home, Brain, Zap, Activity, Filter, BarChart3, Target, TrendingUp } from "lucide-react"
import { useState, createContext, useContext } from "react"

// Create context for mission filter
const MissionFilterContext = createContext<{
  selectedMission: string
  setSelectedMission: (mission: string) => void
  isSpinning: boolean
  setIsSpinning: (spinning: boolean) => void
}>({
  selectedMission: "all",
  setSelectedMission: () => {},
  isSpinning: false,
  setIsSpinning: () => {},
})

export const useMissionFilter = () => useContext(MissionFilterContext)

export function ExoplanetDetectionUI() {
  const { returnToSpace, currentView } = useStarStore()
  const [selectedMission, setSelectedMission] = useState<string>("all")
  const [isSpinning, setIsSpinning] = useState<boolean>(false)

  if (currentView !== "exoplanet-detection") return null

  const missions = ["all", "Kepler", "TESS"]

  const handleMissionSelect = (mission: string) => {
    if (mission !== selectedMission) {
      console.log("Starting spin for mission:", mission) // Debug log
      setIsSpinning(true)
      setSelectedMission(mission)
      // Stop spinning after 2 seconds
      setTimeout(() => {
        console.log("Stopping spin") // Debug log
        setIsSpinning(false)
      }, 2000)
    }
  }

  return (
    <MissionFilterContext.Provider value={{ selectedMission, setSelectedMission, isSpinning, setIsSpinning }}>
      {/* Navigation buttons */}
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

      {/* Page Title */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60]">
        <h1 className="text-2xl font-bold text-white bg-black/50 px-6 py-2 rounded-lg backdrop-blur-sm border border-white/20">
          Exoplanet Detection Model
        </h1>
      </div>

      {/* Mission Filter - Left Bottom */}
      <div className="fixed bottom-4 left-4 z-[60]">
        <Card className="bg-black/50 border-white/20 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Mission Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              {missions.map((mission) => (
                <Button
                  key={mission}
                  onClick={() => handleMissionSelect(mission)}
                  variant={selectedMission === mission ? "default" : "outline"}
                  size="sm"
                  className={`text-xs px-3 py-2 transition-all duration-300 ${
                    selectedMission === mission
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-transparent border-white/20 text-white hover:bg-white/10"
                  }`}
                >
                  {mission === "all" ? "All" : mission}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Panel - Right Side */}
      <div className="fixed top-20 right-4 z-[60] w-80">
        <Card className="bg-black/50 border-white/20 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {/* Total Candidates */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm font-medium">Total Candidates</span>
              </div>
              <div className="text-2xl font-bold text-white">25</div>
            </div>

            {/* Mission Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-white text-sm font-medium">Mission Breakdown</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-white/70">Kepler</span>
                  <span className="text-white">12 candidates</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/70">TESS</span>
                  <span className="text-white">13 candidates</span>
                </div>
              </div>
            </div>

            {/* AI Detection Accuracy */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-white text-sm font-medium">AI Detection Accuracy</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-green-400">High Confidence</span>
                  <span className="text-white">8 candidates (32%)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-purple-400">Medium Confidence</span>
                  <span className="text-white">10 candidates (40%)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white">Low Confidence</span>
                  <span className="text-white">7 candidates (28%)</span>
                </div>
              </div>
            </div>

            {/* AI Approach */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-white text-sm font-medium">AI Approach</span>
              </div>
              <div className="text-xs text-white/70 space-y-1">
                <div>• Deep Learning Neural Networks</div>
                <div>• Transit Photometry Analysis</div>
                <div>• Radial Velocity Detection</div>
                <div>• Light Curve Pattern Recognition</div>
                <div>• Statistical Validation Models</div>
              </div>
            </div>

            {/* Color Legend */}
            <div className="space-y-2">
              <span className="text-white text-sm font-medium">Color Legend</span>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-white/70">High Accuracy (80%+)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-white/70">Medium Accuracy (60-79%)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <span className="text-white/70">Low Accuracy (&lt;60%)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MissionFilterContext.Provider>
  )
}
