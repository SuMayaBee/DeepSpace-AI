"use client"

import { useStarStore } from "@/lib/star-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Home, Brain, Zap, Activity, Filter, BarChart3, Target, TrendingUp, X } from "lucide-react"
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
  const [selectedParameter, setSelectedParameter] = useState<string | null>(null)

  if (currentView !== "exoplanet-detection") return null

  const missions = ["all", "Kepler", "TESS"]

  // Parameter definitions with descriptions
  const parameterData = {
    "Orbital Period": {
      description: "Time for planet to complete one orbit around its star",
      importance: "Determines planet's year length and habitability zone",
      color: "pink"
    },
    "Transit Depth": {
      description: "Amount of starlight blocked when planet passes in front",
      importance: "Indicates planet size relative to its star",
      color: "purple"
    },
    "Transit Duration": {
      description: "How long the planet takes to cross the star's disk",
      importance: "Reveals orbital distance and planet size",
      color: "orange"
    },
    "Planet Radius": {
      description: "Physical size of the exoplanet",
      importance: "Key factor in determining planet type and composition",
      color: "green"
    },
    "Signal-to-Noise": {
      description: "Quality of the detection signal vs background noise",
      importance: "Higher values mean more reliable detections",
      color: "blue"
    },
    "Impact Parameter": {
      description: "How close the planet passes to the star's center",
      importance: "Affects transit shape and detection probability",
      color: "cyan"
    },
    "Inclination": {
      description: "Angle of planet's orbit relative to our line of sight",
      importance: "Determines if we can observe transits",
      color: "pink"
    },
    "Stellar Temperature": {
      description: "Surface temperature of the host star",
      importance: "Affects planet's surface temperature and habitability",
      color: "purple"
    },
    "Stellar Radius": {
      description: "Size of the host star",
      importance: "Used to calculate planet size from transit depth",
      color: "orange"
    },
    "Stellar Mass": {
      description: "Mass of the host star",
      importance: "Determines orbital dynamics and planet formation",
      color: "green"
    },
    "Surface Gravity": {
      description: "Gravitational pull at the star's surface",
      importance: "Affects stellar evolution and planet retention",
      color: "blue"
    },
    "Metallicity": {
      description: "Amount of heavy elements in the star",
      importance: "Indicates likelihood of rocky planet formation",
      color: "cyan"
    }
  }

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
        <h1 className="text-2xl font-bold text-white bg-cyan-900/30 px-6 py-2 rounded-lg backdrop-blur-sm border border-cyan-400/30 transition-all duration-500 hover:bg-cyan-900/40">
          Exoplanet Detection Model
        </h1>
      </div>

      {/* Mission Filter - Left Bottom */}
      <div className="fixed bottom-4 left-4 z-[60]">
        <Card className="bg-cyan-900/30 border-cyan-400/30 backdrop-blur-sm transition-all duration-500 hover:bg-cyan-900/40">
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

      {/* Left Panel - AI Model Training Parameters */}
      <div className="fixed top-20 left-4 z-[60]">
        <Card className="bg-cyan-900/30 border-cyan-400/30 backdrop-blur-sm transition-all duration-500 hover:bg-cyan-900/40 w-64">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg md:text-xl flex items-center gap-2 font-semibold">
              <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
              AI Model Training Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <div className="text-sm text-cyan-300/90 italic mb-3 font-medium">
              Trained on NASA Kepler & TESS datasets
            </div>
            
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(parameterData).map(([name, data]) => (
                <div 
                  key={name}
                  className={`bg-gradient-to-r from-${data.color}-500/20 to-${data.color === 'blue' ? 'cyan' : data.color === 'green' ? 'emerald' : data.color === 'purple' ? 'violet' : data.color === 'orange' ? 'red' : data.color === 'pink' ? 'rose' : data.color === 'yellow' ? 'amber' : data.color === 'indigo' ? 'blue' : data.color === 'teal' ? 'cyan' : data.color === 'lime' ? 'green' : data.color === 'sky' ? 'blue' : data.color === 'emerald' ? 'teal' : 'purple'}-500/20 rounded px-2 py-1.5 border border-${data.color}-400/30 hover:border-${data.color}-400/50 transition-all cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-${data.color}-500/25`}
                  onClick={() => setSelectedParameter(name)}
                >
                  <span className="text-white text-xs font-medium">{name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - AI Detection Results */}
      <div className="fixed top-20 right-4 z-[60]">
        <Card className="bg-cyan-900/30 border-cyan-400/30 backdrop-blur-sm transition-all duration-500 hover:bg-cyan-900/40 w-72">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 animate-pulse" />
              AI Analysis - {analysisData?.missionName}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {/* Mission Description */}
            <div className="text-xs text-white/70 italic mb-2">
              {analysisData?.description}
            </div>

            {/* Total Candidates with Animation */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400 animate-bounce" />
                <span className="text-white text-sm font-medium">Total Candidates</span>
              </div>
              <div className="text-2xl font-bold text-white transition-all duration-500">
                {analysisData?.total.toLocaleString()}
              </div>
            </div>

            {/* AI Classification Results with Enhanced Charts */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="text-white text-sm font-medium">Classification Results</span>
              </div>
              
              {/* Enhanced Pie Chart with Glow Effects */}
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-purple-500/20 to-white/20 rounded-full blur-sm"></div>
                <svg className="relative w-24 h-24 transform -rotate-90 drop-shadow-lg" viewBox="0 0 40 40">
                  {/* Background circle */}
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="#374151"
                    strokeWidth="8"
                    opacity="0.3"
                  />
                  {/* Exoplanet (95%+) - Green with glow */}
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="url(#greenGradient)"
                    strokeWidth="8"
                    strokeDasharray={`${(analysisData?.exoplanet / analysisData?.total) * 100.5} 100.5`}
                    className="transition-all duration-1500 ease-out drop-shadow-lg"
                    filter="url(#glow)"
                  />
                  {/* Near Exoplanet (85-94%) - Purple with glow */}
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="url(#purpleGradient)"
                    strokeWidth="8"
                    strokeDasharray={`${(analysisData?.nearExoplanet / analysisData?.total) * 100.5} 100.5`}
                    strokeDashoffset={`-${(analysisData?.exoplanet / analysisData?.total) * 100.5}`}
                    className="transition-all duration-1500 ease-out drop-shadow-lg"
                    filter="url(#glow)"
                  />
                  {/* Not Exoplanet (<85%) - White with glow */}
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="url(#whiteGradient)"
                    strokeWidth="8"
                    strokeDasharray={`${(analysisData?.notExoplanet / analysisData?.total) * 100.5} 100.5`}
                    strokeDashoffset={`-${((analysisData?.exoplanet + analysisData?.nearExoplanet) / analysisData?.total) * 100.5}`}
                    className="transition-all duration-1500 ease-out drop-shadow-lg"
                    filter="url(#glow)"
                  />
                  
                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                    <linearGradient id="whiteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#E5E7EB" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white text-lg font-bold drop-shadow-lg">
                    {analysisData?.total.toLocaleString()}
                  </span>
                  <span className="text-white/70 text-xs">Total</span>
                </div>
              </div>

              {/* Enhanced Legend with 3D Cards */}
              <div className="space-y-3">
                {/* Exoplanet (95%+) */}
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-3 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg shadow-green-500/50 animate-pulse"></div>
                      <span className="text-green-400 font-semibold text-sm">Exoplanet (95%+)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold text-lg">{Math.round((analysisData?.exoplanet / analysisData?.total) * 100)}%</span>
                      <div className="text-white/70 text-xs">{analysisData?.exoplanet.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700/20 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 h-3 rounded-full transition-all duration-1500 ease-out shadow-lg shadow-green-500/30 relative"
                      style={{ width: `${(analysisData?.exoplanet / analysisData?.total) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Near Exoplanet (85-94%) */}
                <div className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-lg p-3 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full shadow-lg shadow-purple-500/50 animate-pulse"></div>
                      <span className="text-purple-400 font-semibold text-sm">Near Exoplanet (85-94%)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold text-lg">{Math.round((analysisData?.nearExoplanet / analysisData?.total) * 100)}%</span>
                      <div className="text-white/70 text-xs">{analysisData?.nearExoplanet.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700/20 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 via-violet-400 to-purple-500 h-3 rounded-full transition-all duration-1500 ease-out shadow-lg shadow-purple-500/30 relative"
                      style={{ width: `${(analysisData?.nearExoplanet / analysisData?.total) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Not Exoplanet (<85%) */}
                <div className="bg-gradient-to-r from-gray-500/10 to-slate-500/10 rounded-lg p-3 border border-gray-500/20 hover:border-gray-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gradient-to-r from-white to-gray-300 rounded-full shadow-lg shadow-white/50 animate-pulse"></div>
                      <span className="text-white font-semibold text-sm">Not Exoplanet (&lt;85%)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold text-lg">{Math.round((analysisData?.notExoplanet / analysisData?.total) * 100)}%</span>
                      <div className="text-white/70 text-xs">{analysisData?.notExoplanet.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700/20 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-white via-gray-200 to-white h-3 rounded-full transition-all duration-1500 ease-out shadow-lg shadow-white/30 relative"
                      style={{ width: `${(analysisData?.notExoplanet / analysisData?.total) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Detection Rate */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-green-400 animate-bounce" />
                <span className="text-white text-sm font-medium">Detection Rate</span>
              </div>
              <div className="text-xl font-bold text-green-400 transition-all duration-500">
                {analysisData?.detectionRate}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Parameter Explanation Card */}
      {selectedParameter && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedParameter(null)}
          ></div>
          
          {/* Explanation Card */}
          <div className="relative bg-gradient-to-br from-gray-900/95 to-black/95 border border-white/20 rounded-3xl p-10 max-w-2xl mx-4 shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Background Glow Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br from-${parameterData[selectedParameter].color}-500/10 to-transparent rounded-3xl blur-xl`}></div>
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedParameter(null)}
              className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 border border-white/20"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            {/* Parameter Info */}
            <div className="text-center space-y-6 relative z-10">
              {/* Visual Icon/Graphic */}
              <div className="flex justify-center mb-6">
                <div className={`w-24 h-24 bg-gradient-to-br from-${parameterData[selectedParameter].color}-500/20 to-${parameterData[selectedParameter].color === 'blue' ? 'cyan' : parameterData[selectedParameter].color === 'green' ? 'emerald' : parameterData[selectedParameter].color === 'purple' ? 'violet' : parameterData[selectedParameter].color === 'orange' ? 'red' : parameterData[selectedParameter].color === 'pink' ? 'rose' : parameterData[selectedParameter].color === 'yellow' ? 'amber' : parameterData[selectedParameter].color === 'indigo' ? 'blue' : parameterData[selectedParameter].color === 'teal' ? 'cyan' : parameterData[selectedParameter].color === 'lime' ? 'green' : parameterData[selectedParameter].color === 'sky' ? 'blue' : parameterData[selectedParameter].color === 'emerald' ? 'teal' : 'purple'}-500/20 rounded-2xl border border-${parameterData[selectedParameter].color}-400/30 flex items-center justify-center relative overflow-hidden`}>
                  {/* Animated Background Pattern */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-${parameterData[selectedParameter].color}-500/10 to-transparent animate-pulse`}></div>
                  
                  {/* Scientific Animation based on parameter type */}
                  <div className="relative z-10 w-full h-full flex items-center justify-center">
                    {/* Orbital Period - Planet orbiting star */}
                    {selectedParameter.includes('Orbital') && (
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 w-4 h-4 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-500/50"></div>
                        <div className="absolute inset-0 w-2 h-2 bg-white rounded-full animate-spin" style={{animationDuration: '4s', transformOrigin: '0 0', transform: 'translate(24px, 24px) rotate(0deg) translate(-24px, -24px)'}}></div>
                      </div>
                    )}
                    
                    {/* Transit Depth - Star with planet passing in front causing brightness dip */}
                    {selectedParameter.includes('Transit') && (
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 w-12 h-12 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-500/50"></div>
                        <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDuration: '2s', animationDelay: '0.5s'}}></div>
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white/20 rounded-full">
                          <div className="h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" style={{animationDuration: '2s'}}></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Planet Radius - Growing/shrinking planet */}
                    {selectedParameter.includes('Planet') && (
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-pulse shadow-lg" style={{animationDuration: '1.5s'}}></div>
                        <div className="absolute inset-0 w-12 h-12 border-2 border-white/20 rounded-full animate-ping" style={{animationDuration: '2s'}}></div>
                      </div>
                    )}
                    
                    {/* Signal-to-Noise - Signal waves with noise */}
                    {selectedParameter.includes('Signal') && (
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="w-12 h-8 relative">
                          <div className="absolute top-1 left-0 w-full h-1 bg-green-400 rounded-full animate-pulse"></div>
                          <div className="absolute top-3 left-0 w-full h-0.5 bg-white/30 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          <div className="absolute top-5 left-0 w-full h-0.5 bg-white/20 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                          <div className="absolute top-6 left-0 w-full h-0.5 bg-white/10 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Impact Parameter - Planet passing at different distances */}
                    {selectedParameter.includes('Impact') && (
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 w-12 h-12 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-500/50"></div>
                        <div className="absolute inset-0 w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDuration: '3s', animationDelay: '0.5s'}}></div>
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white/30 rounded-full"></div>
                      </div>
                    )}
                    
                    {/* Inclination - Orbital plane angle */}
                    {selectedParameter.includes('Inclination') && (
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 w-12 h-12 border-2 border-white/40 rounded-full"></div>
                        <div className="absolute inset-0 w-8 h-8 border-2 border-white/60 rounded-full transform rotate-45 animate-spin" style={{animationDuration: '4s'}}></div>
                        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                    
                    {/* Stellar Temperature - Hot star with heat waves */}
                    {selectedParameter.includes('Stellar') && (
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse shadow-lg shadow-yellow-500/50"></div>
                        <div className="absolute inset-0 w-12 h-12 border border-orange-400/30 rounded-full animate-ping" style={{animationDuration: '1.5s'}}></div>
                        <div className="absolute inset-0 w-14 h-14 border border-red-400/20 rounded-full animate-ping" style={{animationDuration: '2s', animationDelay: '0.3s'}}></div>
                      </div>
                    )}
                    
                    {/* Surface Gravity - Gravity waves */}
                    {selectedParameter.includes('Surface') && (
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 w-10 h-10 border border-blue-400/40 rounded-full animate-ping" style={{animationDuration: '1.8s'}}></div>
                        <div className="absolute inset-0 w-12 h-12 border border-purple-400/30 rounded-full animate-ping" style={{animationDuration: '2.2s', animationDelay: '0.4s'}}></div>
                      </div>
                    )}
                    
                    {/* Metallicity - Heavy elements visualization */}
                    {selectedParameter.includes('Metallicity') && (
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full animate-pulse"></div>
                        <div className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full animate-ping" style={{animationDuration: '1s'}}></div>
                        <div className="absolute top-4 right-3 w-1 h-1 bg-white rounded-full animate-ping" style={{animationDuration: '1.2s', animationDelay: '0.2s'}}></div>
                        <div className="absolute bottom-3 left-3 w-1 h-1 bg-white rounded-full animate-ping" style={{animationDuration: '1.4s', animationDelay: '0.4s'}}></div>
                        <div className="absolute bottom-2 right-2 w-1 h-1 bg-white rounded-full animate-ping" style={{animationDuration: '1.6s', animationDelay: '0.6s'}}></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-${parameterData[selectedParameter].color}-500/20 to-transparent rounded-2xl blur-sm animate-pulse`}></div>
                </div>
              </div>
              
              {/* Parameter Name */}
              <div className="space-y-3">
                <h3 className="text-3xl font-bold text-white">
                  {selectedParameter}
                </h3>
                <div className={`w-24 h-1.5 bg-gradient-to-r from-${parameterData[selectedParameter].color}-500 to-${parameterData[selectedParameter].color === 'blue' ? 'cyan' : parameterData[selectedParameter].color === 'green' ? 'emerald' : parameterData[selectedParameter].color === 'purple' ? 'violet' : parameterData[selectedParameter].color === 'orange' ? 'red' : parameterData[selectedParameter].color === 'pink' ? 'rose' : parameterData[selectedParameter].color === 'yellow' ? 'amber' : parameterData[selectedParameter].color === 'indigo' ? 'blue' : parameterData[selectedParameter].color === 'teal' ? 'cyan' : parameterData[selectedParameter].color === 'lime' ? 'green' : parameterData[selectedParameter].color === 'sky' ? 'blue' : parameterData[selectedParameter].color === 'emerald' ? 'teal' : 'purple'}-500 mx-auto rounded-full shadow-lg`}></div>
              </div>
              
              {/* Description */}
              <div className="space-y-4">
                <p className="text-white/90 text-lg leading-relaxed font-medium">
                  {parameterData[selectedParameter].description}
                </p>
                
                <div className="bg-gradient-to-r from-white/10 to-white/5 rounded-xl p-6 border border-white/20 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 bg-${parameterData[selectedParameter].color}-500 rounded-full animate-pulse`}></div>
                    <h4 className="text-white font-bold text-lg">Why it matters:</h4>
                  </div>
                  <p className="text-white/80 text-base leading-relaxed">
                    {parameterData[selectedParameter].importance}
                  </p>
                </div>
              </div>
              
              {/* AI Training Indicator */}
              <div className="flex items-center justify-center gap-3 text-sm text-cyan-400 bg-cyan-500/10 rounded-lg px-4 py-3 border border-cyan-500/20">
                <Zap className="w-4 h-4 animate-pulse" />
                <span className="font-medium">Used in AI model training</span>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
              </div>
              
              {/* Visual Data Representation */}
              <div className="mt-6 p-4 bg-gradient-to-r from-white/5 to-transparent rounded-xl border border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">NASA Dataset</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-medium">Active</span>
                  </div>
                </div>
                <div className="mt-2 w-full bg-white/10 rounded-full h-2">
                  <div className={`bg-gradient-to-r from-${parameterData[selectedParameter].color}-500 to-${parameterData[selectedParameter].color === 'blue' ? 'cyan' : parameterData[selectedParameter].color === 'green' ? 'emerald' : parameterData[selectedParameter].color === 'purple' ? 'violet' : parameterData[selectedParameter].color === 'orange' ? 'red' : parameterData[selectedParameter].color === 'pink' ? 'rose' : parameterData[selectedParameter].color === 'yellow' ? 'amber' : parameterData[selectedParameter].color === 'indigo' ? 'blue' : parameterData[selectedParameter].color === 'teal' ? 'cyan' : parameterData[selectedParameter].color === 'lime' ? 'green' : parameterData[selectedParameter].color === 'sky' ? 'blue' : parameterData[selectedParameter].color === 'emerald' ? 'teal' : 'purple'}-500 h-2 rounded-full animate-pulse`} style={{width: '85%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MissionFilterContext.Provider>
  )
}
