import * as THREE from 'three'
import type { DoorDefinition } from '@/data/siteConfig'
import { CORRIDOR, DOOR_WALL } from '@/shared/corridor/corridor'

type Side = DoorDefinition['side']

const WALL_LINE = CORRIDOR.width / 2 - 0.02
const PANEL_HALF = DOOR_WALL.length / 2

function materialsOf(object: THREE.Object3D): THREE.Material[] {
  const material = (object as THREE.Mesh).material
  if (!material) return []
  return Array.isArray(material) ? material : [material]
}

/**
 * Rooms inherit the yaw of their tilted door panel, so wide content (sky boxes,
 * clouds) swings past the wall line into the corridor further along. A fragment is
 * discarded when it is inside the corridor volume AND beyond the panel's span, which
 * keeps the sliver of room visible in the pocket behind a swung-out panel.
 */
export class RoomClipper {
  private readonly planes: THREE.Plane[]
  private readonly wall: THREE.Plane
  private readonly panel: THREE.Plane
  private readonly sign: number
  private readonly clones = new Map<THREE.Material, THREE.Material>()
  private readonly axis = new THREE.Vector3()

  constructor(
    side: Side,
    private readonly shared: Set<THREE.Material>,
  ) {
    this.sign = side === 'left' ? 1 : -1
    this.wall = new THREE.Plane(new THREE.Vector3(-this.sign, 0, 0), -WALL_LINE)
    this.panel = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0)
    this.planes = [this.wall, this.panel]
  }

  private place(anchor: THREE.Object3D): void {
    const yaw = anchor.rotation.y
    this.axis.set(Math.cos(yaw), 0, -Math.sin(yaw))
    this.panel.normal.copy(this.axis).multiplyScalar(-this.sign)
    this.panel.constant = PANEL_HALF + this.sign * this.axis.dot(anchor.position)
  }

  private clip(material: THREE.Material): void {
    material.clippingPlanes = this.planes
    material.clipIntersection = true
  }

  apply(anchor: THREE.Object3D): void {
    this.place(anchor)
    anchor.traverse((object) => {
      const owner = object as THREE.Mesh
      const materials = materialsOf(object)
      if (materials.length === 0) return
      let swapped = false
      const next = materials.map((material) => {
        if (!this.shared.has(material)) {
          if (material.clippingPlanes !== this.planes) this.clip(material)
          return material
        }
        let clone = this.clones.get(material)
        if (!clone) {
          clone = material.clone()
          this.clip(clone)
          this.clones.set(material, clone)
        }
        swapped = true
        return clone
      })
      if (!swapped) return
      owner.material = Array.isArray(owner.material) ? next : next[0]
    })
  }

  dispose(): void {
    this.clones.forEach((clone) => clone.dispose())
    this.clones.clear()
  }
}
