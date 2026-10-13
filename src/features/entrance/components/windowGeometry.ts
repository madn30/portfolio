import { accentHex } from '@/data/siteConfig'
import { mulberry32 } from '@/shared/utils/random'
import { BLUE, LEAF_DARK, WOOD_LIGHT } from '@/features/entrance/shared'

export const SURROUND = { x: 1058, y: 386, width: 234, height: 198 }
export const FRAME_BOX = { x: 1072, y: 398, width: 206, height: 182 }
export const PANE = { x: 1080, y: 404, width: 190, height: 172 }
export const SILL = { x: 1046, y: 580, width: 258, height: 16 }
export const SASH_DROP = 6
export const MEETING_RAIL = 490
export const SASH_MEMBER = 7
export const PLANTER = { x: 1044, y: 644, width: 252, height: 46 }
export const SOIL_Y = 634
export const BOOKS = [
  { x: 1176, y: 442, width: 8, height: 26, color: BLUE },
  { x: 1185, y: 446, width: 7, height: 22, color: accentHex.terracotta },
  { x: 1193, y: 440, width: 9, height: 28, color: LEAF_DARK },
  { x: 1203, y: 444, width: 6, height: 24, color: WOOD_LIGHT },
]

type Point = [number, number]

const f = (n: number): string => n.toFixed(1)
const pt = ([x, y]: Point): string => `${f(x)} ${f(y)}`

export function hatch(
  x: number,
  y: number,
  width: number,
  height: number,
  spacing: number,
): string {
  const parts: string[] = []
  for (let k = -height; k < width; k += spacing) {
    const t0 = Math.max(0, -k)
    const t1 = Math.min(height, width - k)
    if (t1 <= t0) continue
    parts.push(`M${f(x + k + t0)} ${f(y + height - t0)}L${f(x + k + t1)} ${f(y + height - t1)}`)
  }
  return parts.join('')
}

export function lines(
  x0: number,
  x1: number,
  step: number,
  y0: number,
  y1: number,
  seed: number,
): string {
  const random = mulberry32(seed)
  const parts: string[] = []
  for (let x = x0; x <= x1; x += step) {
    const wobble = (random() - 0.5) * 3
    parts.push(`M${f(x + wobble)} ${f(y0)}V${f(y1)}`)
  }
  return parts.join('')
}

function quadPoint(p0: Point, c: Point, p1: Point, t: number): Point {
  const u = 1 - t
  return [
    u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0],
    u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1],
  ]
}

function quadTangent(p0: Point, c: Point, p1: Point, t: number): Point {
  const dx = 2 * (1 - t) * (c[0] - p0[0]) + 2 * t * (p1[0] - c[0])
  const dy = 2 * (1 - t) * (c[1] - p0[1]) + 2 * t * (p1[1] - c[1])
  const len = Math.hypot(dx, dy) || 1
  return [dx / len, dy / len]
}

function cubicPoint(p0: Point, c0: Point, c1: Point, p1: Point, t: number): Point {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const c = 3 * u * t * t
  const d = t * t * t
  return [
    a * p0[0] + b * c0[0] + c * c1[0] + d * p1[0],
    a * p0[1] + b * c0[1] + c * c1[1] + d * p1[1],
  ]
}

function cubicTangent(p0: Point, c0: Point, c1: Point, p1: Point, t: number): Point {
  const u = 1 - t
  const dx = 3 * u * u * (c0[0] - p0[0]) + 6 * u * t * (c1[0] - c0[0]) + 3 * t * t * (p1[0] - c1[0])
  const dy = 3 * u * u * (c0[1] - p0[1]) + 6 * u * t * (c1[1] - c0[1]) + 3 * t * t * (p1[1] - c1[1])
  const len = Math.hypot(dx, dy) || 1
  return [dx / len, dy / len]
}

function leafPath(p: Point, tangent: Point, side: number, size: number): string {
  const nx = -tangent[1] * side + tangent[0] * 0.35
  const ny = tangent[0] * side + tangent[1] * 0.35
  const len = Math.hypot(nx, ny) || 1
  const d: Point = [nx / len, ny / len]
  const n: Point = [-d[1], d[0]]
  const at = (along: number, across: number): Point => [
    p[0] + d[0] * size * along + n[0] * size * across,
    p[1] + d[1] * size * along + n[1] * size * across,
  ]
  return `M${pt(p)}C${pt(at(-0.1, 0.9))} ${pt(at(0.9, 0.9))} ${pt(at(1.5, 0))}C${pt(at(0.9, -0.9))} ${pt(at(-0.1, -0.9))} ${pt(p)}Z`
}

export interface Frond {
  spine: string
  pinnae: string
}

interface FrondOptions {
  count: number
  length: number
  spread: number
  pinna: number
  seed: number
}

