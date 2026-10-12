import { useEffect, useMemo, useRef, type MutableRefObject, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mulberry32 } from '@/shared/graphics/sketch'
import { useScene } from '@/features/world/scene/SceneContext'

export interface Wind {
  speed: number
}

interface FloatyProps {
  seed: number
  wind?: MutableRefObject<Wind>
  amount?: number
  shadow?: readonly [width: number, height: number]
  children: ReactNode
}

const SHADOW_OFFSET = [0.14, -0.2, -0.16] as const
const STIFFNESS = 34
const DAMPING = 4.2

let softShadow: THREE.Texture | null = null

function getSoftShadow(): THREE.Texture {
  if (softShadow) return softShadow
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')
  ctx.filter = 'blur(9px)'
  ctx.fillStyle = '#2e2822'
  ctx.fillRect(22, 22, 84, 84)
  softShadow = new THREE.CanvasTexture(canvas)
  return softShadow
}

function windOf(wind: MutableRefObject<Wind> | undefined): number {
  return THREE.MathUtils.clamp((wind?.current.speed ?? 0) / 12, -1, 1)
}

export function Floaty({ seed, wind, amount = 1, shadow, children }: FloatyProps) {
  const { reducedMotion, quality } = useScene()
  const body = useRef<THREE.Group>(null)
  const shade = useRef<THREE.Mesh>(null)
  const swing = useRef({ lean: 0, leanV: 0, roll: 0, rollV: 0, last: 0 })
  const motion = useMemo(() => {
    const random = mulberry32(seed * 53 + 9)
    return {
      phase: random() * Math.PI * 2,
      bob: 0.45 + random() * 0.25,
      sway: 0.3 + random() * 0.2,
      turn: 0.22 + random() * 0.14,
      side: random() < 0.5 ? -1 : 1,
      mass: 0.8 + random() * 0.5,
    }
  }, [seed])

  useFrame((state, delta) => {
    const group = body.current
    if (!group || reducedMotion || amount === 0) return
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime + motion.phase
    const w = windOf(wind)
    const s = swing.current
    const push = (w - s.last) / dt
    s.last = w
    s.leanV += ((-w * 0.34 - s.lean) * STIFFNESS - s.leanV * DAMPING) * dt * motion.mass
    s.lean += s.leanV * dt
    s.rollV += ((0 - s.roll) * STIFFNESS * 0.7 - s.rollV * DAMPING * 0.8) * dt
    s.rollV += push * 0.012 * motion.side
    s.roll += s.rollV * dt
    const lift = Math.sin(t * motion.bob) * 0.11 + Math.sin(t * motion.bob * 2.3) * 0.03
    const drift = Math.sin(t * motion.sway * 0.7) * 0.07
    group.position.set(drift * amount, (lift + Math.abs(s.lean) * 0.25) * amount, s.lean * 1.1)
    group.rotation.set(
      (Math.sin(t * motion.turn * 1.3) * 0.035 + s.lean) * amount,
      (Math.sin(t * motion.turn) * 0.07 + s.roll * 0.6) * amount,
      (Math.sin(t * motion.sway) * 0.028 + s.roll) * amount,
    )
    if (shade.current) {
      const height = lift + Math.abs(s.lean) * 0.6
      shade.current.position.set(
        SHADOW_OFFSET[0] - drift * 0.5 + height * 0.25,
        SHADOW_OFFSET[1] - height * 0.9,
        SHADOW_OFFSET[2],
      )
      shade.current.scale.setScalar(1 + height * 0.35)
      const material = shade.current.material
      if (material instanceof THREE.MeshBasicMaterial) {
        material.opacity = THREE.MathUtils.clamp(0.16 - height * 0.2, 0.05, 0.2)
      }
    }
  })

  return (
    <group>
      {shadow && quality !== 'low' && (
        <mesh ref={shade} position={[...SHADOW_OFFSET]} renderOrder={5}>
          <planeGeometry args={[shadow[0] * 1.5, shadow[1] * 1.5]} />
          <meshBasicMaterial
            map={getSoftShadow()}
            transparent
            opacity={0.15}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
      <group ref={body}>{children}</group>
    </group>
  )
}

interface PaperSheetProps {
  width: number
  height: number
  material: THREE.MeshBasicMaterial
  seed: number
  wind?: MutableRefObject<Wind>
}

const COLS = 16
const ROWS = 10

export function PaperSheet({ width, height, material, seed, wind }: PaperSheetProps) {
  const { reducedMotion } = useScene()
  const gust = useRef(0)
  const shape = useMemo(() => {
    const random = mulberry32(seed * 71 + 5)
    return {
      phase: random() * Math.PI * 2,
      bow: 0.015 + random() * 0.015,
      corners: [0, 1, 2, 3].map(() => 0.03 + random() * 0.05),
      crease: (random() - 0.5) * 0.6,
    }
  }, [seed])
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(width, height, COLS, ROWS)
    g.setAttribute(
      'color',
      new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3).fill(1), 3),
    )
    return g
  }, [width, height])
  const edge = useMemo(() => {
    const stride = COLS + 1
    const ring: number[] = []
    for (let c = 0; c <= COLS; c++) ring.push(c)
    for (let r = 1; r <= ROWS; r++) ring.push(r * stride + COLS)
    for (let c = COLS - 1; c >= 0; c--) ring.push(ROWS * stride + c)
    for (let r = ROWS - 1; r >= 0; r--) ring.push(r * stride)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ring.length * 3), 3))
    const line = new THREE.Line(
      g,
      new THREE.LineBasicMaterial({ color: '#262421', transparent: true, opacity: 0.85 }),
    )
    return { ring, line }
  }, [])
  useEffect(
    () => () => {
      edge.line.geometry.dispose()
      edge.line.material.dispose()
    },
    [edge],
  )
  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => {
    material.vertexColors = true
    material.transparent = true
    material.side = THREE.DoubleSide
    material.needsUpdate = true
  }, [material])

  const bend = (time: number, g: number) => {
    const position = geometry.attributes.position
    const color = geometry.attributes.color
    const stride = COLS + 1
    for (let i = 0; i < position.count; i++) {
      const u = (position.getX(i) / width) * 2
      const v = (position.getY(i) / height) * 2
      const corner = shape.corners[(u > 0 ? 1 : 0) + (v > 0 ? 2 : 0)]
      const reach = Math.max(0, Math.abs(u) + Math.abs(v) - 1.15)
      const breathe = 1 + Math.sin(time * 0.6 + shape.phase + u) * 0.25
      const ripple =
        Math.sin(u * 2.6 + v * 1.1 - time * (3 + g * 5) + shape.phase) * (0.006 + g * 0.05) +
        Math.sin(v * 3.4 + time * 2.2 + shape.phase) * g * 0.02
      const z =
        -u * u * shape.bow * width * breathe +
        reach * reach * corner * width * (1 + g * 1.6) +
        (u - shape.crease) * (u - shape.crease) * 0.004 * width +
        ripple * (0.4 + Math.abs(u) * 0.8) * width * 0.35
      position.setZ(i, z)
    }
    for (let i = 0; i < position.count; i++) {
      const col = i % stride
      const left = col === 0 ? i : i - 1
      const right = col === COLS ? i : i + 1
      const up = i - stride >= 0 ? i - stride : i
      const down = i + stride < position.count ? i + stride : i
      const slopeX = (position.getZ(right) - position.getZ(left)) / (width / COLS)
      const slopeY = (position.getZ(up) - position.getZ(down)) / (height / ROWS)
      const light = THREE.MathUtils.clamp(1 - slopeX * 0.22 + slopeY * 0.14, 0.9, 1)
      color.setXYZ(i, light, light, light)
    }
    position.needsUpdate = true
    color.needsUpdate = true
    const outline = edge.line.geometry.attributes.position
    edge.ring.forEach((index, n) => {
      outline.setXYZ(n, position.getX(index), position.getY(index), position.getZ(index) + 0.004)
    })
    outline.needsUpdate = true
  }

  useEffect(() => {
    bend(0, 0)
  })

  useFrame((state, delta) => {
    if (reducedMotion) return
    const target = Math.abs(windOf(wind))
    gust.current += (target - gust.current) * (1 - Math.exp(-Math.min(delta, 0.05) * 2.5))
    bend(state.clock.elapsedTime, gust.current)
  })

  return (
    <>
      <mesh geometry={geometry} material={material} renderOrder={6} />
      <primitive object={edge.line} renderOrder={7} />
    </>
  )
}
