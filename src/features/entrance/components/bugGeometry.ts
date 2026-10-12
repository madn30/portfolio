import { cloudPath } from '@/features/entrance/shared'

export const BUG_HOME = { x: 1175, y: 330 }
export const BUG_PIVOT = { wing: -3, legs: -4 }

export const BUG_ABDOMEN = { cx: 4, rx: 8.5, ry: 6 }
export const BUG_THORAX = { cx: -6, rx: 5.2, ry: 4.6 }
export const BUG_HEAD = { cx: -13.5, rx: 3.4, ry: 3.3 }

export interface BugEye {
  cx: number
  cy: number
  angle: number
}

export const BUG_EYE = { rx: 2.3, ry: 1.7 }
export const BUG_EYES: BugEye[] = [
  { cx: -13.2, cy: -2.3, angle: -25 },
  { cx: -13.2, cy: 2.3, angle: 25 },
]

export const BUG_WING = 'M-3 0 C1 -5 12 -8.5 19 -5 C21 -3 15 -0.5 -3 0 Z'
export const BUG_WING_VEINS = 'M-3 0 L18 -5.5 M-2 -0.5 L13 -7.3 M-1 0 L16 -3 M6 -4.6 L8 -2'
export const BUG_LEGS_A = 'M-7 -3 l-4 -6 l-4 -1 M-3 5 l1 7 l3 2 M1 -5 l5 -5 l4 0'
export const BUG_LEGS_B = 'M-7 3 l-4 6 l-4 1 M-3 -5 l1 -7 l3 -2 M1 5 l5 5 l4 0'
export const BUG_SEGMENTS =
  'M-1 -4.8 q0.8 4.8 0 9.6 M3.5 -5.9 q0.8 5.9 0 11.8 M8 -5.2 q0.7 5.2 0 10.4'
export const BUG_SHEEN = 'M-3.5 -2.2 C-0.5 -5.4 7.5 -5.6 11.8 -1.8 C8 -3.6 1 -3.7 -3.5 -2.2 Z'
export const BUG_HIGHLIGHTS = 'M0 -3.9 l2.6 -0.4 M5.2 -4.2 l2.2 0.1 M-8.5 -2.6 l2.4 -0.6'
export const BUG_THORAX_STRIPES = 'M-9.8 -2.3 h6.6 M-10.2 0 h7.4 M-9.8 2.3 h6.6'
export const BUG_HATCH =
  'M-11 2 l1.6 1.8 M-9 2.6 l1.6 1.8 M-7 3 l1.6 1.8 M-5 2.8 l1.6 1.8 M-3 2.4 l1.6 1.8 ' +
  'M-1 3.2 l1.6 1.8 M1 3.6 l1.6 1.8 M3 3.8 l1.6 1.8 M5 3.7 l1.6 1.8 M7 3.4 l1.6 1.8 ' +
  'M9 2.8 l1.5 1.6 M11 1.8 l1.2 1.2'
export const BUG_ANTENNAE =
  'M-16.4 -1.2 c-1.4 -0.8 -2.4 -2 -2.2 -3.6 M-16.4 1.2 c-1.4 0.8 -2.4 2 -2.2 3.6'

export const SPLAT = cloudPath(0, 0, 36, 29, 11, 41)
export const SPLAT_STREAKS =
  'M30 -12 q18 -9 34 -8 q-15 4 -30 12 Z M-24 18 q-14 12 -30 12 q13 -6 23 -16 Z'

export interface SplatDrop {
  cx: number
  cy: number
  rx: number
  ry: number
  angle: number
}

export const SPLAT_DROPS: SplatDrop[] = [
  { cx: -50, cy: -24, rx: 5, ry: 3.5, angle: -30 },
  { cx: 48, cy: 16, rx: 4, ry: 4, angle: 0 },
  { cx: 10, cy: -46, rx: 3, ry: 3, angle: 0 },
  { cx: -18, cy: 46, rx: 4.5, ry: 3, angle: 20 },
  { cx: 58, cy: -8, rx: 2.5, ry: 2.5, angle: 0 },
  { cx: -58, cy: 10, rx: 3, ry: 2, angle: 0 },
  { cx: 30, cy: 40, rx: 2.5, ry: 2.5, angle: 0 },
]
