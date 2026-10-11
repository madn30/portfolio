import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { DoorDefinition } from '@/data/siteConfig'
import { worldRefs, worldStore } from '@/store/worldStore'
import {
  CORRIDOR,
  doorPosition,
  doorStationZ,
  getDoor,
  lookTowardNearestDoor,
  progressToCameraZ,
} from '@/utils/corridor'
import { useScene } from './SceneContext'

/** Where the camera stands and looks while facing a door. */
function stationPose(
  door: DoorDefinition,
  inside: boolean,
  pos: THREE.Vector3,
  look: THREE.Vector3,
): void {
  const [dx, dy, dz] = doorPosition(door)
  const z = doorStationZ(door)
  if (door.side === 'left') pos.set(0.55, CORRIDOR.cameraHeight, z)
  else if (door.side === 'right') pos.set(-0.55, CORRIDOR.cameraHeight, z)
  else pos.set(0, CORRIDOR.cameraHeight, z)
  look.set(dx, dy + 0.1, dz)
  if (inside) {
    // Step toward the open door so the section feels like it is "through" it.
    pos.lerp(
      new THREE.Vector3(dx * 0.5, CORRIDOR.cameraHeight, dz + (door.side === 'end' ? 2 : 0)),
      0.45,
    )
    pos.x = THREE.MathUtils.clamp(pos.x, -CORRIDOR.maxLateral * 1.6, CORRIDOR.maxLateral * 1.6)
  }
}

/**
 * Drives the camera every frame from scroll progress and pointer position, or parks it in
 * front of the door being entered. All motion is a critically damped lerp — no competing
 * tween systems touch the camera.
 */
export function SceneCamera() {
  const { camera } = useThree()
  const { reducedMotion, touch } = useScene()
  const targetPos = useRef(new THREE.Vector3(0, CORRIDOR.cameraHeight, CORRIDOR.cameraStartZ))
  const targetLook = useRef(new THREE.Vector3(0, CORRIDOR.cameraHeight, CORRIDOR.cameraStartZ - 8))
  const currentPos = useRef(targetPos.current.clone())
  const currentLook = useRef(targetLook.current.clone())
  const elapsed = useRef(0)
  const initialised = useRef(false)

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    elapsed.current += dt
    const { enteringDoor, activeDoor } = worldStore.getState()
    const doorId = activeDoor ?? enteringDoor
    const pos = targetPos.current
    const look = targetLook.current

    if (doorId) {
      stationPose(getDoor(doorId), activeDoor !== null, pos, look)
    } else {
      const parallax = touch || reducedMotion ? 0 : 1
      const px = worldRefs.pointerX * parallax
      const py = worldRefs.pointerY * parallax
      const z = progressToCameraZ(worldRefs.scroll)
      const bob = reducedMotion ? 0 : Math.sin(elapsed.current * 0.9) * 0.012
      pos.set(
        THREE.MathUtils.clamp(px * 0.3, -CORRIDOR.maxLateral, CORRIDOR.maxLateral),
        CORRIDOR.cameraHeight + py * 0.05 + bob,
        z,
      )
      look.set(
        pos.x + px * 0.9 + lookTowardNearestDoor(z),
        CORRIDOR.cameraHeight + py * 0.55,
        z - 9,
      )
    }

    if (!initialised.current || reducedMotion) {
      currentPos.current.copy(pos)
      currentLook.current.copy(look)
      initialised.current = true
    } else {
      const rate = doorId ? 2.6 : 5
      const a = 1 - Math.exp(-dt * rate)
      currentPos.current.lerp(pos, a)
      currentLook.current.lerp(look, a)
    }

    camera.position.copy(currentPos.current)
    camera.lookAt(currentLook.current)
  })

  return null
}
