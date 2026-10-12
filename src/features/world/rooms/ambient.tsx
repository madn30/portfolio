import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mulberry32 } from '@/shared/graphics/sketch'
import {
  createBirdTexture,
  createDotTexture,
  createSunTexture,
} from '@/shared/graphics/spriteTextures'
import { useScene } from '@/features/world/scene/SceneContext'

interface SunProps {
  position: [number, number, number]
  scale?: number
}

export function Sun({ position, scale = 2 }: SunProps) {
  const { reducedMotion } = useScene()
  const sprite = useRef<THREE.Sprite>(null)
  const texture = useMemo(() => createSunTexture(), [])
  useEffect(() => () => texture.dispose(), [texture])

  useFrame((state) => {
    if (reducedMotion || !sprite.current) return
    const t = state.clock.elapsedTime
    const s = scale * (1 + Math.sin(t * 0.4) * 0.02)
    sprite.current.scale.set(s, s, 1)
    sprite.current.material.rotation = t * 0.015
  })

  return (
    <sprite ref={sprite} position={position} scale={[scale, scale, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} fog={false} />
    </sprite>
  )
}

interface BirdsProps {
  centre: [number, number, number]
  count?: number
  spread?: number
  seed?: number
}

export function Birds({ centre, count = 4, spread = 2.5, seed = 1 }: BirdsProps) {
  const { reducedMotion } = useScene()
  const sprites = useRef<(THREE.Sprite | null)[]>([])
  const texture = useMemo(() => createBirdTexture(), [])
  const material = useMemo(
    () => new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }),
    [texture],
  )
  useEffect(
    () => () => {
      texture.dispose()
      material.dispose()
    },
    [texture, material],
  )
  const birds = useMemo(() => {
    const random = mulberry32(seed * 13 + 1)
    return Array.from({ length: count }, () => ({
      phase: random() * Math.PI * 2,
      speed: 0.06 + random() * 0.05,
      radius: spread * (0.5 + random() * 0.5),
      height: (random() - 0.5) * 1.2,
      flap: 2.5 + random() * 2.5,
      size: 0.3 + random() * 0.22,
    }))
  }, [count, spread, seed])

  useFrame((state) => {
    if (reducedMotion) return
    const t = state.clock.elapsedTime
    birds.forEach((bird, i) => {
      const sprite = sprites.current[i]
      if (!sprite) return
      const a = bird.phase + t * bird.speed
      sprite.position.set(
        centre[0] + Math.cos(a) * bird.radius,
        centre[1] + bird.height + Math.sin(t * 0.7 + bird.phase) * 0.15,
        centre[2] + Math.sin(a) * bird.radius * 0.35,
      )
      const flap = 0.5 + Math.abs(Math.sin(t * bird.flap + bird.phase)) * 0.5
      sprite.scale.set(bird.size * 1.8, bird.size * flap, 1)
    })
  })

  return (
    <>
      {birds.map((bird, i) => (
        <sprite
          key={i}
          ref={(el) => {
            sprites.current[i] = el
          }}
          material={material}
          position={[
            centre[0] + Math.cos(bird.phase) * bird.radius,
            centre[1] + bird.height,
            centre[2] + Math.sin(bird.phase) * bird.radius * 0.35,
          ]}
          scale={[bird.size * 1.8, bird.size, 1]}
        />
      ))}
    </>
  )
}

interface MotesProps {
  centre: [number, number, number]
  area: [number, number, number]
  count?: number
  seed?: number
}

export function Motes({ centre, area, count = 60, seed = 2 }: MotesProps) {
  const { quality, reducedMotion } = useScene()
  const points = useRef<THREE.Points>(null)
  const total = quality === 'low' ? Math.round(count / 3) : count
  const key = JSON.stringify([centre, area, total, seed])

  const { geometry, base, speed } = useMemo(() => {
    const random = mulberry32(seed * 31 + 5)
    const base = new Float32Array(total * 3)
    const speed = new Float32Array(total)
    for (let i = 0; i < total; i++) {
      base[i * 3] = centre[0] + (random() - 0.5) * area[0]
      base[i * 3 + 1] = centre[1] + (random() - 0.5) * area[1]
      base[i * 3 + 2] = centre[2] + (random() - 0.5) * area[2]
      speed[i] = 0.4 + random() * 0.8
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(base.slice(), 3))
    return { geometry, base, speed }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  const texture = useMemo(() => createDotTexture(), [])
  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        map: texture,
        size: 0.05,
        color: '#ffffff',
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    [texture],
  )
  useEffect(
    () => () => {
      geometry.dispose()
      texture.dispose()
      material.dispose()
    },
    [geometry, texture, material],
  )

  useFrame((state) => {
    if (reducedMotion || !points.current) return
    const t = state.clock.elapsedTime
    const attribute = geometry.getAttribute('position') as THREE.BufferAttribute
    const array = attribute.array as Float32Array
    const half = area[1] / 2
    for (let i = 0; i < total; i++) {
      const rise = (t * 0.05 * speed[i]) % area[1]
      let y = base[i * 3 + 1] + rise
      if (y > centre[1] + half) y -= area[1]
      array[i * 3] = base[i * 3] + Math.sin(t * 0.3 * speed[i] + i) * 0.2
      array[i * 3 + 1] = y
      array[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.2 * speed[i] + i) * 0.15
    }
    attribute.needsUpdate = true
  })

  return <points ref={points} geometry={geometry} material={material} />
}

interface HoverLiftProps {
  hovered: boolean
  lift?: number
  scale?: number
  children: ReactNode
}

export function HoverLift({ hovered, lift = 0.08, scale = 1.05, children }: HoverLiftProps) {
  const { reducedMotion } = useScene()
  const group = useRef<THREE.Group>(null)
  const level = useRef(0)

  useFrame((_, delta) => {
    const target = hovered ? 1 : 0
    const current = level.current
    if (current === target || !group.current) return
    const next = reducedMotion ? target : current + (target - current) * (1 - Math.exp(-delta * 10))
    level.current = Math.abs(next - target) < 0.002 ? target : next
    group.current.position.y = level.current * lift
    group.current.scale.setScalar(1 + (scale - 1) * level.current)
  })

  return <group ref={group}>{children}</group>
}