export function buildFronds(baseX: number, baseY: number, options: FrondOptions): Frond[] {
  const { count, length, spread, pinna, seed } = options
  const random = mulberry32(seed)
  const fronds: Frond[] = []
  for (let i = 0; i < count; i++) {
    const u = count > 1 ? i / (count - 1) - 0.5 : 0
    const angle = -Math.PI / 2 + u * spread + (random() - 0.5) * 0.15
    const len = length * (0.75 + random() * 0.45)
    const p0: Point = [baseX, baseY]
    const p1: Point = [baseX + Math.cos(angle) * len, baseY + Math.sin(angle) * len]
    const c: Point = [(p0[0] + p1[0]) / 2 + u * len * 0.5, (p0[1] + p1[1]) / 2 - len * 0.15]
    let pinnae = ''
    const steps = Math.max(3, Math.round(len / 7))
    for (let s = 1; s <= steps && pinna > 0; s++) {
      const t = 0.18 + (s / steps) * 0.78
      const p = quadPoint(p0, c, p1, t)
      const [tx, ty] = quadTangent(p0, c, p1, t)
      const size = pinna * (1.1 - t) * (0.8 + random() * 0.4)
      const dx = tx * size * 0.45
      const dy = ty * size * 0.45
      pinnae += `M${pt(p)}l${f(-ty * size + dx)} ${f(tx * size + dy)}`
      pinnae += `M${pt(p)}l${f(ty * size + dx)} ${f(-tx * size + dy)}`
    }
    fronds.push({ spine: `M${pt(p0)}Q${pt(c)} ${pt(p1)}`, pinnae })
  }
  return fronds
}

export interface Vine {
  stem: string
  leaves: string
}

export function buildIvy(x: number, y: number, count: number, seed: number): Vine[] {
  const random = mulberry32(seed)
  const vines: Vine[] = []
  for (let i = 0; i < count; i++) {
    const drift = (i - (count - 1) / 2) * 24 + (random() - 0.5) * 10
    const p0: Point = [x + drift * 0.3, y]
    const p1: Point = [x + drift, 674 + random() * 22]
    const c0: Point = [p0[0] + drift * 0.2, y - 20 - random() * 10]
    const c1: Point = [p1[0] - drift * 0.3, y + 24]
    const n = 4 + Math.floor(random() * 3)
    let leaves = ''
    for (let s = 0; s < n; s++) {
      const t = 0.12 + (s / (n - 1)) * 0.82
      const p = cubicPoint(p0, c0, c1, p1, t)
      const tangent = cubicTangent(p0, c0, c1, p1, t)
      leaves += leafPath(p, tangent, s % 2 === 0 ? 1 : -1, 5 + random() * 3)
    }
    vines.push({ stem: `M${pt(p0)}C${pt(c0)} ${pt(c1)} ${pt(p1)}`, leaves })
  }
  return vines
}

export interface Flower {
  stem: string
  leaf: string
  petals: string
  cx: number
  cy: number
  color: string
}

interface FlowerSpec {
  x: number
  height: number
  lean: number
  color: string
}

export function buildFlowers(y: number, specs: FlowerSpec[], seed: number): Flower[] {
  const random = mulberry32(seed)
  return specs.map(({ x, height, lean, color }) => {
    const p0: Point = [x, y]
    const head: Point = [x + lean, y - height]
    const c: Point = [x + lean * 0.3, y - height * 0.6]
    const leafAt = 0.4 + random() * 0.2
    const leaf = leafPath(
      quadPoint(p0, c, head, leafAt),
      quadTangent(p0, c, head, leafAt),
      lean >= 0 ? -1 : 1,
      5,
    )
    const r = 6.5 + random() * 1.5
    let petals = ''
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 - Math.PI / 2 + (random() - 0.5) * 0.2
      const tip: Point = [head[0] + Math.cos(a) * r, head[1] + Math.sin(a) * r]
      const l: Point = [
        head[0] + Math.cos(a - 0.6) * r * 1.05,
        head[1] + Math.sin(a - 0.6) * r * 1.05,
      ]
      const rt: Point = [
        head[0] + Math.cos(a + 0.6) * r * 1.05,
        head[1] + Math.sin(a + 0.6) * r * 1.05,
      ]
      petals += `M${pt(head)}Q${pt(l)} ${pt(tip)}Q${pt(rt)} ${pt(head)}`
    }
    return {
      stem: `M${pt(p0)}Q${pt(c)} ${pt(head)}`,
      leaf,
      petals,
      cx: head[0],
      cy: head[1],
      color,
    }
  })
}

export function soilPath(x0: number, x1: number, y: number, depth: number): string {
  const segments = 10
  const step = (x1 - x0) / segments
  let d = `M${f(x0)} ${f(y + depth)}V${f(y)}`
  for (let i = 0; i < segments; i++) {
    const bump = i % 2 === 0 ? -4 : -2
    d += `q${f(step / 2)} ${f(bump)} ${f(step)} 0`
  }
  return `${d}V${f(y + depth)}Z`
}

export const FERN = buildFronds(1104, SOIL_Y, {
  count: 8,
  length: 54,
  spread: 2.3,
  pinna: 9,
  seed: 31,
})
export const ROSEMARY = buildFronds(1063, 612, {
  count: 5,
  length: 26,
  spread: 1.2,
  pinna: 5,
  seed: 7,
})
export const SHELF_PLANT = buildFronds(1233, 456, {
  count: 5,
  length: 15,
  spread: 1.6,
  pinna: 0,
  seed: 13,
})
export const IVY = buildIvy(1160, SOIL_Y, 3, 11)
export const FLOWERS = buildFlowers(
  SOIL_Y,
  [
    { x: 1190, height: 42, lean: 7, color: accentHex.terracotta },
    { x: 1204, height: 30, lean: -4, color: accentHex.ochre },
    { x: 1294, height: 36, lean: -3, color: accentHex.plum },
  ],
  17,
)
export const SOIL = soilPath(1048, 1292, SOIL_Y - 6, 12)
export const BOARDS = lines(1066, 1276, 21, PLANTER.y + 2, PLANTER.y + PLANTER.height - 2, 5)
