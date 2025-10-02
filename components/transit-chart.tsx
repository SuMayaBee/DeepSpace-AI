"use client"

import { useMemo, useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Zap } from "lucide-react"
import { useStarStore } from "@/lib/star-store"

interface TransitChartProps {
  planetName: string
  starName: string
}

export function TransitChart({ planetName, starName }: TransitChartProps) {
  const { planetInCenter } = useStarStore()
  const [dynamicTransitDepth, setDynamicTransitDepth] = useState(0.02)
  const [chartOffset, setChartOffset] = useState(0)

  // Update chart properties based on planet position
  useEffect(() => {
    if (planetInCenter) {
      // When planet is in center, increase transit depth and add offset
      setDynamicTransitDepth(0.05) // Deeper transit
      setChartOffset(0.01) // Shift line down
    } else {
      // Reset when planet is not in center
      setDynamicTransitDepth(0.02)
      setChartOffset(0)
    }
  }, [planetInCenter])
  // Generate realistic transit data with dynamic properties
  const transitData = useMemo(() => {
    const data = []
    const totalPoints = 100
    const transitDuration = 20 // points where transit occurs
    const transitStart = 40 // when transit starts
    
    // Base stellar brightness (normalized to 1.0)
    const baseBrightness = 1.0
    
    for (let i = 0; i < totalPoints; i++) {
      let brightness = baseBrightness
      
      // Add some stellar noise
      const noise = (Math.random() - 0.5) * 0.005
      
      // Transit detection - light curve dip with dynamic depth
      if (i >= transitStart && i < transitStart + transitDuration) {
        const transitProgress = (i - transitStart) / transitDuration
        
        // Create realistic transit shape (ingress, flat bottom, egress)
        if (transitProgress < 0.1) {
          // Ingress - gradual decrease
          brightness -= dynamicTransitDepth * (transitProgress / 0.1)
        } else if (transitProgress < 0.9) {
          // Flat bottom - full transit
          brightness -= dynamicTransitDepth
        } else {
          // Egress - gradual increase
          brightness -= dynamicTransitDepth * (1 - (transitProgress - 0.9) / 0.1)
        }
      }
      
      data.push({
        time: i,
        brightness: brightness + noise - chartOffset, // Apply dynamic offset
        phase: i >= transitStart && i < transitStart + transitDuration ? "transit" : "normal"
      })
    }
    
    return data
  }, [planetName, starName, dynamicTransitDepth, chartOffset])

  return (
    <Card className="bg-black/50 border-white/20 backdrop-blur-sm transition-all duration-500 hover:bg-black/60 w-96">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          Exoplanet Transit Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Transit Info */}
        <div className="text-xs text-cyan-300/80 italic mb-3">
          Detecting {planetName} transiting {starName}
        </div>
        
        {/* Main Chart */}
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={transitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Time', position: 'insideBottom', offset: -5, fill: '#9CA3AF', fontSize: 10 }}
              />
              <YAxis 
                dataKey="brightness" 
                stroke="#9CA3AF" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0.94, 1.01]}
                label={{ value: 'Light', angle: -90, position: 'insideLeft', offset: 10, fill: '#9CA3AF', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  borderColor: '#374151',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)',
                }}
                labelStyle={{ color: '#FFFFFF', fontSize: 12 }}
                formatter={(value: number) => [value.toFixed(4), 'Brightness']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="brightness"
                stroke="#00FFFF"
                strokeWidth={planetInCenter ? 3 : 2} // Thicker line when planet is in center
                dot={false}
                activeDot={{ r: planetInCenter ? 6 : 4, fill: '#00FFFF', stroke: '#000000', strokeWidth: 1 }}
                isAnimationActive={true}
                animationDuration={planetInCenter ? 1000 : 2000} // Faster animation when planet is in center
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        
        {/* Transit Statistics */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/70">Transit Depth:</span>
            <span className="text-cyan-400 font-semibold">{(dynamicTransitDepth * 100).toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/70">Duration:</span>
            <span className="text-cyan-400 font-semibold">3.2 hours</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/70">Period:</span>
            <span className="text-cyan-400 font-semibold">127.3 days</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/70">Detection:</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">Confirmed</span>
            </div>
          </div>
        </div>
        
        {/* AI Detection Indicator */}
        <div className="flex items-center justify-center gap-3 text-sm rounded-lg px-4 py-2 border text-cyan-400 bg-cyan-500/10 border-cyan-500/20 transition-all duration-500">
          <Zap className="w-4 h-4" />
          <span className="font-medium">AI Transit Detection Active</span>
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  )
}
