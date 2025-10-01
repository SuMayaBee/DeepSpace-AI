"use client"

import { useRef, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useStarStore } from "@/lib/star-store"
import * as THREE from "three"

export function CameraController() {
  const { camera } = useThree()
  const { currentView } = useStarStore()
  const targetPosition = useRef(new THREE.Vector3())
  const isAnimating = useRef(false)
  const animationSpeed = 0.05

  // Define camera positions for different views
  const cameraPositions = {
    space: new THREE.Vector3(0, 0, 50),
    "star-system": new THREE.Vector3(0, 15, 25),
    "focused-object": new THREE.Vector3(0, 0, 15),
  }

  useEffect(() => {
    const newPosition = cameraPositions[currentView]
    if (newPosition && !targetPosition.current.equals(newPosition)) {
      targetPosition.current.copy(newPosition)
      isAnimating.current = true
    }
  }, [currentView])

  useFrame(() => {
    if (isAnimating.current) {
      const distance = camera.position.distanceTo(targetPosition.current)

      if (distance > 0.1) {
        camera.position.lerp(targetPosition.current, animationSpeed)
      } else {
        camera.position.copy(targetPosition.current)
        isAnimating.current = false
      }
    }
  })

  return null
}
