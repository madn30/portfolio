import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { DoorDefinition } from '@/data/siteConfig'
import type { DoorSectionId } from '@/shared/types'
import { playBreath, playStep } from '@/app/audio'
import { worldRefs, worldStore } from '@/shared/store/worldStore'
import {
  CORRIDOR,
  getDoor,
  LOOP_SHIFT,
  lookTowardNearestDoor,
  onRug,
  progressToCameraZ,
  roomToWorld,
} from '@/shared/corridor/corridor'
import { roomCameras } from '@/features/world/rooms/cameras'
import { projectFocusPose } from '@/features/world/gallery/galleryLayout'
import { useScene } from '@/features/world/scene/SceneContext'
import { doorPush, pushPose } from '@/features/world/navigation/doorPush'

type Vec3 = readonly [number, number, number]

const DOOR_FRONT: Vec3 = [0.1, CORRIDOR.cameraHeight, 1.75]
const DOOR_GAZE: Vec3 = [0.1, 1.5, -4]
const DOOR_REACH: Vec3 = [0.3, CORRIDOR.cameraHeight, 0.98]
const DOOR_THRESHOLD: Vec3 = [0.12, CORRIDOR.cameraHeight, 0.72]
const HANDLE_GAZE: Vec3 = [0.34, 1.34, -0.4]
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
  push: number | null,
): void {
  if (walk < 0 && push !== null) {
    const step = easeInOut(push)
    pos.set(
      ...roomToWorld(door, [
        mix(DOOR_REACH[0], DOOR_THRESHOLD[0], step),
        DOOR_REACH[1],
        mix(DOOR_REACH[2], DOOR_THRESHOLD[2], step),
      ]),
    )
    look.set(
      ...roomToWorld(door, [
        mix(HANDLE_GAZE[0], DOOR_GAZE[0], step),
        mix(HANDLE_GAZE[1], DOOR_GAZE[1], step),
        mix(HANDLE_GAZE[2], DOOR_GAZE[2], step),
      ]),
    )
    return
  }
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
      mix(DOOR_THRESHOLD[0], restPos[0], turn) + Math.sin(phase) * STEP_SWAY * stride,
      mix(DOOR_THRESHOLD[1], restPos[1], travel) + Math.abs(Math.sin(phase)) * STEP_RISE * stride,
      mix(DOOR_THRESHOLD[2], restPos[2], travel),
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
const BODY_FOLLOW = 0.12
const TURN_ROLL = 0.05
const MAX_ROLL = 0.025
const WEIGHT_KICK = 9
const WEIGHT_STIFFNESS = 70
const WEIGHT_DAMPING = 11
const WEIGHT_PITCH = 0.035
const WEIGHT_DIP = 0.02
const BREATH_RATE = 0.22
const BREATH_RISE = 0.005
const BREATH_SOUND_FROM = 0.45
const IDLE_LOOK_AFTER = 9
const IDLE_LOOK_SECONDS = 4.5
const IDLE_LOOK_REACH = 2.2

export function SceneCamera() {
  const { camera } = useThree()
  const { reducedMotion, touch } = useScene()
  const lastActive = useRef<DoorSectionId | null>(null)
  const hurryUntil = useRef(0)
  const leaving = useRef<{ door: DoorDefinition; until: number } | null>(null)
  const lastEntering = useRef<DoorSectionId | null>(null)
  const walkStart = useRef(-Infinity)
  const pushTime = useRef(Infinity)
  const glance = useRef(0)
  const targetPos = useRef(new THREE.Vector3(0, CORRIDOR.cameraHeight, CORRIDOR.cameraStartZ))
  const targetLook = useRef(new THREE.Vector3(0, CORRIDOR.cameraHeight, CORRIDOR.cameraStartZ - 8))
  const currentPos = useRef(targetPos.current.clone())
  const currentLook = useRef(targetLook.current.clone())
  const elapsed = useRef(0)
  const stride = useRef({ phase: 0, amount: 0, lastZ: CORRIDOR.cameraStartZ as number })
  const body = useRef({
    follow: 0,
    yaw: 0,
    yawSpeed: 0,
    weight: 0,
    weightSpeed: 0,
    lastAmount: 0,
    exertion: 0,
    breath: 0,
    idle: 0,
    lookStart: -1,
    lookSide: 1,
    pointerX: 0,
    pointerY: 0,
  })
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
    pushTime.current =
      enteringDoor && enteringDoor !== lastEntering.current
        ? 0
        : pushTime.current + Math.min(delta, 0.25)
    lastEntering.current = enteringDoor
    if (leaving.current && (doorId || elapsed.current > leaving.current.until)) {
      leaving.current = null
    }
    const walk =
      activeDoor === null
        ? -1
        : Math.min(1, (elapsed.current - walkStart.current) / WALK_IN_SECONDS)
    doorPush.door = enteringDoor ?? (activeDoor && walk < 1 ? activeDoor : null)
    doorPush.time = pushTime.current
    const push = enteringDoor ? pushPose(doorPush.time).swing : null
    const pos = targetPos.current
    const look = targetLook.current
    const parallax = touch || reducedMotion ? 0 : 1
    const px = worldRefs.pointerX * parallax
    const py = worldRefs.pointerY * parallax

    if (doorId) {
      stationPose(getDoor(doorId), walk, pos, look, px, py, push)
    } else if (leaving.current) {
      stationPose(leaving.current.door, -1, pos, look, px, py, null)
    } else {
      const z = progressToCameraZ(worldRefs.scroll)
      const glanceTarget = lookTowardNearestDoor(z)
      const releasing = Math.abs(glanceTarget) < Math.abs(glance.current)
      const glanceRate = reducedMotion ? 1 : 1 - Math.exp(-dt * (releasing ? 5 : 2))
      glance.current += (glanceTarget - glance.current) * glanceRate
      const b = body.current
      const still =
        !reducedMotion &&
        stride.current.amount < 0.02 &&
        Math.abs(px - b.pointerX) + Math.abs(py - b.pointerY) < 0.001
      b.pointerX = px
      b.pointerY = py
      b.idle = still ? b.idle + dt : 0
      if (!still) b.lookStart = -1
      if (b.lookStart < 0 && b.idle > IDLE_LOOK_AFTER) {
        b.lookStart = elapsed.current
        b.lookSide = Math.random() < 0.5 ? -1 : 1
      }
      let around = 0
      if (b.lookStart >= 0) {
        const u = (elapsed.current - b.lookStart) / IDLE_LOOK_SECONDS
        if (u >= 1) {
          b.lookStart = -1
          b.idle = -Math.random() * 4
        } else {
          around = Math.sin(u * Math.PI * 2) * Math.sin(u * Math.PI) * IDLE_LOOK_REACH * b.lookSide
        }
      }
      b.follow = reducedMotion
        ? 0
        : b.follow + (glance.current * BODY_FOLLOW - b.follow) * (1 - Math.exp(-dt * 1.2))
      pos.set(
        THREE.MathUtils.clamp(px * 0.4 + b.follow, -CORRIDOR.maxLateral, CORRIDOR.maxLateral),
        CORRIDOR.cameraHeight + py * 0.12,
        z,
      )
      look.set(pos.x + px * 0.9 + glance.current + around, CORRIDOR.cameraHeight + py * 0.55, z - 9)
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
      const rate =
        elapsed.current < hurryUntil.current
          ? 9
          : stepping
            ? 8
            : enteringDoor
              ? 5
              : doorId
                ? 3.4
                : 7
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
      const strides = Math.floor(step.phase / Math.PI)
      if (strides !== before && step.amount > 0.35) {
        playStep(strides % 2 === 0 ? 1 : -1, onRug(currentPos.current.z))
      }
    }
    if (step.amount > 0.002) {
      const lift = Math.abs(Math.sin(step.phase))
      const side = Math.sin(step.phase)
      camera.position.y += (lift - 0.55) * HEAD_RISE * step.amount
      camera.position.x += side * HEAD_SWAY * step.amount
      camera.rotateX(-(lift - 0.55) * HEAD_NOD * 0.2 * step.amount)
      camera.rotateZ(side * HEAD_ROLL * step.amount)
    }

    const b = body.current
    const corridor = !doorId && !leaving.current && !reducedMotion
    const yaw = Math.atan2(
      currentLook.current.x - currentPos.current.x,
      currentPos.current.z - currentLook.current.z,
    )
    const yawSpeed = corridor ? (yaw - b.yaw) / dt : 0
    b.yaw = yaw
    b.yawSpeed += (yawSpeed - b.yawSpeed) * (1 - Math.exp(-dt * 10))
    worldRefs.walkSpeed = step.amount
    worldRefs.turnSpeed = Math.abs(b.yawSpeed)

    b.weightSpeed += (step.amount - b.lastAmount) * WEIGHT_KICK
    b.weightSpeed += (-WEIGHT_STIFFNESS * b.weight - WEIGHT_DAMPING * b.weightSpeed) * dt
    b.weight += b.weightSpeed * dt
    b.lastAmount = step.amount
    b.exertion = THREE.MathUtils.clamp(
      b.exertion + (step.amount * 0.12 - b.exertion * 0.05) * dt,
      0,
      1,
    )
    const breathBefore = Math.floor(b.breath / Math.PI)
    b.breath += dt * Math.PI * 2 * (BREATH_RATE + 0.2 * b.exertion)
    if (!corridor) return
    const breaths = Math.floor(b.breath / Math.PI)
    if (breaths !== breathBefore && b.exertion > BREATH_SOUND_FROM) {
      playBreath(breaths % 2 === 0, b.exertion)
    }
    const breath = Math.sin(b.breath - Math.PI / 2)
    camera.position.y +=
      breath * (BREATH_RISE + 0.007 * b.exertion) - Math.abs(b.weight) * WEIGHT_DIP
    camera.rotateX(breath * 0.0015 - b.weight * WEIGHT_PITCH)
    camera.rotateZ(THREE.MathUtils.clamp(-b.yawSpeed * TURN_ROLL, -MAX_ROLL, MAX_ROLL))
  })

  return null
}
