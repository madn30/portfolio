import * as THREE from 'three'
import { mulberry32 } from '@/shared/graphics/sketch'

interface TornPaper {
  geometry: THREE.PlaneGeometry
  base: Float32Array
}

export function createTornPaper(
  width: number,
  height: number,
  segmentsX: number,
  segmentsY: number,
  tear = 0.04,
  seed = 12345,
): TornPaper {
  const geometry = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY)
  const positions = geometry.attributes.position
  const random = mulberry32(seed)
  const halfWidth = width / 2
  const halfHeight = height / 2
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i)
    const y = positions.getY(i)
    const onLeft = Math.abs(x + halfWidth) < 0.01
    const onEdge =
      onLeft ||
      Math.abs(x - halfWidth) < 0.01 ||
      Math.abs(y - halfHeight) < 0.01 ||
      Math.abs(y + halfHeight) < 0.01
    let z = 0
    if (onEdge) {
      const scale = onLeft ? 2.5 : 1
      positions.setX(i, x + (random() - 0.5) * tear * scale)
      positions.setY(i, y + (random() - 0.5) * tear * scale)
      z = random() * 0.01
    }
    positions.setZ(i, z + Math.sin(x * 3) * Math.cos(y * 2) * 0.015)
  }
  geometry.computeVertexNormals()
  return { geometry, base: Float32Array.from(positions.array) }
}

export function foldPaper({ geometry, base }: TornPaper, progress: number): void {
  const positions = geometry.attributes.position
  const angle = progress * Math.PI * 0.97
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  for (let i = 0; i < positions.count; i++) {
    const x = base[i * 3]
    const z = base[i * 3 + 2]
    if (x < 0) {
      positions.setX(i, x * cos)
      positions.setZ(i, z + -x * sin + progress * 0.012)
    }
  }
  positions.needsUpdate = true
}
