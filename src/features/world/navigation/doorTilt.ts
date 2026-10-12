import { doors } from '@/data/siteConfig'
import type { DoorSectionId } from '@/shared/types'
import { doorInstances, doorTiltTarget } from '@/shared/corridor/corridor'

const tilts = new Map<string, number>()

function key(id: DoorSectionId, z: number): string {
  return `${id}:${z}`
}

export function getDoorTilt(id: DoorSectionId, z: number): number {
  return tilts.get(key(id, z)) ?? 0
}

const instances = doorInstances()
const ownZ = new Map(doors.map((door) => [door.id, door.z]))

export function stepDoorTilts(
  cameraZ: number,
  dt: number,
  held: DoorSectionId | null,
  instant: boolean,
): void {
  const k = instant ? 1 : 1 - Math.exp(-dt * 9)
  for (const { door, z } of instances) {
    const isHeld = held === door.id && ownZ.get(door.id) === z
    const target = isHeld ? 1 : doorTiltTarget(cameraZ, z)
    const id = key(door.id, z)
    const current = tilts.get(id) ?? target
    const next = current + (target - current) * k
    tilts.set(id, Math.abs(next - target) < 0.0005 ? target : next)
  }
}
