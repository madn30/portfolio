import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { worldStore } from '@/shared/store/worldStore'
import {
  CORRIDOR,
  DOOR_WALL,
  doorInstances,
  doorPosition,
  doorRotationY,
  type DoorInstance,
} from '@/shared/corridor/corridor'
import { createSketchPolyline } from '@/shared/graphics/sketch'
import { getDoorTilt, stepDoorTilts } from '@/features/world/navigation/doorTilt'
import { useScene } from '@/features/world/scene/SceneContext'
import { SketchEdges } from './SketchEdges'

const { width, height, zStart, zBeyond, doorSpan, wallInner } = CORRIDOR
const HALF = width / 2
const HOLE_HALF = CORRIDOR.door.width / 2 + 0.05
const HOLE_HEIGHT = CORRIDOR.door.height + 0.04
const PANEL = DOOR_WALL.length
const SIDE_W = PANEL / 2 - HOLE_HALF
const STEP = HALF - wallInner
const RAILS = [0.98, 1.05]
const SKIRT_H = 0.12

interface Filler {
  zFrom: number
  zTo: number
}

function fillers(side: 'left' | 'right'): Filler[] {
  const cuts = doorInstances()
    .filter((i) => i.door.side === side)
    .sort((a, b) => b.z - a.z)
  const out: Filler[] = []
  let cursor: number = zStart
  for (const cut of cuts) {
    out.push({ zFrom: cursor, zTo: cut.z + doorSpan / 2 })
    cursor = cut.z - doorSpan / 2
  }
  out.push({ zFrom: cursor, zTo: zBeyond })
  return out.filter((f) => f.zFrom - f.zTo > 0.01)
}

function v(x: number, y: number, z: number): THREE.Vector3 {
  return new THREE.Vector3(x, y, z)
}

