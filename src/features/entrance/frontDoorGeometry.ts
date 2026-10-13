import { mulberry32 } from '@/shared/utils/random'
import { LEAF_WIDTH, OPENING } from '@/features/entrance/shared'

export type Side = 'left' | 'right'

export const HANDLE_Y = 160
export const PAINT_HIDDEN = -124

export const STILE = 12
export const TOP_RAIL = 16
export const LOCK_RAIL = { y: 148, height: 28 }
export const BOTTOM_RAIL_Y = 290
export const BEVEL = 7

export interface Box {
  x: number
  y: number
  width: number
  height: number
}

export const PANELS: Box[] = [
  { x: 18, y: TOP_RAIL + 6, width: LEAF_WIDTH - 36, height: LOCK_RAIL.y - TOP_RAIL - 12 },
  {
    x: 18,
    y: LOCK_RAIL.y + LOCK_RAIL.height + 6,
    width: LEAF_WIDTH - 36,
    height: BOTTOM_RAIL_Y - LOCK_RAIL.y - LOCK_RAIL.height - 12,
  },
]

export const STICKER_SIZE = { width: 58, height: 28 }

export function stickerSlot(index: number): { x: number; y: number; rotate: number } {
  const panel = PANELS[Math.floor((index % 4) / 2)]
  const upper = index % 2 === 0
  const centre = panel.y + panel.height / 2
  const spread = panel.height / 4 + 1
  const random = mulberry32(31 + index)
  return {
    x: LEAF_WIDTH / 2 + (random() - 0.5) * 6,
    y: upper ? centre - spread : centre + spread,
    rotate: (random() - 0.5) * 14,
  }
}

export function handlePivotX(side: Side): number {
  return side === 'left' ? 93 : 11
}

export function handlePivot(side: Side): string {
  return `${handlePivotX(side)} ${HANDLE_Y}`
}

export function mirrorX(side: Side, x: number, width = 0): number {
  return side === 'left' ? x : LEAF_WIDTH - x - width
}

export function hatchRect(box: Box, spacing: number): string {
  const x1 = box.x + box.width
  const y1 = box.y + box.height
  let d = ''
  for (let c = box.x + box.y + spacing / 2; c < x1 + y1; c += spacing) {
    const xa = Math.max(box.x, c - y1)
    const xb = Math.min(x1, c - box.y)
    if (xb - xa < 0.6) continue
    d += `M${xa.toFixed(1)} ${(c - xa).toFixed(1)}L${xb.toFixed(1)} ${(c - xb).toFixed(1)}`
  }
  return d
}

export function grainStrokes(seed: number, box: Box, count: number, vertical: boolean): string {
  const random = mulberry32(seed)
  const long = vertical ? box.height : box.width
  let d = ''
  for (let i = 0; i < count; i++) {
    const across =
      (vertical ? box.x : box.y) + 1.5 + random() * ((vertical ? box.width : box.height) - 3)
    const start = (vertical ? box.y : box.x) + random() * long * 0.55
    const end = Math.min(start + long * (0.25 + random() * 0.55), (vertical ? box.y : box.x) + long)
    const wobble = (random() - 0.5) * 3
    const drift = (random() - 0.5) * 1.4
    const mid = (start + end) / 2
    d += vertical
      ? `M${across.toFixed(1)} ${start.toFixed(1)}Q${(across + wobble).toFixed(1)} ${mid.toFixed(1)} ${(across + drift).toFixed(1)} ${end.toFixed(1)}`
      : `M${start.toFixed(1)} ${across.toFixed(1)}Q${mid.toFixed(1)} ${(across + wobble).toFixed(1)} ${end.toFixed(1)} ${(across + drift).toFixed(1)}`
  }
  return d
}

export function leafGrain(seed: number): string {
  const height = OPENING.height
  return [
    grainStrokes(seed, { x: 0, y: 0, width: STILE, height }, 7, true),
    grainStrokes(seed + 1, { x: LEAF_WIDTH - STILE, y: 0, width: STILE, height }, 7, true),
    grainStrokes(
      seed + 2,
      { x: STILE, y: 0, width: LEAF_WIDTH - 2 * STILE, height: TOP_RAIL },
      4,
      false,
    ),
    grainStrokes(
      seed + 3,
      { x: STILE, y: LOCK_RAIL.y, width: LEAF_WIDTH - 2 * STILE, height: LOCK_RAIL.height },
      5,
      false,
    ),
    grainStrokes(
      seed + 4,
      { x: STILE, y: BOTTOM_RAIL_Y, width: LEAF_WIDTH - 2 * STILE, height: 8 },
      3,
      false,
    ),
    ...PANELS.map((panel, i) =>
      grainStrokes(
        seed + 5 + i,
        {
          x: panel.x + BEVEL,
          y: panel.y + BEVEL,
          width: panel.width - 2 * BEVEL,
          height: panel.height - 2 * BEVEL,
        },
        9,
        true,
      ),
    ),
  ].join('')
}

export function leverPath(side: Side): string {
  const p = handlePivotX(side)
  const dir = side === 'left' ? -1 : 1
  const y = HANDLE_Y
  const tip = p + dir * 27
  return [
    `M${p} ${y - 3.6}`,
    `H${tip + dir * -4}`,
    `q${dir * 5} 0 ${dir * 5.5} 4.4`,
    `l${dir * 0.4} 3.2`,
    `q${dir * 0.2} 2.6 ${dir * -2.4} 2.6`,
    `H${p}`,
    'Z',
  ].join(' ')
}

export const BRUSH = (() => {
  const random = mulberry32(5)
  let d = 'M0 0'
  for (let y = 0; y <= OPENING.height; y += 24) {
    d += ` L${(LEAF_WIDTH + 6 + random() * 14).toFixed(1)} ${y}`
  }
  return `${d} L0 ${OPENING.height} Z`
})()
