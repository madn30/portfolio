import * as THREE from 'three'
import type { TowerSlot } from './layout'

export type TowerPhase = 'idle' | 'turning' | 'approaching' | 'open' | 'returning'

export interface TowerState {
  rotation: number
  velocity: number
  autoDirection: 1 | -1
  fall: number
  dragging: boolean
  travel: number
  lastX: number
  lastY: number
  lastTime: number
  offsets: Float32Array
  phase: TowerPhase
  focus: number | null
  turnTarget: number
  approach: number
}

export const DRAG_THRESHOLD = 6
const DRAG_RATE = 0.008
const AUTO_SPEED = 0.12
const BASE_FALL = 0.3
const WHEEL_RATE = 0.006
const SWIPE_RATE = 0.005
const SPIN_DECAY = 1.2
const FALL_DECAY = 0.9
const TURN_RATE = 6
const APPROACH_SECONDS = 0.5
const RETURN_SECONDS = 0.8
const TWO_PI = Math.PI * 2

export function createTowerState(count: number): TowerState {
  return {
    rotation: 0,
    velocity: 0,
    autoDirection: 1,
    fall: BASE_FALL,
    dragging: false,
    travel: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    offsets: new Float32Array(count),
    phase: 'idle',
    focus: null,
    turnTarget: 0,
    approach: 0,
  }
}

function angleDelta(from: number, to: number): number {
  return ((((to - from) % TWO_PI) + TWO_PI + Math.PI) % TWO_PI) - Math.PI
}

export function beginDrag(s: TowerState, x: number, y: number, time: number): void {
  s.dragging = true
  s.travel = 0
  s.velocity = 0
  s.lastX = x
  s.lastY = y
  s.lastTime = time
}

export function moveDrag(s: TowerState, x: number, y: number, time: number): boolean {
  if (!s.dragging) return false
  const dx = x - s.lastX
  const dy = y - s.lastY
  const dt = Math.max(time - s.lastTime, 8) / 1000
  s.lastX = x
  s.lastY = y
  s.lastTime = time
  s.travel += Math.abs(dx) + Math.abs(dy)
  if (Math.abs(dx) > 1) s.autoDirection = dx > 0 ? 1 : -1
  if (s.phase === 'idle') {
    s.rotation += dx * DRAG_RATE
    s.velocity = THREE.MathUtils.clamp((dx * DRAG_RATE) / dt, -4, 4)
    s.fall += dy * SWIPE_RATE
  }
  return s.travel > DRAG_THRESHOLD
}

export function endDrag(s: TowerState): void {
  s.dragging = false
}

export function nudgeFall(s: TowerState, deltaY: number): void {
  if (s.phase !== 'idle') return
  s.fall += deltaY * WHEEL_RATE
}

export function focusSlot(s: TowerState, index: number, slot: TowerSlot): void {
  s.focus = index
  s.velocity = 0
  s.phase = 'turning'
  s.turnTarget = s.rotation + angleDelta(s.rotation, -slot.rot)
}

export function releaseFocus(s: TowerState): void {
  if (s.phase === 'idle') return
  s.phase = s.approach > 0 ? 'returning' : 'idle'
  if (s.phase === 'idle') s.focus = null
}

export function resetTower(s: TowerState): void {
  s.phase = 'idle'
  s.focus = null
  s.approach = 0
  s.dragging = false
  s.velocity = 0
}

type TowerEvent = 'opened' | 'settled' | null

export function stepTower(
  s: TowerState,
  dt: number,
  slots: TowerSlot[],
  totalHeight: number,
  bottom: number,
  reducedMotion: boolean,
): TowerEvent {
  if (s.phase === 'turning') {
    const diff = s.turnTarget - s.rotation
    if (reducedMotion || Math.abs(diff) < 0.004) {
      s.rotation = s.turnTarget
      s.phase = 'approaching'
    } else {
      s.rotation += diff * (1 - Math.exp(-dt * TURN_RATE))
    }
    return null
  }
  if (s.phase === 'approaching') {
    s.approach = reducedMotion ? 1 : Math.min(1, s.approach + dt / APPROACH_SECONDS)
    if (s.approach >= 1) {
      s.phase = 'open'
      return 'opened'
    }
    return null
  }
  if (s.phase === 'returning') {
    s.approach = reducedMotion ? 0 : Math.max(0, s.approach - dt / RETURN_SECONDS)
    if (s.approach <= 0) {
      s.phase = 'idle'
      s.focus = null
      return 'settled'
    }
    return null
  }
  if (s.phase !== 'idle' || s.dragging) return null

  const auto = reducedMotion ? 0 : AUTO_SPEED * s.autoDirection
  s.rotation += (auto + s.velocity) * dt
  s.velocity *= Math.exp(-dt * SPIN_DECAY)
  if (Math.abs(s.velocity) < 0.001) s.velocity = 0

  const drift = reducedMotion ? 0 : s.fall >= 0 ? BASE_FALL : -BASE_FALL
  s.fall += (drift - s.fall) * (1 - Math.exp(-dt * FALL_DECAY))
  if (s.fall === 0) return null
  const top = bottom + totalHeight
  for (let i = 0; i < slots.length; i++) {
    s.offsets[i] -= s.fall * dt
    const y = slots[i].baseY + s.offsets[i]
    if (y < bottom && s.fall > 0) s.offsets[i] += totalHeight
    else if (y > top && s.fall < 0) s.offsets[i] -= totalHeight
  }
  return null
}
