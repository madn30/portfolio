import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { accentHex } from '@/data/siteConfig'
import { unlock } from '@/features/achievements'
import type { AccentColor } from '@/shared/types'
import { createCardTexture, type CardOptions } from '@/shared/graphics/cardTexture'
import { createFluffyCloudTexture } from '@/shared/graphics/cloudTexture'
import { mulberry32 } from '@/shared/graphics/sketch'
import { InteractiveHotspot } from '@/features/world/corridor/components/InteractiveHotspot'
import { useScene } from '@/features/world/scene/SceneContext'
import { Floaty, PaperSheet, type Wind } from './about/Floaty'
import { SketchEdges } from '@/features/world/corridor/components/SketchEdges'
import { HoverLift } from './ambient'
import { useSkyMaterial, useToonMaterials } from './helpers'
import { PaperPlane } from './shared'
import { HORIZON, type Vec3 } from './flight'

const FLIGHT_SECONDS = 3.6
const TRAIL_SECONDS = 3
const MAX_THROWN = 6

interface SkyCloudProps {
  position: Vec3
  scale?: number
  seed?: number
  drift?: number
}

export function SkyCloud({ position, scale = 1, seed = 1, drift = 0.03 }: SkyCloudProps) {
  const { reducedMotion } = useScene()
  const sprite = useRef<THREE.Sprite>(null)
  const texture = useMemo(() => createFluffyCloudTexture(seed, 512, 320), [seed])
  useEffect(() => () => texture.dispose(), [texture])
  const phase = seed * 1.7

  useFrame((state) => {
    if (reducedMotion || !sprite.current) return
    const t = state.clock.elapsedTime
    sprite.current.position.x = position[0] + Math.sin(t * drift + phase) * 0.6
    sprite.current.position.y = position[1] + Math.sin(t * drift * 1.7 + phase) * 0.12
    const breath = 1 + Math.sin(t * 0.35 + phase) * 0.035
    sprite.current.scale.set(1.6 * scale * breath, scale * (2 - breath), 1)
    sprite.current.material.rotation = Math.sin(t * 0.18 + phase) * 0.03
  })

  return (
    <sprite ref={sprite} position={position} scale={[1.6 * scale, scale, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  )
}

interface SkyCardProps extends Omit<CardOptions, 'accent' | 'width' | 'height' | 'seed'> {
  position: Vec3
  rotation?: Vec3
  width: number
  height: number
  accent: AccentColor
  seed: number
  label: string
  hovered: boolean
  onHover: (hovered: boolean) => void
  onActivate: () => void
  disabled?: boolean
  wind?: MutableRefObject<Wind>
  still?: boolean
}

export function SkyCard({
  position,
  rotation = [0, 0, 0],
  width,
  height,
  accent,
  seed,
  label,
  hovered,
  onHover,
  onActivate,
  disabled = false,
  wind,
  still = false,
  ...card
}: SkyCardProps) {
  const { touch } = useScene()
  const materials = useToonMaterials({ paper: '#fbfaf7' })
  const key = JSON.stringify(card)
  const options = useMemo(() => JSON.parse(key) as CardOptions, [key])
  const { geometry, face, texture, material } = useMemo(() => {
    const texture = createCardTexture({
      ...options,
      accent: accentHex[accent],
      width: 1024,
      height: Math.round((1024 * height) / width),
      seed,
    })
    return {
      geometry: new THREE.BoxGeometry(width, height, 0.04),
      face: new THREE.PlaneGeometry(width, height),
      texture,
      material: new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }),
    }
  }, [options, accent, width, height, seed])
  useEffect(
    () => () => {
      geometry.dispose()
      face.dispose()
      texture.dispose()
      material.dispose()
    },
    [geometry, face, texture, material],
  )

  return (
    <group position={position} rotation={rotation}>
      <Floaty
        seed={seed}
        wind={wind}
        amount={still ? 0 : 1}
        shadow={still ? undefined : [width, height]}
      >
        <InteractiveHotspot
          label={label}
          onActivate={onActivate}
          onHoverChange={onHover}
          hitArea={[width + 0.2, height + 0.2, touch ? 1 : 0.4]}
          disabled={disabled}
        >
          <HoverLift hovered={hovered} lift={0.08} scale={1.03}>
            {still ? (
              <>
                <mesh geometry={geometry} material={materials.paper} />
                <mesh position={[0, 0, 0.021]} geometry={face} material={material} />
                <SketchEdges
                  geometry={geometry}
                  seed={seed}
                  jitter={0.012}
                  subdivisions={6}
                  passes={hovered ? 3 : 2}
                />
              </>
            ) : (
              <PaperSheet
                width={width}
                height={height}
                material={material}
                seed={seed}
                wind={wind}
              />
            )}
          </HoverLift>
        </InteractiveHotspot>
      </Floaty>
    </group>
  )
}

