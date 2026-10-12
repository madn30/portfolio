import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { CORRIDOR } from '@/shared/corridor/corridor'
import {
  createCoffeeBugTexture,
  createIdeaDoodleTexture,
} from '@/features/world/corridor/textures/doorDecor'

const W = CORRIDOR.loopDoor.width

export function LoopDoorDecor() {
  const textures = useMemo(
    () => ({ idea: createIdeaDoodleTexture(), coffee: createCoffeeBugTexture() }),
    [],
  )
  const materials = useMemo(() => {
    const decal = (map: THREE.Texture) =>
      new THREE.MeshBasicMaterial({
        map,
        transparent: true,
        alphaTest: 0.05,
        toneMapped: false,
        depthWrite: false,
      })
    return { idea: decal(textures.idea), coffee: decal(textures.coffee) }
  }, [textures])
  useEffect(
    () => () => {
      Object.values(textures).forEach((t) => t.dispose())
      Object.values(materials).forEach((m) => m.dispose())
    },
    [textures, materials],
  )

  return (
    <group>
      <mesh
        position={[-(W / 2 + 1.1), 0.35, 0.03]}
        rotation={[0, 0, 0.05]}
        material={materials.idea}
      >
        <planeGeometry args={[0.95, 1.42]} />
      </mesh>
      <mesh
        position={[W / 2 + 1.1, 1.25, 0.03]}
        rotation={[0, 0, -0.05]}
        material={materials.coffee}
      >
        <planeGeometry args={[1.3, 0.74]} />
      </mesh>
    </group>
  )
}
