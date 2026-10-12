import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { CORRIDOR } from '@/shared/corridor/corridor'
import {
  createDrawerFrontTexture,
  createGrateTexture,
  createPottedTreeTexture,
  createStandingFrameTexture,
} from '@/features/world/corridor/textures/furniture'
import { HatchShadow, Plant } from '@/features/world/scene/details'
import { useScene } from '@/features/world/scene/SceneContext'
import { SketchEdges } from '@/features/world/corridor/components/SketchEdges'

const HALF = CORRIDOR.width / 2

type Side = 'left' | 'right'

function sign(side: Side): number {
  return side === 'left' ? -1 : 1
}

function facing(side: Side): number {
  return side === 'left' ? Math.PI / 2 : -Math.PI / 2
}

function useDecal(create: () => THREE.Texture): THREE.MeshBasicMaterial {
  const texture = useMemo(create, [create])
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.1,
        toneMapped: false,
        side: THREE.DoubleSide,
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
  return material
}

export function SideTable({ side, z }: { side: Side; z: number }) {
  const { materials } = useScene()
  const geometries = useMemo(
    () => ({
      top: new THREE.BoxGeometry(0.5, 0.06, 1.2),
      leg: new THREE.BoxGeometry(0.05, 0.7, 0.05),
    }),
    [],
  )
  useEffect(() => () => Object.values(geometries).forEach((g) => g.dispose()), [geometries])
  const x = sign(side) * (HALF - 0.3)
  return (
    <group position={[x, 0, z]}>
      <group position={[0, 0.73, 0]}>
        <mesh geometry={geometries.top} material={materials.wood} castShadow />
        <SketchEdges geometry={geometries.top} seed={Math.round(z) + 600} jitter={0.008} />
      </group>
      {[-1, 1].flatMap((lx) =>
        [-1, 1].map((lz) => (
          <group key={`${lx}${lz}`} position={[lx * 0.2, 0.35, lz * 0.52]}>
            <mesh geometry={geometries.leg} material={materials.woodDark} />
            <SketchEdges
              geometry={geometries.leg}
              seed={Math.round(z) + 610 + lx + lz * 2}
              jitter={0.005}
              subdivisions={3}
              passes={1}
            />
          </group>
        )),
      )}
      <Plant position={[sign(side) * 0.05, 0.76, 0.2]} seed={Math.abs(Math.round(z))} />
      <HatchShadow size={[0.7, 1.4]} position={[-sign(side) * 0.05, 0.002, 0]} />
    </group>
  )
}

export function Cabinet({ side, z }: { side: Side; z: number }) {
  const { materials } = useScene()
  const body = useMemo(() => new THREE.BoxGeometry(0.5, 1, 0.8), [])
  useEffect(() => () => body.dispose(), [body])
  const front = useDecal(createDrawerFrontTexture)
  const photo = useDecal(createStandingFrameTexture)
  const s = sign(side)
  return (
    <group position={[s * (HALF - 0.26), 0, z]}>
      <group position={[0, 0.5, 0]}>
        <mesh geometry={body} material={materials.wood} castShadow />
        <SketchEdges geometry={body} seed={Math.round(z) + 620} jitter={0.008} />
        <mesh position={[-s * 0.252, 0, 0]} rotation={[0, facing(side), 0]} material={front}>
          <planeGeometry args={[0.76, 0.96]} />
        </mesh>
      </group>
      <mesh
        position={[-s * 0.04, 1.19, 0.14]}
        rotation={[0, facing(side) + s * 0.2, 0]}
        material={photo}
      >
        <planeGeometry args={[0.3, 0.375]} />
      </mesh>
      <HatchShadow size={[0.7, 1.0]} position={[-s * 0.08, 0.002, 0.05]} />
    </group>
  )
}

export function PottedTree({ side, z }: { side: Side; z: number }) {
  const material = useDecal(createPottedTreeTexture)
  const s = sign(side)
  return (
    <group position={[s * (HALF - 0.75), 0, z]}>
      <mesh
        position={[0, 1.25, 0]}
        rotation={[0, facing(side) - s * Math.PI * 0.25, 0]}
        material={material}
      >
        <planeGeometry args={[1.5, 2.5]} />
      </mesh>
      <HatchShadow size={[0.9, 0.7]} position={[0.05, 0.002, 0.05]} />
    </group>
  )
}

export function Grate({ side, z }: { side: Side; z: number }) {
  const material = useDecal(createGrateTexture)
  return (
    <mesh
      position={[sign(side) * (HALF - 0.012), CORRIDOR.height - 0.6, z]}
      rotation={[0, facing(side), 0]}
      material={material}
    >
      <planeGeometry args={[0.8, 0.4]} />
    </mesh>
  )
}
