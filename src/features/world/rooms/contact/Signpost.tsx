import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { InteractiveHotspot } from '@/features/world/corridor/components/InteractiveHotspot'
import { useScene } from '@/features/world/scene/SceneContext'
import { SketchEdges } from '@/features/world/corridor/components/SketchEdges'
import { HoverLift } from '@/features/world/rooms/ambient'
import type { Vec3 } from './constants'
import { applyReveal, createRevealUniforms } from './reveal'
import type { SignpostGeometries } from './signpostGeometry'
import { createSignBoardTexture } from './signTextures'

interface SignpostProps {
  index: number
  label: string
  hint: string
  position: Vec3
  turn: number
  tilt: number
  geometries: SignpostGeometries
  barrelTexture: THREE.Texture
  onActivate: () => void
}

const SPAN = 2.2
const scratch = new THREE.Vector3()

export function Signpost({
  index,
  label,
  hint,
  position,
  turn,
  tilt,
  geometries,
  barrelTexture,
  onActivate,
}: SignpostProps) {
  const { materials: scene, reducedMotion, touch } = useScene()
  const group = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const phase = position[0] * 0.5 + index

  const uniforms = useMemo(() => createRevealUniforms('#e0a63a', SPAN), [])
  const boardTexture = useMemo(
    () => createSignBoardTexture(label, 512, 176, index + 1),
    [label, index],
  )
  const materials = useMemo(() => {
    const gradientMap = scene.wall.gradientMap
    const barrel = applyReveal(
      new THREE.MeshBasicMaterial({ map: barrelTexture, toneMapped: false }),
      uniforms,
    )
    const wood = applyReveal(
      new THREE.MeshToonMaterial({ color: '#a9713f', gradientMap }),
      uniforms,
    )
    const post = applyReveal(
      new THREE.MeshToonMaterial({ color: '#7a4e2b', gradientMap }),
      uniforms,
    )
    const face = applyReveal(
      new THREE.MeshBasicMaterial({ map: boardTexture, toneMapped: false }),
      uniforms,
    )
    return { barrel, wood, post, face, board: [wood, wood, wood, wood, face, face] }
  }, [barrelTexture, boardTexture, uniforms, scene])
  useEffect(
    () => () => {
      boardTexture.dispose()
      materials.barrel.dispose()
      materials.wood.dispose()
      materials.post.dispose()
      materials.face.dispose()
    },
    [boardTexture, materials],
  )

  useFrame((state, delta) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    const target = hovered ? 1 : 0
    const current = uniforms.uReveal.value
    const rate = hovered ? 4 : 6
    uniforms.uReveal.value = reducedMotion
      ? target
      : current + (target - current) * (1 - Math.exp(-delta * rate))
    group.current.getWorldPosition(scratch)
    uniforms.uRevealRange.value.set(scratch.y - 0.5, scratch.y - 0.5 + SPAN)
    if (reducedMotion) return
    group.current.position.y = position[1] + Math.sin(t * 0.8 + phase) * 0.08
    group.current.position.x = position[0] + Math.sin(t * 0.4 + phase) * 0.12
    group.current.rotation.z = Math.sin(t * 0.6 + phase) * 0.04
    group.current.rotation.x = Math.sin(t * 0.55 + phase * 0.7) * 0.02
  })

  return (
    <group ref={group} position={position} rotation={[0, turn, 0]}>
      <InteractiveHotspot
        label={hint}
        onActivate={onActivate}
        onHoverChange={setHovered}
        hitArea={[1.7, 2.6, touch ? 1.3 : 0.9]}
        hitAreaPosition={[0, 0.9, 0]}
      >
        <HoverLift hovered={hovered} lift={0.1} scale={1.06}>
          <group position={[0, -0.5, 0]}>
            <mesh geometry={geometries.barrel} material={materials.barrel} />
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.7, 0]}
              geometry={geometries.lid}
              material={materials.wood}
            />
            <SketchEdges
              geometry={geometries.barrel}
              seed={130 + index}
              jitter={0.01}
              subdivisions={4}
              thresholdAngle={40}
              passes={1}
            />
          </group>
          <mesh position={[0, 0.95, 0]} geometry={geometries.post} material={materials.post} />
          <SketchEdges
            geometry={geometries.post}
            position={[0, 0.95, 0]}
            seed={135 + index}
            jitter={0.006}
            subdivisions={4}
            passes={1}
          />
          <group position={[0, 1.42, 0.09]} rotation={[0, 0, tilt]}>
            <mesh geometry={geometries.board} material={materials.board} />
            <SketchEdges geometry={geometries.board} seed={140 + index} jitter={0.01} passes={1} />
          </group>
        </HoverLift>
      </InteractiveHotspot>
    </group>
  )
}
