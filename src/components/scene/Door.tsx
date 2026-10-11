import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { DoorDefinition } from '@/data/siteConfig'
import { accentHex } from '@/data/siteConfig'
import { useFontsReady } from '@/hooks/useFontsReady'
import { setWorld, useWorld } from '@/store/worldStore'
import { CORRIDOR, doorPosition, doorRotationY } from '@/utils/corridor'
import { createSketchPolyline } from '@/utils/sketch'
import { createLabelTexture } from '@/utils/textures'
import { openSection } from '@/app/navigation'
import { InteractiveHotspot } from './InteractiveHotspot'
import { useScene } from './SceneContext'
import { SketchEdges } from './SketchEdges'

const W = CORRIDOR.door.width
const H = CORRIDOR.door.height
const FRAME = 0.12
const ALCOVE_DEPTH = 1.9
const ALCOVE_WIDTH = 2.2

interface DoorProps {
  door: DoorDefinition
  index: number
}

function v(x: number, y: number, z: number): THREE.Vector3 {
  return new THREE.Vector3(x, y, z)
}

/**
 * A door with frame, hinged panel, plaque, and a small lit alcove behind it.
 * Hover: the door cracks open and the alcove light warms up. Active: fully open.
 */
export function Door({ door, index }: DoorProps) {
  const { materials, quality, reducedMotion, touch } = useScene()
  const fontsReady = useFontsReady()
  const hinge = useRef<THREE.Group>(null)
  const light = useRef<THREE.PointLight>(null)
  const plaque = useRef<THREE.Mesh>(null)
  const openAmount = useRef(0)

  const hovered = useWorld((s) => s.hoveredDoor === door.id)
  const entering = useWorld((s) => s.enteringDoor === door.id)
  const active = useWorld((s) => s.activeDoor === door.id)
  const accent = accentHex[door.accent]

  const geometries = useMemo(
    () => ({
      panel: new THREE.BoxGeometry(W, H, 0.06),
      jamb: new THREE.BoxGeometry(FRAME, H + FRAME, 0.2),
      lintel: new THREE.BoxGeometry(W + FRAME * 2, FRAME, 0.2),
      knob: new THREE.SphereGeometry(0.045, 10, 8),
      plaque: new THREE.PlaneGeometry(0.72, 0.27),
      step: new THREE.BoxGeometry(W + 0.3, 0.03, 0.5),
    }),
    [],
  )

  // Inset panels drawn on the door face: the "two rectangles" every sketched door has.
  const panelLines = useMemo(() => {
    const z = 0.034
    const rect = (x0: number, y0: number, x1: number, y1: number, seed: number) =>
      createSketchPolyline([v(x0, y0, z), v(x1, y0, z), v(x1, y1, z), v(x0, y1, z), v(x0, y0, z)], {
        jitter: 0.008,
        subdivisions: 4,
        seed,
        passes: 2,
      })
    const upper = rect(-W * 0.32, H * 0.08, W * 0.32, H * 0.4, index * 10 + 1)
    const lower = rect(-W * 0.32, -H * 0.42, W * 0.32, -H * 0.06, index * 10 + 2)
    return [upper, lower]
  }, [index])

  const labelTexture = useMemo(
    () =>
      createLabelTexture({
        title: door.label,
        subtitle: `No. ${door.number}`,
        accent,
      }),
    // Redraw once fonts arrive so the plaque uses the real typefaces.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [door.label, door.number, accent, fontsReady],
  )

  const localMaterials = useMemo(
    () => ({
      knob: new THREE.MeshToonMaterial({ color: accent, gradientMap: materials.wall.gradientMap }),
      label: new THREE.MeshBasicMaterial({ map: labelTexture, toneMapped: false }),
      glow: new THREE.MeshBasicMaterial({ color: '#ffe6c2', transparent: true, opacity: 0 }),
    }),
    [accent, labelTexture, materials],
  )

  useEffect(
    () => () => {
      Object.values(geometries).forEach((g) => g.dispose())
      panelLines.forEach((g) => g.dispose())
    },
    [geometries, panelLines],
  )
  useEffect(
    () => () => {
      labelTexture.dispose()
      Object.values(localMaterials).forEach((m) => m.dispose())
    },
    [labelTexture, localMaterials],
  )

  useFrame((_, delta) => {
    const target = active ? 1.25 : entering ? 1.05 : hovered ? 0.16 : 0
    const current = openAmount.current
    const next = reducedMotion
      ? target
      : current + (target - current) * (1 - Math.exp(-delta * (target > current ? 4.5 : 3)))
    if (Math.abs(next - current) < 0.0005 && Math.abs(target - current) < 0.0005) return
    openAmount.current = next
    if (hinge.current) hinge.current.rotation.y = next
    const warmth = Math.min(1, next / 0.3)
    if (light.current) light.current.intensity = 0.3 + warmth * 3.2
    localMaterials.glow.opacity = warmth * 0.55
    if (plaque.current) plaque.current.position.z = 0.02 + (hovered ? 0.02 : 0) * warmth
  })

  const position = doorPosition(door)
  const rotationY = doorRotationY(door)
  const lit = quality !== 'low'

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <InteractiveHotspot
        onActivate={() => openSection(door.id)}
        onHoverChange={(isHovered) => setWorld({ hoveredDoor: isHovered ? door.id : null })}
        hitArea={[W + 0.5, H + 0.4, touch ? 1.2 : 0.5]}
        hitAreaPosition={[0, 0.1, 0.2]}
        disabled={active}
      >
        {/* Frame */}
        <group position={[0, FRAME / 2, 0.02]}>
          <mesh
            position={[-(W / 2 + FRAME / 2), -FRAME / 2, 0]}
            geometry={geometries.jamb}
            material={materials.woodDark}
            castShadow={quality === 'high'}
          />
          <SketchEdges
            geometry={geometries.jamb}
            position={[-(W / 2 + FRAME / 2), -FRAME / 2, 0]}
            seed={index * 7 + 1}
            jitter={0.008}
            subdivisions={4}
          />
          <mesh
            position={[W / 2 + FRAME / 2, -FRAME / 2, 0]}
            geometry={geometries.jamb}
            material={materials.woodDark}
            castShadow={quality === 'high'}
          />
          <SketchEdges
            geometry={geometries.jamb}
            position={[W / 2 + FRAME / 2, -FRAME / 2, 0]}
            seed={index * 7 + 2}
            jitter={0.008}
            subdivisions={4}
          />
          <mesh
            position={[0, H / 2, 0]}
            geometry={geometries.lintel}
            material={materials.woodDark}
          />
          <SketchEdges
            geometry={geometries.lintel}
            position={[0, H / 2, 0]}
            seed={index * 7 + 3}
            jitter={0.008}
            subdivisions={4}
          />
        </group>

        {/* Hinged panel */}
        <group position={[-W / 2, 0, 0.04]}>
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
                jitter={0.01}
                subdivisions={5}
              />
              {panelLines.map((g, i) => (
                <lineSegments key={i} geometry={g} material={materials.lineSoft} />
              ))}
              <mesh
                position={[W / 2 - 0.16, -0.04, 0.06]}
                geometry={geometries.knob}
                material={localMaterials.knob}
              />
              <SketchEdges
                geometry={geometries.knob}
                position={[W / 2 - 0.16, -0.04, 0.06]}
                seed={index * 7 + 5}
                jitter={0.004}
                subdivisions={2}
                passes={1}
                thresholdAngle={40}
              />
            </group>
          </group>
        </group>

        {/* Plaque beside the door */}
        <mesh
          ref={plaque}
          position={[W / 2 + 0.58, 0.38, 0.02]}
          geometry={geometries.plaque}
          material={localMaterials.label}
        />
      </InteractiveHotspot>

      {/* Threshold step */}
      <mesh
        position={[0, -H / 2 + 0.015, 0.3]}
        geometry={geometries.step}
        material={materials.woodDark}
      />
      <SketchEdges
        geometry={geometries.step}
        position={[0, -H / 2 + 0.015, 0.3]}
        seed={index * 7 + 6}
        jitter={0.006}
        subdivisions={4}
        tone="soft"
      />

      {/* Alcove behind the door */}
      <group position={[0, 0, -0.02]}>
        <mesh position={[0, 0, -ALCOVE_DEPTH]} material={materials.alcove}>
          <planeGeometry args={[ALCOVE_WIDTH, H + 0.1]} />
        </mesh>
        <mesh
          position={[-ALCOVE_WIDTH / 2, 0, -ALCOVE_DEPTH / 2]}
          rotation={[0, Math.PI / 2, 0]}
          material={materials.alcove}
        >
          <planeGeometry args={[ALCOVE_DEPTH, H + 0.1]} />
        </mesh>
        <mesh
          position={[ALCOVE_WIDTH / 2, 0, -ALCOVE_DEPTH / 2]}
          rotation={[0, -Math.PI / 2, 0]}
          material={materials.alcove}
        >
          <planeGeometry args={[ALCOVE_DEPTH, H + 0.1]} />
        </mesh>
        <mesh
          position={[0, -H / 2, -ALCOVE_DEPTH / 2]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={materials.floor}
        >
          <planeGeometry args={[ALCOVE_WIDTH, ALCOVE_DEPTH]} />
        </mesh>
        <mesh
          position={[0, H / 2 + 0.05, -ALCOVE_DEPTH / 2]}
          rotation={[Math.PI / 2, 0, 0]}
          material={materials.ceiling}
        >
          <planeGeometry args={[ALCOVE_WIDTH, ALCOVE_DEPTH]} />
        </mesh>
        {/* Warm glow that fades in as the door opens */}
        <mesh position={[0, 0, -ALCOVE_DEPTH + 0.02]} material={localMaterials.glow}>
          <planeGeometry args={[ALCOVE_WIDTH - 0.2, H - 0.2]} />
        </mesh>
        {lit && (
          <pointLight
            ref={light}
            position={[0, 0.7, -1.3]}
            color="#ffd9a8"
            intensity={0.3}
            distance={4.5}
            decay={2}
          />
        )}
      </group>
    </group>
  )
}
