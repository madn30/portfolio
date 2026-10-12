import { mulberry32 } from '@/shared/graphics/sketch'

export interface Point {
  x: number
  y: number
}

export const BOARD = { x: 662, y: 220, width: 276, height: 70 }
export const BOARD_DEPTH = 5
export const FRAME_INSET = 8
export const PLATE = { x: 626, y: 140, width: 20, height: 64 }
export const ARM = { x: 646, y: 150, width: 290, height: 8 }
export const PLATE_BOLTS: readonly [Point, Point] = [
  { x: 636, y: 148 },
  { x: 636, y: 196 },
]
export const CHAIN_ANCHORS: readonly [Point, Point] = [
  { x: 700, y: 164 },
  { x: 900, y: 164 },
]
export const BOARD_RINGS: readonly [Point, Point] = [
  { x: 700, y: 213 },
  { x: 900, y: 213 },
]

const CHAIN_LENGTH = 49.5
const LINK_COUNT = 6
const LINK_HALF = 6
const LINK_WIDTHS = [3, 1.5]

const fmt = (value: number): string => value.toFixed(1)

export function rotateAbout(point: Point, pivot: Point, angle: number): Point {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const dx = point.x - pivot.x
  const dy = point.y - pivot.y
  return { x: pivot.x + dx * cos - dy * sin, y: pivot.y + dx * sin + dy * cos }
}

export function chainPath(from: Point, to: Point, side: 1 | -1): string {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const distance = Math.hypot(dx, dy) || 1
  const ux = dx / distance
  const uy = dy / distance
  const slack = Math.sqrt(Math.max(0, CHAIN_LENGTH ** 2 - distance ** 2))
  const cx = (from.x + to.x) / 2 - uy * slack * side
  const cy = (from.y + to.y) / 2 + ux * slack * side
  let d = ''
  for (let i = 0; i < LINK_COUNT; i++) {
    const t = (i + 0.5) / LINK_COUNT
    const mt = 1 - t
    const x = mt * mt * from.x + 2 * mt * t * cx + t * t * to.x
    const y = mt * mt * from.y + 2 * mt * t * cy + t * t * to.y
    const tx = 2 * mt * (cx - from.x) + 2 * t * (to.x - cx)
    const ty = 2 * mt * (cy - from.y) + 2 * t * (to.y - cy)
    const length = Math.hypot(tx, ty) || 1
    const ax = (tx / length) * LINK_HALF
    const ay = (ty / length) * LINK_HALF
    const angle = ((Math.atan2(ty, tx) * 180) / Math.PI).toFixed(1)
    const width = LINK_WIDTHS[i % 2]
    const start = `${fmt(x - ax)} ${fmt(y - ay)}`
    const end = `${fmt(x + ax)} ${fmt(y + ay)}`
    d += `M${start}A${LINK_HALF} ${width} ${angle} 0 1 ${end}A${LINK_HALF} ${width} ${angle} 0 1 ${start}`
  }
  return d
}

export function hatchPath(x0: number, y0: number, x1: number, y1: number, step: number): string {
  const height = y1 - y0
  let d = ''
  for (let x = x0 - height; x < x1; x += step) {
    const ax = Math.max(x, x0)
    const bx = Math.min(x + height, x1)
    if (bx <= ax) continue
    d += `M${fmt(ax)} ${fmt(y1 - (ax - x))}L${fmt(bx)} ${fmt(y1 - (bx - x))}`
  }
  return d
}

export function spiralPath(
  cx: number,
  cy: number,
  radius: number,
  turns: number,
  direction: 1 | -1,
): string {
  const steps = Math.round(turns * 16)
  let d = ''
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = -Math.PI / 2 + direction * t * turns * Math.PI * 2
    const r = radius * (1 - t * 0.85)
    d += `${i ? 'L' : 'M'}${fmt(cx + Math.cos(a) * r)} ${fmt(cy + Math.sin(a) * r)}`
  }
  return d
}

export function strip(from: Point, to: Point, width: number): string {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.hypot(dx, dy) || 1
  const nx = ((-dy / length) * width) / 2
  const ny = ((dx / length) * width) / 2
  return [
    [from.x + nx, from.y + ny],
    [to.x + nx, to.y + ny],
    [to.x - nx, to.y - ny],
    [from.x - nx, from.y - ny],
  ]
    .map(([x, y]) => `${fmt(x)},${fmt(y)}`)
    .join(' ')
}

