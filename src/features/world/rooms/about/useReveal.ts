import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { useScene } from '@/features/world/scene/SceneContext'
import { createPaintedMaterial, createRevealMaterial, type RevealMaterial } from './revealMaterial'

interface RevealPair {
  sketch: RevealMaterial
  painted: THREE.MeshBasicMaterial
  setHovered: (hovered: boolean) => void
  fade: MutableRefObject<number>
}

export function useReveal(sketchMap: THREE.Texture, paintedMap: THREE.Texture): RevealPair {
  const { touch, reducedMotion } = useScene()
  const target = useRef(0)
  const fade = useRef(1)
  const materials = useMemo(
    () => ({ sketch: createRevealMaterial(sketchMap), painted: createPaintedMaterial(paintedMap) }),
    [sketchMap, paintedMap],
  )
  useEffect(
    () => () => {
      materials.sketch.dispose()
      materials.painted.dispose()
    },
    [materials],
  )

  useFrame((_, delta) => {
    const { sketch, painted } = materials
    const goal = target.current
    const k = reducedMotion ? 1 : 1 - Math.exp(-Math.min(delta, 0.05) * (goal ? 4 : 6))
    const next = sketch.uProgress + (goal - sketch.uProgress) * k
    sketch.uProgress = Math.abs(next - goal) < 0.002 ? goal : next
    sketch.opacity = fade.current
    painted.opacity = (sketch.uProgress > 0.001 ? 1 : 0) * fade.current
  })

  return useMemo(
    () => ({
      ...materials,
      fade,
      setHovered: (hovered: boolean) => {
        if (touch) return
        target.current = hovered ? 1 : 0
      },
    }),
    [materials, touch],
  )
}
