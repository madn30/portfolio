import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { play } from '@/app/audio'
import { accentHex } from '@/data/siteConfig'
import type { TechBalloon as TechBalloonData } from '@/shared/types'
import {
  BALLOON_ASPECT,
  createPartyBalloonTexture,
} from '@/features/world/rooms/about/aboutTextures'
import { createHandwritingTexture } from '@/shared/graphics/textures/handwriting'
import { InteractiveHotspot } from '@/features/world/corridor/components/InteractiveHotspot'
import { useScene } from '@/features/world/scene/SceneContext'
import { useReveal } from './useReveal'
import { useLane } from './lane'

export interface BalloonSpot {
  x: number
  y: number
  z: number
  phase: number
}

export interface BalloonFactors {
  reveal: number
  spread: number
  time: number
}

const SIZES = { large: 3.0, medium: 2.2, small: 1.6 } as const
const SPREAD = 9
const TEXT_SECONDS = 3

interface TechBalloonProps {
  balloon: TechBalloonData
  spot: BalloonSpot
  index: number
  factors: MutableRefObject<BalloonFactors>
}

interface BalloonState {
  pop: number
  poppedAt: number
  textFade: number
  respawn: number
  scale: number
  hovered: boolean
  magnet: THREE.Vector2
  magnetTarget: THREE.Vector2
}

export function TechBalloon({ balloon, spot, index, factors }: TechBalloonProps) {
  const { touch, reducedMotion } = useScene()
  const [popping, setPopping] = useState(false)
  const outer = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  const state = useRef<BalloonState>({
    pop: 0,
    poppedAt: 0,
    textFade: 1,
    respawn: 0,
    scale: 1,
    hovered: false,
    magnet: new THREE.Vector2(),
    magnetTarget: new THREE.Vector2(),
  })
  const scratch = useMemo(() => new THREE.Vector3(), [])
  const height = SIZES[balloon.size] * (touch ? 0.85 : 1)
  const width = height * BALLOON_ASPECT
  const positionScale = Math.min(touch ? 0.5 : 1, useLane())
  const spreadScale = Math.min(touch ? 0.5 : 1, useLane(0.12))

  const textures = useMemo(() => {
    const base = { accent: accentHex[balloon.accent], seed: 70 + index }
    return {
      sketch: createPartyBalloonTexture(base, balloon.label),
      painted: createPartyBalloonTexture({ ...base, painted: true }, balloon.label),
      text: createHandwritingTexture({
        lines: [balloon.label],
        color: '#262421',
        fontSize: 84,
        width: 512,
        height: 160,
        font: 'hand',
      }),
    }
  }, [balloon, index])
  const geometries = useMemo(
    () => ({
      body: new THREE.PlaneGeometry(width, height),
      text: new THREE.PlaneGeometry(2.4, 0.75),
    }),
    [width, height],
  )
  const textMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: textures.text,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
      }),
    [textures],
  )
  useEffect(
    () => () => {
      Object.values(textures).forEach((t) => t.dispose())
      Object.values(geometries).forEach((g) => g.dispose())
      textMaterial.dispose()
    },
    [textures, geometries, textMaterial],
  )
  const reveal = useReveal(textures.sketch, textures.painted)

  const pop = () => {
    if (popping) return
    setPopping(true)
    state.current.poppedAt = factors.current.time
    reveal.setHovered(false)
    play('tear')
  }

  const onMove = (event: ThreeEvent<PointerEvent>) => {
    const s = state.current
    if (!s.hovered || popping || !outer.current || touch) return
    outer.current.getWorldPosition(scratch)
    s.magnetTarget.set((event.point.x - scratch.x) * 0.15, (event.point.y - scratch.y) * 0.15)
  }

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const s = state.current
    const { reveal: f, spread, time } = factors.current
    const lift = s.hovered && !popping ? 1.05 : 1
    s.scale = THREE.MathUtils.lerp(s.scale, lift, 8 * dt)
    if (!s.hovered || popping) s.magnetTarget.set(0, 0)
    s.magnet.lerp(s.magnetTarget, 8 * dt)
    if (popping) {
      s.pop = reducedMotion ? 1 : THREE.MathUtils.lerp(s.pop, 1, 2.5 * dt)
      if (time - s.poppedAt > TEXT_SECONDS) {
        s.textFade = reducedMotion ? 0 : THREE.MathUtils.lerp(s.textFade, 0, 2 * dt)
      }
      if (s.textFade < 0.05) {
        setPopping(false)
        s.pop = 0
        s.textFade = 1
        s.respawn = -12
        s.hovered = false
      }
    }
    if (s.respawn < -0.01) s.respawn = THREE.MathUtils.lerp(s.respawn, 0, 1.5 * dt)
    reveal.fade.current = 1 - s.pop
    textMaterial.opacity = popping ? s.pop * s.textFade : 0

    const floatY = reducedMotion ? 0 : Math.sin(time * 0.6 + spot.phase) * 0.3
    const floatX = reducedMotion ? 0 : Math.sin(time * 0.4 + spot.phase * 0.7) * 0.15
    const roll = reducedMotion ? 0 : Math.sin(time * 0.3 + spot.phase) * 0.08
    const startY = spot.y - 8
    const y = startY + f * (spot.y - startY) + floatY + s.respawn
    const scale = Math.max(0.001, f * (s.scale + s.pop * 0.4))
    const maxSpread = SPREAD * spreadScale
    let spreadX: number
    if (spot.x < -0.5) spreadX = -spread * maxSpread * (0.5 + Math.abs(spot.x) / 6)
    else if (spot.x > 0.5) spreadX = spread * maxSpread * (0.5 + Math.abs(spot.x) / 6)
    else spreadX = (spot.phase > 3.5 ? 1 : -1) * spread * maxSpread * 0.8
    if (outer.current) {
      outer.current.position.set(spot.x * positionScale + floatX + spreadX, y, spot.z)
      outer.current.rotation.z = roll
      outer.current.scale.setScalar(scale)
    }
    if (inner.current) inner.current.position.set(s.magnet.x, s.magnet.y, 0)
  })

  return (
    <group ref={outer} position={[spot.x * positionScale, spot.y - 8, spot.z]}>
      <group ref={inner}>
        <InteractiveHotspot
          label={`Pop ${balloon.label}`}
          onActivate={pop}
          onHoverChange={(on) => {
            state.current.hovered = on
            reveal.setHovered(on && !popping)
          }}
          hitArea={[width * 0.9, height * 0.75, touch ? 0.8 : 0.3]}
          hitAreaPosition={[0, height * 0.12, 0]}
          disabled={popping}
        >
          <mesh geometry={geometries.body} material={reveal.painted} position={[0, 0, -0.002]} />
          <mesh geometry={geometries.body} material={reveal.sketch} onPointerMove={onMove} />
        </InteractiveHotspot>
        <mesh
          geometry={geometries.text}
          material={textMaterial}
          position={[0, height * 0.1, 0.1]}
        />
      </group>
    </group>
  )
}
