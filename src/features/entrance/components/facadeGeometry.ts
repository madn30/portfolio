import { mulberry32 } from '@/shared/utils/random'

export const BRICK = { length: 100, height: 27, joint: 7 }
export const COURSE = BRICK.height + BRICK.joint
export const PITCH = BRICK.length + BRICK.joint
export const BRICK_TILE = { width: PITCH * 4, height: COURSE * 6 }
export const PLINTH_TOP = 706
export const ARCH = { cx: 800, cy: 412, innerRx: 114, innerRy: 68, outerRx: 146, outerRy: 92 }

type Point = [number, number]
type Random = () => number

const f = (n: number): string => n.toFixed(1)
const pt = ([x, y]: Point): string => `${f(x)} ${f(y)}`

const AVOID: [number, number, number, number][] = [
  [150, 60, 530, 760],
  [640, 300, 960, 762],
  [1020, 380, 1310, 700],
]

function brickOutline(random: Random, x: number, y: number, w: number, h: number, chip: boolean) {
  const j = () => (random() - 0.5) * 1.8
  const corners: Point[] = [
    [x + j(), y + j()],
    [x + w + j(), y + j()],
    [x + w + j(), y + h + j()],
    [x + j(), y + h + j()],
  ]
  if (chip) {
    const c = Math.floor(random() * 4)
    const [cx, cy] = corners[c]
    const dx = c === 0 || c === 3 ? 1 : -1
    const dy = c < 2 ? 1 : -1
    const bite = 4 + random() * 5
    const alongY: Point = [cx, cy + dy * bite]
    const alongX: Point = [cx + dx * bite, cy]
    const jag: Point = [cx + dx * (bite * 0.45 + 2), cy + dy * (bite * 0.45 + 2)]
    corners.splice(c, 1, ...(c % 2 === 0 ? [alongY, jag, alongX] : [alongX, jag, alongY]))
  }
  return `M${corners.map(pt).join('L')}Z`
}

function brickHatch(x: number, y: number, w: number, h: number, step: number, flip = false) {
  const run = h - 6
  let d = ''
  for (let sx = x + 4; sx + run < x + w - 3; sx += step) {
    d += flip
      ? `M${f(sx)} ${f(y + 3)}L${f(sx + run)} ${f(y + h - 3)}`
      : `M${f(sx)} ${f(y + h - 3)}L${f(sx + run)} ${f(y + 3)}`
  }
  return d
}

function buildTile() {
  const random = mulberry32(7)
  const tones = ['', '', '']
  let outlines = ''
  let hatched = ''
  let shaded = ''
  const place = (d: string) => {
    outlines += d
    tones[Math.floor(random() * 3)] += d
  }
  for (let c = 0; c < 6; c++) {
    const offset = c % 2 ? PITCH / 2 : 0
    for (let i = -1; i < 5; i++) {
      const x = offset + i * PITCH + BRICK.joint / 2
      const y = c * COURSE + BRICK.joint / 2
      if (x >= BRICK_TILE.width || x + BRICK.length <= 0) continue
      const roll = random()
      if (roll < 0.07) {
        const half = (BRICK.length - BRICK.joint) / 2
        place(brickOutline(random, x, y, half, BRICK.height, false))
        place(brickOutline(random, x + half + BRICK.joint, y, half, BRICK.height, false))
        continue
      }
      const d = brickOutline(random, x, y, BRICK.length, BRICK.height, roll > 0.84)
      place(d)
      if (roll > 0.6 && roll < 0.7) hatched += brickHatch(x, y, BRICK.length, BRICK.height, 9)
      else if (roll >= 0.7 && roll < 0.8) shaded += d
    }
  }
  return { tones, outlines, hatched, shaded }
}

function clear(x: number, y: number, w: number, h: number) {
  return AVOID.every(([ax, ay, bx, by]) => x + w < ax || x > bx || y + h < ay || y > by)
}

function steppedCrack(random: Random, startX: number, startCourse: number, courses: number) {
  let x = startX
  let y = startCourse * COURSE
  let d = `M${f(x)} ${f(y)}`
  for (let i = 0; i < courses; i++) {
    y += COURSE
    d += `L${f(x + (random() - 0.5) * 2)} ${f(y)}`
    x += (random() < 0.7 ? 1 : -1) * (PITCH / 2)
    d += `L${f(x)} ${f(y + (random() - 0.5) * 2)}`
  }
  return d
}

