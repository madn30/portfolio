import { mulberry32 } from '@/shared/graphics/sketch'

export interface Point {
  x: number
  y: number
}

export interface Cluster {
  pivot: Point
  outline: string
  hatch: string
  leaves: string
  layer: 0 | 1 | 2
  phase: number
  speed: number
  amp: number
}

interface Sample {
  x: number
  y: number
  tx: number
  ty: number
  w: number
}

interface ClusterSpec {
  cx: number
  cy: number
  rx: number
  ry: number
  pivot: Point
  layer: 0 | 1 | 2
}

const fmt = (n: number) => n.toFixed(1)
const pt = (x: number, y: number) => `${fmt(x)} ${fmt(y)}`

function catmull(p0: number, p1: number, p2: number, p3: number, t: number): number {
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t)
  )
}

function catmullTangent(p0: number, p1: number, p2: number, p3: number, t: number): number {
  return (
    0.5 *
    (-p0 + p2 + 2 * (2 * p0 - 5 * p1 + 4 * p2 - p3) * t + 3 * (-p0 + 3 * p1 - 3 * p2 + p3) * t * t)
  )
}

function sampleLimb(nodes: number[], perSegment: number): Sample[] {
  const count = nodes.length / 3
  const out: Sample[] = []
  const at = (i: number, k: number) => nodes[Math.min(Math.max(i, 0), count - 1) * 3 + k]
  for (let i = 0; i < count - 1; i++) {
    const steps = i === count - 2 ? perSegment + 1 : perSegment
    for (let s = 0; s < steps; s++) {
      const t = s / perSegment
      const tx = catmullTangent(at(i - 1, 0), at(i, 0), at(i + 1, 0), at(i + 2, 0), t)
      const ty = catmullTangent(at(i - 1, 1), at(i, 1), at(i + 1, 1), at(i + 2, 1), t)
      const len = Math.hypot(tx, ty) || 1
      out.push({
        x: catmull(at(i - 1, 0), at(i, 0), at(i + 1, 0), at(i + 2, 0), t),
        y: catmull(at(i - 1, 1), at(i, 1), at(i + 1, 1), at(i + 2, 1), t),
        tx: tx / len,
        ty: ty / len,
        w: at(i, 2) + (at(i + 1, 2) - at(i, 2)) * t,
      })
    }
  }
  return out
}

function limbPath(samples: Sample[], random: () => number, jitter: number, closed: boolean) {
  const left: string[] = []
  const right: string[] = []
  const j = () => (random() - 0.5) * jitter
  for (const s of samples) {
    const nx = -s.ty
    const ny = s.tx
    left.push(pt(s.x + nx * s.w + j(), s.y + ny * s.w + j()))
    right.push(pt(s.x - nx * s.w + j(), s.y - ny * s.w + j()))
  }
  return `M${left.join(' L')} L${right.reverse().join(' L')}${closed ? ' Z' : ''}`
}

function limb(nodes: number[], seed: number): string {
  return limbPath(sampleLimb(nodes, 5), mulberry32(seed), 1.1, false)
}

export function leafPath(x: number, y: number, angle: number, len: number): string {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const p = (u: number, v: number) => pt(x + u * c - v * s, y + u * s + v * c)
  const w = len * 0.36
  const rib = `M${p(len * 0.12, 0)} L${p(len * 0.86, 0)}`
  return `M${p(0, 0)} Q${p(len * 0.5, -w)} ${p(len, 0)} Q${p(len * 0.5, w)} ${p(0, 0)} Z ${rib}`
}

function knotPath(x: number, y: number, r: number): string {
  const almond = (k: number) => {
    const top = `${pt(x - k * 0.4, y - k * 0.9)} ${pt(x + k * 0.4, y - k * 0.9)} ${pt(x + k, y)}`
    const bottom = `${pt(x + k * 0.4, y + k * 0.9)} ${pt(x - k * 0.4, y + k * 0.9)} ${pt(x - k, y)}`
    return `M${pt(x - k, y)} C${top} C${bottom} Z`
  }
  return `${almond(r)} ${almond(r * 0.5)}`
}

const TRUNK_NODES = [
  320, 763, 44, 318, 742, 30, 314, 700, 24, 310, 630, 22, 318, 560, 19, 322, 500, 16, 318, 450, 13,
  318, 428, 12,
]

const trunkSamples = sampleLimb(TRUNK_NODES, 5)

export const TRUNK = limbPath(trunkSamples, mulberry32(41), 1.4, true)

