import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { CORRIDOR } from '@/shared/corridor/corridor'
import { createMarkerTexture } from '@/features/world/corridor/textures/doorDecor'
import { getGlowTexture } from '@/shared/graphics/textures/surfaces'
import { useScene } from '@/features/world/scene/SceneContext'

const W = CORRIDOR.door.width
const H = CORRIDOR.door.height
const NEAR = 8

interface DoorMarkerProps {
  z: number
  index: number
  accent: string
  y: number
  hidden: boolean
}

export function DoorMarker({ z, index, accent, y, hidden }: DoorMarkerProps) {
  const { reducedMotion } = useScene()
  const camera = useThree((state) => state.camera)
  const marker = useRef<THREE.Mesh>(null)
  const level = useRef(0)

  const textures = useMemo(() => ({ marker: createMarkerTexture(), glow: getGlowTexture() }), [])
  const materials = useMemo(
    () => ({
      marker: new THREE.MeshBasicMaterial({
        map: textures.marker,
        transparent: true,
        opacity: 0,
        alphaTest: 0.05,
        toneMapped: false,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
      glow: new THREE.SpriteMaterial({
        map: textures.glow,
        color: accent,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    }),
    [textures, accent],
  )
  useEffect(
    () => () => {
      textures.marker.dispose()
      Object.values(materials).forEach((m) => m.dispose())
    },
    [textures, materials],
  )

  useFrame((state, delta) => {
    const distance = Math.abs(camera.position.z - z)
    const target = hidden ? 0 : Math.min(1, Math.max(0, (NEAR - distance) / 3))
    const next = reducedMotion
      ? target
      : level.current + (target - level.current) * (1 - Math.exp(-delta * 5))
    if (Math.abs(next - level.current) > 0.0005) {
      level.current = next
      materials.marker.opacity = next
      materials.glow.opacity = next * 0.16
    }
    if (marker.current && !reducedMotion) {
      marker.current.position.y = y + Math.sin(state.clock.elapsedTime * 2.2 + index) * 0.05
    }
  })

  return (
    <group>
      <mesh ref={marker} position={[0, y, 0.08]} material={materials.marker}>
        <planeGeometry args={[0.26, 0.26]} />
      </mesh>
      <sprite position={[0, 0.1, 0.01]} scale={[W + 1.6, H + 1.4, 1]} material={materials.glow} />
    </group>
  )
}
