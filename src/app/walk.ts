import { CORRIDOR, LOOP_SHIFT } from '@/shared/corridor/corridor'

const LOOP_LENGTH = LOOP_SHIFT
const TRAVEL = CORRIDOR.cameraStartZ - CORRIDOR.cameraEndZ

const walk = {
  distance: 0,
  target: 0,
  velocity: 0,
}

const WALK_SPEED = 5.2
const ACCELERATION = 4.5

export function distanceToProgress(distance: number): number {
  const inLap = ((distance % LOOP_LENGTH) + LOOP_LENGTH) % LOOP_LENGTH
  return inLap / TRAVEL
}

export function lapOf(distance: number): number {
  return Math.floor(distance / LOOP_LENGTH)
}

export function walkBy(delta: number): void {
  walk.target = Math.max(0, walk.target + delta)
}

export function walkToProgress(progress: number, smooth: boolean): void {
  const base = lapOf(walk.target) * LOOP_LENGTH
  walk.target = base + Math.min(1, Math.max(0, progress)) * TRAVEL
  if (!smooth) {
    walk.distance = walk.target
    walk.velocity = 0
  }
}

export function walkThroughLoop(): void {
  walk.target = (lapOf(walk.target) + 1) * LOOP_LENGTH + 1.2
}

export function stepWalk(dt: number, instant: boolean): number {
  if (instant) {
    walk.distance = walk.target
    walk.velocity = 0
    return walk.distance
  }
  const gap = walk.target - walk.distance
  if (Math.abs(gap) < 0.0005 && Math.abs(walk.velocity) < 0.01) {
    walk.distance = walk.target
    walk.velocity = 0
    return walk.distance
  }
  const limit = Math.max(WALK_SPEED, Math.abs(gap) * 1.2)
  const wanted = Math.min(limit, Math.max(-limit, gap * 3.2))
  walk.velocity += (wanted - walk.velocity) * (1 - Math.exp(-dt * ACCELERATION))
  const step = walk.velocity * dt
  walk.distance =
    Math.abs(step) >= Math.abs(gap) && step * gap > 0 ? walk.target : walk.distance + step
  return walk.distance
}
