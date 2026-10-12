import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { DoorDefinition } from '@/data/siteConfig'
import { accentHex } from '@/data/siteConfig'
import { setWorld, useWorld } from '@/shared/store/worldStore'
import { CORRIDOR, doorPosition, doorRotationY } from '@/shared/corridor/corridor'
import { createArrowTexture, createSignTexture } from '@/shared/graphics/textures/doorSigns'
import { openSection } from '@/app/navigation'
import { DoorLeaf } from './DoorLeaf'
import { DoorMarker } from './DoorMarker'
import { getDoorTilt } from './doorTilt'
import { InteractiveHotspot } from '@/features/world/corridor/components/InteractiveHotspot'
import { useScene } from '@/features/world/scene/SceneContext'
import { SketchEdges } from '@/features/world/corridor/components/SketchEdges'

const W = CORRIDOR.door.width
const H = CORRIDOR.door.height
const FRAME = 0.17
const FRAME_DEPTH = 0.3
const SIGN_W = 1.5
const SIGN_H = 0.47
const ARROW_IDLE = 0.45

interface DoorProps {
  door: DoorDefinition
  index: number
  z: number
  twin?: boolean
}

export function Door({ door, index, z, twin = false }: DoorProps) {
  const { materials, quality, reducedMotion, touch } = useScene()
  const light = useRef<THREE.PointLight>(null)
  const root = useRef<THREE.Group>(null)
  const sign = useRef<THREE.Group>(null)
  const swing = useRef(0)
  const arrowLevel = useRef(ARROW_IDLE)

  const hovered = useWorld((s) => !twin && s.hoveredDoor === door.id)
  const entering = useWorld((s) => !twin && s.enteringDoor === door.id)
  const active = useWorld((s) => !twin && s.activeDoor === door.id)
  const accent = accentHex[door.accent]

  const geometries = useMemo(
    () => ({
      jamb: new THREE.BoxGeometry(FRAME, H + FRAME, FRAME_DEPTH),
      lintel: new THREE.BoxGeometry(W + FRAME * 2, FRAME, FRAME_DEPTH),
      reveal: new THREE.BoxGeometry(0.05, H, FRAME_DEPTH - 0.08),
      head: new THREE.BoxGeometry(W + 0.1, 0.05, FRAME_DEPTH - 0.08),
      step: new THREE.BoxGeometry(W + 0.3, 0.03, 0.5),
      sign: new THREE.BoxGeometry(SIGN_W, SIGN_H, 0.05),
      chain: new THREE.CylinderGeometry(0.008, 0.008, 0.32, 4),
      bracket: new THREE.BoxGeometry(0.12, 0.04, 0.12),
      arrow: new THREE.PlaneGeometry(0.6, 0.3),
    }),
    [],
  )

  const textures = useMemo(
    () => ({ sign: createSignTexture(door.label), arrow: createArrowTexture() }),
    [door.label],
  )

  const localMaterials = useMemo(
    () => ({
      casing: new THREE.MeshToonMaterial({
        color: '#f7f3ea',
        gradientMap: materials.wall.gradientMap,
      }),
      reveal: new THREE.MeshToonMaterial({
        color: '#d9cdb6',
        gradientMap: materials.wall.gradientMap,
      }),
      sign: new THREE.MeshBasicMaterial({ map: textures.sign, toneMapped: false }),
      arrow: new THREE.MeshBasicMaterial({
        map: textures.arrow,
        transparent: true,
        opacity: ARROW_IDLE,
        toneMapped: false,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    }),
    [textures, materials],
  )

  useEffect(() => () => Object.values(geometries).forEach((g) => g.dispose()), [geometries])
  useEffect(
    () => () => {
      Object.values(textures).forEach((t) => t.dispose())
      Object.values(localMaterials).forEach((m) => m.dispose())
    },
    [textures, localMaterials],
  )

  useFrame((state, delta) => {
    if (root.current) {
      const tilt = getDoorTilt(door.id, z)
      root.current.position.set(...doorPosition(door, z, tilt))
      root.current.rotation.y = doorRotationY(door, tilt)
    }
    if (light.current) {
      const warmth = Math.min(1, swing.current / 0.3)
      light.current.intensity = 0.3 + warmth * 2.4
    }
    const arrowTarget = hovered && !active ? 1 : ARROW_IDLE
    const arrows = reducedMotion
      ? arrowTarget
      : arrowLevel.current + (arrowTarget - arrowLevel.current) * (1 - Math.exp(-delta * 8))
    if (arrows !== arrowLevel.current) {
      arrowLevel.current = arrows
      localMaterials.arrow.opacity = arrows
    }
    if (sign.current && !reducedMotion) {
      sign.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 0.9 + index) * 0.012 * (1 + (arrows - ARROW_IDLE) * 2)
    }
  })

  const position = doorPosition(door, z, 0)
  const rotationY = doorRotationY(door, 0)
  const lit = quality !== 'low' && !twin

  return (
    <group ref={root} position={position} rotation={[0, rotationY, 0]}>
      <InteractiveHotspot
        onActivate={() => openSection(door.id)}
        onHoverChange={(isHovered) => setWorld({ hoveredDoor: isHovered ? door.id : null })}
        hitArea={[W + FRAME * 2, H + FRAME, touch ? 1.2 : 0.02]}
        hitAreaPosition={[0, FRAME / 2, touch ? 0.2 : 0.03]}
        disabled={active || twin}
      >
        <group position={[0, FRAME / 2, 0.02]}>
          {[-1, 1].map((s) => (
            <group key={`reveal${s}`} position={[s * (W / 2 + 0.022), -FRAME / 2, -0.06]}>
              <mesh geometry={geometries.reveal} material={localMaterials.reveal} />
            </group>
          ))}
          <mesh
            position={[0, H / 2 - 0.028, -0.06]}
            geometry={geometries.head}
            material={localMaterials.reveal}
          />
          {[-1, 1].map((s) => (
            <group key={s} position={[s * (W / 2 + FRAME / 2), -FRAME / 2, 0]}>
              <mesh
                geometry={geometries.jamb}
                material={localMaterials.casing}
                castShadow={quality === 'high'}
              />
              <SketchEdges
                geometry={geometries.jamb}
                seed={index * 7 + 1 + s}
                jitter={0.01}
                subdivisions={5}
                passes={3}
              />
            </group>
          ))}
          <group position={[0, H / 2, 0]}>
            <mesh geometry={geometries.lintel} material={localMaterials.casing} />
            <SketchEdges
              geometry={geometries.lintel}
              seed={index * 7 + 3}
              jitter={0.01}
              subdivisions={5}
              passes={3}
            />
          </group>
        </group>

        <DoorLeaf
          door={door}
          index={index}
          accent={accent}
          hovered={hovered}
          entering={entering}
          active={active}
          swing={swing}
        />

        <mesh
          position={[-(W / 2 + 0.62), 0.15, 0.05]}
          geometry={geometries.arrow}
          material={localMaterials.arrow}
          raycast={() => null}
        />
        <mesh
          position={[W / 2 + 0.62, -0.15, 0.05]}
          rotation={[0, Math.PI, 0]}
          geometry={geometries.arrow}
          material={localMaterials.arrow}
          raycast={() => null}
        />
      </InteractiveHotspot>

      <group position={[0, H / 2 + FRAME + 0.34, 0.06]}>
        <mesh position={[0, 0.3, 0]} geometry={geometries.bracket} material={materials.woodDark} />
        <group ref={sign}>
          {[-0.55, 0.55].map((x) => (
            <mesh
              key={x}
              position={[x, 0.14, 0]}
              geometry={geometries.chain}
              material={materials.woodDark}
            />
          ))}
          <group position={[0, -SIGN_H / 2 + 0.02, 0]}>
            <mesh geometry={geometries.sign} material={materials.woodDark} />
            <SketchEdges
              geometry={geometries.sign}
              seed={index * 7 + 8}
              jitter={0.01}
              subdivisions={5}
              passes={2}
            />
            <mesh position={[0, 0, 0.027]} material={localMaterials.sign}>
              <planeGeometry args={[SIGN_W - 0.02, SIGN_H - 0.02]} />
            </mesh>
          </group>
        </group>
      </group>

      {!twin && (
        <DoorMarker
          z={z}
          index={index}
          accent={accent}
          y={H / 2 + FRAME + 0.86}
          hidden={hovered || entering || active}
        />
      )}

      <group position={[0, -H / 2 + 0.015, 0.3]}>
        <mesh geometry={geometries.step} material={materials.woodDark} />
        <SketchEdges
          geometry={geometries.step}
          seed={index * 7 + 6}
          jitter={0.006}
          subdivisions={4}
          tone="soft"
        />
      </group>

      {lit && (
        <pointLight
          ref={light}
          position={[0, 0.7, -1.3]}
          color="#fff3dc"
          intensity={0.3}
          distance={4.5}
          decay={2}
        />
      )}
    </group>
  )
}
