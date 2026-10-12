import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

export interface SignpostGeometries {
  barrel: THREE.LatheGeometry
  lid: THREE.CircleGeometry
  post: THREE.BoxGeometry
  board: THREE.BoxGeometry
}

export function useSignpostGeometries(): SignpostGeometries {
  const geometries = useMemo(() => {
    const profile = [
      new THREE.Vector2(0.3, 0),
      new THREE.Vector2(0.37, 0.16),
      new THREE.Vector2(0.4, 0.35),
      new THREE.Vector2(0.37, 0.54),
      new THREE.Vector2(0.3, 0.7),
    ]
    return {
      barrel: new THREE.LatheGeometry(profile, 18),
      lid: new THREE.CircleGeometry(0.3, 18),
      post: new THREE.BoxGeometry(0.13, 1.5, 0.13),
      board: new THREE.BoxGeometry(1.45, 0.5, 0.07),
    }
  }, [])
  useEffect(() => () => Object.values(geometries).forEach((g) => g.dispose()), [geometries])
  return geometries
}
