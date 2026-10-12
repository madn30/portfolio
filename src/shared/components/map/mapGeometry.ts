import type { DoorDefinition } from '@/data/siteConfig'
import { doorStationProgress, LOOP_END_PROGRESS } from '@/shared/corridor/corridor'

export const INK = '#262421'
export const PAPER = '#ffe9a8'
export const FLOOR = '#c8955c'
export const DOOR_WOOD = '#a9713f'
const ROOM_WIDTH = 150
const ROOM_HEIGHT = 48

export const MAP = { top: 70, bottom: 400, left: 165, right: 195, centre: 180 }

export function progressToMapY(progress: number): number {
  return MAP.bottom - (MAP.bottom - MAP.top) * Math.min(1, progress / LOOP_END_PROGRESS)
}

export function doorMapY(door: DoorDefinition): number {
  return progressToMapY(doorStationProgress(door))
}

export function roomBox(door: DoorDefinition): {
  x: number
  y: number
  width: number
  height: number
} {
  const y = doorMapY(door) - ROOM_HEIGHT / 2
  return door.side === 'left'
    ? { x: MAP.left - 2 - ROOM_WIDTH, y, width: ROOM_WIDTH, height: ROOM_HEIGHT }
    : { x: MAP.right + 2, y, width: ROOM_WIDTH, height: ROOM_HEIGHT }
}
