import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createWalkerShadowTexture } from '@/shared/graphics/spriteTextures'
import { worldStore } from '@/shared/store/worldStore'

const AHEAD = 4.3
const WIDTH = 1.1
const LENGTH = 2.4
const DARKNESS = 0.17

export function WalkerShadow() {
  const mesh = useRef<THREE.Mesh>(null)
  const texture = useMemo(() => createWalkerShadowTexture(), [])
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        color: '#2a211c',
        transparent: true,
        opacity: 0,
        depthWrite: false,
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

  useFrame(({ camera }, delta) => {
    if (!mesh.current) return
    const { activeDoor, enteringDoor } = worldStore.getState()
    const target = activeDoor || enteringDoor ? 0 : DARKNESS
    material.opacity += (target - material.opacity) * (1 - Math.exp(-Math.min(delta, 0.05) * 5))
    mesh.current.visible = material.opacity > 0.004
    mesh.current.position.set(camera.position.x, 0.012, camera.position.z - AHEAD)
  })

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} material={material} renderOrder={2}>
      <planeGeometry args={[WIDTH, LENGTH]} />
    </mesh>
  )
}
