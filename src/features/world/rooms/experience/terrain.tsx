import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { AVATAR_ASPECT, createAvatarFrames } from '@/shared/graphics/avatarTexture'
import {
  createMistTexture,
  createMountainFaceTexture,
  createTentTexture,
  FACE_BASE,
  faceTop,
  type MountainFaceOptions,
} from '@/features/world/rooms/experience/experienceTextures'
import { createDotTexture } from '@/shared/graphics/spriteTextures'
import { useScene } from '@/features/world/scene/SceneContext'

export function MountainFace(options: MountainFaceOptions & { z: number }) {
  const { profile, seed, strength, trees, snowLine, z } = options
  const { geometry, material } = useMemo(() => {
    const shape = new THREE.Shape()
    profile.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)))
    shape.closePath()
    const geometry = new THREE.ShapeGeometry(shape)
    const top = faceTop(profile)
    const position = geometry.attributes.position
    const uv = geometry.attributes.uv
    for (let i = 0; i < position.count; i++) {
      uv.setXY(i, (position.getX(i) + 16) / 32, (position.getY(i) - FACE_BASE) / (top - FACE_BASE))
    }
    const map = createMountainFaceTexture({ profile, seed, strength, trees, snowLine })
    const material = new THREE.MeshBasicMaterial({
      map,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    })
    return { geometry, material }
  }, [profile, seed, strength, trees, snowLine])
  useEffect(
    () => () => {
      geometry.dispose()
      material.map?.dispose()
      material.dispose()
    },
    [geometry, material],
  )
  return <mesh geometry={geometry} material={material} position={[0, 0, z + 0.02]} />
}

export function Mist({ position, width, height, speed }: MistProps) {
  const { reducedMotion } = useScene()
  const texture = useMemo(() => {
    const map = createMistTexture()
    map.repeat.set(2, 1)
    return map
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  useFrame((_, delta) => {
    if (!reducedMotion) texture.offset.x += delta * speed
  })
  return (
    <mesh position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

interface MistProps {
  position: [number, number, number]
  width: number
  height: number
  speed: number
}

export function Pennant({ width, height, color, phase }: PennantProps) {
  const { reducedMotion } = useScene()
  const geometry = useMemo(() => new THREE.PlaneGeometry(width, height, 10, 2), [width, height])
  const rest = useMemo(() => Float32Array.from(geometry.attributes.position.array), [geometry])
  useEffect(() => () => geometry.dispose(), [geometry])

  const wave = (time: number) => {
    const position = geometry.attributes.position
    for (let i = 0; i < position.count; i++) {
      const t = rest[i * 3] / width + 0.5
      const ripple = Math.sin(t * 7 - time * 6 + phase) * 0.07 * t
      position.setXYZ(
        i,
        rest[i * 3] + width / 2,
        rest[i * 3 + 1] * (1 - t * 0.92) + ripple * 0.5 - t * t * 0.06,
        ripple,
      )
    }
    position.needsUpdate = true
  }
  useEffect(() => {
    wave(0)
  })
  useFrame((state) => {
    if (!reducedMotion) wave(state.clock.elapsedTime)
  })

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color={color} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

interface PennantProps {
  width: number
  height: number
  color: string
  phase: number
}

const PUFFS = 5

export function Campsite({ accent, seed, lit }: { accent: string; seed: number; lit: boolean }) {
  const { reducedMotion, quality } = useScene()
  const tent = useMemo(() => createTentTexture(accent, seed), [accent, seed])
  const dot = useMemo(() => createDotTexture(), [])
  useEffect(
    () => () => {
      tent.dispose()
      dot.dispose()
    },
    [tent, dot],
  )
  const puffs = useRef<(THREE.Sprite | null)[]>([])
  const flame = useRef<THREE.Sprite>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (flame.current) {
      const flicker = reducedMotion
        ? 1
        : 0.85 + Math.sin(t * 13 + seed) * 0.1 + Math.sin(t * 7) * 0.08
      flame.current.scale.set(0.16 * flicker, 0.24 * flicker, 1)
      flame.current.material.opacity = lit ? 0.95 : 0
    }
    puffs.current.forEach((puff, i) => {
      if (!puff) return
      const life = reducedMotion ? i / PUFFS : (t * 0.22 + i / PUFFS + seed * 0.37) % 1
      puff.position.set(0.75 + Math.sin(life * 5 + i) * 0.1 + life * 0.35, 0.3 + life * 1.5, 0.12)
      puff.scale.setScalar(0.14 + life * 0.42)
      puff.material.opacity = lit ? (1 - life) * 0.3 : 0
    })
  })

  return (
    <group>
      <mesh position={[0, 0.34, 0.1]}>
        <planeGeometry args={[0.92, 0.69]} />
        <meshBasicMaterial map={tent} transparent alphaTest={0.05} toneMapped={false} />
      </mesh>
      {[-0.08, 0.08].map((x) => (
        <mesh key={x} position={[0.75 + x, 0.06, 0.12]} rotation={[0, 0, x * 6]}>
          <boxGeometry args={[0.22, 0.045, 0.045]} />
          <meshBasicMaterial color="#8c7c6f" toneMapped={false} />
        </mesh>
      ))}
      <sprite ref={flame} position={[0.75, 0.2, 0.13]}>
        <spriteMaterial map={dot} color={accent} transparent depthWrite={false} />
      </sprite>
      {quality !== 'low' &&
        Array.from({ length: PUFFS }, (_, i) => (
          <sprite
            key={i}
            ref={(el) => {
              puffs.current[i] = el
            }}
          >
            <spriteMaterial map={dot} color="#8a857c" transparent opacity={0} depthWrite={false} />
          </sprite>
        ))}
    </group>
  )
}

const HIKER_HEIGHT = 0.95

export function Hiker({ curve, t }: { curve: THREE.Curve<THREE.Vector3>; t: number }) {
  const { reducedMotion } = useScene()
  const mesh = useRef<THREE.Mesh>(null)
  const current = useRef(t)
  const facing = useRef(1)
  const frames = useMemo(() => createAvatarFrames(), [])
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: frames[0],
        transparent: true,
        alphaTest: 0.05,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    [frames],
  )
  useEffect(
    () => () => {
      frames.forEach((frame) => frame.dispose())
      material.dispose()
    },
    [frames, material],
  )
  const point = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    if (!mesh.current) return
    const dt = Math.min(delta, 0.05)
    const before = current.current
    current.current = reducedMotion ? t : before + (t - before) * (1 - Math.exp(-dt * 1.6))
    const speed = Math.abs(current.current - before) / dt
    const walking = speed > 0.004
    if (walking) facing.current = current.current > before ? 1 : -1
    curve.getPointAt(THREE.MathUtils.clamp(current.current, 0, 1), point)
    const time = state.clock.elapsedTime
    const hop = walking && !reducedMotion ? Math.abs(Math.sin(time * 9)) * 0.07 : 0
    mesh.current.position.set(point.x, point.y + HIKER_HEIGHT / 2 + hop, point.z + 0.34)
    mesh.current.rotation.z = walking ? Math.sin(time * 9) * 0.05 : 0
    mesh.current.scale.x = facing.current
    if (!reducedMotion) {
      const cycle = 2 * (frames.length - 1)
      const step = Math.floor(time * (walking ? 4 : 9)) % cycle
      material.map = frames[step < frames.length ? step : cycle - step]
    }
  })

  return (
    <mesh ref={mesh} material={material}>
      <planeGeometry args={[HIKER_HEIGHT * AVATAR_ASPECT, HIKER_HEIGHT]} />
    </mesh>
  )
}