export function CorridorWalls() {
  const { materials, quality, reducedMotion } = useScene()
  const panelGroups = useRef<(THREE.Group | null)[]>([])
  const stepMeshes = useRef<(THREE.Mesh | null)[]>([])
  const detailed = quality !== 'low'
  const left = useMemo(() => fillers('left'), [])
  const right = useMemo(() => fillers('right'), [])
  const panels = useMemo(() => doorInstances(), [])

  const stepMaterial = useMemo(() => {
    const m = materials.wall.clone()
    m.side = THREE.DoubleSide
    return m
  }, [materials])
  useEffect(() => () => stepMaterial.dispose(), [stepMaterial])

  const geometries = useMemo(
    () => ({
      fillerSkirt: [...left, ...right].map(
        (f) => new THREE.BoxGeometry(0.06, SKIRT_H, f.zFrom - f.zTo),
      ),
      panelSkirt: new THREE.BoxGeometry(SIDE_W, SKIRT_H, 0.06),
    }),
    [left, right],
  )
  useEffect(
    () => () => {
      geometries.fillerSkirt.forEach((g) => g.dispose())
      geometries.panelSkirt.dispose()
    },
    [geometries],
  )

  const lines = useMemo(() => {
    const out: THREE.BufferGeometry[] = []
    const sub = detailed ? 24 : 8
    const seam = (points: THREE.Vector3[], seed: number) =>
      out.push(createSketchPolyline(points, { jitter: 0.02, subdivisions: sub, seed, passes: 2 }))
    const rails = (points: (y: number) => THREE.Vector3[], seed: number) =>
      RAILS.forEach((y, i) => seam(points(y), seed + i * 10))
    ;[...left, ...right].forEach((f, i) => {
      const x = i < left.length ? -HALF + 0.01 : HALF - 0.01
      rails((y) => [v(x, y, f.zFrom), v(x, y, f.zTo)], 20 + i)
    })
    return out
  }, [left, right, detailed])
  useEffect(() => () => lines.forEach((g) => g.dispose()), [lines])

  const panelLines = useMemo(() => {
    const sub = detailed ? 24 : 8
    return panels.map((p, i) => {
      const out: THREE.BufferGeometry[] = []
      const seam = (points: THREE.Vector3[], seed: number) =>
        out.push(createSketchPolyline(points, { jitter: 0.02, subdivisions: sub, seed, passes: 2 }))
      const at = (x: number, y: number) => v(x, y, 0.016)
      for (const [x0, x1] of [
        [-PANEL / 2, -HOLE_HALF],
        [HOLE_HALF, PANEL / 2],
      ]) {
        RAILS.forEach((y, r) => seam([at(x0, y), at(x1, y)], 60 + i * 4 + r * 10))
        seam([at(x0, 0), at(x1, 0)], 100 + i * 4)
      }
      seam([at(-PANEL / 2, height), at(PANEL / 2, height)], 140 + i)
      const far = p.door.side === 'left' ? PANEL / 2 : -PANEL / 2
      seam([at(far, 0), at(far, height)], 180 + i)
      return out
    })
  }, [panels, detailed])
  useEffect(() => () => panelLines.flat().forEach((g) => g.dispose()), [panelLines])

  useFrame((state, delta) => {
    const { activeDoor, enteringDoor } = worldStore.getState()
    stepDoorTilts(
      state.camera.position.z,
      Math.min(delta, 0.05),
      activeDoor ?? enteringDoor,
      reducedMotion,
    )
    panels.forEach((p, i) => {
      const tilt = getDoorTilt(p.door.id, p.z)
      const group = panelGroups.current[i]
      if (group) {
        const [x, , z] = doorPosition(p.door, p.z, tilt)
        group.position.set(x, 0, z)
        group.rotation.y = doorRotationY(p.door, tilt)
      }
      const step = stepMeshes.current[i]
      if (step) {
        const angle = DOOR_WALL.angle * tilt
        const depth = PANEL * Math.sin(angle)
        const sign = p.door.side === 'left' ? -1 : 1
        step.position.set(
          sign * (HALF - depth / 2),
          height / 2,
          p.z + doorSpan / 2 - PANEL * Math.cos(angle),
        )
        step.scale.x = Math.max(depth / STEP, 0.0001)
        step.visible = depth > 0.002
      }
    })
  })

  const panel = (p: DoorInstance, i: number) => {
    const [px, , pz] = doorPosition(p.door, p.z, 0)
    return (
      <group key={`panel${i}`}>
        <group
          ref={(node) => {
            panelGroups.current[i] = node
          }}
          position={[px, 0, pz]}
          rotation={[0, doorRotationY(p.door, 0), 0]}
        >
          {[-1, 1].map((s) => (
            <group key={s} position={[s * (HOLE_HALF + SIDE_W / 2), 0, 0.004]}>
              <mesh position={[0, height / 2, 0]} material={materials.wall} receiveShadow>
                <planeGeometry args={[SIDE_W, height]} />
              </mesh>
              <group position={[0, SKIRT_H / 2, 0.03]}>
                <mesh geometry={geometries.panelSkirt} material={materials.woodDark} />
                <SketchEdges
                  geometry={geometries.panelSkirt}
                  seed={520 + i * 2 + s}
                  jitter={0.008}
                  subdivisions={4}
                />
              </group>
            </group>
          ))}
          <mesh position={[0, (HOLE_HEIGHT + height) / 2, 0.004]} material={materials.wallUpper}>
            <planeGeometry args={[HOLE_HALF * 2, height - HOLE_HEIGHT]} />
          </mesh>
          {panelLines[i].map((g, n) => (
            <lineSegments key={n} geometry={g} material={materials.line} />
          ))}
        </group>
        <mesh
          ref={(node) => {
            stepMeshes.current[i] = node
          }}
          rotation={[0, Math.PI, 0]}
          material={stepMaterial}
          visible={false}
        >
          <planeGeometry args={[STEP, height]} />
        </mesh>
      </group>
    )
  }

  return (
    <group>
      {[...left, ...right].map((f, i) => {
        const isLeft = i < left.length
        const x = isLeft ? -HALF : HALF
        const mid = (f.zFrom + f.zTo) / 2
        return (
          <group key={`f${i}`}>
            <mesh
              position={[x, height / 2, mid]}
              rotation={[0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0]}
              material={materials.wall}
              receiveShadow
            >
              <planeGeometry args={[f.zFrom - f.zTo, height]} />
            </mesh>
            <group position={[isLeft ? -HALF + 0.03 : HALF - 0.03, SKIRT_H / 2, mid]}>
              <mesh geometry={geometries.fillerSkirt[i]} material={materials.woodDark} />
              <SketchEdges
                geometry={geometries.fillerSkirt[i]}
                seed={500 + i}
                jitter={0.008}
                subdivisions={4}
              />
            </group>
          </group>
        )
      })}
      {panels.map(panel)}
      {lines.map((g, i) => (
        <lineSegments key={`line${i}`} geometry={g} material={materials.line} />
      ))}
    </group>
  )
}
