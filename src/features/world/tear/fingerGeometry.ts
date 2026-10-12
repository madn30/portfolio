import * as THREE from 'three'

export interface FingerSpec {
  x: number
  y: number
  z: number
  radius: number
  lengths: [number, number, number]
  spread: number
  spreadHooked: number
  rest: [number, number, number]
  hook: [number, number, number]
}

export interface Finger {
  spec: FingerSpec
  skin: THREE.BufferGeometry
  nail: THREE.BufferGeometry
  update: (curl: number) => void
  dispose: () => void
}

const RINGS = 66
const CAP_RINGS = 14
const SIDES = 22
const TABLE = 180
const NAIL_ROWS = 12
const NAIL_COLS = 10
const NAIL_ARC = 0.8

function gauss(x: number): number {
  return Math.exp(-x * x)
}

function smooth(x: number): number {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}

function power(value: number, exponent: number): number {
  return Math.sign(value) * Math.pow(Math.abs(value), exponent)
}

function gridIndex(rows: number, cols: number): number[] {
  const index: number[] = []
  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < cols - 1; j++) {
      const a = i * cols + j
      const b = a + 1
      const c = a + cols
      const d = c + 1
      index.push(a, b, c, b, d, c)
    }
  }
  return index
}

export function createFinger(spec: FingerSpec): Finger {
  const [l1, l2, l3] = spec.lengths
  const r0 = spec.radius
  const total = l1 + l2 + l3
  const s1 = l1
  const s2 = l1 + l2
  const cap = 1.15 * r0
  const bendWidth = 2.4 * r0
  const rows = RINGS + CAP_RINGS
  const cols = SIDES + 1
  const stations: number[] = []
  for (let i = 0; i < RINGS; i++) stations.push(((total - cap) * i) / (RINGS - 1))
  for (let k = 1; k <= CAP_RINGS; k++) {
    stations.push(total - cap + cap * Math.sin((k / CAP_RINGS) * (Math.PI / 2)))
  }

  const capScale = (s: number) => {
    const u = (s - (total - cap)) / cap
    return u <= 0 ? 1 : Math.sqrt(Math.max(0, 1 - u * u))
  }
  const radiusAt = (s: number) =>
    r0 *
    (1 - 0.2 * (s / total)) *
    (1 + 0.08 * gauss((s - s1) / r0) + 0.06 * gauss((s - s2) / (0.85 * r0))) *
    capScale(s)
  const padAt = (s: number) => 1 + 0.14 * gauss((s - (s2 + 0.55 * l3)) / (0.4 * l3))

  const theta = new Float32Array(TABLE + 1)
  const tx = new Float32Array(TABLE + 1)
  const tz = new Float32Array(TABLE + 1)
  const frame = { x: 0, z: 0, sin: 0, cos: 1 }
  const sample = (s: number) => {
    const f = Math.min(TABLE - 1e-4, Math.max(0, (s / total) * TABLE))
    const k = Math.floor(f)
    const w = f - k
    const angle = theta[k] + (theta[k + 1] - theta[k]) * w
    frame.x = tx[k] + (tx[k + 1] - tx[k]) * w
    frame.z = tz[k] + (tz[k + 1] - tz[k]) * w
    frame.sin = Math.sin(angle)
    frame.cos = Math.cos(angle)
  }

  const skinPositions = new Float32Array(rows * cols * 3)
  const skinColors = new Float32Array(rows * cols * 3)
  const skinUvs = new Float32Array(rows * cols * 2)
  for (let i = 0; i < rows; i++) {
    const s = stations[i]
    const tip = smooth((s - (s2 + 0.2 * l3)) / (total - s2 - 0.2 * l3))
    const knuckle = gauss((s - s1) / (0.9 * r0)) + gauss((s - s2) / (0.8 * r0))
    let crease = 0
    for (const joint of [s1, s2]) {
      for (let m = -1; m <= 1; m++) crease += gauss((s - joint - m * 0.013) / 0.004)
    }
    for (let j = 0; j < cols; j++) {
      const phi = (j / SIDES) * Math.PI * 2 + Math.PI
      const dorsal = Math.max(0, Math.cos(phi))
      const o = (i * cols + j) * 3
      const shade = 1 - 0.1 * crease * dorsal
      skinColors[o] = shade * (1 - 0.05 * knuckle * dorsal)
      skinColors[o + 1] = shade * (1 - 0.12 * knuckle * dorsal) * (1 - 0.1 * tip)
      skinColors[o + 2] = shade * (1 - 0.13 * knuckle * dorsal) * (1 - 0.12 * tip)
      skinUvs[(i * cols + j) * 2] = (j / SIDES) * 2
      skinUvs[(i * cols + j) * 2 + 1] = s * 9
    }
  }
  const skin = new THREE.BufferGeometry()
  skin.setAttribute('position', new THREE.BufferAttribute(skinPositions, 3))
  skin.setAttribute('color', new THREE.BufferAttribute(skinColors, 3))
  skin.setAttribute('uv', new THREE.BufferAttribute(skinUvs, 2))
  skin.setIndex(gridIndex(rows, cols))

  const nailRows = NAIL_ROWS + 1
  const nailCols = NAIL_COLS + 1
  const nailStart = s2 + 0.36 * l3
  const nailEnd = total - 0.12 * r0
  const nailPositions = new Float32Array(nailRows * nailCols * 3)
  const nailColors = new Float32Array(nailRows * nailCols * 3)
  const nailArc = (e: number) => {
    const edge = e > 0.62 ? Math.sqrt(1 - 0.75 * ((e - 0.62) / 0.38) ** 2) : 1
    return NAIL_ARC * edge * (0.86 + 0.14 * Math.min(1, e / 0.15))
  }
  for (let i = 0; i < nailRows; i++) {
    const e = i / NAIL_ROWS
    for (let j = 0; j < nailCols; j++) {
      const across = (2 * j) / NAIL_COLS - 1
      const o = (i * nailCols + j) * 3
      const lunula = e < 0.18 && Math.abs(across) < 0.6 * Math.sqrt(1 - (e / 0.18) ** 2)
      const free = e > 0.9
      nailColors[o] = lunula ? 0.87 : free ? 0.9 : 0.84
      nailColors[o + 1] = lunula ? 0.67 : free ? 0.84 : 0.58
      nailColors[o + 2] = lunula ? 0.63 : free ? 0.78 : 0.54
    }
  }
  const nail = new THREE.BufferGeometry()
  nail.setAttribute('position', new THREE.BufferAttribute(nailPositions, 3))
  nail.setAttribute('color', new THREE.BufferAttribute(nailColors, 3))
  nail.setIndex(gridIndex(nailRows, nailCols))

  const place = (out: Float32Array, o: number, phi: number, lateral: number, depth: number) => {
    const across = power(Math.sin(phi), 0.92)
    const up = power(Math.cos(phi), 0.92)
    out[o] = frame.x + frame.sin * depth * up
    out[o + 1] = lateral * across
    out[o + 2] = frame.z - frame.cos * depth * up
  }

  let last = Number.NaN
  const update = (curl: number) => {
    if (Math.abs(curl - last) < 1e-4) return
    last = curl
    const a0 = spec.rest[0] + (spec.hook[0] - spec.rest[0]) * curl
    const a1 = spec.rest[1] + (spec.hook[1] - spec.rest[1]) * curl
    const a2 = spec.rest[2] + (spec.hook[2] - spec.rest[2]) * curl
    const step = total / TABLE
    for (let k = 0; k <= TABLE; k++) {
      const s = k * step
      theta[k] =
        a0 + a1 * smooth((s - s1) / bendWidth + 0.5) + a2 * smooth((s - s2) / bendWidth + 0.5)
      if (k === 0) {
        tx[0] = 0
        tz[0] = 0
        continue
      }
      const mid = (theta[k] + theta[k - 1]) / 2
      tx[k] = tx[k - 1] + Math.cos(mid) * step
      tz[k] = tz[k - 1] + Math.sin(mid) * step
    }
    for (let i = 0; i < rows; i++) {
      const s = stations[i]
      sample(s)
      const r = radiusAt(s)
      const pad = padAt(s)
      for (let j = 0; j < cols; j++) {
        const phi = (j / SIDES) * Math.PI * 2 + Math.PI
        const depth = Math.cos(phi) > 0 ? r * 0.9 : r * pad
        place(skinPositions, (i * cols + j) * 3, phi, r * 1.07, depth)
      }
    }
    for (let i = 0; i < nailRows; i++) {
      const e = i / NAIL_ROWS
      const s = nailStart + (nailEnd - nailStart) * e
      sample(s)
      const r = radiusAt(Math.min(s, total - cap * 0.8))
      const lift = 0.0007 + 0.0016 * e * e
      const arc = nailArc(e)
      for (let j = 0; j < nailCols; j++) {
        const phi = arc * ((2 * j) / NAIL_COLS - 1)
        place(nailPositions, (i * nailCols + j) * 3, phi, r * 1.07 + lift, r * 0.9 + lift)
      }
    }
    skin.attributes.position.needsUpdate = true
    nail.attributes.position.needsUpdate = true
    skin.computeVertexNormals()
    nail.computeVertexNormals()
    skin.computeBoundingSphere()
    nail.computeBoundingSphere()
  }

  update(0)

  return {
    spec,
    skin,
    nail,
    update,
    dispose: () => {
      skin.dispose()
      nail.dispose()
    },
  }
}
