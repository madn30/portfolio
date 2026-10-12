import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useScene } from '@/features/world/scene/SceneContext'

export function useToonMaterials<K extends string>(
  colors: Record<K, string>,
): Record<K, THREE.MeshToonMaterial> {
  const { materials } = useScene()
  const key = JSON.stringify(colors)
  const result = useMemo(() => {
    const out = {} as Record<K, THREE.MeshToonMaterial>
    for (const name of Object.keys(colors) as K[]) {
      out[name] = new THREE.MeshToonMaterial({
        color: colors[name],
        gradientMap: materials.wall.gradientMap,
      })
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, materials])
  useEffect(
    () => () => Object.values<THREE.MeshToonMaterial>(result).forEach((m) => m.dispose()),
    [result],
  )
  return result
}

export function usePaperPlaneGeometry(): THREE.BufferGeometry {
  const geometry = useMemo(() => {
    const nose: [number, number, number] = [0, 0, -1]
    const tailL: [number, number, number] = [-0.72, 0.08, 0.62]
    const tailR: [number, number, number] = [0.72, 0.08, 0.62]
    const spine: [number, number, number] = [0, 0, 0.55]
    const keel: [number, number, number] = [0, -0.26, 0.5]
    const tris = [
      [nose, tailL, spine],
      [nose, spine, tailR],
      [nose, keel, spine],
    ]
    const positions = new Float32Array(tris.flat(2))
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.computeVertexNormals()
    return g
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  return geometry
}
