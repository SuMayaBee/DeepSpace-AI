"use client"

import { useStarStore } from "@/lib/star-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

export function SpaceUI() {
  const { hoveredStar } = useStarStore()

  return (
    <>
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
