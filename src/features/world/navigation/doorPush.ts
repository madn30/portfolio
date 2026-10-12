import * as THREE from 'three'
import type { DoorDefinition } from '@/data/siteConfig'
import type { DoorSectionId } from '@/shared/types'
import { CORRIDOR, doorPosition, doorRotationY } from '@/shared/corridor/corridor'
import { getDoorTilt } from './doorTilt'

const W = CORRIDOR.door.width
const UP = new THREE.Vector3(0, 1, 0)

export const HANDLE_X = (0.879 - 0.5) * W
export const HANDLE_Y = 0.05
export const LEVER_TURN = 0.4
export const LEAF_Z = 0.04
const PUSH_OPEN = 0.8
const LEVER_REACH = 0.11
const LEVER_FRONT = 0.08

export const doorPush = {
  door: null as DoorSectionId | null,
  time: 0,
  open: 0,
  turn: 0,
}

export interface PushPose {
  reach: number
  grip: number
  press: number
  swing: number
  hold: number
  open: number
}

function smooth(x: number): number {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}

export function pushPose(time: number): PushPose {
  const swing = Math.min(1, Math.max(0, (time - 0.74) / 0.7))
  return {
    reach: smooth(time / 0.55),
    grip: smooth((time - 0.38) / 0.2),
    press: smooth((time - 0.6) / 0.14),
    swing,
    hold: 1 - smooth((time - 1.3) / 0.25),
    open: PUSH_OPEN * swing * swing,
  }
}

export function handleGrip(door: DoorDefinition, out: THREE.Vector3): THREE.Vector3 {
  const tilt = getDoorTilt(door.id, door.z)
  const [x, y, z] = doorPosition(door, door.z, tilt)
  out
    .set(
      W / 2 + HANDLE_X - LEVER_REACH * Math.cos(doorPush.turn),
      HANDLE_Y - LEVER_REACH * Math.sin(doorPush.turn),
      LEVER_FRONT,
    )
    .applyAxisAngle(UP, doorPush.open)
  out.x -= W / 2
  out.z += LEAF_Z
  out.applyAxisAngle(UP, doorRotationY(door, tilt))
  out.x += x
  out.y += y
  out.z += z
  return out
}
