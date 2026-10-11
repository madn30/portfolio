import { doors, type DoorDefinition } from '@/data/siteConfig'
import type { DoorSectionId } from '@/types'

/** Shared corridor dimensions (world units, metres-ish). */
export const CORRIDOR = {
  width: 6,
  height: 4.2,
  /** Where the corridor starts (behind the camera at the entrance). */
  zStart: 6,
  /** Far wall (the Contact door lives on it). */
  zEnd: -42,
  /** Camera travel range mapped onto scroll progress 0..1. */
  cameraStartZ: 3.6,
  cameraEndZ: -37.5,
  cameraHeight: 1.65,
  /** Camera stays inside these lateral bounds so it never clips a wall. */
  maxLateral: 1.1,
  door: { width: 1.3, height: 2.5 },
} as const

/** Number of viewport heights the page scrolls to walk the whole corridor. */
export const SCROLL_PAGES = 7

export function progressToCameraZ(progress: number): number {
  const p = Math.min(1, Math.max(0, progress))
  return CORRIDOR.cameraStartZ + (CORRIDOR.cameraEndZ - CORRIDOR.cameraStartZ) * p
}

export function cameraZToProgress(z: number): number {
  const range = CORRIDOR.cameraEndZ - CORRIDOR.cameraStartZ
  return Math.min(1, Math.max(0, (z - CORRIDOR.cameraStartZ) / range))
}

/** Where the camera should stand while looking at a door. */
export function doorStationZ(door: DoorDefinition): number {
  return door.side === 'end' ? door.z + 4.5 : door.z + 4.2
}

/** How far (in z) the camera starts turning its head toward an approaching door. */
export const LOOK_RANGE = 4.5

/**
 * Lateral look offset (world x) that gently turns the view toward the nearest side door
 * as the camera passes it, so doors never slip out of the frame.
 */
export function lookTowardNearestDoor(cameraZ: number): number {
  let offset = 0
  for (const door of doors) {
    if (door.side === 'end') continue
    const dz = Math.abs(cameraZ - doorStationZ(door))
    if (dz > LOOK_RANGE) continue
    const t = 1 - dz / LOOK_RANGE
    const weight = t * t * (3 - 2 * t)
    offset += (door.side === 'left' ? -1 : 1) * weight * 1.9
  }
  return offset
}

/** Scroll progress at which the camera is standing in front of a door. */
export function doorStationProgress(door: DoorDefinition): number {
  return cameraZToProgress(doorStationZ(door))
}

export function getDoor(id: DoorSectionId): DoorDefinition {
  const door = doors.find((d) => d.id === id)
  if (!door) throw new Error(`Unknown door "${id}"`)
  return door
}

/** World-space position of the door panel's centre. */
export function doorPosition(door: DoorDefinition): [number, number, number] {
  const half = CORRIDOR.width / 2
  const y = CORRIDOR.door.height / 2
  if (door.side === 'left') return [-half, y, door.z]
  if (door.side === 'right') return [half, y, door.z]
  return [0, y, door.z]
}

/** Yaw of the door so it sits flush with its wall. */
export function doorRotationY(door: DoorDefinition): number {
  if (door.side === 'left') return Math.PI / 2
  if (door.side === 'right') return -Math.PI / 2
  return 0
}

/** Index of the door nearest to the camera, or -1 near the entrance. */
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

export function maxScrollTop(): number {
  const doc = document.documentElement
  return Math.max(1, doc.scrollHeight - window.innerHeight)
}

export function scrollToProgress(progress: number, smooth: boolean): void {
  const top = progress * maxScrollTop()
  window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' })
}
