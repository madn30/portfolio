import { useEffect, useMemo } from 'react'
import type { RefObject } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { mulberry32 } from '@/shared/graphics/sketch'
import { createFibreSprite } from './paperTextures'
import { tearX } from './tearProfile'
import type { TearOctave } from './tearProfile'

const COUNT = 220
const GRAVITY = 0.25
const MAX_SPAWN = 8
const PARKED = -100

interface FibresProps {
  profile: TearOctave[]
  length: RefObject<number>
}

function createPool() {
  return {
    positions: new Float32Array(COUNT * 3).fill(PARKED),
    velocity: new Float32Array(COUNT * 3),
    life: new Float32Array(COUNT),
    next: 0,
    last: 0,
    random: mulberry32(5),
  }
}

export function Fibres({ profile, length }: FibresProps) {
  const sprite = useMemo(createFibreSprite, [])
  const pool = useMemo(createPool, [])
  const geometry = useMemo(() => {
    const buffer = new THREE.BufferGeometry()
    buffer.setAttribute('position', new THREE.BufferAttribute(pool.positions, 3))
    return buffer
  }, [pool])

  useEffect(
    () => () => {
      sprite.dispose()
      geometry.dispose()
    },
    [sprite, geometry],
  )

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const current = length.current
    const grown = current - pool.last
    pool.last = current
    const { positions, velocity, life, random } = pool
    if (grown > 0 && current < 1.05) {
      const spawn = Math.min(MAX_SPAWN, Math.ceil(grown * 300))
      for (let k = 0; k < spawn; k++) {
        const i = pool.next++ % COUNT
        const y = (random() > 0.5 ? 1 : -1) * current
        positions[i * 3] = tearX(profile, y) + (random() - 0.5) * 0.04
        positions[i * 3 + 1] = y
        positions[i * 3 + 2] = 0.12
        velocity[i * 3] = (random() - 0.5) * 0.35
        velocity[i * 3 + 1] = -(0.05 + random() * 0.3)
        velocity[i * 3 + 2] = random() * 0.1
        life[i] = 0.8 + random() * 0.9
      }
    }
    for (let i = 0; i < COUNT; i++) {
      if (life[i] <= 0) continue
      life[i] -= dt
      if (life[i] <= 0) {
        positions[i * 3 + 2] = PARKED
        continue
      }
      velocity[i * 3 + 1] -= GRAVITY * dt
      positions[i * 3] += velocity[i * 3] * dt
      positions[i * 3 + 1] += velocity[i * 3 + 1] * dt
      positions[i * 3 + 2] += velocity[i * 3 + 2] * dt
    }
    geometry.attributes.position.needsUpdate = true
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        map={sprite}
        size={3.5}
        sizeAttenuation={false}
        transparent
        opacity={0.8}
        color="#f4f1ea"
        depthWrite={false}
      />
    </points>
  )
}
