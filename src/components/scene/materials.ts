import * as THREE from 'three'
import { getPaperTexture, getToonGradient } from '@/utils/textures'

/**
 * Shared materials for the whole corridor. Created once, reused by every mesh, and disposed
 * when the scene unmounts. Toon shading + pencil outlines is what sells the illustrated look.
 */
export interface SceneMaterials {
  wall: THREE.MeshToonMaterial
  floor: THREE.MeshToonMaterial
  ceiling: THREE.MeshToonMaterial
  wood: THREE.MeshToonMaterial
  woodDark: THREE.MeshToonMaterial
  alcove: THREE.MeshToonMaterial
  line: THREE.LineBasicMaterial
  lineSoft: THREE.LineBasicMaterial
  lineAccent: THREE.LineBasicMaterial
  shadow: THREE.MeshBasicMaterial
  plaque: THREE.MeshBasicMaterial
  dispose: () => void
}

let shared: SceneMaterials | null = null
let refCount = 0

function paperMap(repeatX: number, repeatY: number): THREE.Texture {
  const texture = getPaperTexture().clone()
  texture.repeat.set(repeatX, repeatY)
  texture.needsUpdate = true
  return texture
}

function create(): SceneMaterials {
  const gradientMap = getToonGradient()

  const wall = new THREE.MeshToonMaterial({
    color: '#f3ede1',
    gradientMap,
    map: paperMap(12, 2),
  })
  const floor = new THREE.MeshToonMaterial({
    color: '#dfd2bb',
    gradientMap,
    map: paperMap(3, 20),
  })
  const ceiling = new THREE.MeshToonMaterial({
    color: '#f7f2e8',
    gradientMap,
    map: paperMap(3, 20),
  })
  const wood = new THREE.MeshToonMaterial({
    color: '#d9c4a4',
    gradientMap,
    map: paperMap(1, 2),
  })
  const woodDark = new THREE.MeshToonMaterial({
    color: '#c3a985',
    gradientMap,
  })
  const alcove = new THREE.MeshToonMaterial({
    color: '#e9dcc5',
    gradientMap,
    map: paperMap(2, 2),
  })
  const line = new THREE.LineBasicMaterial({
    color: '#3a332e',
    transparent: true,
    opacity: 0.85,
  })
  const lineSoft = new THREE.LineBasicMaterial({
    color: '#5c534c',
    transparent: true,
    opacity: 0.4,
  })
  const lineAccent = new THREE.LineBasicMaterial({
    color: '#c0693b',
    transparent: true,
    opacity: 0.9,
  })
  const shadow = new THREE.MeshBasicMaterial({
    color: '#3a2e22',
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
  })
  const plaque = new THREE.MeshBasicMaterial({ color: '#faf6ee' })

  const all: THREE.Material[] = [
    wall,
    floor,
    ceiling,
    wood,
    woodDark,
    alcove,
    line,
    lineSoft,
    lineAccent,
    shadow,
    plaque,
  ]

  return {
    wall,
    floor,
    ceiling,
    wood,
    woodDark,
    alcove,
    line,
    lineSoft,
    lineAccent,
    shadow,
    plaque,
    dispose: () => {
      all.forEach((m) => {
        if ('map' in m && m.map instanceof THREE.Texture) m.map.dispose()
        m.dispose()
      })
    },
  }
}

/** Acquire the shared material set. Call `releaseMaterials` when the scene unmounts. */
export function acquireMaterials(): SceneMaterials {
  if (!shared) shared = create()
  refCount += 1
  return shared
}

export function releaseMaterials(): void {
  refCount = Math.max(0, refCount - 1)
  if (refCount === 0 && shared) {
    shared.dispose()
    shared = null
  }
}