export const ROOTS = [
  limb([300, 745, 9, 282, 756, 6, 258, 764, 2], 42),
  limb([340, 745, 9, 360, 756, 6, 384, 764, 2], 43),
].join(' ')

export const KNOTS = `${knotPath(309, 598, 7)} ${knotPath(327, 512, 5)}`

export const BARK_STROKES = (() => {
  const random = mulberry32(44)
  const usable = trunkSamples.filter((s) => s.y > 462 && s.y < 742)
  const strokes: string[] = []
  for (let k = 0; k < 46; k++) {
    const s = usable[Math.floor(random() * usable.length)]
    const u = (random() * 2 - 1) * 0.72
    const x0 = s.x - s.ty * s.w * u
    const y0 = s.y + s.tx * s.w * u
    if (Math.hypot(x0 - 309, y0 - 598) < 12 || Math.hypot(x0 - 327, y0 - 512) < 9) continue
    const len = 8 + random() * 16
    const bend = (random() - 0.5) * 3
    const mid = pt(x0 + s.tx * len * 0.5 - s.ty * bend, y0 + s.ty * len * 0.5 + s.tx * bend)
    strokes.push(`M${pt(x0, y0)} Q${mid} ${pt(x0 + s.tx * len, y0 + s.ty * len)}`)
  }
  return strokes.join(' ')
})()

const LIMB_NODES = [
  [318, 452, 12, 296, 414, 9, 262, 372, 7, 232, 330, 5, 212, 296, 3],
  [324, 456, 11, 360, 428, 8, 412, 408, 6, 456, 386, 4, 486, 364, 2.5],
  [318, 440, 11, 324, 380, 9, 314, 320, 7, 316, 270, 5, 320, 220, 3],
  [318, 340, 5, 296, 300, 4, 276, 262, 3, 262, 236, 2],
  [320, 356, 6, 350, 316, 5, 378, 282, 3.5, 398, 252, 2],
  [364, 426, 5, 386, 392, 4, 412, 358, 3, 432, 334, 2],
]

export const LIMBS: string[] = LIMB_NODES.map((nodes, i) => limb(nodes, 51 + i))

const TWIG_NODES = [
  [214, 298, 2, 196, 282, 1.3, 178, 276, 0.6],
  [262, 372, 2, 240, 364, 1.2, 222, 366, 0.6],
  [320, 222, 2, 312, 196, 1.2, 318, 172, 0.6],
  [320, 222, 2, 338, 204, 1.2, 352, 198, 0.6],
  [262, 236, 2, 246, 218, 1.2, 240, 200, 0.6],
  [398, 252, 2, 416, 236, 1.2, 436, 232, 0.6],
  [432, 334, 2, 448, 318, 1.2, 470, 314, 0.6],
  [486, 364, 2, 504, 354, 1.2, 516, 338, 0.6],
  [456, 386, 2, 468, 404, 1.2, 486, 410, 0.6],
  [296, 412, 2, 280, 420, 1.2, 262, 418, 0.6],
]

export const TWIGS = TWIG_NODES.map((nodes, i) => limb(nodes, 60 + i)).join(' ')

function scallopPath(spec: ClusterSpec, random: () => number): string {
  const { cx, cy, rx, ry } = spec
  const n = Math.max(10, Math.round(((rx + ry) * Math.PI) / 15))
  const points: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const a = ((i + (random() - 0.5) * 0.35) / n) * Math.PI * 2
    const wobble = 0.9 + random() * 0.16
    points.push([cx + Math.cos(a) * rx * wobble, cy + Math.sin(a) * ry * wobble])
  }
  let d = `M${pt(points[0][0], points[0][1])}`
  for (let i = 0; i < n; i++) {
    const [x0, y0] = points[i]
    const [x1, y1] = points[(i + 1) % n]
    const mx = (x0 + x1) / 2
    const my = (y0 + y1) / 2
    const nx = (mx - cx) / rx
    const ny = (my - cy) / ry
    const len = Math.hypot(nx, ny) || 1
    const bulge = Math.hypot(x1 - x0, y1 - y0) * (0.42 + random() * 0.22)
    d += ` Q${pt(mx + (nx / len) * bulge, my + (ny / len) * bulge)} ${pt(x1, y1)}`
  }
  return `${d} Z`
}

