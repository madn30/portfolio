import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createFluffyCloudTexture, type CloudVariant } from '@/shared/graphics/cloudTexture'
import { mulberry32 } from '@/shared/graphics/sketch'
import { useScene } from '@/features/world/scene/SceneContext'
import type { Flight } from '@/features/world/rooms/flight'
import {
  BEHIND,
  CHUNK,
  CLIP_AHEAD,
  CYCLE,
  FOG_FAR,
  LANE_TOP,
  LANE_X,
  MILESTONES,
  mod,
  smoothstep,
  approach,
  zForAhead,
} from './stream'

const VARIANTS: CloudVariant[] = [
  'puffy',
  'long',
  'puffy',
  'wisp',
  'puffy',
  'long',
  'wisp',
  'puffy',
]
const FAR_LOOP = 120
const FAR_RATE = 0.35

interface CloudSlot {
  x: number
  y: number
  at: number
  scale: number
  texture: number
  speed: number
  amount: number
  bob: number
  phase: number
}

function useCloudMaterials(count: number, opacity = 1): THREE.SpriteMaterial[] {
  const materials = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const variant = VARIANTS[i % VARIANTS.length]
        const map = createFluffyCloudTexture(
          100 + i,
          variant === 'long' ? 640 : 512,
          variant === 'long' ? 256 : 320,
          variant,
        )
        return new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, opacity })
      }),
    [count, opacity],
  )
  useEffect(
    () => () =>
      materials.forEach((m) => {
        m.map?.dispose()
        m.dispose()
      }),
    [materials],
  )
  return materials
}

function nearMilestone(at: number): boolean {
  const inCycle = mod(at, CYCLE)
  return MILESTONES.some(
    (m) => Math.abs(inCycle - m.at) < 5 || Math.abs(inCycle - m.at - CYCLE) < 5,
  )
}

function generate(chunk: number, count: number, textures: number): CloudSlot[] {
  const random = mulberry32((chunk + 4096) * 7919 + 42)
  const out: CloudSlot[] = []
  for (let i = 0; i < count; i++) {
    let x = (random() - 0.5) * 24
    let y = -2 + random() * 10
    const scale = 1 + random() * 1.8
    const at = chunk * CHUNK + random() * CHUNK
    if (Math.abs(x) < LANE_X + scale * 0.8 && y - scale / 2 < LANE_TOP && y + scale / 2 > -0.2) {
      x += x < 0 ? -(LANE_X + scale) : LANE_X + scale
    }
    if (nearMilestone(at) && Math.abs(x) < 6) {
      if (y > 1) y = 8.5 + random() * 1.5
      else x += x < 0 ? -6 : 6
    }
    out.push({
      x,
      y,
      at,
      scale,
      texture: Math.floor(random() * textures),
      speed: 0.3 + random() * 0.4,
      amount: 0.3 + random() * 0.6,
      bob: 0.1 + random() * 0.2,
      phase: random() * Math.PI * 2,
    })
  }
  return out
}

function placeCloud(
  sprite: THREE.Sprite,
  cloud: CloudSlot,
  ahead: number,
  t: number,
  reducedMotion: boolean,
): void {
  sprite.visible = ahead > CLIP_AHEAD && ahead < FOG_FAR + 10
  if (!sprite.visible) return
  const evasion = smoothstep(approach(ahead, 22, 6)) * 6 * (cloud.x >= 0 ? 1 : -1)
  const drift = reducedMotion ? 0 : Math.sin(t * cloud.speed + cloud.phase) * cloud.amount
  const bob = reducedMotion ? 0 : Math.sin(t * cloud.speed * 0.7 + cloud.phase + 1.5) * cloud.bob
  sprite.position.set(cloud.x + drift + evasion, cloud.y + bob, zForAhead(ahead))
}

export function SkyChunks({ flight }: { flight: MutableRefObject<Flight> }) {
  const { quality, reducedMotion } = useScene()
  const slots = quality === 'low' ? 3 : 4
  const perChunk = quality === 'low' ? 8 : quality === 'medium' ? 13 : 18
  const materials = useCloudMaterials(quality === 'low' ? 4 : 8)
  const sprites = useRef<(THREE.Sprite | null)[]>([])
  const chunks = useRef<{ index: number; clouds: CloudSlot[] }[]>([])

  useFrame((state) => {
    const distance = flight.current.distance
    const current = Math.floor(distance / CHUNK)
    const t = state.clock.elapsedTime
    for (let k = 0; k < slots; k++) {
      const index = current + k - 1
      let slot = chunks.current[k]
      if (!slot || slot.index !== index) {
        slot = { index, clouds: generate(index, perChunk, materials.length) }
        chunks.current[k] = slot
        slot.clouds.forEach((cloud, i) => {
          const sprite = sprites.current[k * perChunk + i]
          if (!sprite) return
          sprite.material = materials[cloud.texture]
          const long = VARIANTS[cloud.texture % VARIANTS.length] === 'long'
          sprite.scale.set((long ? 2.5 : 1.6) * cloud.scale, cloud.scale, 1)
        })
      }
      slot.clouds.forEach((cloud, i) => {
        const sprite = sprites.current[k * perChunk + i]
        if (sprite) placeCloud(sprite, cloud, cloud.at - distance, t, reducedMotion)
      })
    }
  })

  return (
    <>
      {Array.from({ length: slots * perChunk }, (_, i) => (
        <sprite
          key={i}
          ref={(el) => {
            sprites.current[i] = el
          }}
          material={materials[i % materials.length]}
          visible={false}
        />
      ))}
    </>
  )
}

export function FarClouds({ flight }: { flight: MutableRefObject<Flight> }) {
  const { reducedMotion } = useScene()
  const materials = useCloudMaterials(3, 0.55)
  const sprites = useRef<(THREE.Sprite | null)[]>([])
  const clouds = useMemo(() => {
    const random = mulberry32(909)
    return Array.from({ length: 10 }, (_, i): CloudSlot => {
      const side = i % 2 ? 1 : -1
      return {
        x: side * (9 + random() * 6),
        y: -1 + random() * 9,
        at: (i / 10) * FAR_LOOP + random() * 6,
        scale: 5 + random() * 2.5,
        texture: i % 3,
        speed: 0.1 + random() * 0.1,
        amount: 0.4,
        bob: 0.15,
        phase: random() * Math.PI * 2,
      }
    })
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const travelled = flight.current.distance * FAR_RATE
    clouds.forEach((cloud, i) => {
      const sprite = sprites.current[i]
      if (!sprite) return
      const ahead = mod(cloud.at - travelled + BEHIND, FAR_LOOP) - BEHIND
      placeCloud(sprite, cloud, ahead, t, reducedMotion)
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
          material={materials[cloud.texture]}
          scale={[cloud.scale * 1.8, cloud.scale, 1]}
          visible={false}
        />
      ))}
    </>
  )
}
