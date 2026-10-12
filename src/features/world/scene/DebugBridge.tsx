import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { worldStore, type WorldState } from '@/shared/store/worldStore'
import type { DoorSectionId } from '@/shared/types'
import { doorPosition, getDoor } from '@/shared/corridor/corridor'

interface CorridorDebug {
  projectDoor: (id: DoorSectionId) => { x: number; y: number; inView: boolean } | null
  state: () => WorldState
  probe: (
    ndcX?: number,
    ndcY?: number,
  ) => {
    camera: number[]
    hits: { type: string; name: string; distance: number; position: number[]; color?: string }[]
  }
}

declare global {
  interface Window {
    __corridor?: CorridorDebug
  }
}

export function DebugBridge() {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)

  useEffect(() => {
    const vector = new THREE.Vector3()
    const raycaster = new THREE.Raycaster()
    raycaster.params.Line.threshold = 0.02
    window.__corridor = {
      probe: (ndcX = 0, ndcY = 0) => {
        raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera)
        const hits = raycaster
          .intersectObjects(scene.children, true)
          .slice(0, 8)
          .map((hit) => {
            const material = (hit.object as THREE.Mesh).material
            const single = Array.isArray(material) ? material[0] : material
            const color =
              single && 'color' in single && single.color instanceof THREE.Color
                ? `#${single.color.getHexString()}`
                : undefined
            return {
              type: hit.object.type,
              name: hit.object.name,
              distance: Math.round(hit.distance * 100) / 100,
              position: hit.object
                .getWorldPosition(new THREE.Vector3())
                .toArray()
                .map((n) => Math.round(n * 100) / 100),
              color,
            }
          })
        return { camera: camera.position.toArray().map((n) => Math.round(n * 100) / 100), hits }
      },
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
  }, [camera, gl, scene])

  return null
}
