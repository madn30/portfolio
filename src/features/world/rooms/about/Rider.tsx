import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { worldRefs } from '@/shared/store/worldStore'
import { useScene } from '@/features/world/scene/SceneContext'
import { SketchEdges } from '@/features/world/corridor/components/SketchEdges'
import type { Flight, Vec3 } from '@/features/world/rooms/flight'

const RIDER: Vec3 = [0, 0.8, -4.3]
const RIDER_PITCH = -0.18
const TRAIL_DASHES = 14
const TRAIL_LENGTH = 3.2

function RiderPlane() {
  const { geometry, material } = useMemo(() => {
    const nose: Vec3 = [0, 0, -1.4]
    const spine: Vec3 = [0, 0.12, 0.8]
    const creaseL: Vec3 = [-0.55, 0.1, 0.78]
    const creaseR: Vec3 = [0.55, 0.1, 0.78]
    const tipL: Vec3 = [-1.45, 0.3, 0.72]
    const tipR: Vec3 = [1.45, 0.3, 0.72]
    const keel: Vec3 = [0, -0.12, 0.62]
    const panels: { tri: [Vec3, Vec3, Vec3]; color: string }[] = [
      { tri: [nose, tipL, creaseL], color: '#e7e5e0' },
      { tri: [nose, creaseL, spine], color: '#d8d6d0' },
      { tri: [nose, spine, creaseR], color: '#c8c5bf' },
      { tri: [nose, creaseR, tipR], color: '#d3d0ca' },
      { tri: [nose, keel, spine], color: '#bcb9b3' },
    ]
    const positions: number[] = []
    const colors: number[] = []
    const c = new THREE.Color()
    for (const { tri, color } of panels) {
      c.set(color)
      for (const v of tri) {
        positions.push(...v)
        colors.push(c.r, c.g, c.b)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    g.computeVertexNormals()
    const m = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      toneMapped: false,
    })
    return { geometry: g, material: m }
  }, [])
  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )
  return (
    <>
      <mesh geometry={geometry} material={material} />
      <SketchEdges
        geometry={geometry}
        seed={19}
        jitter={0.008}
        subdivisions={6}
        thresholdAngle={4}
      />
    </>
  )
}

function Trail({ flight }: { flight: MutableRefObject<Flight> }) {
  const { materials, reducedMotion } = useScene()
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(TRAIL_DASHES * 2 * 2 * 3, 3))
    g.setDrawRange(0, 0)
    return g
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((state) => {
    if (reducedMotion) return
    const strength = Math.min(1, Math.abs(flight.current.speed) / 18)
    const attribute = geometry.getAttribute('position') as THREE.BufferAttribute
    const array = attribute.array as Float32Array
    const t = state.clock.elapsedTime
    const direction = flight.current.speed >= 0 ? 1 : -1
    let i = 0
    for (let d = 0; d < TRAIL_DASHES; d++) {
      const s0 = (d + ((t * 3) % 1)) / TRAIL_DASHES
      const s1 = s0 + 0.5 / TRAIL_DASHES
      for (const side of [-1, 1]) {
        const x = side * 0.5
        for (const s of [s0, s1]) {
          array[i++] = x + Math.sin(s * 9 + t * 2 + side) * 0.05 * s
          array[i++] = 0.1 - s * 0.15
          array[i++] = direction * s * TRAIL_LENGTH * strength
        }
      }
    }
    attribute.needsUpdate = true
    geometry.setDrawRange(0, strength > 0.05 ? TRAIL_DASHES * 4 : 0)
  })

  return <lineSegments geometry={geometry} material={materials.lineSoft} />
}

export function Rider({ flight }: { flight: MutableRefObject<Flight> }) {
  const { reducedMotion, quality } = useScene()
  const group = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (!group.current) return
    const dt = Math.min(delta, 0.05)
    const f = flight.current
    const bank = -worldRefs.pointerX * 0.45 - f.bank * 2
    const pitch =
      RIDER_PITCH + f.pitch * 3 + THREE.MathUtils.clamp(-(f.velocity - f.speed) * 0.01, -0.25, 0.3)
    const k = reducedMotion ? 1 : 1 - Math.exp(-dt * 5)
    group.current.rotation.z += (bank - group.current.rotation.z) * k
    group.current.rotation.x += (pitch - group.current.rotation.x) * k
    group.current.position.x +=
      (RIDER[0] + worldRefs.pointerX * 0.35 - group.current.position.x) * k
    group.current.position.y =
      RIDER[1] + (reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.9) * 0.05)
  })

  return (
    <group ref={group} position={RIDER} rotation={[RIDER_PITCH, 0, 0]} scale={0.36}>
      <RiderPlane />
      {quality !== 'low' && <Trail flight={flight} />}
    </group>
  )
}
