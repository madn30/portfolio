import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { createGradientTexture } from '@/shared/graphics/spriteTextures'
import { Note } from '@/features/world/rooms/shared'
import { CodeParticles } from '@/features/world/studio/CodeParticles'
import { Tower } from '@/features/world/studio/Tower'

function StudioSky() {
  const texture = useMemo(
    () =>
      createGradientTexture([
        [0, '#2b2a5c'],
        [0.38, '#4a3f85'],
        [0.56, '#8a5a9c'],
        [0.68, '#d9788c'],
        [1, '#f2a66b'],
      ]),
    [],
  )
  const materials = useMemo(() => {
    const side = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, fog: false })
    const top = new THREE.MeshBasicMaterial({ color: '#2b2a5c', side: THREE.BackSide, fog: false })
    const floor = new THREE.MeshBasicMaterial({
      color: '#f2a66b',
      side: THREE.BackSide,
      fog: false,
    })
    return [side, side, top, floor, side, side]
  }, [texture])
  useEffect(
    () => () => {
      texture.dispose()
      materials.forEach((m) => m.dispose())
    },
    [texture, materials],
  )
  return (
    <mesh position={[0, 3, -11.05]} material={materials}>
      <boxGeometry args={[34, 30, 22]} />
    </mesh>
  )
}

export function SkillsRoom() {
  return (
    <>
      <StudioSky />
      <CodeParticles />
      <Tower />

      <Note
        lines={['the studio', 'drag to spin · scroll to climb', 'click a screen']}
        position={[0, 5.6, -12]}
        width={3.6}
        fontSize={60}
        color="#fff3d6"
      />
    </>
  )
}
