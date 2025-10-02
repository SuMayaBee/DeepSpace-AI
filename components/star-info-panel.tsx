"use client"

import { useStarStore } from "@/lib/star-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Star, Thermometer, Weight, Ruler, MapPin, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

export function StarInfoPanel() {
  const { selectedStar, setSelectedStar } = useStarStore()

  if (!selectedStar) return null

  return (
    <div className="fixed top-4 right-4 w-80 z-10">
      <Card className="bg-cyan-900/50 border-cyan-400/30 text-white backdrop-blur-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Star className="w-5 h-5" style={{ color: selectedStar.color }} />
              {selectedStar.name}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedStar(null)}
              className="text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Badge variant="secondary" className="w-fit">
            {selectedStar.type}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Thermometer className="w-4 h-4 text-orange-400" />
                <span className="text-white/70">Temperature</span>
              </div>
              <p className="font-mono text-sm">{selectedStar.temperature.toLocaleString()} K</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Weight className="w-4 h-4 text-blue-400" />
                <span className="text-white/70">Mass</span>
              </div>
              <p className="font-mono text-sm">{selectedStar.mass} M☉</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Ruler className="w-4 h-4 text-green-400" />
                <span className="text-white/70">Radius</span>
              </div>
              <p className="font-mono text-sm">{selectedStar.radius} R☉</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span className="text-white/70">Distance</span>
              </div>
              <p className="font-mono text-sm">{selectedStar.distance} ly</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Eye className="w-4 h-4 text-yellow-400" />
              <span className="text-white/70">Apparent Magnitude</span>
            </div>
            <p className="font-mono text-sm">{selectedStar.magnitude}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white/70">Constellation</h4>
            <Badge variant="outline" className="border-white/30 text-white">
              {selectedStar.constellation}
            </Badge>
          </div>

          {selectedStar.planets.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white/70">Known Planets</h4>
              <div className="flex flex-wrap gap-1">
                {selectedStar.planets.map((planet) => (
                  <Badge key={planet} variant="secondary" className="text-xs bg-white/10 text-white/90">
                    {planet}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
