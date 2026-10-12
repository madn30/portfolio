import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { about } from '@/data/about'
import { accentHex } from '@/data/siteConfig'
import { createCardTexture } from '@/shared/graphics/cardTexture'
import { createSketchPolyline } from '@/shared/graphics/sketch'
import { InteractiveHotspot } from '@/features/world/corridor/components/InteractiveHotspot'
import { useScene } from '@/features/world/scene/SceneContext'
import { SketchEdges } from '@/features/world/corridor/components/SketchEdges'
import { HoverLift } from '@/features/world/rooms/ambient'
import type { Flight, Vec3 } from '@/features/world/rooms/flight'
import { useToonMaterials } from '@/features/world/rooms/helpers'
import { Note } from '@/features/world/rooms/shared'
import { SkyCloud } from '@/features/world/rooms/sky'
import { flyToMilestone } from './aboutState'
import { Milestone } from './Milestone'
import { milestoneAt } from './stream'

const BALLOON_AT: Vec3 = [3.9, 4.1, 0]

interface HotAirBalloonProps {
  body: string
  hovered: boolean
  onHover: (hovered: boolean) => void
}

function HotAirBalloon({ body, hovered, onHover }: HotAirBalloonProps) {
  const { materials: scene, reducedMotion, touch } = useScene()
  const materials = useToonMaterials({
    envelope: '#d2483c',
    skirt: '#e0a63a',
    basket: '#c8955c',
    board: '#fbfaf7',
    mast: '#7a4e2b',
  })
  const pennant = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ffd34d', toneMapped: false }),
    [],
  )
  const group = useRef<THREE.Group>(null)
  const geometries = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.lineTo(0, 0.26)
    shape.lineTo(0.38, 0.13)
    shape.closePath()
    return {
      envelope: new THREE.SphereGeometry(0.95, 10, 8),
      skirt: new THREE.CylinderGeometry(0.5, 0.2, 0.45, 10),
      basket: new THREE.BoxGeometry(0.56, 0.42, 0.56),
      board: new THREE.BoxGeometry(2.0, 1.1, 0.03),
      face: new THREE.PlaneGeometry(2.0, 1.1),
      mast: new THREE.BoxGeometry(0.02, 0.36, 0.02),
      pennant: new THREE.ShapeGeometry(shape),
    }
  }, [])
  const ropes = useMemo(() => {
    const corners: [number, number][] = [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]
    const lines = corners.map(([sx, sz], i) =>
      createSketchPolyline(
        [
          new THREE.Vector3(sx * 0.17, -1.2, sz * 0.17),
          new THREE.Vector3(sx * 0.27, -1.95, sz * 0.27),
        ],
        { jitter: 0.004, subdivisions: 3, seed: 230 + i },
      ),
    )
    ;[-1, 1].forEach((sx, i) =>
      lines.push(
        createSketchPolyline(
          [new THREE.Vector3(sx * 0.25, -2.37, 0.02), new THREE.Vector3(sx * 0.9, -2.75, 0.02)],
          { jitter: 0.004, subdivisions: 3, seed: 240 + i },
        ),
      ),
    )
    return lines
  }, [])
  const banner = useMemo(() => {
    const texture = createCardTexture({
      eyebrow: 'right now',
      body,
      accent: accentHex.terracotta,
      width: 1024,
      height: 563,
      titleSize: 120,
      bodySize: 66,
      seed: 5,
    })
    return { texture, material: new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }) }
  }, [body])
  useEffect(
    () => () => {
      Object.values(geometries).forEach((g) => g.dispose())
      ropes.forEach((g) => g.dispose())
      banner.texture.dispose()
      banner.material.dispose()
      pennant.dispose()
    },
    [geometries, ropes, banner, pennant],
  )

  useFrame((state) => {
    if (reducedMotion || !group.current) return
    const t = state.clock.elapsedTime
    group.current.position.set(
      BALLOON_AT[0] + Math.sin(t * 0.09) * 0.5,
      BALLOON_AT[1] + Math.sin(t * 0.33) * 0.16,
      BALLOON_AT[2],
    )
    group.current.rotation.z = Math.sin(t * 0.27) * 0.025
  })

  return (
    <group ref={group} position={BALLOON_AT}>
      <InteractiveHotspot
        label="Current focus"
        onActivate={() => flyToMilestone('focus')}
        onHoverChange={onHover}
        hitArea={[2.2, 4.7, touch ? 1.4 : 1.0]}
        hitAreaPosition={[0, -1.15, 0]}
      >
        <HoverLift hovered={hovered} lift={0.12} scale={1.03}>
          <group scale={[1, 1.12, 1]}>
            <mesh geometry={geometries.envelope} material={materials.envelope} />
            <SketchEdges
              geometry={geometries.envelope}
              seed={231}
              jitter={0.012}
              subdivisions={3}
              thresholdAngle={20}
            />
          </group>
          <mesh position={[0, 1.24, 0]} geometry={geometries.mast} material={materials.mast} />
          <mesh position={[0.01, 1.16, 0]} geometry={geometries.pennant} material={pennant} />
          <mesh position={[0, -1.0, 0]} geometry={geometries.skirt} material={materials.skirt} />
          <SketchEdges
            geometry={geometries.skirt}
            position={[0, -1.0, 0]}
            seed={232}
            jitter={0.008}
            subdivisions={3}
            thresholdAngle={30}
          />
          {ropes.map((g, i) => (
            <lineSegments key={i} geometry={g} material={scene.line} />
          ))}
          <mesh position={[0, -2.16, 0]} geometry={geometries.basket} material={materials.basket} />
          <SketchEdges
            geometry={geometries.basket}
            position={[0, -2.16, 0]}
            seed={233}
            jitter={0.008}
            subdivisions={4}
          />
          <mesh position={[0, -3.3, 0]} geometry={geometries.board} material={materials.board} />
          <SketchEdges
            geometry={geometries.board}
            position={[0, -3.3, 0]}
            seed={234}
            jitter={0.01}
            subdivisions={5}
            passes={hovered ? 3 : 2}
          />
          <mesh position={[0, -3.3, 0.016]} geometry={geometries.face} material={banner.material} />
        </HoverLift>
      </InteractiveHotspot>
    </group>
  )
}

export function FocusMilestone({ flight }: { flight: MutableRefObject<Flight> }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Milestone at={milestoneAt('focus')} flight={flight}>
      <HotAirBalloon body={about.currentFocus} hovered={hovered} onHover={setHovered} />
      <SkyCloud position={[-3.8, 3.6, -0.8]} scale={2.8} seed={91} drift={0.02} />
      <Note
        lines={[about.loopNote]}
        position={[-3.8, 5.0, -0.2]}
        width={3.4}
        fontSize={76}
        color="#262421"
      />
      <Note
        lines={['the story loops from here']}
        position={[-3.8, 4.4, -0.2]}
        width={3.0}
        fontSize={48}
        color="#33485c"
      />
    </Milestone>
  )
}
