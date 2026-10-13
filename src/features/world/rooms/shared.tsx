import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  createCloudTexture,
  createHandwritingTexture,
} from '@/shared/graphics/textures/handwriting'
import { useScene } from '@/features/world/scene/SceneContext'
import { SketchEdges } from '@/features/world/corridor/components/SketchEdges'
import { usePaperPlaneGeometry, useSkyMaterial, useToonMaterials } from './helpers'

export function SkyBox({ width = 12, height = 9, depth = 16 }) {
  const material = useSkyMaterial()
  return (
    <mesh position={[0, height / 2 - 0.5, -depth / 2 - 0.05]} material={material}>
      <boxGeometry args={[width, height, depth]} />
    </mesh>
  )
}

interface CloudProps {
  position: [number, number, number]
  scale?: number
  seed?: number
  drift?: number
}

export function Cloud({ position, scale = 1, seed = 1, drift = 0.08 }: CloudProps) {
  const { reducedMotion } = useScene()
  const sprite = useRef<THREE.Sprite>(null)
  const texture = useMemo(() => createCloudTexture(seed), [seed])
  useEffect(() => () => texture.dispose(), [texture])
  const phase = useMemo(() => seed * 1.7, [seed])

  useFrame((state) => {
    if (reducedMotion || !sprite.current) return
    const t = state.clock.elapsedTime
    sprite.current.position.x = position[0] + Math.sin(t * drift + phase) * 0.6
    sprite.current.position.y = position[1] + Math.sin(t * drift * 1.7 + phase) * 0.12
  })

  return (
    <sprite ref={sprite} position={position} scale={[1.6 * scale, scale, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  )
}

interface NoteProps {
  lines: string[]
  position: [number, number, number]
  width?: number
  color?: string
  fontSize?: number
}

export function Note({ lines, position, width = 2, color = '#2f2a26', fontSize = 56 }: NoteProps) {
  const texture = useMemo(
    () =>
      createHandwritingTexture({
        lines,
        color,
        fontSize,
        width: 512,
        height: Math.max(128, Math.round(lines.length * fontSize * 1.15 + 40)),
        font: 'hand',
      }),
    [lines, color, fontSize],
  )
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        toneMapped: false,
        depthWrite: false,
        side: THREE.DoubleSide,
        forceSinglePass: true,
      }),
    [texture],
  )
  useEffect(
    () => () => {
      texture.dispose()
      material.dispose()
    },
    [texture, material],
  )
  const height = (width * texture.image.height) / texture.image.width
  return (
    <mesh position={position} material={material}>
      <planeGeometry args={[width, height]} />
    </mesh>
  )
}

interface PaperPlaneProps {
  position: [number, number, number]
  seed?: number
}

export function PaperPlane({ position, seed = 1 }: PaperPlaneProps) {
  const { reducedMotion } = useScene()
  const group = useRef<THREE.Group>(null)
  const geometry = usePaperPlaneGeometry()
  const materials = useToonMaterials({ paper: '#ffffff' })
  useEffect(() => {
    materials.paper.side = THREE.DoubleSide
  }, [materials])

  useFrame((state) => {
    if (reducedMotion || !group.current) return
    const t = state.clock.elapsedTime + seed
    group.current.position.y = position[1] + Math.sin(t * 0.9) * 0.08
    group.current.rotation.z = Math.sin(t * 0.6) * 0.08
    group.current.rotation.x = Math.sin(t * 0.45) * 0.04
  })

  return (
    <group ref={group} position={position}>
      <mesh geometry={geometry} material={materials.paper} />
      <SketchEdges
        geometry={geometry}
        seed={40 + seed}
        jitter={0.012}
        subdivisions={5}
        thresholdAngle={5}
      />
    </group>
  )
}