interface Throw {
  id: number
  curve: THREE.CatmullRomCurve3
}

function ThrownPlane({ flight, onDone }: { flight: Throw; onDone: (id: number) => void }) {
  const { materials: scene, reducedMotion } = useScene()
  const group = useRef<THREE.Group>(null)
  const born = useRef<number | null>(null)
  const finished = useRef(false)
  const trail = useMemo(() => {
    const samples = flight.curve.getPoints(120)
    const positions: number[] = []
    for (let i = 0; i < samples.length - 1; i += 2) {
      const a = samples[i]
      const b = samples[i + 1]
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z)
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setDrawRange(0, 0)
    return geometry
  }, [flight])
  useEffect(() => () => trail.dispose(), [trail])
  const vertexCount = trail.getAttribute('position').count
  const scratch = useMemo(
    () => ({
      position: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      target: new THREE.Vector3(),
    }),
    [],
  )

  useFrame((state) => {
    if (!group.current || finished.current) return
    const now = state.clock.elapsedTime
    if (born.current === null) born.current = now
    const age = now - born.current
    const progress = reducedMotion ? 1 : Math.min(1, age / FLIGHT_SECONDS)
    const t = 1 - Math.pow(1 - progress, 1.6)
    const { position, tangent, target } = scratch
    flight.curve.getPointAt(t, position)
    flight.curve.getTangentAt(t, tangent)
    group.current.position.copy(position)
    target.copy(position).sub(tangent)
    group.current.lookAt(target)
    group.current.rotateZ(Math.sin(t * Math.PI * 2.5 + flight.id) * 0.4)
    const fade = reducedMotion ? 1 : Math.min(1, (1 - t) / 0.12)
    group.current.scale.setScalar(0.55 * fade)
    group.current.visible = fade > 0.01
    trail.setDrawRange(0, Math.floor((t * vertexCount) / 2) * 2)
    if (age > FLIGHT_SECONDS + TRAIL_SECONDS) {
      finished.current = true
      onDone(flight.id)
    }
  })

  return (
    <>
      <lineSegments geometry={trail} material={scene.lineSoft} />
      <group ref={group}>
        <PaperPlane position={[0, 0, 0]} seed={10 + (flight.id % 7)} />
      </group>
    </>
  )
}

export function SkyPaper({ active }: { active: boolean }) {
  const camera = useThree((state) => state.camera)
  const scene = useThree((state) => state.scene)
  const root = useRef<THREE.Group>(null)
  const sky = useSkyMaterial()
  useEffect(() => {
    const fog = scene.fog
    if (!active || !fog) return
    const before = fog.color.clone()
    fog.color.set(HORIZON)
    return () => {
      fog.color.copy(before)
    }
  }, [active, scene])
  const [thrown, setThrown] = useState<Throw[]>([])
  const nextThrow = useRef(1)

  const throwPlane = (event: ThreeEvent<MouseEvent>) => {
    if (!active || !root.current) return
    event.stopPropagation()
    const id = nextThrow.current++
    const random = mulberry32(id * 7 + 1)
    const start = root.current.worldToLocal(camera.position.clone())
    start.x += 0.3
    start.y -= 0.35
    start.z -= 1.4
    const end = root.current.worldToLocal(event.point.clone()).lerp(start, 0.4)
    const side = (random() - 0.5) * 2.4
    const rise = start.clone().lerp(end, 0.28)
    rise.y += 0.9 + random() * 0.4
    rise.x += side
    const dip = start.clone().lerp(end, 0.62)
    dip.y -= 0.25
    dip.x -= side * 0.5
    const curve = new THREE.CatmullRomCurve3([start, rise, dip, end], false, 'catmullrom', 0.5)
    setThrown((list) => [...list, { id, curve }].slice(-MAX_THROWN))
    unlock('skywalker')
  }
  const landed = (id: number) => setThrown((list) => list.filter((f) => f.id !== id))

  return (
    <group ref={root}>
      <mesh position={[0, 5, -26.05]} material={sky} material-depthWrite={false} renderOrder={-1}>
        <boxGeometry args={[30, 22, 52]} />
      </mesh>
      <mesh position={[0, 4, -44]} visible={false} onClick={throwPlane}>
        <planeGeometry args={[80, 50]} />
        <meshBasicMaterial />
      </mesh>
      {thrown.map((flight) => (
        <ThrownPlane key={flight.id} flight={flight} onDone={landed} />
      ))}
    </group>
  )
}
