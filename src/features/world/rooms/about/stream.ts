export const CAM_Z = -1.9
export const CHUNK = 40
const SPACING = 36
export const BEHIND = 8
export const CLIP_AHEAD = -1.5
export const FOG_FAR = 27
export const LANE_X = 2.4
export const LANE_TOP = 2.8

export type MilestoneId = 'intro' | 'about' | 'journey' | 'principles' | 'balloons' | 'focus'

interface MilestoneSpot {
  id: MilestoneId
  title: string
  at: number
}

export const MILESTONES: readonly MilestoneSpot[] = [
  { id: 'intro', title: 'Hello', at: 18 },
  { id: 'about', title: 'About me', at: 18 + SPACING },
  { id: 'journey', title: 'Journey', at: 18 + SPACING * 2 },
  { id: 'principles', title: 'Principles', at: 18 + SPACING * 3 },
  { id: 'balloons', title: 'Tools', at: 18 + SPACING * 4 },
  { id: 'focus', title: 'Right now', at: 18 + SPACING * 5 },
]

export const CYCLE = SPACING * MILESTONES.length

export function mod(n: number, m: number): number {
  return ((n % m) + m) % m
}

export function aheadInCycle(at: number, distance: number): number {
  return mod(at - distance + BEHIND, CYCLE) - BEHIND
}

export function zForAhead(ahead: number): number {
  return CAM_Z - ahead
}

export function approach(ahead: number, far: number, near: number): number {
  return Math.min(1, Math.max(0, (far - ahead) / (far - near)))
}

export const easeInQuad = (t: number): number => t * t
export const easeOutQuad = (t: number): number => 1 - (1 - t) * (1 - t)
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)
export const smoothstep = (t: number): number => t * t * (3 - 2 * t)

export function nearestMilestone(distance: number): MilestoneId | null {
  let best: MilestoneId | null = null
  let bestAhead = Infinity
  for (const spot of MILESTONES) {
    const ahead = aheadInCycle(spot.at, distance)
    if (ahead > -6 && ahead < 20 && ahead < bestAhead) {
      best = spot.id
      bestAhead = ahead
    }
  }
  return best
}

export function milestoneAt(id: MilestoneId): number {
  return MILESTONES.find((m) => m.id === id)?.at ?? 0
}
