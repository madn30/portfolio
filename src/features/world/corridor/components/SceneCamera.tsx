import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { DoorDefinition } from '@/data/siteConfig'
import type { DoorSectionId } from '@/shared/types'
import { play } from '@/app/audio'
import { worldRefs, worldStore } from '@/shared/store/worldStore'
import {
  CORRIDOR,
  getDoor,
  LOOP_SHIFT,
  lookTowardNearestDoor,
  progressToCameraZ,
  roomToWorld,
} from '@/shared/corridor/corridor'
import { roomCameras } from '@/features/world/rooms/cameras'
import { projectFocusPose } from '@/features/world/gallery/galleryLayout'
import { useScene } from '@/features/world/scene/SceneContext'

type Vec3 = readonly [number, number, number]

const DOOR_FRONT: Vec3 = [0.1, CORRIDOR.cameraHeight, 1.75]
const DOOR_GAZE: Vec3 = [0.1, 1.5, -4]
const WALK_IN_SECONDS = 1.7
const STEP_RATE = 1.9
const STEP_RISE = 0.034
const STEP_SWAY = 0.018

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

function stationPose(
  door: DoorDefinition,
  walk: number,
  pos: THREE.Vector3,
  look: THREE.Vector3,
  px: number,
  py: number,
): void {
  if (walk < 0) {
    pos.set(...roomToWorld(door, DOOR_FRONT))
    look.set(...roomToWorld(door, DOOR_GAZE))
    return
  }
  const focused = worldStore.getState().focusedProject
  const room =
    (door.id === 'projects' && focused ? projectFocusPose(focused) : null) ?? roomCameras[door.id]
  const restPos: Vec3 = [
    room.position[0] + px * 0.06,
    room.position[1] + py * 0.04,
    room.position[2],
  ]
  const restLook: Vec3 = [room.look[0] + px * 0.8, room.look[1] + py * 0.6, room.look[2]]
  if (walk >= 1) {
    pos.set(...roomToWorld(door, restPos))
    look.set(...roomToWorld(door, restLook))
    return
  }
  const travel = easeInOut(walk)
  const turn = easeInOut(Math.min(1, Math.max(0, (walk - 0.35) / 0.65)))
  const stride = Math.sin(walk * Math.PI)
  const phase = walk * WALK_IN_SECONDS * STEP_RATE * Math.PI
  pos.set(
    ...roomToWorld(door, [
      mix(DOOR_FRONT[0], restPos[0], turn) + Math.sin(phase) * STEP_SWAY * stride,
      mix(DOOR_FRONT[1], restPos[1], travel) + Math.abs(Math.sin(phase)) * STEP_RISE * stride,
      mix(DOOR_FRONT[2], restPos[2], travel),
    ]),
  )
  look.set(
    ...roomToWorld(door, [
      mix(DOOR_GAZE[0], restLook[0], turn),
      mix(DOOR_GAZE[1], restLook[1], turn),
      mix(DOOR_GAZE[2], restLook[2], turn),
    ]),
  )
}

