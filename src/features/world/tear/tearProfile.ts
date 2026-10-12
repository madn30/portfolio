import { mulberry32 } from '@/shared/graphics/sketch'

export type TearOctave = [amplitude: number, frequency: number, phase: number]

export interface TearPose {
  grip: number
  length: number
  pull: number
  wedge: number
  reach: number
  approach: number
  shade: number
}

export const TEAR_MARGIN = 0.2
export const HAND_GAP = 0.57
export const HOOK_GAP = 0.315
export const PALM_Z = -0.154
const FLAT_Y = -0.16
const HOOK_Y = -0.05

const AMPLITUDES = [0.09, 0.04, 0.014, 0.006]
const FREQUENCIES = [2.3, 5.1, 11.3, 23.7]

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

export function createTearProfile(seed: number): TearOctave[] {
  const random = mulberry32(seed)
  return AMPLITUDES.map((amplitude, i) => [
    amplitude,
    FREQUENCIES[i] * (0.9 + random() * 0.2),
    random() * Math.PI * 2,
  ])
}

export function tearX(profile: TearOctave[], y: number): number {
  let x = 0
  for (const [amplitude, frequency, phase] of profile) {
    x += amplitude * Math.sin(frequency * y + phase)
  }
  return x
}

export function tearSlope(profile: TearOctave[], y: number): number {
  let slope = 0
  for (const [amplitude, frequency, phase] of profile.slice(0, 2)) {
    slope += amplitude * frequency * Math.cos(frequency * y + phase)
  }
  return slope
}

const PUNCTURE_LENGTH = 0.24
const PUNCTURE_WEDGE = 0.08
const FULL_LENGTH = 1.35
const FULL_WEDGE = 0.4

export function tearPose(t: number, aspect: number): TearPose {
  const release = smoothstep(0.88, 1, t)
  const reach = smoothstep(0.24, 0.42, t)
  const puncture = smoothstep(0.26, 0.38, t)
  const rip = smoothstep(0.42, 0.8, t)
  return {
    grip: smoothstep(0.13, 0.24, t) * (1 - release),
    approach: smoothstep(0, 0.21, t),
    shade: smoothstep(0, 0.05, t) * (1 - release) * (1 - 0.72 * reach),
    length: PUNCTURE_LENGTH * puncture + (FULL_LENGTH - PUNCTURE_LENGTH) * rip,
    pull: 1.9 * aspect * Math.pow(smoothstep(0.78, 1, t), 1.6),
    wedge: PUNCTURE_WEDGE * puncture + (FULL_WEDGE - PUNCTURE_WEDGE) * rip,
    reach,
  }
}

export function handPosition(
  profile: TearOctave[],
  side: number,
  pose: TearPose,
): [number, number] {
  const open = smoothstep(0, 0.06, pose.length)
  const gap = HAND_GAP + (HOOK_GAP - HAND_GAP) * smoothstep(0, 0.5, pose.reach)
  const y = FLAT_Y + (HOOK_Y - FLAT_Y) * pose.reach
  return [tearX(profile, y) + side * (gap + pose.pull + pose.wedge * open), y]
}