export const REST_CHAINS: readonly [string, string] = [
  chainPath(CHAIN_ANCHORS[0], BOARD_RINGS[0], 1),
  chainPath(CHAIN_ANCHORS[1], BOARD_RINGS[1], -1),
]

export const BRACE = strip(PLATE_BOLTS[1], { x: 760, y: ARM.y + ARM.height - 1 }, 5)

export const SCROLLS: readonly string[] = [
  spiralPath(ARM.x + ARM.width - 7, ARM.y + ARM.height + 11, 10, 1.6, 1),
  spiralPath(776, ARM.y + ARM.height + 10, 9, 1.5, -1),
  spiralPath(676, ARM.y + ARM.height + 14, 7, 1.4, -1),
]

export const SHADOWS: readonly string[] = [
  hatchPath(
    PLATE.x + PLATE.width,
    PLATE.y + 6,
    PLATE.x + PLATE.width + 6,
    PLATE.y + PLATE.height,
    4,
  ),
  hatchPath(
    PLATE.x + 4,
    PLATE.y + PLATE.height,
    PLATE.x + PLATE.width + 6,
    PLATE.y + PLATE.height + 5,
    4,
  ),
  hatchPath(ARM.x + 8, ARM.y + ARM.height, ARM.x + ARM.width + 4, ARM.y + ARM.height + 5, 6),
]

export const BOARD_EDGE_HATCH =
  hatchPath(
    BOARD.x + 6,
    BOARD.y + BOARD.height,
    BOARD.x + BOARD.width + BOARD_DEPTH,
    BOARD.y + BOARD.height + BOARD_DEPTH,
    4,
  ) +
  hatchPath(
    BOARD.x + BOARD.width,
    BOARD.y + 6,
    BOARD.x + BOARD.width + BOARD_DEPTH,
    BOARD.y + BOARD.height,
    4,
  )

export const INNER = {
  x: BOARD.x + FRAME_INSET,
  y: BOARD.y + FRAME_INSET,
  width: BOARD.width - FRAME_INSET * 2,
  height: BOARD.height - FRAME_INSET * 2,
}
export const PINSTRIPE = {
  x: INNER.x + 3,
  y: INNER.y + 3,
  width: INNER.width - 6,
  height: INNER.height - 6,
}
export const RIVETS: readonly Point[] = [
  { x: INNER.x + 7, y: INNER.y + 7 },
  { x: INNER.x + INNER.width - 7, y: INNER.y + 7 },
  { x: INNER.x + 7, y: INNER.y + INNER.height - 7 },
  { x: INNER.x + INNER.width - 7, y: INNER.y + INNER.height - 7 },
]
export const BEVELS = [
  `M${BOARD.x + 2} ${BOARD.y + 2}L${INNER.x} ${INNER.y}`,
  `M${BOARD.x + BOARD.width - 2} ${BOARD.y + 2}L${INNER.x + INNER.width} ${INNER.y}`,
  `M${BOARD.x + 2} ${BOARD.y + BOARD.height - 2}L${INNER.x} ${INNER.y + INNER.height}`,
  `M${BOARD.x + BOARD.width - 2} ${BOARD.y + BOARD.height - 2}L${INNER.x + INNER.width} ${INNER.y + INNER.height}`,
].join('')

const RULE_Y = INNER.y + INNER.height - 7
export const RULE = `M742 ${RULE_Y}H786M814 ${RULE_Y}H858`
export const RULE_TICKS = `M786 ${RULE_Y - 2.5}L790 ${RULE_Y}L786 ${RULE_Y + 2.5}M814 ${RULE_Y - 2.5}L810 ${RULE_Y}L814 ${RULE_Y + 2.5}`
export const RULE_DOOR = `M795.5 ${RULE_Y + 4.5}V${RULE_Y - 1}A4.5 4.5 0 0 1 804.5 ${RULE_Y - 1}V${RULE_Y + 4.5}Z`
export const RULE_DOOR_SPLIT = `M800 ${RULE_Y - 5}V${RULE_Y + 4.5}`
export const RULE_DOOR_KNOB: Point = { x: 801.6, y: RULE_Y + 1.2 }

