import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

export function useDrawing(texture: THREE.Texture, fog = false): THREE.MeshBasicMaterial {
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.02,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
        fog,
      }),
    [texture, fog],
  )
  useEffect(() => () => material.dispose(), [material])
  return material
}

export function useFlat(texture: THREE.Texture, fog = true): THREE.MeshBasicMaterial {
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, fog }),
    [texture, fog],
  )
  useEffect(() => () => material.dispose(), [material])
  return material
}
