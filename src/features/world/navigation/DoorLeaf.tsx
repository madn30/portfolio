import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { DoorDefinition } from '@/data/siteConfig'
import { CORRIDOR } from '@/shared/corridor/corridor'
import { play } from '@/app/audio'
import { createDoorFaceTexture } from '@/shared/graphics/textures/doorFace'
import { RevealMaterial } from '@/features/world/scene/RevealMaterial'
import { useScene } from '@/features/world/scene/SceneContext'
import { SketchEdges } from '@/features/world/corridor/components/SketchEdges'
import { doorPush, HANDLE_X, HANDLE_Y, LEAF_Z, LEVER_TURN, pushPose } from './doorPush'

const W = CORRIDOR.door.width
const H = CORRIDOR.door.height

interface DoorLeafProps {
  door: DoorDefinition
  index: number
  accent: string
  hovered: boolean
  entering: boolean
  active: boolean
  swing: RefObject<number>
}

export function DoorLeaf({ door, index, accent, hovered, entering, active, swing }: DoorLeafProps) {
  const { materials, quality, reducedMotion } = useScene()
  const hinge = useRef<THREE.Group>(null)
  const handle = useRef<THREE.Group>(null)
  const painted = useRef<THREE.Mesh>(null)
  const open = useRef(0)
  const turn = useRef(0)
  const paint = useRef(0)
  const pushed = useRef(false)

  const geometries = useMemo(
    () => ({
      panel: new THREE.BoxGeometry(W, H, 0.06),
      face: new THREE.PlaneGeometry(W - 0.02, H - 0.02),
      lever: new THREE.BoxGeometry(0.2, 0.034, 0.034),
      boss: new THREE.CylinderGeometry(0.03, 0.03, 0.04, 10),
    }),
    [],
  )
  const textures = useMemo(
    () => ({
      sketch: createDoorFaceTexture(door.id, accent, index + 1),
      painted: createDoorFaceTexture(door.id, accent, index + 1, { painted: true }),
      back: createDoorFaceTexture(door.id, accent, index + 1, { back: true }),
    }),
    [door.id, accent, index],
  )
  const localMaterials = useMemo(() => {
    const sketch = new RevealMaterial({
      map: textures.sketch,
      transparent: true,
      alphaTest: 0.1,
      toneMapped: false,
    })
    return {
      sketch,
      painted: new THREE.MeshBasicMaterial({ map: textures.painted, toneMapped: false }),
      back: new THREE.MeshBasicMaterial({ map: textures.back, toneMapped: false }),
      lever: new THREE.MeshToonMaterial({
        color: '#c9a24a',
        gradientMap: materials.wall.gradientMap,
      }),
    }
  }, [textures, materials])

  useEffect(() => () => Object.values(geometries).forEach((g) => g.dispose()), [geometries])
  useEffect(
    () => () => {
      Object.values(textures).forEach((t) => t.dispose())
      Object.values(localMaterials).forEach((m) => m.dispose())
    },
    [textures, localMaterials],
  )

  useFrame((_, delta) => {
    const ease = (current: number, target: number, rate: number) =>
      reducedMotion ? target : current + (target - current) * (1 - Math.exp(-delta * rate))

    const push = entering && doorPush.door === door.id ? pushPose(doorPush.time) : null
    if (push && push.swing > 0 && !pushed.current) play('doorOpen')
    pushed.current = push !== null && push.swing > 0
    const openTarget = active || entering ? 1.42 : hovered ? 0.16 : 0
    const nextOpen = push
      ? Math.max(open.current, push.open)
      : ease(open.current, openTarget, openTarget > open.current ? 4.5 : 3)
    if (Math.abs(nextOpen - open.current) > 0.0003) {
      open.current = nextOpen
      swing.current = nextOpen
      if (hinge.current) hinge.current.rotation.y = nextOpen
    }

    const turnTarget = active || entering ? LEVER_TURN : hovered ? 0.1 : 0
    const nextTurn = push
      ? Math.max(turn.current, LEVER_TURN * push.press)
      : ease(turn.current, turnTarget, turnTarget > turn.current ? 12 : 7)
    if (push) {
      doorPush.open = nextOpen
      doorPush.turn = nextTurn
    }
    if (Math.abs(nextTurn - turn.current) > 0.0003) {
      turn.current = nextTurn
      if (handle.current) handle.current.rotation.z = nextTurn
    }

    const paintTarget = hovered || entering || active ? 1 : 0
    const nextPaint = ease(paint.current, paintTarget, paintTarget > paint.current ? 4 : 5)
    if (Math.abs(nextPaint - paint.current) > 0.0005) {
      paint.current = nextPaint
      localMaterials.sketch.progress = nextPaint
      if (painted.current) painted.current.visible = nextPaint > 0.001
    }
  })

  return (
    <group position={[-W / 2, 0, LEAF_Z]}>
      <group ref={hinge}>
        <group position={[W / 2, 0, 0]}>
          <mesh
            geometry={geometries.panel}
            material={materials.wood}
            castShadow={quality === 'high'}
          />
          <SketchEdges
            geometry={geometries.panel}
            seed={index * 7 + 4}
            jitter={0.012}
            subdivisions={6}
            passes={3}
          />
          <mesh
            ref={painted}
            visible={false}
            position={[0, 0, 0.031]}
            geometry={geometries.face}
            material={localMaterials.painted}
          />
          <mesh
            position={[0, 0, 0.032]}
            geometry={geometries.face}
            material={localMaterials.sketch}
          />
          <mesh
            position={[0, 0, -0.031]}
            rotation={[0, Math.PI, 0]}
            geometry={geometries.face}
            material={localMaterials.back}
          />
          <group ref={handle} position={[HANDLE_X, HANDLE_Y, 0.05]}>
            <mesh
              geometry={geometries.boss}
              material={localMaterials.lever}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <mesh
              position={[-0.1, 0, 0.012]}
              geometry={geometries.lever}
              material={localMaterials.lever}
            />
            <SketchEdges
              geometry={geometries.lever}
              position={[-0.1, 0, 0.012]}
              seed={index * 7 + 9}
              jitter={0.004}
              subdivisions={3}
              passes={1}
            />
          </group>
        </group>
      </group>
    </group>
  )
}
