import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createLampGrilleTexture } from '@/features/world/corridor/textures/furniture'
import { getGlowTexture } from '@/shared/graphics/textures/surfaces'
import { InteractiveHotspot } from '@/features/world/corridor/components/InteractiveHotspot'
import { useScene } from '@/features/world/scene/SceneContext'
import { SketchEdges } from '@/features/world/corridor/components/SketchEdges'

export function Lamp({
  position,
  seed = 1,
}: {
  position: [number, number, number]
  seed?: number
}) {
  const { materials, quality, reducedMotion } = useScene()
  const light = useRef<THREE.PointLight>(null)
  const diffuser = useRef<THREE.MeshBasicMaterial>(null)
  const glow = useRef<THREE.SpriteMaterial>(null)
  const on = useRef(true)
  const level = useRef(1)

  const geometries = useMemo(
    () => ({
      housing: new THREE.BoxGeometry(1.5, 0.08, 0.46),
      diffuser: new THREE.PlaneGeometry(1.36, 0.34),
    }),
    [],
  )
  const housingMaterial = useMemo(
    () =>
      new THREE.MeshToonMaterial({
        color: '#d9d5cc',
        gradientMap: materials.wall.gradientMap,
      }),
    [materials],
  )
  const grilleTexture = useMemo(() => createLampGrilleTexture(), [])
  const grilleMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: grilleTexture,
        transparent: true,
        alphaTest: 0.1,
        toneMapped: false,
        depthWrite: false,
      }),
    [grilleTexture],
  )
  const glowTexture = useMemo(() => getGlowTexture(), [])
  useEffect(
    () => () => {
      Object.values(geometries).forEach((g) => g.dispose())
      housingMaterial.dispose()
      grilleTexture.dispose()
      grilleMaterial.dispose()
    },
    [geometries, housingMaterial, grilleTexture, grilleMaterial],
  )

  useFrame((_, delta) => {
    const target = on.current ? 1 : 0
    if (Math.abs(level.current - target) < 0.001) return
    level.current = reducedMotion
      ? target
      : level.current + (target - level.current) * (1 - Math.exp(-delta * 8))
    if (light.current) light.current.intensity = level.current * 2.4
    if (diffuser.current)
      diffuser.current.color.setStyle(level.current > 0.5 ? '#fffdf4' : '#dedad2')
    if (glow.current) glow.current.opacity = level.current * 0.4
  })

  return (
    <group position={position}>
      <InteractiveHotspot
        hitArea={[1.6, 0.4, 0.6]}
        hitAreaPosition={[0, -0.1, 0]}
        onActivate={() => {
          on.current = !on.current
        }}
      >
        <mesh geometry={geometries.housing} material={housingMaterial} position={[0, -0.04, 0]} />
        <SketchEdges
          geometry={geometries.housing}
          position={[0, -0.04, 0]}
          seed={seed + 90}
          jitter={0.008}
          subdivisions={5}
          passes={2}
        />
        <mesh
          geometry={geometries.diffuser}
          position={[0, -0.085, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial ref={diffuser} color="#fffdf4" toneMapped={false} />
        </mesh>
        <mesh
          geometry={geometries.diffuser}
          position={[0, -0.092, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          material={grilleMaterial}
        />
      </InteractiveHotspot>
      <sprite position={[0, -0.5, 0]} scale={[3.2, 1.6, 1]}>
        <spriteMaterial
          ref={glow}
          map={glowTexture}
          transparent
          opacity={0.4}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      {quality !== 'low' && (
        <pointLight
          ref={light}
          position={[0, -0.3, 0]}
          color="#fff6e4"
          intensity={2.4}
          distance={8}
          decay={2}
        />
      )}
    </group>
  )
}
