import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { play } from '@/app/audio'
import { walkThroughLoopDoor } from '@/app/navigation'
import { loopDoor } from '@/data/siteConfig'
import { CORRIDOR, loopDoorOpenAmount } from '@/shared/corridor/corridor'
import { createSketchPolyline } from '@/shared/graphics/sketch'
import { createInfinityTexture } from '@/shared/graphics/textures/doorSigns'
import { createHandwritingTexture } from '@/shared/graphics/textures/handwriting'
import { InteractiveHotspot } from '@/features/world/corridor/components/InteractiveHotspot'
import { LoopDoorDecor } from './LoopDoorDecor'
import { useScene } from '@/features/world/scene/SceneContext'
import { SketchEdges } from '@/features/world/corridor/components/SketchEdges'

const W = CORRIDOR.loopDoor.width
const H = CORRIDOR.loopDoor.height
const LEAF = W / 2
const FRAME = 0.12
const SWING = 1.55
const HANDLE_TURN = 0.4
const HANDLE_WINDOW = 0.12
const SOUND_AT = 0.04

function v(x: number, y: number, z: number): THREE.Vector3 {
  return new THREE.Vector3(x, y, z)
}

interface LoopDoorProps {
  zOffset?: number
}

export function LoopDoor({ zOffset = 0 }: LoopDoorProps) {
  const { materials, quality, reducedMotion, touch } = useScene()
  const decorative = zOffset !== 0
  const camera = useThree((state) => state.camera)
  const leftHinge = useRef<THREE.Group>(null)
  const rightHinge = useRef<THREE.Group>(null)
  const leftHandle = useRef<THREE.Group>(null)
  const rightHandle = useRef<THREE.Group>(null)
  const openAmount = useRef(0)
  const hovered = useRef(false)

  const geometries = useMemo(
    () => ({
      leaf: new THREE.BoxGeometry(LEAF, H, 0.06),
      jamb: new THREE.BoxGeometry(FRAME, H + FRAME, 0.2),
      lintel: new THREE.BoxGeometry(W + FRAME * 2, FRAME, 0.2),
      boss: new THREE.CylinderGeometry(0.03, 0.03, 0.04, 10),
      lever: new THREE.BoxGeometry(0.18, 0.032, 0.032),
      step: new THREE.BoxGeometry(W + 0.4, 0.03, 0.5),
      decal: new THREE.PlaneGeometry(LEAF - 0.06, H - 0.1),
      code: new THREE.PlaneGeometry(2.1, 1.05),
      note: new THREE.PlaneGeometry(1.3, 0.54),
    }),
    [],
  )

  const panelLines = useMemo(() => {
    const z = 0.034
    const rect = (x0: number, y0: number, x1: number, y1: number, seed: number) =>
      createSketchPolyline([v(x0, y0, z), v(x1, y0, z), v(x1, y1, z), v(x0, y1, z), v(x0, y0, z)], {
        jitter: 0.008,
        subdivisions: 4,
        seed,
        passes: 2,
      })
    return [
      rect(-LEAF * 0.3, -H * 0.42, LEAF * 0.3, -H * 0.1, 91),
      rect(-LEAF * 0.3, -H * 0.42, LEAF * 0.3, -H * 0.1, 92),
    ]
  }, [])

  const textures = useMemo(
    () => ({
      left: createInfinityTexture('left'),
      right: createInfinityTexture('right'),
      code: createHandwritingTexture({
        lines: loopDoor.code,
        font: 'code',
        fontSize: 58,
        width: 512,
        height: 256,
      }),
      note: createHandwritingTexture({
        lines: [loopDoor.note],
        fontSize: 60,
        width: 512,
        height: 212,
        color: '#6b625a',
      }),
    }),
    [],
  )
  const localMaterials = useMemo(() => {
    const decal = (map: THREE.Texture) =>
      new THREE.MeshBasicMaterial({
        map,
        transparent: true,
        toneMapped: false,
        depthWrite: false,
      })
    return {
      left: decal(textures.left),
      right: decal(textures.right),
      code: decal(textures.code),
      note: decal(textures.note),
      handle: new THREE.MeshToonMaterial({
        color: '#4f7fc9',
        gradientMap: materials.wall.gradientMap,
      }),
    }
  }, [textures, materials])

  useEffect(
    () => () => {
      Object.values(geometries).forEach((g) => g.dispose())
      panelLines.forEach((g) => g.dispose())
    },
    [geometries, panelLines],
  )
  useEffect(
    () => () => {
      Object.values(textures).forEach((t) => t.dispose())
      Object.values(localMaterials).forEach((m) => m.dispose())
    },
    [textures, localMaterials],
  )

  useFrame((_, delta) => {
    const target = Math.min(
      1,
      loopDoorOpenAmount(camera.position.z - zOffset) + (hovered.current ? 0.12 : 0),
    )
    const current = openAmount.current
    const next = reducedMotion
      ? target
      : current + (target - current) * (1 - Math.exp(-delta * 3.5))
    if (Math.abs(next - current) < 0.0005 && Math.abs(target - current) < 0.0005) return
    openAmount.current = next
    if (!decorative) {
      if (current < SOUND_AT && next >= SOUND_AT) play('open')
      if (current > SOUND_AT && next <= SOUND_AT) play('close')
    }
    const turn = Math.min(1, next / HANDLE_WINDOW) * HANDLE_TURN
    const swing = Math.max(0, (next - HANDLE_WINDOW * 0.5) / (1 - HANDLE_WINDOW * 0.5)) * SWING
    if (leftHinge.current) leftHinge.current.rotation.y = swing
    if (rightHinge.current) rightHinge.current.rotation.y = -swing
    if (leftHandle.current) leftHandle.current.rotation.z = turn
    if (rightHandle.current) rightHandle.current.rotation.z = -turn
  })

  const leaf = (side: 'left' | 'right') => {
    const sign = side === 'left' ? 1 : -1
    return (
      <group position={[-sign * (W / 2), 0, 0.04]}>
        <group ref={side === 'left' ? leftHinge : rightHinge}>
          <group position={[sign * (LEAF / 2), 0, 0]}>
            <mesh
              geometry={geometries.leaf}
              material={materials.wood}
              castShadow={quality === 'high'}
            />
            <SketchEdges
              geometry={geometries.leaf}
              seed={side === 'left' ? 81 : 82}
              jitter={0.01}
              subdivisions={5}
            />
            <lineSegments
              geometry={panelLines[side === 'left' ? 0 : 1]}
              material={materials.lineSoft}
            />
            <mesh
              position={[0, 0, 0.034]}
              geometry={geometries.decal}
              material={side === 'left' ? localMaterials.left : localMaterials.right}
            />
            <group
              ref={side === 'left' ? leftHandle : rightHandle}
              position={[sign * (LEAF / 2 - 0.14), -0.04, 0.05]}
            >
              <mesh
                geometry={geometries.boss}
                material={localMaterials.handle}
                rotation={[Math.PI / 2, 0, 0]}
              />
              <mesh
                position={[-sign * 0.09, 0, 0.012]}
                geometry={geometries.lever}
                material={localMaterials.handle}
              />
              <SketchEdges
                geometry={geometries.lever}
                position={[-sign * 0.09, 0, 0.012]}
                seed={side === 'left' ? 88 : 89}
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

  return (
    <group position={[0, H / 2, CORRIDOR.zEnd + zOffset]}>
      <InteractiveHotspot
        onActivate={walkThroughLoopDoor}
        onHoverChange={(isHovered) => {
          hovered.current = isHovered
        }}
        hitArea={[W + 0.5, H + 0.4, touch ? 1.2 : 0.5]}
        hitAreaPosition={[0, 0.1, 0.2]}
        disabled={decorative}
      >
        <group position={[0, FRAME / 2, 0.02]}>
          {[-1, 1].map((s) => (
            <group key={s} position={[s * (W / 2 + FRAME / 2), -FRAME / 2, 0]}>
              <mesh
                geometry={geometries.jamb}
                material={materials.woodDark}
                castShadow={quality === 'high'}
              />
              <SketchEdges
                geometry={geometries.jamb}
                seed={83 + s}
                jitter={0.008}
                subdivisions={4}
              />
            </group>
          ))}
          <group position={[0, H / 2, 0]}>
            <mesh geometry={geometries.lintel} material={materials.woodDark} />
            <SketchEdges geometry={geometries.lintel} seed={86} jitter={0.008} subdivisions={4} />
          </group>
        </group>

        {leaf('left')}
        {leaf('right')}
      </InteractiveHotspot>

      <group position={[0, -H / 2 + 0.015, 0.3]}>
        <mesh geometry={geometries.step} material={materials.woodDark} />
        <SketchEdges
          geometry={geometries.step}
          seed={87}
          jitter={0.006}
          subdivisions={4}
          tone="soft"
        />
      </group>

      <mesh
        position={[0, H / 2 + 0.72, 0.03]}
        geometry={geometries.code}
        material={localMaterials.code}
      />
      <mesh
        position={[W / 2 + 1.05, 0.55, 0.03]}
        geometry={geometries.note}
        material={localMaterials.note}
      />
      <LoopDoorDecor />
    </group>
  )
}
