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
  const [analysisData, setAnalysisData] = useState<any>(null)

  if (currentView !== "exoplanet-detection") return null

  const missions = ["all", "Kepler", "TESS"]

  // Mission-specific AI analysis data
  const getMissionAnalysisData = (mission: string) => {
    switch (mission) {
      case "Kepler":
        return {
          total: 2955,
          exoplanet: 443, // 15% of 2955
          nearExoplanet: 886, // 30% of 2955
          notExoplanet: 1626, // 55% of 2955
          missionName: "Kepler/K2",
          description: "Long-duration observations of distant star fields",
          keyFindings: ["Hot Jupiters", "Super-Earths", "Multi-planet systems"],
          detectionRate: "94.2%"
        }
      case "TESS":
        return {
          total: 7703,
          exoplanet: 1155, // 15% of 7703
          nearExoplanet: 2311, // 30% of 7703
          notExoplanet: 4237, // 55% of 7703
          missionName: "TESS",
          description: "All-sky survey focusing on nearby bright stars",
          keyFindings: ["Rocky planets", "Habitable zone candidates", "Young systems"],
          detectionRate: "96.8%"
        }
      default: // "all"
        return {
          total: 10658,
          exoplanet: 1598, // 15% of 10658
          nearExoplanet: 3197, // 30% of 10658
          notExoplanet: 5863, // 55% of 10658
          missionName: "Combined Missions",
          description: "Comprehensive analysis of all exoplanet candidates",
          keyFindings: ["Diverse planetary systems", "Habitable worlds", "Extreme environments"],
          detectionRate: "95.7%"
        }
    }
  }

  const handleMissionSelect = (mission: string) => {
    if (mission !== selectedMission) {
      console.log("Starting spin for mission:", mission) // Debug log
      setIsSpinning(true)
      setSelectedMission(mission)
      
      // Update analysis data with animation
      setTimeout(() => {
        setAnalysisData(getMissionAnalysisData(mission))
      }, 500)
      
      // Stop spinning after 2 seconds
      setTimeout(() => {
        console.log("Stopping spin") // Debug log
        setIsSpinning(false)
      }, 2000)
    }
  }

  // Initialize analysis data
  if (!analysisData) {
    setAnalysisData(getMissionAnalysisData(selectedMission))
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
        <Card className="bg-black/50 border-white/20 backdrop-blur-sm transition-all duration-500 hover:bg-black/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 animate-pulse" />
              AI Analysis - {analysisData?.missionName}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {/* Mission Description */}
            <div className="space-y-2">
              <div className="text-xs text-white/70 italic">
                {analysisData?.description}
              </div>
            </div>

            {/* Total Candidates with Animation */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400 animate-bounce" />
                <span className="text-white text-sm font-medium">Total Candidates</span>
              </div>
              <div className="text-3xl font-bold text-white transition-all duration-500">
                {analysisData?.total.toLocaleString()}
              </div>
            </div>

            {/* AI Classification Results with Progress Bars */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="text-white text-sm font-medium">AI Classification Results</span>
              </div>
              
              {/* Exoplanet (95%+) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-green-400 font-semibold">🟢 Exoplanet (95%+)</span>
                  <span className="text-white">{analysisData?.exoplanet.toLocaleString()} ({Math.round((analysisData?.exoplanet / analysisData?.total) * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(analysisData?.exoplanet / analysisData?.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Near Exoplanet (85-94%) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-purple-400 font-semibold">🟣 Near Exoplanet (85-94%)</span>
                  <span className="text-white">{analysisData?.nearExoplanet.toLocaleString()} ({Math.round((analysisData?.nearExoplanet / analysisData?.total) * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(analysisData?.nearExoplanet / analysisData?.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Not Exoplanet (<85%) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-white font-semibold">⚪ Not Exoplanet (&lt;85%)</span>
                  <span className="text-white">{analysisData?.notExoplanet.toLocaleString()} ({Math.round((analysisData?.notExoplanet / analysisData?.total) * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(analysisData?.notExoplanet / analysisData?.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Key Findings */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-white text-sm font-medium">Key Findings</span>
              </div>
              <div className="space-y-1">
                {analysisData?.keyFindings.map((finding: string, index: number) => (
                  <div key={index} className="text-xs text-white/70 flex items-center gap-2">
                    <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
                    {finding}
                  </div>
                ))}
              </div>
            </div>

            {/* Detection Rate */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-400 animate-bounce" />
                <span className="text-white text-sm font-medium">AI Detection Rate</span>
              </div>
              <div className="text-2xl font-bold text-green-400 transition-all duration-500">
                {analysisData?.detectionRate}
              </div>
            </div>

            {/* Color Legend */}
            <div className="space-y-2">
              <span className="text-white text-sm font-medium">Classification Legend</span>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-white/70">Exoplanet (95%+)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-white/70">Near Exoplanet (85-94%)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white/70">Not Exoplanet (&lt;85%)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MissionFilterContext.Provider>
  )
}
