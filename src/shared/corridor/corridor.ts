import { doors, type DoorDefinition } from '@/data/siteConfig'
import type { DoorSectionId } from '@/shared/types'

export const CORRIDOR = {
  width: 6,
  height: 4.2,
  zStart: 11,
  zEnd: -52,
  zBeyond: -84,
  cameraStartZ: 3.6,
  cameraEndZ: -53.5,
  cameraHeight: 1.65,
  maxLateral: 1.1,
  door: { width: 1.3, height: 2.5 },
  loopDoor: { width: 2.2, height: 2.8 },
  wallInner: 1.75,
  doorSpan: 4.2,
} as const

const HALF = CORRIDOR.width / 2

export const DOOR_WALL = {
  length: Math.hypot(HALF - CORRIDOR.wallInner, CORRIDOR.doorSpan),
  angle: Math.atan2(HALF - CORRIDOR.wallInner, CORRIDOR.doorSpan),
} as const

const LOOP_OVERSHOOT = 1.3
export const LOOP_SHIFT = CORRIDOR.cameraStartZ - CORRIDOR.zEnd + LOOP_OVERSHOOT

export function lapCopies(z: number, margin = 0.3): number[] {
  return [z, z - LOOP_SHIFT, z + LOOP_SHIFT].filter(
    (zz) => zz < CORRIDOR.zStart - margin && zz > CORRIDOR.zBeyond + margin,
  )
}

export function progressToCameraZ(progress: number): number {
  const p = Math.min(1, Math.max(0, progress))
  return CORRIDOR.cameraStartZ + (CORRIDOR.cameraEndZ - CORRIDOR.cameraStartZ) * p
}

function cameraZToProgress(z: number): number {
  const range = CORRIDOR.cameraEndZ - CORRIDOR.cameraStartZ
  return Math.min(1, Math.max(0, (z - CORRIDOR.cameraStartZ) / range))
}

export const LOOP_END_PROGRESS = cameraZToProgress(CORRIDOR.zEnd)

export function loopDoorOpenAmount(cameraZ: number): number {
  const far = CORRIDOR.zEnd + 11
  const near = CORRIDOR.zEnd + 3.5
  const t = Math.min(1, Math.max(0, (far - cameraZ) / (far - near)))
  return t * t * (3 - 2 * t)
}

function doorStationZ(door: DoorDefinition): number {
  return door.z + 4.2
}

const GLANCE = { start: 10, peak: 3.5, end: -1.5, amount: 3.4 } as const

export const DOOR_PUSH_SECONDS = 1.45

export const RUG = { z: 1.2, width: 2.4, length: 3.2 }

export function onRug(z: number): boolean {
  return [RUG.z, RUG.z - LOOP_SHIFT].some((centre) => Math.abs(z - centre) < RUG.length / 2)
}

export function lookTowardNearestDoor(cameraZ: number): number {
  let best = 0
  for (const door of doors) {
    const dist = cameraZ - door.z
    let strength = 0
    if (dist > GLANCE.peak && dist < GLANCE.start) {
      strength = (GLANCE.start - dist) / (GLANCE.start - GLANCE.peak)
    } else if (dist <= GLANCE.peak && dist > GLANCE.end) {
      strength = (dist - GLANCE.end) / (GLANCE.peak - GLANCE.end)
    }
    if (strength <= 0) continue
    const eased = strength * (2 - strength)
    if (eased > Math.abs(best)) best = (door.side === 'left' ? -1 : 1) * eased
  }
  return best * GLANCE.amount
}

export function doorStationProgress(door: DoorDefinition): number {
  return cameraZToProgress(doorStationZ(door))
}

export function getDoor(id: DoorSectionId): DoorDefinition {
  const door = doors.find((d) => d.id === id)
  if (!door) throw new Error(`Unknown door "${id}"`)
  return door
}

const DOOR_TILT = { start: 8.5, full: 4.6, hold: -1, end: -4 } as const

export function doorTiltTarget(cameraZ: number, doorZ: number): number {
  const dist = cameraZ - doorZ
  let t = 0
  if (dist >= DOOR_TILT.full && dist < DOOR_TILT.start) {
    t = (DOOR_TILT.start - dist) / (DOOR_TILT.start - DOOR_TILT.full)
  } else if (dist < DOOR_TILT.full && dist >= DOOR_TILT.hold) {
    t = 1
  } else if (dist < DOOR_TILT.hold && dist > DOOR_TILT.end) {
    t = (dist - DOOR_TILT.end) / (DOOR_TILT.hold - DOOR_TILT.end)
  }
  return t * t * (3 - 2 * t)
}

export function doorPosition(door: DoorDefinition, z = door.z, tilt = 1): [number, number, number] {
  const angle = DOOR_WALL.angle * tilt
  const half = DOOR_WALL.length / 2
  const x = HALF - half * Math.sin(angle)
  const y = CORRIDOR.door.height / 2
  return [door.side === 'left' ? -x : x, y, z + CORRIDOR.doorSpan / 2 - half * Math.cos(angle)]
}

export function doorRotationY(door: DoorDefinition, tilt = 1): number {
  const yaw = Math.PI / 2 - DOOR_WALL.angle * tilt
  return door.side === 'left' ? yaw : -yaw
}

export function roomToWorld(
  door: DoorDefinition,
  [x, y, z]: readonly [number, number, number],
  doorZ = door.z,
): [number, number, number] {
  const [px, , pz] = doorPosition(door, doorZ)
  const yaw = doorRotationY(door)
  const cos = Math.cos(yaw)
  const sin = Math.sin(yaw)
  return [px + x * cos + z * sin, y, pz - x * sin + z * cos]
}

export interface DoorInstance {
  door: DoorDefinition
  index: number
  z: number
  twin: boolean
}

export function doorInstances(): DoorInstance[] {
  return doors.flatMap((door, index) =>
    lapCopies(door.z, CORRIDOR.doorSpan / 2 + 0.5).map((z) => ({
      door,
      index,
      z,
      twin: z !== door.z,
    })),
  )
}

export function nearestStation(progress: number): number {
  let best = -1
  let bestDistance = 0.08
  doors.forEach((door, index) => {
    const distance = Math.abs(doorStationProgress(door) - progress)
    if (distance < bestDistance) {
      bestDistance = distance
      best = index
    }
  })
  return best
}
