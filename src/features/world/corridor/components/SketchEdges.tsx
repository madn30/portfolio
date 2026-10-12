import { useEffect, useMemo } from 'react'
import type * as THREE from 'three'
import { createSketchEdges, type SketchOptions } from '@/shared/graphics/sketch'
import { useScene } from '@/features/world/scene/SceneContext'

interface SketchEdgesProps extends SketchOptions {
  geometry: THREE.BufferGeometry
  tone?: 'ink' | 'soft' | 'accent'
  position?: [number, number, number]
  rotation?: [number, number, number]
}

export function SketchEdges({
  geometry,
  tone = 'ink',
  position,
  rotation,
  ...options
}: SketchEdgesProps) {
  const { materials, quality } = useScene()
  const subdivisions = options.subdivisions ?? (quality === 'low' ? 3 : 6)
  const passes = options.passes ?? (quality === 'low' ? 1 : 2)

  const edges = useMemo(
    () => createSketchEdges(geometry, { ...options, subdivisions, passes }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      geometry,
      subdivisions,
      passes,
      options.jitter,
      options.seed,
      options.offset,
      options.thresholdAngle,
    ],
  )

  useEffect(() => () => edges.dispose(), [edges])

  const material =
    tone === 'accent' ? materials.lineAccent : tone === 'soft' ? materials.lineSoft : materials.line

  return (
    <lineSegments
      geometry={edges}
      material={material}
      position={position}
      rotation={rotation}
      raycast={() => null}
    />
  )
}
