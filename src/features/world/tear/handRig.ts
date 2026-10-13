import * as THREE from 'three'
import { createFinger } from './fingerGeometry'
import type { Finger, FingerSpec } from './fingerGeometry'
import type { SkinTextures } from './skinTextures'

export const HAND_SCALE = 1.4

const KNUCKLE_X = 0.15
const REST: [number, number, number] = [0.1, 0.16, 0.1]
const HOOK: [number, number, number] = [0.6, 1.45, 0.85]

const PALM_OUTLINE: [number, number][] = [
  [-0.2, -0.085],
  [-0.06, -0.16],
  [0.09, -0.162],
  [0.17, -0.14],
  [0.195, -0.05],
  [0.2, 0.05],
  [0.18, 0.145],
  [0.09, 0.168],
  [-0.01, 0.15],
  [-0.1, 0.165],
  [-0.18, 0.12],
  [-0.21, 0.04],
]

function finger(
  y: number,
  radius: number,
  lengths: [number, number, number],
  spread: number,
): FingerSpec {
  return {
    x: KNUCKLE_X + 0.6 * (0.12 - lengths[0]),
    y,
    z: 0,
    radius,
    lengths,
    spread,
    spreadHooked: spread * 0.25,
    rest: REST,
    hook: HOOK,
  }
}

const SPECS: FingerSpec[] = [
  finger(0.118, 0.033, [0.11, 0.078, 0.062], 0.1),
  finger(0.04, 0.035, [0.12, 0.086, 0.066], 0.03),
  finger(-0.04, 0.033, [0.11, 0.08, 0.062], -0.05),
  finger(-0.116, 0.028, [0.086, 0.06, 0.052], -0.15),
  {
    x: -0.11,
    y: 0.1,
    z: 0.01,
    radius: 0.039,
    lengths: [0.1, 0.075, 0.062],
    spread: 0.78,
    spreadHooked: 0.62,
    rest: [0.05, 0.12, 0.15],
    hook: [0.1, 0.2, 0.3],
  },
]

export interface HandParts {
  fingers: Finger[]
  palm: THREE.BufferGeometry
  thenar: THREE.BufferGeometry
  forearm: THREE.BufferGeometry
  setCurl: (curl: number) => void
  dispose: () => void
}

export interface HandMaterials {
  skin: THREE.MeshPhysicalMaterial
  nail: THREE.MeshPhysicalMaterial
}

export interface Hand {
  group: THREE.Group
  setCurl: (curl: number) => void
}

export function createHandMaterials(textures: SkinTextures): HandMaterials {
  const skin = new THREE.MeshPhysicalMaterial({
    map: textures.albedo,
    normalMap: textures.normal,
    normalScale: new THREE.Vector2(0.22, 0.22),
    vertexColors: true,
    roughness: 0.52,
    metalness: 0,
    sheen: 0.5,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color('#ffc9b0'),
    emissive: new THREE.Color('#7a2a18'),
    emissiveIntensity: 0.1,
    envMapIntensity: 0.75,
  })
  const nail = new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.34,
    metalness: 0,
    clearcoat: 0.3,
    clearcoatRoughness: 0.25,
    side: THREE.DoubleSide,
  })
  return { skin, nail }
}

function white<T extends THREE.BufferGeometry>(geometry: T): T {
  const count = geometry.attributes.position.count
  geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3).fill(1), 3))
  return geometry
}

function palmSlab(): THREE.BufferGeometry {
  const points = PALM_OUTLINE.map(([x, y]) => new THREE.Vector2(x * 0.86, y * 0.86))
  const shape = new THREE.Shape()
  shape.moveTo(points[0].x, points[0].y)
  shape.splineThru([...points.slice(1), points[0]])
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.028,
    bevelSize: 0.028,
    bevelSegments: 4,
    curveSegments: 20,
  })
  geometry.translate(0, 0, -0.015)
  return white(geometry)
}

function thenarPad(): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(1, 28, 20)
  geometry.scale(0.1, 0.08, 0.055)
  geometry.translate(-0.09, 0.075, 0.02)
  return white(geometry)
}

function forearmShaft(): THREE.BufferGeometry {
  const geometry = new THREE.CapsuleGeometry(0.088, 1.7, 6, 18)
  geometry.rotateZ(-Math.PI / 2)
  geometry.scale(1, 1, 0.7)
  geometry.translate(-0.93, 0, 0)
  return white(geometry)
}

export function createHandParts(): HandParts {
  const fingers = SPECS.map(createFinger)
  const palm = palmSlab()
  const thenar = thenarPad()
  const forearm = forearmShaft()
  return {
    fingers,
    palm,
    thenar,
    forearm,
    setCurl: (curl) => fingers.forEach((f) => f.update(curl)),
    dispose: () => {
      fingers.forEach((f) => f.dispose())
      palm.dispose()
      thenar.dispose()
      forearm.dispose()
    },
  }
}

export function createHand(
  parts: HandParts,
  materials: Record<keyof HandMaterials, THREE.Material>,
  mirror: boolean,
): Hand {
  const group = new THREE.Group()
  group.scale.set(mirror ? -HAND_SCALE : HAND_SCALE, HAND_SCALE, HAND_SCALE)
  const solid = (geometry: THREE.BufferGeometry) => {
    const mesh = new THREE.Mesh(geometry, materials.skin)
    mesh.castShadow = true
    group.add(mesh)
    return mesh
  }
  solid(parts.palm)
  solid(parts.thenar)
  const forearm = solid(parts.forearm)
  forearm.rotation.z = 0.42
  forearm.rotation.y = -0.34
  forearm.position.set(-0.08, -0.04, -0.02)

  const roots = parts.fingers.map((part) => {
    const root = new THREE.Group()
    root.position.set(part.spec.x, part.spec.y, part.spec.z)
    const skin = new THREE.Mesh(part.skin, materials.skin)
    skin.castShadow = true
    skin.receiveShadow = true
    const nail = new THREE.Mesh(part.nail, materials.nail)
    root.add(skin, nail)
    group.add(root)
    return root
  })

  return {
    group,
    setCurl: (curl) => {
      roots.forEach((root, i) => {
        const { spread, spreadHooked } = parts.fingers[i].spec
        root.rotation.z = spread + (spreadHooked - spread) * curl
      })
    },
  }
}