function hatchPath(spec: ClusterSpec, random: () => number): string {
  const { cx, cy, rx, ry } = spec
  const step = 8.5 / ((rx + ry) / 2)
  const k = Math.SQRT1_2
  const lines: string[] = []
  for (let s = 0.22; s < 0.84; s += step) {
    const half = Math.sqrt(Math.max(0.88 * 0.88 - s * s, 0)) * (0.7 + random() * 0.3)
    const shift = (random() - 0.5) * 0.12
    const ax = s * k - (half + shift) * k
    const ay = s * k + (half + shift) * k
    const bx = s * k + (half - shift) * k
    const by = s * k - (half - shift) * k
    lines.push(`M${pt(cx + ax * rx, cy + ay * ry)} L${pt(cx + bx * rx, cy + by * ry)}`)
  }
  return lines.join(' ')
}

function edgeLeaves(spec: ClusterSpec, random: () => number, count: number): string {
  const { cx, cy, rx, ry } = spec
  const leaves: string[] = []
  for (let i = 0; i < count; i++) {
    const a = Math.PI * (0.05 + random() * 0.9) + (random() < 0.3 ? Math.PI : 0)
    const x = cx + Math.cos(a) * rx * 1.03
    const y = cy + Math.sin(a) * ry * 1.03
    const angle = Math.atan2(Math.sin(a) * rx, Math.cos(a) * ry) + (random() - 0.5) * 0.6
    leaves.push(leafPath(x, y, angle, 10 + random() * 5))
  }
  return leaves.join(' ')
}

const CLUSTER_SPECS: ClusterSpec[] = [
  { cx: 252, cy: 162, rx: 92, ry: 68, pivot: { x: 262, y: 236 }, layer: 0 },
  { cx: 398, cy: 182, rx: 92, ry: 68, pivot: { x: 398, y: 252 }, layer: 0 },
  { cx: 322, cy: 122, rx: 88, ry: 50, pivot: { x: 320, y: 220 }, layer: 0 },
  { cx: 226, cy: 300, rx: 58, ry: 50, pivot: { x: 212, y: 296 }, layer: 0 },
  { cx: 464, cy: 300, rx: 54, ry: 48, pivot: { x: 456, y: 386 }, layer: 0 },
  { cx: 242, cy: 236, rx: 72, ry: 60, pivot: { x: 262, y: 236 }, layer: 1 },
  { cx: 386, cy: 246, rx: 82, ry: 58, pivot: { x: 398, y: 252 }, layer: 1 },
  { cx: 312, cy: 178, rx: 78, ry: 56, pivot: { x: 320, y: 220 }, layer: 1 },
  { cx: 448, cy: 336, rx: 60, ry: 44, pivot: { x: 432, y: 334 }, layer: 1 },
  { cx: 218, cy: 346, rx: 52, ry: 42, pivot: { x: 212, y: 296 }, layer: 1 },
  { cx: 286, cy: 300, rx: 68, ry: 50, pivot: { x: 262, y: 372 }, layer: 2 },
  { cx: 352, cy: 322, rx: 60, ry: 44, pivot: { x: 350, y: 316 }, layer: 2 },
  { cx: 332, cy: 240, rx: 54, ry: 40, pivot: { x: 320, y: 220 }, layer: 2 },
  { cx: 428, cy: 262, rx: 50, ry: 38, pivot: { x: 398, y: 252 }, layer: 2 },
]

export const CLUSTERS: Cluster[] = CLUSTER_SPECS.map((spec, i) => {
  const random = mulberry32(100 + i * 7)
  return {
    pivot: spec.pivot,
    outline: scallopPath(spec, random),
    hatch: spec.layer === 0 ? '' : hatchPath(spec, random),
    leaves: spec.layer === 0 ? '' : edgeLeaves(spec, random, spec.layer === 2 ? 4 : 2),
    layer: spec.layer,
    phase: random() * Math.PI * 2,
    speed: 0.55 + random() * 0.4,
    amp: 0.5 + random() * 0.45,
  }
})

export const PIT = { cx: 320, cy: 760, rx: 96, ry: 9, innerRx: 80, innerRy: 6 }

export const GRATE = (() => {
  const lines: string[] = []
  for (let i = 0; i < 11; i++) {
    const a = Math.PI * (0.06 + (0.88 * i) / 10)
    const c = Math.cos(a)
    const s = Math.sin(a)
    const inner = pt(PIT.cx + c * PIT.innerRx * 0.3, PIT.cy + s * PIT.innerRy * 0.3)
    const outer = pt(PIT.cx + c * PIT.innerRx * 0.94, PIT.cy + s * PIT.innerRy * 0.94)
    lines.push(`M${inner} L${outer}`)
  }
  return lines.join(' ')
})()

export const LEAF_STARTS: Point[] = [
  { x: 446, y: 352 },
  { x: 236, y: 382 },
  { x: 496, y: 300 },
  { x: 300, y: 348 },
]
