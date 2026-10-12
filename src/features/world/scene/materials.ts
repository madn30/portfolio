import * as THREE from 'three'
import { CORRIDOR, LOOP_SHIFT } from '@/shared/corridor/corridor'
import {
  getPaperTexture,
  getToonGradient,
  getWallTexture,
  getWoodGrainTexture,
} from '@/shared/graphics/textures/surfaces'

export interface SceneMaterials {
  wall: THREE.MeshToonMaterial
  wallUpper: THREE.MeshToonMaterial
  floor: THREE.MeshToonMaterial
  ceiling: THREE.MeshToonMaterial
  wood: THREE.MeshToonMaterial
  woodDark: THREE.MeshToonMaterial
  line: THREE.LineBasicMaterial
  lineSoft: THREE.LineBasicMaterial
  lineAccent: THREE.LineBasicMaterial
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

  const wallMap = getWallTexture(0.98 / CORRIDOR.height, 1.05 / CORRIDOR.height).clone()
  wallMap.repeat.set(12, 1)
  wallMap.needsUpdate = true
  const wall = new THREE.MeshToonMaterial({
    color: '#ffffff',
    gradientMap,
    map: wallMap,
  })
  const wallUpper = new THREE.MeshToonMaterial({
    color: '#f2e3c6',
    gradientMap,
    map: paperMap(2, 1),
  })
  const grain = getWoodGrainTexture().clone()
  const tile = LOOP_SHIFT / 13
  grain.repeat.set(3, (CORRIDOR.zStart - CORRIDOR.zBeyond) / tile)
  grain.needsUpdate = true
  const floor = new THREE.MeshToonMaterial({
    color: '#ffffff',
    gradientMap,
    map: grain,
  })
  const ceiling = new THREE.MeshToonMaterial({
    color: '#faf6ec',
    gradientMap,
    map: paperMap(3, 20),
  })
  const wood = new THREE.MeshToonMaterial({
    color: '#c8955c',
    gradientMap,
    map: paperMap(1, 2),
  })
  const woodDark = new THREE.MeshToonMaterial({
    color: '#a9713f',
    gradientMap,
  })
  const line = new THREE.LineBasicMaterial({
    color: '#262421',
    transparent: true,
    opacity: 0.9,
  })
  const lineSoft = new THREE.LineBasicMaterial({
    color: '#4a3a2c',
    transparent: true,
    opacity: 0.5,
  })
  const lineAccent = new THREE.LineBasicMaterial({
    color: '#4f7fc9',
    transparent: true,
    opacity: 0.9,
  })

  const all: THREE.Material[] = [
    wall,
    wallUpper,
    floor,
    ceiling,
    wood,
    woodDark,
    line,
    lineSoft,
    lineAccent,
  ]

  return {
    wall,
    wallUpper,
    floor,
    ceiling,
    wood,
    woodDark,
    line,
    lineSoft,
    lineAccent,
    dispose: () => {
      all.forEach((m) => {
        if ('map' in m && m.map instanceof THREE.Texture) m.map.dispose()
        m.dispose()
      })
    },
  }
}

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