const MAX_TRAIL = 3
const STRIDE = 1.25
const MAX_CADENCE = 2.7
const HEAD_RISE = 0.042
const HEAD_SWAY = 0.026
const HEAD_NOD = 0.05
const HEAD_ROLL = 0.006
const LEAVE_SECONDS = 0.9
export function SceneCamera() {
  const { camera } = useThree()
  const { reducedMotion, touch } = useScene()
  const lastActive = useRef<DoorSectionId | null>(null)
  const hurryUntil = useRef(0)
  const leaving = useRef<{ door: DoorDefinition; until: number } | null>(null)
  const lastEntering = useRef<DoorSectionId | null>(null)
  const walkStart = useRef(-Infinity)
  const glance = useRef(0)
  const targetPos = useRef(new THREE.Vector3(0, CORRIDOR.cameraHeight, CORRIDOR.cameraStartZ))
  const targetLook = useRef(new THREE.Vector3(0, CORRIDOR.cameraHeight, CORRIDOR.cameraStartZ - 8))
  const currentPos = useRef(targetPos.current.clone())
  const currentLook = useRef(targetLook.current.clone())
  const elapsed = useRef(0)
  const stride = useRef({ phase: 0, amount: 0, lastZ: CORRIDOR.cameraStartZ as number })
  const initialised = useRef(false)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    elapsed.current += dt
    const { enteringDoor, activeDoor } = worldStore.getState()
    const doorId = activeDoor ?? enteringDoor
    if (activeDoor !== lastActive.current) {
      if (activeDoor && lastActive.current) hurryUntil.current = elapsed.current + 1.2
      walkStart.current =
        activeDoor && lastEntering.current === activeDoor ? elapsed.current : -Infinity
      if (!activeDoor && lastActive.current && !enteringDoor) {
        leaving.current = {
          door: getDoor(lastActive.current),
          until: elapsed.current + LEAVE_SECONDS,
        }
      }
      lastActive.current = activeDoor
    }
    lastEntering.current = enteringDoor
    if (leaving.current && (doorId || elapsed.current > leaving.current.until)) {
      leaving.current = null
    }
    const walk =
      activeDoor === null
        ? -1
        : Math.min(1, (elapsed.current - walkStart.current) / WALK_IN_SECONDS)
    const pos = targetPos.current
    const look = targetLook.current
    const parallax = touch || reducedMotion ? 0 : 1
    const px = worldRefs.pointerX * parallax
    const py = worldRefs.pointerY * parallax

    if (doorId) {
      stationPose(getDoor(doorId), walk, pos, look, px, py)
    } else if (leaving.current) {
      stationPose(leaving.current.door, -1, pos, look, px, py)
    } else {
      const z = progressToCameraZ(worldRefs.scroll)
      const glanceTarget = lookTowardNearestDoor(z)
      const releasing = Math.abs(glanceTarget) < Math.abs(glance.current)
      const glanceRate = reducedMotion ? 1 : 1 - Math.exp(-dt * (releasing ? 5 : 2))
      glance.current += (glanceTarget - glance.current) * glanceRate
      const bob = reducedMotion ? 0 : Math.sin(elapsed.current * 0.9) * 0.006
      pos.set(
        THREE.MathUtils.clamp(px * 0.4, -CORRIDOR.maxLateral, CORRIDOR.maxLateral),
        CORRIDOR.cameraHeight + py * 0.12 + bob,
        z,
      )
      look.set(pos.x + px * 0.9 + glance.current, CORRIDOR.cameraHeight + py * 0.55, z - 9)
    }

    const jump = pos.z - currentPos.current.z
    if (Math.abs(jump) > LOOP_SHIFT / 2) {
      const shift = Math.sign(jump) * LOOP_SHIFT
      currentPos.current.z += shift
      currentLook.current.z += shift
    }
    if (!initialised.current || reducedMotion) {
      currentPos.current.copy(pos)
      currentLook.current.copy(look)
      initialised.current = true
    } else {
      if (!doorId) {
        const trail = pos.z - currentPos.current.z
        if (Math.abs(trail) > MAX_TRAIL) {
          const clamp = trail - Math.sign(trail) * MAX_TRAIL
          currentPos.current.z += clamp
          currentLook.current.z += clamp
        }
      }
      const stepping = walk >= 0 && walk < 1
      const rate = elapsed.current < hurryUntil.current ? 9 : stepping ? 8 : doorId ? 3.4 : 7
      const a = 1 - Math.exp(-dt * rate)
      currentPos.current.lerp(pos, a)
      currentLook.current.lerp(look, a)
    }

    camera.position.copy(currentPos.current)
    camera.lookAt(currentLook.current)

    const step = stride.current
    const moved = Math.abs(currentPos.current.z - step.lastZ)
    step.lastZ = currentPos.current.z
    const walking = !doorId && !leaving.current && !reducedMotion && moved < 1
    const speed = walking ? moved / dt : 0
    step.amount += (Math.min(1, speed / 1.6) - step.amount) * (1 - Math.exp(-dt * 6))
    if (walking && step.amount > 0.01) {
      const before = Math.floor(step.phase / Math.PI)
      step.phase += Math.min(moved / STRIDE, dt * MAX_CADENCE) * Math.PI
      if (Math.floor(step.phase / Math.PI) !== before && step.amount > 0.35) play('step')
    }
    if (step.amount > 0.002) {
      const lift = Math.abs(Math.sin(step.phase))
      const side = Math.sin(step.phase)
      camera.position.y += (lift - 0.55) * HEAD_RISE * step.amount
      camera.position.x += side * HEAD_SWAY * step.amount
      camera.rotateX(-(lift - 0.55) * HEAD_NOD * 0.2 * step.amount)
      camera.rotateZ(side * HEAD_ROLL * step.amount)
    }
  })

  return null
}
