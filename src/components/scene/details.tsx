import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mulberry32 } from '@/utils/sketch'
import { getHatchTexture } from '@/utils/textures'
import { InteractiveHotspot } from './InteractiveHotspot'
import { useScene } from './SceneContext'
import { SketchEdges } from './SketchEdges'

/* ---------------------------------------------------------------------------------------- */
/* Hatched contact shadow                                                                   */
/* ---------------------------------------------------------------------------------------- */

export function HatchShadow({
  size = [1, 1],
  position = [0, 0.002, 0],
  opacity = 0.18,
}: {
  size?: [number, number]
  position?: [number, number, number]
  opacity?: number
}) {
  const material = useMemo(() => {
    const map = getHatchTexture().clone()
    map.repeat.set(size[0] * 2.5, size[1] * 2.5)
    map.needsUpdate = true
    return new THREE.MeshBasicMaterial({
      color: '#3a2e22',
      transparent: true,
      opacity,
      alphaMap: map,
      depthWrite: false,
    })
  }, [size, opacity])
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

/* ---------------------------------------------------------------------------------------- */
/* Potted plant: tap it and the leaves bounce                                               */
/* ---------------------------------------------------------------------------------------- */

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
        color: '#b98466',
        gradientMap: materials.wall.gradientMap,
      }),
      leaf: new THREE.MeshToonMaterial({
        color: '#8a9a7b',
        gradientMap: materials.wall.gradientMap,
      }),
      stem: new THREE.MeshToonMaterial({
        color: '#6c7a5c',
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

/* ---------------------------------------------------------------------------------------- */
/* Picture frame with a tiny procedural sketch; click to make it swing                     */
/* ---------------------------------------------------------------------------------------- */

function drawMiniSketch(seed: number): THREE.Texture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = Math.round(size * 0.78)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')
  const random = mulberry32(seed)
  ctx.fillStyle = '#faf6ee'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#3a332e'
  ctx.lineWidth = 2.2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const kind = seed % 3
  if (kind === 0) {
    // Hills and a sun
    ctx.beginPath()
    ctx.moveTo(10, 150)
    for (let x = 10; x <= canvas.width - 10; x += 12) {
      ctx.lineTo(x, 150 - Math.sin(x / 40 + random()) * 22 - random() * 6)
    }
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(190 + random() * 20, 60, 22, 0, Math.PI * 2)
    ctx.stroke()
    ctx.strokeStyle = '#c0693b'
    ctx.beginPath()
    ctx.arc(190, 60, 15, 0, Math.PI * 2)
    ctx.stroke()
  } else if (kind === 1) {
    // Little house
    ctx.beginPath()
    ctx.moveTo(70, 160)
    ctx.lineTo(72, 90)
    ctx.lineTo(128, 48)
    ctx.lineTo(184, 92)
    ctx.lineTo(186, 162)
    ctx.closePath()
    ctx.stroke()
    ctx.strokeRect(112, 118, 30, 44)
    ctx.strokeStyle = '#c0693b'
    ctx.strokeRect(88, 100, 18, 18)
    ctx.strokeRect(150, 100, 18, 18)
  } else {
    // Abstract arcs
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = i % 2 ? '#c0693b' : '#3a332e'
      ctx.beginPath()
      ctx.arc(
        128 + (random() - 0.5) * 60,
        110 + (random() - 0.5) * 50,
        20 + i * 14,
        random() * 2,
        random() * 2 + 2.5,
      )
      ctx.stroke()
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function PictureFrame({
  position,
  rotation = [0, 0, 0],
  seed = 1,
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  seed?: number
}) {
  const { materials, reducedMotion } = useScene()
  const swing = useRef<THREE.Group>(null)
  const velocity = useRef(0)
  const angle = useRef(0)

  const frameGeometry = useMemo(() => new THREE.BoxGeometry(0.62, 0.5, 0.035), [])
  const artTexture = useMemo(() => drawMiniSketch(seed), [seed])
  const artMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ map: artTexture, toneMapped: false }),
    [artTexture],
  )
  useEffect(
    () => () => {
      frameGeometry.dispose()
      artTexture.dispose()
      artMaterial.dispose()
    },
    [frameGeometry, artTexture, artMaterial],
  )

  useFrame((_, delta) => {
    if (!swing.current) return
    if (Math.abs(velocity.current) < 0.0005 && Math.abs(angle.current) < 0.0005) return
    // Damped pendulum
    const stiffness = 40
    const damping = 3.2
    velocity.current += (-stiffness * angle.current - damping * velocity.current) * delta
    angle.current += velocity.current * delta
    swing.current.rotation.z = angle.current
  })

  return (
    <group position={position} rotation={rotation}>
      <InteractiveHotspot
        hitArea={[0.8, 0.7, 0.3]}
        onActivate={() => {
          if (reducedMotion) return
          velocity.current = 2.4
        }}
      >
        <group position={[0, 0.25, 0]}>
          <group ref={swing}>
            <group position={[0, -0.25, 0]}>
              <mesh geometry={frameGeometry} material={materials.woodDark} />
              <SketchEdges
                geometry={frameGeometry}
                seed={seed + 40}
                jitter={0.008}
                subdivisions={4}
              />
              <mesh position={[0, 0, 0.02]} material={artMaterial}>
                <planeGeometry args={[0.5, 0.39]} />
              </mesh>
            </group>
          </group>
        </group>
      </InteractiveHotspot>
      {/* Nail */}
      <mesh position={[0, 0.3, 0.01]}>
        <sphereGeometry args={[0.012, 6, 6]} />
        <meshBasicMaterial color="#2f2a26" />
      </mesh>
    </group>
  )
}

