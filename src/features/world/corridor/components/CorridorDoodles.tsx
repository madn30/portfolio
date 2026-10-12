import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { AVATAR_ASPECT, createAvatarFrames, setAvatarLids } from '@/shared/graphics/avatarTexture'
import { createBlinker } from '@/shared/utils/blink'
import {
  createDoodleTexture,
  type DoodleKind,
} from '@/features/world/corridor/textures/doodleTextures'
import { InteractiveHotspot } from './InteractiveHotspot'
import { useScene } from '@/features/world/scene/SceneContext'

const SIGN_FADE_FAR = 3.4
const SIGN_FADE_NEAR = 1.2
const AVATAR_HEIGHT = 1.72
const AVATAR_X = 1.85
const DODGE = 0.8
const WAVE_FPS = 18
const WAVE_FRAMES = 9
const HOP_SECONDS = 0.55

function smooth(t: number): number {
  const c = Math.min(1, Math.max(0, t))
  return c * c * (3 - 2 * c)
}

function useSketchMaterial(texture: THREE.Texture, color?: string): THREE.MeshBasicMaterial {
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        ...(color ? { color } : {}),
        transparent: true,
        alphaTest: 0.05,
        toneMapped: false,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [texture, color],
  )
  useEffect(() => () => material.dispose(), [material])
  return material
}

interface FloaterProps {
  kind: DoodleKind
  position: [number, number, number]
  scale: number
  seed: number
  tilt?: number
  z: number
  spin?: number
  pulse?: number
  shadow?: boolean
  drift?: boolean
}

function Floater({
  kind,
  position,
  scale,
  seed,
  tilt = 0,
  z,
  spin = 0,
  pulse = 0.03,
  shadow = false,
  drift = false,
}: FloaterProps) {
  const { reducedMotion } = useScene()
  const camera = useThree((state) => state.camera)
  const group = useRef<THREE.Group>(null)
  const texture = useMemo(() => createDoodleTexture(kind, seed), [kind, seed])
  useEffect(() => () => texture.dispose(), [texture])
  const material = useSketchMaterial(texture)
  const shadowMaterial = useSketchMaterial(texture, '#262421')

  useFrame((state) => {
    const distance = camera.position.z - z
    const fade = smooth((distance - SIGN_FADE_NEAR) / (SIGN_FADE_FAR - SIGN_FADE_NEAR))
    material.opacity = fade
    shadowMaterial.opacity = fade * 0.15
    if (reducedMotion || !group.current) return
    const t = state.clock.elapsedTime + seed * 1.3
    group.current.position.y = position[1] + Math.sin(t * 0.7) * 0.05
    group.current.position.x = drift ? position[0] + Math.sin(t * 0.5) * 0.02 : position[0]
    group.current.rotation.z = spin ? t * spin : tilt + Math.sin(t * 0.45) * 0.09
    group.current.scale.setScalar(1 + Math.sin(t * 1.5 + position[0] * 2) * pulse)
  })

  return (
    <group ref={group} position={position} rotation={[0, 0, tilt]}>
      {shadow && (
        <mesh position={[0.012, -0.012, -0.012]} material={shadowMaterial}>
          <planeGeometry args={[scale, scale]} />
        </mesh>
      )}
      <mesh material={material}>
        <planeGeometry args={[scale, scale]} />
      </mesh>
    </group>
  )
}

function ThoughtBubble({ position, z }: { position: [number, number, number]; z: number }) {
  const { reducedMotion } = useScene()
  const camera = useThree((state) => state.camera)
  const group = useRef<THREE.Group>(null)
  const textures = useMemo(
    () => ({ bubble: createDoodleTexture('bubble', 21), code: createDoodleTexture('code', 22) }),
    [],
  )
  useEffect(() => () => Object.values(textures).forEach((t) => t.dispose()), [textures])
  const bubble = useSketchMaterial(textures.bubble)
  const code = useSketchMaterial(textures.code)

  useFrame((state) => {
    const distance = camera.position.z - z
    const fade = smooth((distance - SIGN_FADE_NEAR) / (SIGN_FADE_FAR - SIGN_FADE_NEAR))
    const t = state.clock.elapsedTime
    bubble.opacity = fade
    code.opacity = fade * (reducedMotion ? 1 : 0.8 + Math.sin(t * 3) * 0.2)
    if (reducedMotion || !group.current) return
    group.current.position.y = position[1] + Math.sin(t * 0.6) * 0.02
  })

  return (
    <group ref={group} position={position}>
      <mesh material={bubble}>
        <planeGeometry args={[0.44, 0.44]} />
      </mesh>
      <mesh position={[0.035, 0.035, 0.005]} material={code}>
        <planeGeometry args={[0.2, 0.2]} />
      </mesh>
    </group>
  )
}

