import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { worldStore, type WorldState } from '@/shared/store/worldStore'
import type { DoorSectionId } from '@/shared/types'
import { doorPosition, getDoor } from '@/shared/corridor/corridor'
import { pendingPaints } from '@/shared/graphics/paintQueue'

interface CorridorDebug {
  projectDoor: (id: DoorSectionId) => { x: number; y: number; inView: boolean } | null
  state: () => WorldState
  info: () => {
    calls: number
    triangles: number
    lines: number
    programs: number
    geometries: number
    textures: number
    texturePixels: number
    objects: number
    types: Record<string, number>
    textureSizes: Record<string, number>
    mixed: string[]
    paints: number
    rooms: { at: number[]; visible: boolean; objects: number }[]
    far: { inFrustum: number; beyond28: number; beyond32: number; maxDistance: number }
  }
  churn: (frames?: number) => Promise<string[]>
  traceVersion: () => Promise<string[]>
  scene: () => THREE.Scene
  gl: () => THREE.WebGLRenderer
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
      scene: () => scene,
      gl: () => gl,
      traceVersion: () =>
        new Promise((resolve) => {
          const materials = new Set<THREE.Material>()
          scene.traverse((object) => {
            const owner = object as THREE.Mesh
            for (const m of Array.isArray(owner.material)
              ? owner.material
              : owner.material
                ? [owner.material]
                : [])
              materials.add(m)
          })
          const before = new Map([...materials].map((m) => [m, m.version]))
          let frames = 5
          const pick = () => {
            if (--frames > 0) {
              requestAnimationFrame(pick)
              return
            }
            let target: THREE.Material | null = null
            let delta = 0
            materials.forEach((m) => {
              const d = m.version - (before.get(m) ?? 0)
              if (d > delta) {
                delta = d
                target = m
              }
            })
            if (!target) {
              resolve(['no material changed version'])
              return
            }
            const stacks: string[] = []
            let value = (target as THREE.Material).version
            Object.defineProperty(target, 'version', {
              configurable: true,
              get: () => value,
              set: (next: number) => {
                if (stacks.length < 3)
                  stacks.push(String(new Error().stack).split('\n').slice(1, 9).join(' <- '))
                value = next
              },
            })
            window.setTimeout(
              () => resolve([`delta ${delta} ${(target as THREE.Material).type}`, ...stacks]),
              300,
            )
          }
          requestAnimationFrame(pick)
        }),
      churn: (frames = 60) =>
        new Promise((resolve) => {
          const counts = new Map<
            THREE.Material,
            { hits: number; owners: Set<string>; progs: Set<string>; versions: Set<number> }
          >()
          const restore: (() => void)[] = []
          scene.traverse((object) => {
            const owner = object as THREE.Mesh
            const list = Array.isArray(owner.material)
              ? owner.material
              : owner.material
                ? [owner.material]
                : []
            for (const m of list) {
              const entry = counts.get(m) ?? {
                hits: 0,
                owners: new Set<string>(),
                progs: new Set<string>(),
                versions: new Set<number>(),
              }
              const at = object.getWorldPosition(new THREE.Vector3())
              entry.owners.add(
                `${object.type}@${at.x.toFixed(1)},${at.y.toFixed(1)},${at.z.toFixed(1)}`,
              )
              counts.set(m, entry)
              if (Object.prototype.hasOwnProperty.call(m, 'customProgramCacheKey')) continue
              const original = m.customProgramCacheKey
              m.customProgramCacheKey = () => {
                entry.hits += 1
                return original.call(m)
              }
              restore.push(() => {
                delete (m as { customProgramCacheKey?: unknown }).customProgramCacheKey
              })
            }
          })
          let left = frames
          const tick = () => {
            counts.forEach((entry, m) => {
              const props = gl.properties.get(m) as {
                currentProgram?: { id: number; cacheKey: string }
              }
              if (props.currentProgram)
                entry.progs.add(
                  `${props.currentProgram.id}:${props.currentProgram.cacheKey.slice(-90)}`,
                )
              entry.versions.add(m.version)
            })
            if (--left > 0) {
              requestAnimationFrame(tick)
              return
            }
            restore.forEach((fn) => fn())
            resolve(
              [...counts.entries()]
                .filter(([, e]) => e.hits > 0)
                .sort((a, b) => b[1].hits - a[1].hits)
                .slice(0, 20)
                .map(([m, e]) => {
                  const props = gl.properties.get(m) as Record<string, unknown>
                  const snap = [
                    'numClippingPlanes',
                    'numIntersection',
                    'vertexAlphas',
                    'toneMapping',
                    'outputColorSpace',
                    'lightsStateVersion',
                    'instancing',
                    'morphTargets',
                    'batching',
                  ]
                    .map((k) => `${k}=${String(props[k])}`)
                    .join(' ')
                  const flags = `clip=${m.clippingPlanes?.length ?? 'null'} fog=${String((m as { fog?: boolean }).fog)} vc=${String(m.vertexColors)} map=${String(((m as { map?: unknown }).map ?? null) !== null)}`
                  return `${e.hits}x ${m.type} ${flags} | ${snap} | versions=${[...e.versions].join('/')} progs=${[...e.progs].join(' || ')} | ${[...e.owners].slice(0, 4).join(', ')}`
                }),
            )
          }
          requestAnimationFrame(tick)
        }),
      info: () => {
        const seen = new Set<THREE.Texture>()
        let objects = 0
        const types: Record<string, number> = {}
        const usage = new Map<THREE.Material, Set<string>>()
        scene.traverse((object) => {
          objects += 1
          const owner = object as THREE.Mesh
          const kinds = Array.isArray(owner.material)
            ? owner.material
            : owner.material
              ? [owner.material]
              : []
          for (const m of kinds) {
            const set = usage.get(m) ?? new Set<string>()
            set.add(
              `${object.type}:fog=${String(scene.fog !== null)}:clip=${m.clippingPlanes?.length ?? 0}/${String(m.clipIntersection)}`,
            )
            usage.set(m, set)
          }
          const geometry = (object as THREE.Mesh).geometry as THREE.BufferGeometry | undefined
          const key = object.visible
            ? `${object.type}${geometry ? ':' + ((geometry.getAttribute('position')?.count ?? 0 > 400) ? 'big' : 'small') : ''}`
            : 'hidden'
          types[key] = (types[key] ?? 0) + 1
          const material = (object as THREE.Mesh).material
          for (const m of Array.isArray(material) ? material : material ? [material] : []) {
            for (const value of Object.values(m)) {
              if (value instanceof THREE.Texture) seen.add(value)
            }
          }
        })
        let texturePixels = 0
        const textureSizes: Record<string, number> = {}
        seen.forEach((texture) => {
          const image = texture.image as { width?: number; height?: number } | undefined
          texturePixels += (image?.width ?? 0) * (image?.height ?? 0)
          const size = `${image?.width ?? 0}x${image?.height ?? 0}`
          textureSizes[size] = (textureSizes[size] ?? 0) + 1
        })
        return {
          calls: gl.info.render.calls,
          triangles: gl.info.render.triangles,
          lines: gl.info.render.lines,
          programs: gl.info.programs?.length ?? 0,
          geometries: gl.info.memory.geometries,
          textures: gl.info.memory.textures,
          texturePixels,
          objects,
          types,
          textureSizes,
          paints: pendingPaints(),
          far: (() => {
            const frustum = new THREE.Frustum().setFromProjectionMatrix(
              new THREE.Matrix4().multiplyMatrices(
                camera.projectionMatrix,
                camera.matrixWorldInverse,
              ),
            )
            const at = new THREE.Vector3()
            const stats = { inFrustum: 0, beyond28: 0, beyond32: 0, maxDistance: 0 }
            scene.traverse((object) => {
              const drawable = object as THREE.Mesh
              if (!drawable.geometry || !object.visible) return
              let parent: THREE.Object3D | null = object.parent
              while (parent) {
                if (!parent.visible) return
                parent = parent.parent
              }
              if (!frustum.intersectsObject(drawable)) return
              stats.inFrustum += 1
              const distance = object.getWorldPosition(at).distanceTo(camera.position)
              stats.maxDistance = Math.max(stats.maxDistance, Math.round(distance))
              if (distance > 28) stats.beyond28 += 1
              if (distance > 32) stats.beyond32 += 1
            })
            return stats
          })(),
          rooms: (() => {
            const found: { at: number[]; visible: boolean; objects: number }[] = []
            scene.traverse((object) => {
              if (object.type !== 'Group' || Math.abs(object.position.x) < 1.5) return
              let count = 0
              object.traverse(() => (count += 1))
              if (count > 100)
                found.push({
                  at: object.position.toArray().map((v) => Math.round(v * 10) / 10),
                  visible: object.visible,
                  objects: count,
                })
            })
            return found
          })(),
          mixed: [...usage.entries()]
            .filter(([, set]) => set.size > 1)
            .map(([m, set]) => `${m.type}#${m.name || m.uuid.slice(0, 6)} ${[...set].join(' | ')}`),
        }
      },
    }
    return () => {
      delete window.__corridor
    }
  }, [camera, gl, scene])

  return null
}