/* ---------------------------------------------------------------------------------------- */
/* Pendant lamp; click to switch it on and off                                              */
/* ---------------------------------------------------------------------------------------- */

export function Lamp({
  position,
  seed = 1,
}: {
  position: [number, number, number]
  seed?: number
}) {
  const { materials, quality, reducedMotion } = useScene()
  const light = useRef<THREE.PointLight>(null)
  const bulb = useRef<THREE.MeshBasicMaterial>(null)
  const on = useRef(true)
  const level = useRef(1)

  const geometries = useMemo(
    () => ({
      cord: new THREE.CylinderGeometry(0.008, 0.008, 0.7, 5),
      shade: new THREE.ConeGeometry(0.3, 0.24, 12, 1, true),
      bulb: new THREE.SphereGeometry(0.05, 8, 6),
    }),
    [],
  )
  const shadeMaterial = useMemo(
    () =>
      new THREE.MeshToonMaterial({
        color: '#e3cf9f',
        gradientMap: materials.wall.gradientMap,
        side: THREE.DoubleSide,
      }),
    [materials],
  )
  useEffect(
    () => () => {
      Object.values(geometries).forEach((g) => g.dispose())
      shadeMaterial.dispose()
    },
    [geometries, shadeMaterial],
  )

  useFrame((_, delta) => {
    const target = on.current ? 1 : 0
    if (Math.abs(level.current - target) < 0.001) return
    level.current = reducedMotion
      ? target
      : level.current + (target - level.current) * (1 - Math.exp(-delta * 8))
    if (light.current) light.current.intensity = level.current * 6
    if (bulb.current) bulb.current.color.setStyle(level.current > 0.5 ? '#ffe9b8' : '#cbbfae')
  })

  return (
    <group position={position}>
      <InteractiveHotspot
        hitArea={[0.7, 1.0, 0.7]}
        hitAreaPosition={[0, -0.5, 0]}
        onActivate={() => {
          on.current = !on.current
        }}
      >
        <mesh geometry={geometries.cord} material={materials.woodDark} position={[0, -0.35, 0]} />
        <mesh geometry={geometries.shade} material={shadeMaterial} position={[0, -0.8, 0]} />
        <SketchEdges
          geometry={geometries.shade}
          position={[0, -0.8, 0]}
          seed={seed + 90}
          jitter={0.006}
          subdivisions={3}
          thresholdAngle={25}
        />
        <mesh geometry={geometries.bulb} position={[0, -0.88, 0]}>
          <meshBasicMaterial ref={bulb} color="#ffe9b8" />
        </mesh>
      </InteractiveHotspot>
      {quality !== 'low' && (
        <pointLight
          ref={light}
          position={[0, -0.95, 0]}
          color="#ffd9a0"
          intensity={6}
          distance={11}
          decay={2}
        />
      )}
    </group>
  )
}
