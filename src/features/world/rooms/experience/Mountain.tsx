import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { mulberry32 } from '@/shared/graphics/sketch'
import { SketchEdges } from '@/features/world/corridor/components/SketchEdges'
import { useToonMaterials } from '@/features/world/rooms/helpers'
import { RIDGE_DEPTH, type Ridge } from './layout'
import { MountainFace } from './terrain'

export function Mountain({ ridge }: { ridge: Ridge }) {
  const materials = useToonMaterials({ paper: ridge.color })
  const { geometry, profile } = useMemo(() => {
    const random = mulberry32(ridge.seed * 53 + 9)
    const rough: [number, number][] = []
    ridge.profile.forEach(([x, y], i) => {
      rough.push([x, y])
      const next = ridge.profile[i + 1]
      if (!next) return
      for (let k = 1; k < 4; k++) {
        const t = k / 4
        rough.push([
          x + (next[0] - x) * t + (random() - 0.5) * 0.25,
          y + (next[1] - y) * t + (random() - 0.5) * 0.42,
        ])
      }
    })
    const shape = new THREE.Shape()
    rough.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)))
    shape.closePath()
    return {
      geometry: new THREE.ExtrudeGeometry(shape, { depth: RIDGE_DEPTH, bevelEnabled: false }),
      profile: rough,
    }
  }, [ridge])
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <group position={[0, 0, ridge.z - RIDGE_DEPTH]}>
      <mesh geometry={geometry} material={materials.paper} />
      <SketchEdges
        geometry={geometry}
        seed={60 + ridge.seed}
        jitter={0.03}
        subdivisions={8}
        thresholdAngle={15}
      />
      <MountainFace
        profile={profile}
        seed={ridge.seed}
        strength={ridge.strength}
        trees={ridge.trees}
        snowLine={ridge.snowLine}
        z={RIDGE_DEPTH}
      />
    </group>
  )
}
