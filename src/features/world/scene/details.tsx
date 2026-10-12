import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mulberry32 } from '@/shared/graphics/sketch'
import { getHatchTexture } from '@/shared/graphics/textures/surfaces'
import { InteractiveHotspot } from '@/features/world/corridor/components/InteractiveHotspot'
import { useScene } from './SceneContext'
import { SketchEdges } from '@/features/world/corridor/components/SketchEdges'

export function HatchShadow({
  size = [1, 1],
  position = [0, 0.002, 0],
}: {
  size?: [number, number]
  position?: [number, number, number]
}) {
  const material = useMemo(() => {
    const map = getHatchTexture().clone()
    map.repeat.set(size[0] * 2.5, size[1] * 2.5)
    map.needsUpdate = true
    return new THREE.MeshBasicMaterial({
      color: '#3a2e22',
      transparent: true,
      opacity: 0.18,
      alphaMap: map,
      depthWrite: false,
    })
  }, [size])
  useEffect(
    () => () => {
      material.alphaMap?.dispose()
      material.dispose()
    },
    [material],
  )
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position} material={material}>
      <planeGeometry args={size} />
    </mesh>
  )
}

export function Plant({
  position,
  seed = 1,
}: {
  position: [number, number, number]
  seed?: number
}) {
  const { materials, reducedMotion } = useScene()
  const leaves = useRef<THREE.Group>(null)
  const energy = useRef(0)
  const time = useRef(0)

  const geometries = useMemo(
    () => ({
      pot: new THREE.CylinderGeometry(0.17, 0.12, 0.28, 10),
      rim: new THREE.CylinderGeometry(0.19, 0.18, 0.05, 10),
      leaf: new THREE.SphereGeometry(0.13, 7, 5),
      stem: new THREE.CylinderGeometry(0.012, 0.016, 0.5, 5),
    }),
    [],
  )
  const localMaterials = useMemo(
    () => ({
      pot: new THREE.MeshToonMaterial({
        color: '#c0693b',
        gradientMap: materials.wall.gradientMap,
      }),
      leaf: new THREE.MeshToonMaterial({
        color: '#5fa052',
        gradientMap: materials.wall.gradientMap,
      }),
      stem: new THREE.MeshToonMaterial({
        color: '#3f7f3f',
        gradientMap: materials.wall.gradientMap,
      }),
    }),
    [materials],
  )
  useEffect(
    () => () => {
      Object.values(geometries).forEach((g) => g.dispose())
      Object.values(localMaterials).forEach((m) => m.dispose())
    },
    [geometries, localMaterials],
  )

  const leafTransforms = useMemo(() => {
    const random = mulberry32(seed)
    return Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * Math.PI * 2 + random() * 0.6
      const tilt = 0.5 + random() * 0.5
      return {
        position: [Math.cos(angle) * 0.14, 0.55 + random() * 0.18, Math.sin(angle) * 0.14] as [
          number,
          number,
          number,
        ],
        rotation: [Math.sin(angle) * tilt, angle, -Math.cos(angle) * tilt] as [
          number,
          number,
          number,
        ],
        scale: [1, 1.9 + random() * 0.5, 0.35] as [number, number, number],
      }
    })
  }, [seed])

  useFrame((_, delta) => {
    if (!leaves.current) return
    if (energy.current < 0.001) return
    time.current += delta
    energy.current *= Math.exp(-delta * 2.2)
    const wobble = Math.sin(time.current * 14) * energy.current
    leaves.current.rotation.z = wobble * 0.25
    leaves.current.scale.setScalar(1 + wobble * 0.08)
    if (energy.current < 0.001) {
      leaves.current.rotation.z = 0
      leaves.current.scale.setScalar(1)
    }
  })

  return (
    <group position={position}>
      <InteractiveHotspot
        hitArea={[0.7, 1.2, 0.7]}
        hitAreaPosition={[0, 0.5, 0]}
        onActivate={() => {
          if (reducedMotion) return
          energy.current = 1
          time.current = 0
        }}
      >
        <mesh
          geometry={geometries.pot}
          material={localMaterials.pot}
          position={[0, 0.14, 0]}
          castShadow
        />
        <SketchEdges
          geometry={geometries.pot}
          position={[0, 0.14, 0]}
          seed={seed}
          jitter={0.006}
          subdivisions={3}
          thresholdAngle={30}
        />
        <mesh geometry={geometries.rim} material={localMaterials.pot} position={[0, 0.29, 0]} />
        <SketchEdges
          geometry={geometries.rim}
          position={[0, 0.29, 0]}
          seed={seed + 1}
          jitter={0.005}
          subdivisions={3}
          thresholdAngle={30}
        />
        <mesh geometry={geometries.stem} material={localMaterials.stem} position={[0, 0.5, 0]} />
        <group ref={leaves} position={[0, 0, 0]}>
          {leafTransforms.map((t, i) => (
            <group key={i} position={t.position} rotation={t.rotation} scale={t.scale}>
              <mesh geometry={geometries.leaf} material={localMaterials.leaf} castShadow />
              <SketchEdges
                geometry={geometries.leaf}
                seed={seed * 10 + i}
                jitter={0.004}
                subdivisions={2}
                passes={1}
                thresholdAngle={48}
                tone="soft"
              />
            </group>
          ))}
        </group>
      </InteractiveHotspot>
      <HatchShadow size={[0.7, 0.5]} position={[0.08, 0.002, 0.05]} />
    </group>
  )
}
