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
  // Generate simple transit data based on planet position
  const transitData = useMemo(() => {
    const data = []
    const totalPoints = 100
    
    for (let i = 0; i < totalPoints; i++) {
      let brightness = 1.0 // Base stellar brightness
      
      if (planetInCenter) {
        // When planet is in center, create a downward dip in the middle
        if (i >= 40 && i <= 60) {
          // Simple downward line in the middle section
          brightness = 0.95 // Lower brightness when planet transits
        }
      } else {
        // When planet is not in center, show straight line
        brightness = 1.0 // Constant brightness
      }
      
      data.push({
        time: i,
        brightness: brightness
      })
    }
    
    return data
  }, [planetInCenter])

  return (
    <Card className="bg-cyan-900/30 border-cyan-400/30 backdrop-blur-sm transition-all duration-500 hover:bg-cyan-900/40 w-96">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg md:text-xl flex items-center gap-2 font-semibold">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          Exoplanet Transit Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        
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
