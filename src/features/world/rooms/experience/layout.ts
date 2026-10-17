import type { AccentColor } from '@/shared/types'
import type { Vec3 } from '@/features/world/rooms/flight'

export const RIDGE_Z = -14
export const RIDGE_DEPTH = 0.5

export const TRAIL: [number, number][] = [
  [-10.5, -0.3],
  [-8.4, 0.4],
  [-6.8, 1.0],
  [-5.4, 2.0],
  [-3.6, 1.7],
  [-2.4, 2.0],
  [-1.5, 2.3],
  [0.2, 3.1],
  [1.4, 3.6],
  [2.2, 4.2],
  [3.3, 4.7],
]
export const CAMP_POINTS = [2, 6, 10]
export const CAMP_ACCENTS: readonly AccentColor[] = ['ochre', 'slate', 'terracotta']

export const SHEET: Vec3 = [3.25, 1.1, -8]
/** Tall screens: the sheet sits centred under the mountain and the range shifts so every camp fits. */
export const SHEET_PORTRAIT: Vec3 = [0, 0.35, -8]
export const PORTRAIT_SHIFT = 1.4
export const LIFT = 0.25

export interface Ridge {
  profile: [number, number][]
  z: number
  color: string
  seed: number
  strength: number
  trees: number
  snowLine: number
}

export const RIDGES: Ridge[] = [
  {
    profile: [
      [-16, -3],
      [-12, 0.5],
      [-9, 2.2],
      [-7, 1.4],
      [-4, 3.2],
      [-2, 2.7],
      [1, 4.2],
      [3.5, 5.4],
      [5.5, 4.3],
      [8, 4.8],
      [10, 3.2],
      [13, 1.6],
      [16, -3],
    ],
    z: RIDGE_Z,
    color: '#8f9aa3',
    seed: 1,
    strength: 1,
    trees: 20,
    snowLine: 4.9,
  },
  {
    profile: [
      [-16, -3],
      [-11, 3],
      [-8, 2.2],
      [-5, 6.4],
      [-1, 4.6],
      [3, 7.8],
      [7, 5.6],
      [11, 7.0],
      [16, -3],
    ],
    z: -19,
    color: '#a3b3c2',
    seed: 2,
    strength: 0.7,
    trees: 10,
    snowLine: 5.4,
  },
  {
    profile: [
      [-16, -3],
      [-12, 5],
      [-6, 8.6],
      [0, 6.8],
      [5, 9.6],
      [12, 6],
      [16, -3],
    ],
    z: -25,
    color: '#b9cbdc',
    seed: 3,
    strength: 0.45,
    trees: 0,
    snowLine: 6.4,
  },
]