function Avatar({ z }: { z: number }) {
  const { reducedMotion } = useScene()
  const camera = useThree((state) => state.camera)
  const clock = useThree((state) => state.clock)
  const group = useRef<THREE.Group>(null)
  const frames = useMemo(() => createAvatarFrames(WAVE_FRAMES), [])
  const blink = useMemo(() => createBlinker(), [])
  useEffect(() => () => frames.forEach((frame) => frame.dispose()), [frames])
  const material = useSketchMaterial(frames[0])
  const dodge = useRef(0)
  const frame = useRef(0)
  const hopStart = useRef(-Infinity)
  const excitedUntil = useRef(0)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const distance = camera.position.z - z
    material.opacity = smooth((distance - 0.5) / 1.1)
    const near =
      distance > 0 ? smooth((3 - distance) / 3) : distance > -2 ? smooth((distance + 2) / 2) : 0
    dodge.current += (DODGE * near - dodge.current) * (reducedMotion ? 1 : 1 - Math.exp(-delta * 6))
    const hop = Math.sin(Math.min(1, (t - hopStart.current) / HOP_SECONDS) * Math.PI) * 0.22
    group.current?.position.set(AVATAR_X + dodge.current, AVATAR_HEIGHT / 2 + hop, 0.35)
    if (reducedMotion) return
    const fps = t < excitedUntil.current ? WAVE_FPS * 2 : WAVE_FPS
    const cycle = 2 * (frames.length - 1)
    const step = Math.floor(t * fps) % cycle
    const index = step < frames.length ? step : cycle - step
    setAvatarLids(frames[index], blink(t))
    if (index !== frame.current) {
      frame.current = index
      material.map = frames[index]
    }
  })

  const greet = () => {
    const now = clock.getElapsedTime()
    hopStart.current = now
    excitedUntil.current = now + 1.6
  }

  return (
    <group ref={group} position={[AVATAR_X, AVATAR_HEIGHT / 2, 0.35]}>
      <InteractiveHotspot label="Say hi" onActivate={greet}>
        <mesh material={material}>
          <planeGeometry args={[AVATAR_HEIGHT * AVATAR_ASPECT, AVATAR_HEIGHT]} />
        </mesh>
      </InteractiveHotspot>
    </group>
  )
}

export function CorridorDoodles({ z }: { z: number }) {
  const { quality } = useScene()
  const detailed = quality !== 'low'
  return (
    <group position={[0, 0, z]}>
      <Avatar z={z} />
      <Floater
        kind="plane"
        position={[-2.3, 3.5, -0.2]}
        scale={0.62}
        seed={1}
        tilt={0.2}
        z={z}
        shadow
      />
      <Floater kind="ball" position={[-2.45, 1.3, 0.15]} scale={0.4} seed={2} z={z} shadow />
      <Floater kind="ball" position={[-1.5, 3.05, -0.3]} scale={0.3} seed={8} z={z} shadow />
      <Floater
        kind="pencil"
        position={[2.4, 3.4, -0.1]}
        scale={0.7}
        seed={3}
        tilt={-0.3}
        z={z}
        shadow
      />
      {detailed && (
        <>
          <Floater kind="mug" position={[2.6, 2.75, 0.05]} scale={0.42} seed={4} z={z} shadow />
          <Floater
            kind="star"
            position={[-1.75, 3.75, 0]}
            scale={0.22}
            seed={5}
            z={z}
            spin={0.4}
            pulse={0.15}
          />
          <Floater
            kind="star"
            position={[2.7, 2.05, 0.1]}
            scale={0.16}
            seed={6}
            z={z}
            spin={0.5}
            pulse={0.15}
          />
          <Floater
            kind="star"
            position={[-2.7, 2.6, -0.1]}
            scale={0.14}
            seed={7}
            z={z}
            spin={0.3}
            pulse={0.15}
          />
          <Floater
            kind="circle"
            position={[2.75, 1.45, 0.2]}
            scale={0.14}
            seed={9}
            z={z}
            pulse={0.1}
          />
          <Floater
            kind="circle"
            position={[-2.75, 3.3, 0.3]}
            scale={0.11}
            seed={10}
            z={z}
            pulse={0.1}
          />
          <Floater
            kind="squiggle"
            position={[-2.7, 2.15, -0.3]}
            scale={0.36}
            seed={11}
            tilt={0.2}
            z={z}
            drift
            pulse={0}
          />
          <Floater
            kind="squiggle"
            position={[2.72, 1.05, 0.2]}
            scale={0.3}
            seed={12}
            tilt={-0.3}
            z={z}
            drift
            pulse={0}
          />
          <ThoughtBubble position={[2.5, 2.2, 0.5]} z={z} />
        </>
      )}
    </group>
  )
}
