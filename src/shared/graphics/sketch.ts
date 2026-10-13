import * as THREE from 'three'
import { mulberry32 } from '@/shared/utils/random'

export { mulberry32 }

export interface SketchOptions {
  jitter?: number
  subdivisions?: number
  passes?: number
  offset?: number
  seed?: number
  thresholdAngle?: number
}

export function createSketchEdges(
  geometry: THREE.BufferGeometry,
  options: SketchOptions = {},
): THREE.BufferGeometry {
  const {
    jitter = 0.012,
    subdivisions = 6,
    passes = 2,
    offset = 0.004,
    seed = 1,
    thresholdAngle = 20,
  } = options

  const edges = new THREE.EdgesGeometry(geometry, thresholdAngle)
  const source = edges.getAttribute('position') as THREE.BufferAttribute
  const random = mulberry32(seed)
  const positions: number[] = []

  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const dir = new THREE.Vector3()
  const normalish = new THREE.Vector3()

  for (let pass = 0; pass < passes; pass++) {
    const passOffset = (pass - (passes - 1) / 2) * jitter * 1.4
    for (let i = 0; i < source.count; i += 2) {
      a.fromBufferAttribute(source, i)
      b.fromBufferAttribute(source, i + 1)
      dir.subVectors(b, a)
      const length = dir.length()
      if (length === 0) continue
      dir.normalize()
      normalish.set(dir.y, -dir.x, dir.z * 0.3).normalize()
      if (normalish.lengthSq() < 0.5) normalish.set(0, 0, 1)

      const centreDir = a.clone().add(b).multiplyScalar(0.5).normalize()

      const overshoot = Math.min(0.05, length * 0.08)
      let prev: THREE.Vector3 | null = null
      for (let s = 0; s <= subdivisions; s++) {
        const t = s / subdivisions
        const along = -overshoot + (length + overshoot * 2) * t
        const point = a.clone().addScaledVector(dir, along)
        const wobble = Math.sin(t * Math.PI * (1.5 + random())) * jitter + (random() - 0.5) * jitter
        point.addScaledVector(normalish, wobble + passOffset)
        point.addScaledVector(centreDir, offset)
        point.x += (random() - 0.5) * jitter * 0.6
        point.y += (random() - 0.5) * jitter * 0.6
        if (prev) positions.push(prev.x, prev.y, prev.z, point.x, point.y, point.z)
        prev = point
      }
    }
  }

  edges.dispose()
  const result = new THREE.BufferGeometry()
  result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return result
}

export function createSketchPolyline(
  points: THREE.Vector3[],
  options: Pick<SketchOptions, 'jitter' | 'subdivisions' | 'seed' | 'passes'> = {},
): THREE.BufferGeometry {
  const { jitter = 0.01, subdivisions = 5, seed = 7, passes = 1 } = options
  const random = mulberry32(seed)
  const positions: number[] = []
  const dir = new THREE.Vector3()
  const perp = new THREE.Vector3()

  for (let pass = 0; pass < passes; pass++) {
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i]
      const b = points[i + 1]
      dir.subVectors(b, a)
      const length = dir.length()
      dir.normalize()
      perp.set(-dir.z, 0, dir.x)
      if (perp.lengthSq() < 0.1) perp.set(1, 0, 0)
      let prev: THREE.Vector3 | null = null
      for (let s = 0; s <= subdivisions; s++) {
        const t = s / subdivisions
        const p = a.clone().addScaledVector(dir, length * t)
        const w = Math.sin(t * Math.PI * (1 + random() * 2)) * jitter + (random() - 0.5) * jitter
        p.addScaledVector(perp, w + (pass - (passes - 1) / 2) * jitter)
        p.y += (random() - 0.5) * jitter * 0.5
        if (prev) positions.push(prev.x, prev.y, prev.z, p.x, p.y, p.z)
        prev = p
      }
    }
  }

  const result = new THREE.BufferGeometry()
  result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return result
}
