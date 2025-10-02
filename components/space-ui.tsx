"use client"

import { useStarStore } from "@/lib/star-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ChevronDown, ChevronUp, Brain, Zap, TrendingUp, BarChart3, Activity, Orbit, Satellite, BotMessageSquare } from "lucide-react"
import { useState, useEffect } from "react"

export function SpaceUI() {
  const { hoveredStar, triggerFilterSpin, goToExoplanetDetection, currentView } = useStarStore()
  const [planetTypeOpen, setPlanetTypeOpen] = useState(false)
  const [missionOpen, setMissionOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("All")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isFiltering, setIsFiltering] = useState(false)
  const [aiAnalysisActive, setAiAnalysisActive] = useState(true)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null)
  const [showLiveDetections, setShowLiveDetections] = useState(false)
  
  // Recent exoplanet detections data
  const recentDetections = [
    {
      name: "TOI-715 b",
      type: "Super-Earth",
      distance: "137 ly",
      accuracy: "98.7%",
      method: "Transit Photometry",
      discovered: "2h ago",
      status: "Confirmed",
      color: "#06b6d4"
    },
    {
      name: "HD 110067 c",
      type: "Neptune-like",
      distance: "100 ly", 
      accuracy: "96.2%",
      method: "Radial Velocity",
      discovered: "5h ago",
      status: "Candidate", 
      color: "#3b82f6"
    },
    {
      name: "K2-18 b",
      type: "Sub-Neptune",
      distance: "124 ly",
      accuracy: "94.8%", 
      method: "Transit Photometry",
      discovered: "8h ago",
      status: "Confirmed",
      color: "#06b6d4"
    },
    {
      name: "LHS 1140 b",
      type: "Rocky Planet",
      distance: "48 ly",
      accuracy: "99.1%",
      method: "Radial Velocity", 
      discovered: "12h ago",
      status: "Confirmed",
      color: "#3b82f6"
    },
    {
      name: "WASP-96 b",
      type: "Hot Jupiter",
      distance: "1,150 ly",
      accuracy: "97.4%",
      method: "Transit Photometry",
      discovered: "1d ago", 
      status: "Confirmed",
      color: "#06b6d4"
    }
  ]

  const [detectionData, setDetectionData] = useState([
    { 
      method: "Transit Photometry", 
      accuracy: 97.3, 
      discoveries: 3240, 
      color: "cyan",
      description: "Analyzes stellar brightness variations to detect planetary transits",
      findings: [
        "Detected 3,240 exoplanet candidates using deep neural networks",
        "97.3% accuracy in identifying periodic dimming patterns", 
        "Specialized in Earth-sized planets in habitable zones",
        "Primary method for Kepler and TESS mission discoveries"
      ]
    },
    { 
      method: "Radial Velocity", 
      accuracy: 94.8, 
      discoveries: 890, 
      color: "blue",
      description: "Measures stellar wobble caused by gravitational pull of orbiting planets",
      findings: [
        "Confirmed 890 exoplanets through Doppler shift analysis",
        "94.8% precision in detecting velocity changes as small as 1 m/s",
        "Excellent for determining planetary mass and orbital characteristics", 
        "Effective for planets closer than 5 AU from their host stars"
      ]
    },
    { 
      method: "Direct Imaging", 
      accuracy: 89.2, 
      discoveries: 45, 
      color: "purple",
      description: "Directly photographs exoplanets by blocking starlight",
      findings: [
        "Captured 45 direct images of young, massive exoplanets",
        "89.2% success rate using advanced coronagraph techniques",
        "Enables atmospheric composition analysis through spectroscopy",
        "Best suited for planets >5 AU from bright, nearby stars"
      ]
    },
    { 
      method: "Gravitational Lensing", 
      accuracy: 91.7, 
      discoveries: 115, 
      color: "green",
      description: "Detects planets through gravitational light-bending effects", 
      findings: [
        "Discovered 115 exoplanets including free-floating worlds",
        "91.7% accuracy in rare microlensing event detection",
        "Unique capability to find planets at any orbital distance",
        "Detected planets as far as 25,000 light-years away"
      ]
    }
  ])
  const [realtimeAccuracy, setRealtimeAccuracy] = useState(97.3)

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

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeAccuracy(prev => {
        const variation = (Math.random() - 0.5) * 0.2
        return Math.min(99.9, Math.max(95.0, prev + variation))
      })
      
      setDetectionData(prev => prev.map(method => ({
        ...method,
        discoveries: method.discoveries + Math.floor(Math.random() * 3)
      })))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Hide UI when in exoplanet detection view
  if (currentView === "exoplanet-detection") {
    return null
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

      {/* Floating AI Bot */}
      <div className="fixed bottom-6 right-6 z-20">
        <button
          onClick={() => setAiModalOpen(true)}
          className="relative group"
        >
          {/* AI Bot Container */}
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-110 animate-pulse">
            <div className="w-14 h-14 bg-black/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          
          {/* Floating Data Points */}
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-bounce delay-100">
            <div className="w-2 h-2 bg-white rounded-full absolute top-1 left-1"></div>
          </div>
          <div className="absolute -bottom-1 -left-2 w-3 h-3 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
          <div className="absolute top-2 -left-3 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-300"></div>
          
          {/* Hover Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-black/90 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-md border border-white/20 whitespace-nowrap">
              DeepSpace AI Assistant
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
            </div>
          </div>
        </button>
      </div>

      {/* AI Analysis Side Panel */}
      {aiModalOpen && (
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-30 w-96">
          <Card className="bg-gradient-to-br from-cyan-900/40 via-cyan-800/30 to-cyan-900/40 border border-cyan-400/40 text-white backdrop-blur-xl shadow-2xl shadow-cyan-500/20">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                {/* Enhanced Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white">DeepSpace AI Analysis</h2>
                      <p className="text-xs text-cyan-400">Neural Network System</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAiModalOpen(false)}
                    className="text-white/60 hover:text-white transition-colors text-lg"
                  >
                    ×
                  </button>
                </div>
                
                {/* Real-time Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-cyan-400">{getCurrentCount().toLocaleString()}</div>
                    <div className="text-xs text-white/70">Objects</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-green-400">99.2%</div>
                    <div className="text-xs text-white/70">Speed</div>
                  </div>
                </div>

                {/* Detection Methods */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-bold text-orange-400">AI Detection Methods</span>
                  </div>
                  
                  {/* Method Comparison 2x2 Grid */}
                  <div className="bg-gradient-to-r from-gray-500/5 to-gray-600/10 border border-white/20 rounded-lg p-3">
                    <div className="text-xs font-semibold text-white/80 mb-3">Detection Method Performance</div>
                    <div className="grid grid-cols-2 gap-3">
                      {detectionData.map((method, index) => (
                        <div 
                          key={index} 
                          className={`bg-gradient-to-br from-${method.color}-500/10 to-${method.color}-600/10 border border-${method.color}-400/30 rounded-lg p-2 cursor-pointer hover:border-${method.color}-400/60 hover:bg-${method.color}-500/20 transition-all duration-300`}
                          onMouseEnter={() => setHoveredMethod(method.method)}
                          onMouseLeave={() => setHoveredMethod(null)}
                        >
                          <div className="space-y-2">
                            <div className="text-xs text-white/70 font-medium">{method.method}</div>
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-bold text-${method.color}-400`}>{method.accuracy}%</span>
                              <span className="text-xs text-white/60">{method.discoveries.toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-black/30 rounded-full relative overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r from-${method.color}-500 to-${method.color}-400 rounded-full transition-all duration-1000`}
                                style={{ width: `${method.accuracy}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Status */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span className="text-xs font-semibold text-cyan-400">Neural Network Status</span>
                  </div>
                  <div className="flex gap-1">
                    <Badge className="text-xs bg-green-500/20 text-green-400 border-green-400/30">
                      Active
                    </Badge>
                    <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-400/30">
                      Online
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Method Findings Display - Center Screen */}
      {hoveredMethod && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
          <Card className="bg-gradient-to-br from-cyan-900/50 via-cyan-800/40 to-cyan-900/50 border border-cyan-400/40 text-white backdrop-blur-xl shadow-2xl max-w-lg">
            <CardContent className="p-6">
              {(() => {
                const methodData = detectionData.find(m => m.method === hoveredMethod)
                if (!methodData) return null
                
                return (
                  <div className="space-y-4 w-full max-w-4xl">
                    {/* Enhanced Nerdy Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-r from-${methodData.color}-500 to-${methodData.color}-400 rounded-lg flex items-center justify-center`}>
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className={`text-xl font-bold text-${methodData.color}-400`}>{methodData.method}</h3>
                          <p className="text-sm text-white/70">{methodData.description}</p>
                        </div>
                      </div>
                      {/* Technical Specs */}
                      <div className="text-right text-xs text-white/60">
                        <div>Neural Network: CNN + LSTM</div>
                        <div>Processing: 4.2M samples/sec</div>
                        <div>Sensitivity: {methodData.accuracy > 95 ? '10⁻⁶' : methodData.accuracy > 92 ? '10⁻⁵' : '10⁻⁴'} threshold</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {/* Left: Advanced Visualizations */}
                      <div className="space-y-3">
                        {/* Transit Photometry - Light curve with orbital animation */}
                        {methodData.method === "Transit Photometry" && (
                          <div className="bg-black/40 rounded-lg p-4 border border-cyan-400/30 relative">
                            {/* Unique orbital indicator in corner */}
                            <div className="absolute top-2 right-2">
                              <svg width="20" height="20" viewBox="0 0 20 20">
                                <circle cx="10" cy="10" r="6" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.4"/>
                                <circle cx="16" cy="10" r="1.5" fill="#06b6d4">
                                  <animateTransform attributeName="transform" type="rotate" values="0 10 10;360 10 10" dur="3s" repeatCount="indefinite"/>
                                </circle>
                                <circle cx="10" cy="10" r="2" fill="#fbbf24" opacity="0.8"/>
                              </svg>
                            </div>
                            <div className="text-xs text-cyan-400 mb-3 font-mono">∆F/F = (R_p/R_*)² Analysis</div>
                            <div className="h-24 relative bg-gray-900/50 rounded border border-cyan-500/20">
                              {/* Advanced light curve with noise */}
                              <svg width="100%" height="100%" viewBox="0 0 300 80" className="absolute inset-0">
                                {/* Background grid */}
                                <defs>
                                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#06b6d4" strokeOpacity="0.1" strokeWidth="0.5"/>
                                  </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)"/>
                                
                                {/* Noise data points */}
                                {Array.from({length: 50}, (_, i) => {
                                  const x = i * 6
                                  const y = 25 + (Math.random() - 0.5) * 4
                                  return <circle key={i} cx={x} cy={y} r="0.8" fill="#06b6d4" opacity="0.6"/>
                                })}
                                
                                {/* Transit signal with animation */}
                                <path d="M0,25 L135,25 Q142,25 145,35 L155,35 Q158,35 165,25 L300,25" 
                                      stroke="#06b6d4" strokeWidth="2.5" fill="none">
                                  <animate attributeName="stroke-opacity" values="0.7;1;0.7" dur="4s" repeatCount="indefinite"/>
                                </path>
                                <circle cx="150" cy="35" r="4" fill="#fbbf24" className="animate-pulse">
                                  <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite"/>
                                </circle>
                              </svg>
                              <div className="absolute top-1 left-1 text-xs text-cyan-300 font-mono">Flux</div>
                              <div className="absolute bottom-1 right-1 text-xs text-cyan-300 font-mono">Phase</div>
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-yellow-400 font-semibold">
                                δ = 0.001 mag | Period: 3.2d | χ² = 1.23
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Radial Velocity - Spectroscopy with velocity indicator */}
                        {methodData.method === "Radial Velocity" && (
                          <div className="bg-black/40 rounded-lg p-4 border border-blue-400/30 relative">
                            {/* Unique velocity waveform indicator */}
                            <div className="absolute top-2 right-2">
                              <svg width="24" height="16" viewBox="0 0 24 16">
                                <path d="M2,8 Q6,4 12,8 Q18,12 22,8" stroke="#3b82f6" strokeWidth="1.5" fill="none">
                                  <animate attributeName="d" values="M2,8 Q6,4 12,8 Q18,12 22,8;M2,8 Q6,12 12,8 Q18,4 22,8;M2,8 Q6,4 12,8 Q18,12 22,8" dur="2s" repeatCount="indefinite"/>
                                </path>
                              </svg>
                            </div>
                            <div className="text-xs text-blue-400 mb-3 font-mono">v_r = K₁sin(2πt/P + φ)</div>
                            <div className="h-24 relative bg-gray-900/50 rounded border border-blue-500/20">
                              <svg width="100%" height="100%" viewBox="0 0 300 80">
                                {/* Spectral lines background */}
                                <defs>
                                  <linearGradient id="spectrum" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style={{stopColor:"#ef4444", stopOpacity:0.3}} />
                                    <stop offset="50%" style={{stopColor:"#22c55e", stopOpacity:0.3}} />
                                    <stop offset="100%" style={{stopColor:"#8b5cf6", stopOpacity:0.3}} />
                                  </linearGradient>
                                </defs>
                                <rect width="100%" height="20" fill="url(#spectrum)" y="5"/>
                                
                                {/* Enhanced Doppler shifted lines with extra line */}
                                <line x1="60" y1="5" x2="60" y2="25" stroke="#3b82f6" strokeWidth="2" opacity="0.7">
                                  <animateTransform attributeName="transform" type="translate" 
                                    values="0,0; 10,0; -10,0; 0,0" dur="3s" repeatCount="indefinite"/>
                                </line>
                                <line x1="120" y1="5" x2="120" y2="25" stroke="#3b82f6" strokeWidth="2" opacity="0.7">
                                  <animateTransform attributeName="transform" type="translate" 
                                    values="0,0; -8,0; 8,0; 0,0" dur="3s" repeatCount="indefinite"/>
                                </line>
                                <line x1="180" y1="5" x2="180" y2="25" stroke="#3b82f6" strokeWidth="2" opacity="0.5">
                                  <animateTransform attributeName="transform" type="translate" 
                                    values="0,0; 6,0; -6,0; 0,0" dur="3s" repeatCount="indefinite"/>
                                </line>
                                
                                {/* RV curve with subtle enhancement */}
                                <path d="M20,50 Q80,35 140,50 Q200,65 260,50" stroke="#3b82f6" strokeWidth="3" fill="none">
                                  <animate attributeName="stroke-opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite"/>
                                </path>
                                
                                {/* Orbital elements */}
                                <circle cx="150" cy="50" r="8" fill="none" stroke="#f59e0b" strokeWidth="2">
                                  <animateTransform attributeName="transform" type="rotate" 
                                    values="0 150 50; 360 150 50" dur="4s" repeatCount="indefinite"/>
                                </circle>
                                <circle cx="158" cy="50" r="2" fill="#06b6d4"/>
                              </svg>
                              <div className="absolute top-1 left-1 text-xs text-blue-300 font-mono">λ shift</div>
                              <div className="absolute bottom-1 right-1 text-xs text-blue-300 font-mono">v_rad</div>
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-yellow-400 font-semibold">
                                K = 45.2 m/s | e = 0.12 | M sin i = 1.3 M_J
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Direct Imaging - Telescope view with crosshair */}
                        {methodData.method === "Direct Imaging" && (
                          <div className="bg-black/40 rounded-lg p-4 border border-purple-400/30 relative">
                            {/* Unique telescope crosshair indicator */}
                            <div className="absolute top-2 right-2">
                              <svg width="20" height="20" viewBox="0 0 20 20">
                                <circle cx="10" cy="10" r="8" fill="none" stroke="#a855f7" strokeWidth="1" opacity="0.6"/>
                                <line x1="10" y1="2" x2="10" y2="18" stroke="#a855f7" strokeWidth="1" opacity="0.4"/>
                                <line x1="2" y1="10" x2="18" y2="10" stroke="#a855f7" strokeWidth="1" opacity="0.4"/>
                                <circle cx="10" cy="10" r="2" fill="#a855f7" opacity="0.8">
                                  <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite"/>
                                </circle>
                              </svg>
                            </div>
                            <div className="text-xs text-purple-400 mb-3 font-mono">Δmag = -2.5log(F_p/F_*)</div>
                            <div className="h-24 relative bg-gray-900/50 rounded border border-purple-500/20">
                              <svg width="100%" height="100%" viewBox="0 0 300 80">
                                {/* PSF pattern */}
                                <defs>
                                  <radialGradient id="psf">
                                    <stop offset="0%" style={{stopColor:"#facc15", stopOpacity:1}} />
                                    <stop offset="50%" style={{stopColor:"#f59e0b", stopOpacity:0.6}} />
                                    <stop offset="100%" style={{stopColor:"#dc2626", stopOpacity:0}} />
                                  </radialGradient>
                                  <radialGradient id="speckles">
                                    <stop offset="0%" style={{stopColor:"#ffffff", stopOpacity:0.8}} />
                                    <stop offset="100%" style={{stopColor:"#ffffff", stopOpacity:0}} />
                                  </radialGradient>
                                </defs>
                                
                                {/* Central star with enhanced coronagraph */}
                                <circle cx="150" cy="40" r="20" fill="url(#psf)"/>
                                <circle cx="150" cy="40" r="25" fill="none" stroke="#a855f7" strokeWidth="3" strokeDasharray="5,5">
                                  <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite"/>
                                </circle>
                                
                                {/* Enhanced speckle pattern */}
                                {Array.from({length: 18}, (_, i) => {
                                  const angle = (i / 18) * 2 * Math.PI
                                  const r = 35 + Math.random() * 20
                                  const x = 150 + r * Math.cos(angle)
                                  const y = 40 + r * Math.sin(angle)
                                  return <circle key={i} cx={x} cy={y} r="1.5" fill="url(#speckles)" opacity="0.6">
                                    <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" begin={`${i * 0.2}s`}/>
                                  </circle>
                                })}
                                
                                {/* Exoplanet with detection marker */}
                                <circle cx="220" cy="25" r="4" fill="#a855f7" className="animate-pulse">
                                  <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
                                </circle>
                                <circle cx="220" cy="25" r="8" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="3,3" opacity="0.5">
                                  <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite"/>
                                </circle>
                                
                                {/* Airy rings */}
                                <circle cx="150" cy="40" r="30" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.3"/>
                                <circle cx="150" cy="40" r="40" fill="none" stroke="#ffffff" strokeWidth="0.3" opacity="0.2"/>
                              </svg>
                              <div className="absolute top-1 left-1 text-xs text-purple-300 font-mono">IFS</div>
                              <div className="absolute bottom-1 right-1 text-xs text-purple-300 font-mono">ADI</div>
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-yellow-400 font-semibold">
                                Δmag = 12.5 | SNR = 8.2 | λ/D = 4.1
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Gravitational Lensing - Magnification with Einstein ring */}
                        {methodData.method === "Gravitational Lensing" && (
                          <div className="bg-black/40 rounded-lg p-4 border border-green-400/30 relative">
                            {/* Unique lens geometry indicator */}
                            <div className="absolute top-2 right-2">
                              <svg width="20" height="20" viewBox="0 0 20 20">
                                <circle cx="10" cy="10" r="6" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.6"/>
                                <circle cx="10" cy="10" r="3" fill="#22c55e" opacity="0.8"/>
                                <circle cx="16" cy="10" r="1" fill="#eab308">
                                  <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
                                </circle>
                                <path d="M16,10 Q13,7 10,10" stroke="#22c55e" strokeWidth="0.8" fill="none" opacity="0.5" strokeDasharray="1,1">
                                  <animate attributeName="opacity" values="0.2;0.7;0.2" dur="2s" repeatCount="indefinite"/>
                                </path>
                              </svg>
                            </div>
                            <div className="text-xs text-green-400 mb-3 font-mono">A(t) = (u²+2)/(u√(u²+4))</div>
                            <div className="h-24 relative bg-gray-900/50 rounded border border-green-500/20">
                              <svg width="100%" height="100%" viewBox="0 0 300 80">
                                {/* Einstein ring with enhancement */}
                                <defs>
                                  <radialGradient id="ring">
                                    <stop offset="90%" style={{stopColor:"transparent"}} />
                                    <stop offset="95%" style={{stopColor:"#22c55e", stopOpacity:0.8}} />
                                    <stop offset="100%" style={{stopColor:"transparent"}} />
                                  </radialGradient>
                                </defs>
                                
                                {/* Background source with pulsing */}
                                <circle cx="240" cy="40" r="3" fill="#eab308" opacity="0.7">
                                  <animate attributeName="r" values="2;4;2" dur="3s" repeatCount="indefinite"/>
                                </circle>
                                
                                {/* Lens star */}
                                <circle cx="120" cy="40" r="6" fill="#22c55e">
                                  <animate attributeName="cx" values="120;130;120" dur="4s" repeatCount="indefinite"/>
                                </circle>
                                
                                {/* Planet with enhanced animation */}
                                <circle cx="105" cy="35" r="2" fill="#06b6d4">
                                  <animate attributeName="cx" values="105;115;105" dur="4s" repeatCount="indefinite"/>
                                </circle>
                                
                                {/* Enhanced light rays */}
                                <path d="M240,40 Q180,20 120,40" stroke="#22c55e" strokeWidth="1.5" fill="none" opacity="0.6" strokeDasharray="2,2">
                                  <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/>
                                </path>
                                <path d="M240,40 Q180,60 120,40" stroke="#22c55e" strokeWidth="1.5" fill="none" opacity="0.6" strokeDasharray="2,2">
                                  <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" begin="1s"/>
                                </path>
                                <path d="M240,40 Q185,40 120,40" stroke="#10b981" strokeWidth="1" fill="none" opacity="0.4" strokeDasharray="1,1">
                                  <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                                </path>
                                
                                {/* Magnification curve with highlighting */}
                                <path d="M20,65 Q40,50 60,40 Q80,20 100,15 Q120,10 140,15 Q160,25 180,40 Q200,55 220,65" 
                                      stroke="#10b981" strokeWidth="2" fill="none">
                                  <animate attributeName="stroke-width" values="2;3;2" dur="3s" repeatCount="indefinite"/>
                                </path>
                                
                                {/* Caustic with animation */}
                                <ellipse cx="120" cy="40" rx="25" ry="8" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.4">
                                  <animate attributeName="opacity" values="0.2;0.6;0.2" dur="4s" repeatCount="indefinite"/>
                                </ellipse>
                              </svg>
                              <div className="absolute top-1 left-1 text-xs text-green-300 font-mono">μ(t)</div>
                              <div className="absolute bottom-1 right-1 text-xs text-green-300 font-mono">HJD</div>
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-yellow-400 font-semibold">
                                t_E = 28.3d | μ_max = 156x | q = 10⁻³·²
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Neural Network Architecture */}
                        <div className="bg-black/40 rounded-lg p-4 border border-white/20">
                          <div className="text-xs text-white/70 mb-3 font-mono">CNN + LSTM Architecture</div>
                          <div className="relative h-20">
                            <svg width="100%" height="100%" viewBox="0 0 200 60">
                              {/* Input layer */}
                              {Array.from({length: 6}, (_, i) => (
                                <circle key={i} cx="20" cy={8 + i * 8} r="2" fill="#06b6d4" opacity="0.8">
                                  <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin={`${i * 0.2}s`}/>
                                </circle>
                              ))}
                              
                              {/* Hidden layers */}
                              {Array.from({length: 4}, (_, i) => (
                                <circle key={i} cx="60" cy={15 + i * 10} r="3" fill="#22c55e" opacity="0.6">
                                  <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" begin={`${i * 0.3}s`}/>
                                </circle>
                              ))}
                              
                              {Array.from({length: 4}, (_, i) => (
                                <circle key={i} cx="100" cy={15 + i * 10} r="3" fill="#a855f7" opacity="0.6">
                                  <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.8s" repeatCount="indefinite" begin={`${i * 0.25}s`}/>
                                </circle>
                              ))}
                              
                              {/* LSTM cells */}
                              <rect x="130" y="20" width="25" height="20" fill="none" stroke="#f59e0b" strokeWidth="1.5" rx="3">
                                <animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
                              </rect>
                              <text x="142" y="33" fill="#f59e0b" fontSize="8" textAnchor="middle">LSTM</text>
                              
                              {/* Output */}
                              <circle cx="180" cy="30" r="4" fill="#ef4444">
                                <animate attributeName="fill" values="#ef4444;#22c55e;#ef4444" dur="3s" repeatCount="indefinite"/>
                              </circle>
                              
                              {/* Connections */}
                              {Array.from({length: 6}, (_, i) => (
                                <line key={i} x1="22" y1={8 + i * 8} x2="57" y2="25" stroke="#ffffff" strokeWidth="0.5" opacity="0.3"/>
                              ))}
                            </svg>
                            <div className="absolute bottom-0 text-xs text-white/60 font-mono">
                              Layers: 12 | Params: 2.1M | Dropout: 0.3
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Mathematical Models */}
                      <div className="space-y-3">
                        {/* Signal Processing */}
                        <div className="bg-black/40 rounded-lg p-4 border border-white/20">
                          <div className="text-xs text-white/70 mb-3 font-mono">Multi-Spectral Signal Analysis</div>
                          <div className="h-16 bg-gray-900/50 rounded relative">
                            <svg width="100%" height="100%" viewBox="0 0 160 50">
                              {/* Multi-colored FFT visualization */}
                              {Array.from({length: 20}, (_, i) => {
                                const height = Math.sin(i * 0.5) * 15 + 20
                                // Create rainbow spectrum based on frequency
                                const colors = [
                                  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", 
                                  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
                                  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#c084fc",
                                  "#d946ef", "#ec4899", "#f43f5e", "#ef4444", "#f97316"
                                ]
                                const color = colors[i]
                                
                                return (
                                  <rect key={i} x={i * 8} y={50 - height} width="6" height={height} fill={color} opacity="0.8">
                                    <animate attributeName="height" values={`${height};${height * 1.8};${height}`} dur="2s" repeatCount="indefinite" begin={`${i * 0.1}s`}/>
                                    <animate attributeName="y" values={`${50 - height};${50 - height * 1.8};${50 - height}`} dur="2s" repeatCount="indefinite" begin={`${i * 0.1}s`}/>
                                    <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" begin={`${i * 0.05}s`}/>
                                  </rect>
                                )
                              })}
                              
                              {/* Overlay frequency markers */}
                              <line x1="40" y1="5" x2="40" y2="45" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2,2" opacity="0.6">
                                <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3s" repeatCount="indefinite"/>
                              </line>
                              <line x1="80" y1="5" x2="80" y2="45" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2,2" opacity="0.6">
                                <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3s" repeatCount="indefinite" begin="1s"/>
                              </line>
                              <line x1="120" y1="5" x2="120" y2="45" stroke="#a855f7" strokeWidth="1" strokeDasharray="2,2" opacity="0.6">
                                <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3s" repeatCount="indefinite" begin="2s"/>
                              </line>
                            </svg>
                            <div className="absolute bottom-0 left-1 text-xs text-yellow-400 font-mono">FFT</div>
                            <div className="absolute bottom-0 right-1 text-xs text-cyan-400 font-mono">Hz</div>
                            <div className="absolute top-0 right-1 text-xs text-purple-400 font-mono">dB</div>
                          </div>
                          <div className="text-xs text-white/60 mt-2 font-mono">
                            <span className="text-green-400">SNR: {(Math.random() * 50 + 50).toFixed(1)}dB</span> | 
                            <span className="text-blue-400"> σ: {(Math.random() * 0.01 + 0.001).toFixed(4)}</span> | 
                            <span className="text-purple-400"> BW: {(Math.random() * 10 + 5).toFixed(1)}kHz</span>
                          </div>
                        </div>

                        {/* Bayesian Statistics */}
                        <div className="bg-black/40 rounded-lg p-4 border border-white/20">
                          <div className="text-xs text-white/70 mb-3 font-mono">Bayesian Analysis</div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-mono">
                              <span>P(Planet|Data)</span>
                              <span className={`text-${methodData.color}-400`}>{(methodData.accuracy/100).toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-mono">
                              <span>log(Evidence)</span>
                              <span className={`text-${methodData.color}-400`}>{(Math.log(methodData.accuracy) * 10).toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-mono">
                              <span>χ² reduced</span>
                              <span className={`text-${methodData.color}-400`}>{(1 + Math.random() * 0.5).toFixed(2)}</span>
                            </div>
                          </div>
                          {/* Posterior distribution */}
                          <div className="h-8 mt-3 bg-gray-900/50 rounded relative overflow-hidden">
                            <svg width="100%" height="100%" viewBox="0 0 100 20">
                              <path d={`M0,15 Q25,5 50,8 Q75,12 100,15`} 
                                    stroke={methodData.color === "cyan" ? "#06b6d4" : methodData.color === "blue" ? "#3b82f6" : methodData.color === "purple" ? "#a855f7" : "#22c55e"} 
                                    strokeWidth="2" fill="none"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Right: Performance Metrics */}
                      <div className="space-y-3">
                        {/* Confusion Matrix */}
                        <div className="bg-black/40 rounded-lg p-4 border border-white/20">
                          <div className="text-xs text-white/70 mb-3 font-mono">Confusion Matrix</div>
                          <div className="grid grid-cols-2 gap-1 w-20 mx-auto">
                            <div className="bg-green-500/80 text-xs text-center py-1 rounded font-mono">
                              {Math.floor(methodData.accuracy * 0.95)}
                            </div>
                            <div className="bg-red-500/60 text-xs text-center py-1 rounded font-mono">
                              {Math.floor((100 - methodData.accuracy) * 0.3)}
                            </div>
                            <div className="bg-red-500/60 text-xs text-center py-1 rounded font-mono">
                              {Math.floor(methodData.accuracy * 0.05)}
                            </div>
                            <div className="bg-green-500/80 text-xs text-center py-1 rounded font-mono">
                              {Math.floor((100 - methodData.accuracy) * 0.7)}
                            </div>
                          </div>
                          <div className="text-xs text-white/60 mt-2 text-center font-mono">
                            F1: {(methodData.accuracy / 100 * 0.98).toFixed(3)} | AUC: {(methodData.accuracy / 100 * 0.99).toFixed(3)}
                          </div>
                        </div>

                        {/* ROC Curve */}
                        <div className="bg-black/40 rounded-lg p-4 border border-white/20">
                          <div className="text-xs text-white/70 mb-3 font-mono">ROC Analysis</div>
                          <div className="h-16 bg-gray-900/50 rounded relative">
                            <svg width="100%" height="50" viewBox="0 0 50 40">
                              {/* ROC curve */}
                              <path d="M2,38 Q15,25 25,15 Q35,8 48,2" 
                                    stroke={methodData.color === "cyan" ? "#06b6d4" : methodData.color === "blue" ? "#3b82f6" : methodData.color === "purple" ? "#a855f7" : "#22c55e"} 
                                    strokeWidth="2" fill="none"/>
                              {/* Diagonal reference */}
                              <path d="M2,38 L48,2" stroke="#666" strokeWidth="1" strokeDasharray="2,2" opacity="0.5"/>
                              {/* Operating point */}
                              <circle cx="35" cy="8" r="2" fill="#fbbf24" className="animate-pulse"/>
                            </svg>
                          </div>
                          <div className="text-xs text-white/60 mt-2 font-mono">
                            TPR: {(methodData.accuracy/100).toFixed(3)} | FPR: {((100-methodData.accuracy)/1000).toFixed(4)}
                          </div>
                        </div>

                        {/* Learning Curve */}
                        <div className="bg-black/40 rounded-lg p-4 border border-white/20">
                          <div className="text-xs text-white/70 mb-3 font-mono">Training Metrics</div>
                          <div className="h-12 bg-gray-900/50 rounded relative">
                            <svg width="100%" height="35" viewBox="0 0 80 30">
                              {/* Training loss */}
                              <path d="M5,25 Q20,15 40,12 Q60,10 75,8" stroke="#ef4444" strokeWidth="1.5" fill="none" strokeDasharray="3,3"/>
                              {/* Validation accuracy */}
                              <path d="M5,20 Q20,12 40,8 Q60,6 75,5" stroke="#22c55e" strokeWidth="1.5" fill="none"/>
                            </svg>
                          </div>
                          <div className="flex justify-between text-xs font-mono mt-1">
                            <span className="text-red-400">Loss ↓</span>
                            <span className="text-green-400">Acc ↑</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upper left - DeepSpace AI Logo */}
      <div className="fixed top-4 left-4 z-20">
        <div className="flex items-center gap-3 p-3">
          {/* Video Logo */}
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 p-0.5">
            <video 
              autoPlay 
              loop 
              muted={true}
              className="w-full h-full rounded-full object-cover"
            >
              <source src="/Video_Generation_Spinning_Image.mp4" type="video/mp4" />
            </video>
          </div>
          {/* Project Name */}
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              DeepSpace AI
            </h1>
          </div>
        </div>
      </div>

      {/* Upper right - Live */}
      <div className="fixed top-4 right-4 z-20">
        <button
          onClick={() => setShowLiveDetections(!showLiveDetections)}
          className="bg-black/30 border border-white/20 text-white backdrop-blur-md hover:bg-black/40 transition-all duration-300 rounded-lg px-4 py-3 flex items-center gap-3"
        >
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <div>
            <div className="text-sm font-semibold">Live</div>
            <div className="text-xs text-white/60">{recentDetections.length} recent</div>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${showLiveDetections ? 'rotate-180' : ''}`} />
        </button>
        
        {showLiveDetections && (
          <div className="absolute top-full right-0 mt-2 w-96 bg-black/90 border border-white/20 rounded-lg backdrop-blur-md shadow-2xl max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Recent Detections</h3>
                <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                  <Activity className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {recentDetections.map((detection, index) => (
                <div key={index} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-white font-medium">{detection.name}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            detection.status === 'Confirmed' 
                              ? 'border-green-400/50 text-green-400' 
                              : 'border-yellow-400/50 text-yellow-400'
                          }`}
                        >
                          {detection.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
                        <div>Type: <span className="text-white">{detection.type}</span></div>
                        <div>Distance: <span className="text-white">{detection.distance}</span></div>
                        <div>Method: <span className="text-white">{detection.method}</span></div>
                        <div>Accuracy: <span className="text-green-400">{detection.accuracy}</span></div>
                      </div>
                    </div>
                    <div className="text-xs text-white/40 ml-3">
                      {detection.discovered}
                    </div>
                  </div>
                  <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-1000"
                      style={{ width: detection.accuracy }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
              <div className="text-xs text-white/60 text-center">
                AI Detection System: <span className="text-green-400">Online</span> | 
                Processing: <span className="text-blue-400">Real-time</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upper middle - Milky Way Galaxy info */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10">
        <Card className="bg-cyan-900/20 border-cyan-400/30 text-white backdrop-blur-sm">
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
                <div className="flex flex-col items-center text-center min-w-[80px] h-[80px] justify-center">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center mb-2">
                    <Orbit className="w-6 h-6 text-purple-400" />
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
                <div className="flex flex-col items-center text-center min-w-[80px] h-[80px] justify-center">
                  <div className="w-10 h-10 bg-blue-600/40 rounded-full flex items-center justify-center mb-2">
                    <Satellite className="w-6 h-6 text-blue-300" />
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

          {/* Exoplanet Detection Card */}
          <div className="relative">
            <Card 
              className="bg-black/20 border-white/30 text-white backdrop-blur-sm cursor-pointer transition-all hover:bg-white/10"
              onClick={() => goToExoplanetDetection()}
            >
              <CardContent className="p-3">
                <div className="flex flex-col items-center text-center min-w-[80px] h-[80px] justify-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full flex items-center justify-center mb-2">
                    <BotMessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-xs font-medium text-white">Exoplanet</div>
                  <div className="text-xs font-medium text-white">Detection</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>



    </>
  )
}
