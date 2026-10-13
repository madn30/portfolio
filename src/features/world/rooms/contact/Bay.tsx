import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createBeamTexture } from '@/features/world/rooms/contact/contactTextures'
import { mulberry32 } from '@/shared/graphics/sketch'
import { useScene } from '@/features/world/scene/SceneContext'
import { Birds } from '@/features/world/rooms/ambient'
import { Cloud } from '@/features/world/rooms/shared'
import type { Vec3 } from './constants'
import { useDrawing } from './drawing'
import { createLighthouseTexture } from './lighthouseTexture'
import { createPaperBoatTexture } from './seaTextures'

const LIGHTHOUSE: Vec3 = [-6.4, 2.7, -27]
const LANTERN: Vec3 = [LIGHTHOUSE[0], LIGHTHOUSE[1] + 6.6 * 0.21, LIGHTHOUSE[2]]
const BOAT: Vec3 = [-2, 0.12, -15.5]

const CLOUDS = (() => {
  const random = mulberry32(77)
  return Array.from({ length: 34 }, (_, i) => {
    const far = random() < 0.5
    return {
      seed: 40 + i,
      position: [
        (random() - 0.5) * (far ? 36 : 28),
        far ? 2.8 + random() * 2.6 : 5.5 + random() * 5,
        far ? -24 - random() * 6 : -15 - random() * 9,
      ] as Vec3,
      scale: far ? 0.7 + random() * 1.0 : 1.1 + random() * 1.2,
    }
  })
})()

function Beam() {
  const { reducedMotion } = useScene()
  const group = useRef<THREE.Group>(null)
  const texture = useMemo(() => createBeamTexture(), [])
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        forceSinglePass: true,
        toneMapped: false,
      }),
    [texture],
  )
  useEffect(
    () => () => {
      texture.dispose()
      material.dispose()
    },
    [texture, material],
  )
  useFrame((state) => {
    if (reducedMotion || !group.current) return
    group.current.rotation.y = state.clock.elapsedTime * 0.35
  })
  return (
    <group ref={group} position={LANTERN} rotation={[0, 0.6, 0]}>
      {[0, Math.PI].map((turn) => (
        <mesh key={turn} rotation={[0, turn, 0]} position={[0, 0, 0]} material={material}>
          <planeGeometry args={[7, 0.5]} />
        </mesh>
      ))}
    </group>
  )
}

export function Bay() {
  const { quality, reducedMotion } = useScene()
  const boat = useRef<THREE.Group>(null)
  const textures = useMemo(
    () => ({ lighthouse: createLighthouseTexture(), boat: createPaperBoatTexture() }),
    [],
  )
  useEffect(() => () => Object.values(textures).forEach((t) => t.dispose()), [textures])
  const lighthouseMaterial = useDrawing(textures.lighthouse)
  const boatMaterial = useDrawing(textures.boat)
  const clouds = quality === 'low' ? CLOUDS.slice(0, 14) : CLOUDS

  useFrame((state) => {
    if (reducedMotion || !boat.current) return
    const t = state.clock.elapsedTime
    boat.current.position.x = BOAT[0] + Math.sin(t * 0.04) * 7
    boat.current.position.y = BOAT[1] + Math.sin(t * 0.8) * 0.07
    boat.current.rotation.z = Math.sin(t * 0.96) * 0.05
  })

  return (
    <>
      <mesh position={LIGHTHOUSE} material={lighthouseMaterial}>
        <planeGeometry args={[4.4, 6.6]} />
      </mesh>
      {quality !== 'low' && <Beam />}
      <group ref={boat} position={BOAT}>
        <mesh material={boatMaterial}>
          <planeGeometry args={[1.7, 1.06]} />
        </mesh>
      </group>
      {quality !== 'low' && <Birds centre={[5, 5.2, -21]} count={5} spread={5} seed={9} />}
      <Birds centre={[-7.5, 7.4, -25]} count={3} spread={3} seed={12} />
      {clouds.map((cloud) => (
        <Cloud key={cloud.seed} {...cloud} drift={0.05} />
      ))}
    </>
  )
}