function buildCharacterBricks() {
  const random = mulberry32(11)
  let dark = ''
  let cross = ''
  let cracks = ''
  for (let n = 0; n < 60; n++) {
    const c = Math.floor(random() * 20)
    const col = Math.floor(random() * 16) - 1
    const x = (c % 2 ? PITCH / 2 : 0) + col * PITCH + BRICK.joint / 2
    const y = c * COURSE + BRICK.joint / 2
    if (y + BRICK.height > PLINTH_TOP || !clear(x, y, BRICK.length, BRICK.height)) continue
    const roll = random()
    if (roll < 0.45) dark += brickHatch(x, y, BRICK.length, BRICK.height, 5)
    else if (roll < 0.8) {
      cross += brickHatch(x, y, BRICK.length, BRICK.height, 9)
      cross += brickHatch(x, y, BRICK.length, BRICK.height, 9, true)
    } else {
      const sx = x + 20 + random() * 60
      cracks += `M${f(sx)} ${f(y)}l${f(3 - random() * 6)} ${f(9 + random() * 6)}l${f(-4 + random() * 8)} ${f(6 + random() * 8)}`
    }
  }
  cracks += steppedCrack(random, 1393, 1, 10)
  cracks += steppedCrack(random, 100, 3, 7)
  return { dark, cross, cracks }
}

function buildPavement() {
  const random = mulberry32(23)
  const rows = [760, 794, 834, 876]
  let joints = 'M0 794Q400 792 800 795T1600 794M0 834Q500 836 900 833T1600 834'
  let weeds = ''
  for (let r = 0; r < 3; r++) {
    const y0 = rows[r]
    const y1 = rows[r + 1]
    let x = -random() * 120
    while (x < 1600) {
      x += 110 + r * 24 + random() * 90
      if (x > 630 && x < 970) continue
      const lean = (random() - 0.5) * 6
      joints += `M${f(x)} ${f(y0 + 1)}L${f(x + lean)} ${f(y1 - 1)}`
      if (random() < 0.16) {
        const wx = x + lean
        weeds += `M${f(wx - 3)} ${f(y1)}l-4 -11M${f(wx + 1)} ${f(y1)}l1 -13M${f(wx + 5)} ${f(y1)}l5 -9`
      }
    }
  }
  let cracks = ''
  for (let n = 0; n < 7; n++) {
    let x = random() * 1600
    let y = 764 + random() * 100
    if (x > 600 && x < 1000) x += 500
    cracks += `M${f(x)} ${f(y)}`
    for (let s = 0; s < 4; s++) {
      x += (random() - 0.3) * 26
      y += random() * 12
      cracks += `L${f(x)} ${f(y)}`
    }
  }
  let pebbles = ''
  for (let n = 0; n < 16; n++) {
    const x = random() * 1600
    const y = 770 + random() * 100
    if (x > 620 && x < 980) continue
    const r = 2 + random() * 3
    const ry = r * 0.65
    pebbles += `M${f(x - r)} ${f(y)}a${f(r)} ${f(ry)} 0 1 0 ${f(r * 2)} 0a${f(r)} ${f(ry)} 0 1 0 ${f(-r * 2)} 0`
  }
  return { joints, weeds, cracks, pebbles }
}

function buildQuoins() {
  const random = mulberry32(31)
  let d = ''
  for (let k = 0; k * COURSE * 2 < PLINTH_TOP; k++) {
    const w = k % 2 ? 42 : 64
    const y = k * COURSE * 2 + 2
    const h = Math.min(COURSE * 2 - 5, PLINTH_TOP - y - 3)
    d += brickOutline(random, 1, y, w, h, false)
    d += brickOutline(random, 1599 - w, y, w, h, false)
  }
  return d
}

function buildPlinth() {
  const random = mulberry32(37)
  let d = ''
  for (let x = -40 + random() * 60; x < 1600; x += 150 + random() * 60) {
    d += `M${f(x)} 720L${f(x + (random() - 0.5) * 3)} 760`
  }
  return d
}

function radial(deg: number, rx0: number, ry0: number, rx1: number, ry1: number) {
  const t = (deg * Math.PI) / 180
  const a: Point = [ARCH.cx + Math.cos(t) * rx0, ARCH.cy - Math.sin(t) * ry0]
  const b: Point = [ARCH.cx + Math.cos(t) * rx1, ARCH.cy - Math.sin(t) * ry1]
  return `M${pt(a)}L${pt(b)}`
}

export const brickTile = buildTile()
export const characterBricks = buildCharacterBricks()
export const pavement = buildPavement()
export const quoins = buildQuoins()
export const plinthJoints = buildPlinth()
export const voussoirJoints = [14, 34, 54, 74, 106, 126, 146, 166]
  .map((deg) => radial(deg, ARCH.innerRx, ARCH.innerRy, ARCH.outerRx, ARCH.outerRy))
  .join('')
export const fanlightBars = [22.5, 45, 67.5, 90, 112.5, 135, 157.5]
  .map((deg) => radial(deg, 12, 12, 105, 58))
  .join('')
