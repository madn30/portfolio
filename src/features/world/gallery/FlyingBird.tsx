import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createBirdTexture } from '@/shared/graphics/spriteTextures'
import { useScene } from '@/features/world/scene/SceneContext'

const START_X = -14
const END_X = 14
const SPEED = 2.5
const GRAVITY = -12
const JUMP = 5.5
const FLOOR = 2.8
const CEILING = 5.5
const START_Y = 4
const Z = -10

export function FlyingBird() {
  const { reducedMotion } = useScene()
  const sprite = useRef<THREE.Sprite>(null)
  const velocity = useRef(0)
  const nextJump = useRef(0)
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

  useFrame((_, delta) => {
    const bird = sprite.current
    if (!bird || reducedMotion) return
    const dt = Math.min(delta, 0.05)
    bird.position.x += SPEED * dt
    if (bird.position.x > END_X) {
      bird.position.x = START_X
      bird.position.y = START_Y
      velocity.current = 0
      nextJump.current = 0
      material.rotation = 0
    }
    velocity.current += GRAVITY * dt
    bird.position.y += velocity.current * dt
    nextJump.current -= dt
    if (nextJump.current <= 0 || bird.position.y < FLOOR + 0.2) {
      velocity.current = JUMP
      nextJump.current = 0.9 + Math.random() * 0.3
    }
    if (bird.position.y < FLOOR) {
      bird.position.y = FLOOR
      velocity.current = JUMP
    }
    if (bird.position.y > CEILING) {
      bird.position.y = CEILING
      velocity.current = 0
    }
    const target = THREE.MathUtils.clamp(velocity.current * 0.05, -Math.PI / 6, Math.PI / 8)
    material.rotation = THREE.MathUtils.lerp(material.rotation, target, dt * 8)
  })

  return (
    <sprite
      ref={sprite}
      material={material}
      position={[START_X, START_Y, Z]}
      scale={[0.5, 0.36, 1]}
    />
  )
}
