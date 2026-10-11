import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { worldStore, type WorldState } from '@/store/worldStore'
import type { DoorSectionId } from '@/types'
import { doorPosition, getDoor } from '@/utils/corridor'

interface CorridorDebug {
  /** Screen-space (CSS px) centre of a door, or null if it is behind the camera. */
  projectDoor: (id: DoorSectionId) => { x: number; y: number; inView: boolean } | null
  state: () => WorldState
}

declare global {
  interface Window {
    __corridor?: CorridorDebug
  }
}

/**
 * Development-only bridge used by the browser test script to find doors on screen.
 * Not included in production builds (guarded by import.meta.env.DEV at the call site).
 */
export function DebugBridge() {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    const vector = new THREE.Vector3()
    window.__corridor = {
      projectDoor: (id) => {
        const [x, y, z] = doorPosition(getDoor(id))
        vector.set(x, y, z).project(camera)
        if (vector.z > 1) return null
        const rect = gl.domElement.getBoundingClientRect()
        const sx = rect.left + ((vector.x + 1) / 2) * rect.width
        const sy = rect.top + ((1 - vector.y) / 2) * rect.height
        const inView = vector.x > -1 && vector.x < 1 && vector.y > -1 && vector.y < 1
        return { x: sx, y: sy, inView }
      },
      state: () => worldStore.getState(),
    }
    return () => {
      delete window.__corridor
    }
  }, [camera, gl])

  return null
}