export const PANEL_SHADE =
  hatchPath(
    INNER.x + 4,
    INNER.y + INNER.height - 3,
    INNER.x + INNER.width,
    INNER.y + INNER.height,
    4,
  ) +
  hatchPath(
    INNER.x + INNER.width - 3,
    INNER.y + 4,
    INNER.x + INNER.width,
    INNER.y + INNER.height,
    4,
  )

function wavyLine(
  from: number,
  to: number,
  base: number,
  amplitude: number,
  frequency: number,
  phase: number,
  vertical: boolean,
): string {
  let d = ''
  for (let t = from; t <= to; t += 8) {
    const offset = base + Math.sin(t * frequency + phase) * amplitude
    const x = vertical ? offset : t
    const y = vertical ? t : offset
    d += `${d ? 'L' : 'M'}${fmt(x)} ${fmt(y)}`
  }
  return d
}

export const GRAIN: readonly string[] = (() => {
  const random = mulberry32(31)
  const x0 = INNER.x + 6
  const x1 = INNER.x + INNER.width - 6
  const y0 = INNER.y + 6
  const y1 = INNER.y + INNER.height - 6
  const paths: string[] = []
  for (let i = 0; i < 6; i++) {
    const baseY = y0 + ((i + random()) / 6) * (y1 - y0)
    paths.push(
      wavyLine(x0, x1, baseY, 0.5 + random() * 1.2, 0.02 + random() * 0.03, random() * 10, false),
    )
  }
  return paths
})()

export const FRAME_GRAIN: readonly string[] = (() => {
  const random = mulberry32(47)
  const rails = [BOARD.y + 2.5, BOARD.y + BOARD.height - FRAME_INSET + 2.5]
  const stiles = [BOARD.x + 2.5, BOARD.x + BOARD.width - FRAME_INSET + 2.5]
  const lines = (edges: number[], from: number, to: number, vertical: boolean) =>
    edges.flatMap((edge) =>
      [0, 1].map((i) =>
        wavyLine(
          from,
          to,
          edge + 1 + i * 2.4 + random() * 0.6,
          0.4,
          0.05 + random() * 0.05,
          random() * 10,
          vertical,
        ),
      ),
    )
  return [
    ...lines(rails, BOARD.x + 10, BOARD.x + BOARD.width - 10, false),
    ...lines(stiles, INNER.y + 2, INNER.y + INNER.height - 2, true),
  ]
})()

export const SCUFFS: readonly string[] = [
  `M${INNER.x + 18} ${INNER.y + 12}l11 -3.5`,
  `M${INNER.x + 24} ${INNER.y + 15}l6 -2`,
  `M${INNER.x + INNER.width - 34} ${INNER.y + INNER.height - 11}l14 -2.5`,
  `M${INNER.x + 12} ${INNER.y + INNER.height - 16}l4 4`,
]
export const CHIPS: readonly string[] = [
  `M${BOARD.x + 3} ${BOARD.y + BOARD.height - 9}l3.5 -1 1.5 3 -2.5 2.5z`,
  `M${BOARD.x + BOARD.width - 14} ${BOARD.y + 2}l4.5 0.5 -1 3 -3.5 -0.5z`,
]
export const DRIPS: readonly string[] = BOARD_RINGS.map(
  (ring) =>
    `M${ring.x - 1.6} ${BOARD.y + 6}q1 7 1.6 12.5q0.8 -5.5 1.6 -12.5z M${ring.x + 4} ${BOARD.y + 6}q0.4 4 0.8 7q0.4 -3 0.8 -7z`,
)

const braceFrom = PLATE_BOLTS[1]
const braceTo = { x: 760, y: ARM.y + ARM.height - 1 }
const braceLength = Math.hypot(braceTo.x - braceFrom.x, braceTo.y - braceFrom.y)
const braceNormal = {
  x: (-(braceTo.y - braceFrom.y) / braceLength) * 1.4,
  y: ((braceTo.x - braceFrom.x) / braceLength) * 1.4,
}
export const BRACE_HIGHLIGHT = `M${fmt(braceFrom.x + 8 - braceNormal.x)} ${fmt(braceFrom.y - 2.5 - braceNormal.y)}L${fmt(braceTo.x - 6 - braceNormal.x)} ${fmt(braceTo.y + 2 - braceNormal.y)}`
