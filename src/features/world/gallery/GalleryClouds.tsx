import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createFluffyCloudTexture } from '@/shared/graphics/cloudTexture'
import { mulberry32 } from '@/shared/graphics/sketch'
import { useScene } from '@/features/world/scene/SceneContext'

const START_X = 16
const END_X = -16
const SPAN = START_X - END_X + 4
const TEXTURES = 6
const COUNT = 48
const SEED = 123

interface CloudSpec {
  y: number
  z: number
  width: number
  height: number
  drift: number
  offset: number
  material: THREE.SpriteMaterial
}

export function GalleryClouds() {
  const { quality, reducedMotion } = useScene()
  const sprites = useRef<(THREE.Sprite | null)[]>([])
  const total =
    quality === 'low'
      ? Math.round(COUNT / 4)
      : quality === 'medium'
        ? Math.round(COUNT / 1.7)
        : COUNT
  const textures = useMemo(
    () => Array.from({ length: TEXTURES }, (_, i) => createFluffyCloudTexture(SEED + i * 3)),
    [],
  )
  const clouds = useMemo<CloudSpec[]>(() => {
    const random = mulberry32(SEED * 7 + total)
    return Array.from({ length: total }, (_, i) => {
      const scale = 0.5 + random() * 1.2
      const width = 2.5 * scale
      const texture = textures[Math.floor(random() * textures.length)]
      return {
        y: 4.5 + random() * 5,
        z: -8 - random() * 15,
        width,
        height: width / 1.6,
        drift: 0.1 + random() * 0.15,
        offset: (i / total) * SPAN + random() * 2,
        material: new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
          fog: false,
          opacity: 0.6 + random() * 0.35,
        }),
      }
    })
  }, [total, textures])
  useEffect(
    () => () => {
      clouds.forEach((c) => c.material.dispose())
      textures.forEach((t) => t.dispose())
    },
    [clouds, textures],
  )

  const xAt = (cloud: CloudSpec, t: number) =>
    START_X - ((t * cloud.drift + cloud.offset) % SPAN) + 2

  useFrame((state) => {
    if (reducedMotion) return
    const t = state.clock.elapsedTime
    clouds.forEach((cloud, i) => {
      const sprite = sprites.current[i]
      if (sprite) sprite.position.x = xAt(cloud, t)
    })
  })

  return (
    <>
      {clouds.map((cloud, i) => (
        <sprite
          key={i}
          ref={(el) => {
            sprites.current[i] = el
          }}
          material={cloud.material}
          position={[xAt(cloud, 0), cloud.y, cloud.z]}
          scale={[cloud.width, cloud.height, 1]}
        />
      ))}
    </>
  )
}
