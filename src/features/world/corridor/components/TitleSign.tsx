import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { siteConfig } from '@/data/siteConfig'
import {
  createNameGlyphs,
  createTaglineGlyphs,
  type Glyph,
} from '@/features/world/corridor/textures/titleTextures'
import { useScene } from '@/features/world/scene/SceneContext'

const SIGN_Y = 2.45
const NAME_Y = 0.18
const TAGLINE_Y = -0.5
const FADE_FAR = 2.6
const FADE_NEAR = 0.8
const SPLIT_AMOUNT = 0.9
const SPLIT_START = 3
const SPLIT_END = -2
const MAX_X = 2.75

function smooth(t: number): number {
  const c = Math.min(1, Math.max(0, t))
  return c * c * (3 - 2 * c)
}

function easeOut(t: number): number {
  return t * (2 - t)
}

function splitDirection(x: number, base: number, slope: number): number {
  return Math.sign(x || 1) * (base + Math.abs(x) * slope)
}

function useGlyphMaterials(glyphs: Glyph[]): THREE.MeshBasicMaterial[] {
  const materials = useMemo(
    () =>
      glyphs.map(
        (g) =>
          new THREE.MeshBasicMaterial({
            map: g.texture,
            transparent: true,
            alphaTest: 0.05,
            toneMapped: false,
            depthWrite: false,
            side: THREE.DoubleSide,
            forceSinglePass: true,
          }),
      ),
    [glyphs],
  )
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials])
  return materials
}

export function TitleSign({ z }: { z: number }) {
  const { reducedMotion } = useScene()
  const camera = useThree((state) => state.camera)
  const viewportWidth = useThree((state) => state.size.width)
  const group = useRef<THREE.Group>(null)
  const letters = useRef<(THREE.Mesh | null)[]>([])
  const words = useRef<(THREE.Mesh | null)[]>([])
  const split = useRef(0)

  const glyphs = useMemo(
    () => ({
      name: createNameGlyphs(siteConfig.name),
      tagline: createTaglineGlyphs(siteConfig.title),
    }),
    [],
  )
  useEffect(
    () => () => [...glyphs.name, ...glyphs.tagline].forEach((g) => g.texture.dispose()),
    [glyphs],
  )
  const nameMaterials = useGlyphMaterials(glyphs.name)
  const taglineMaterials = useGlyphMaterials(glyphs.tagline)

  const scale = 0.7 + 0.3 * Math.min(1, Math.max(0, (viewportWidth - 320) / 880))

  useFrame((state, delta) => {
    const distance = camera.position.z - z
    const opacity = smooth((distance - FADE_NEAR) / (FADE_FAR - FADE_NEAR))
    nameMaterials.forEach((m) => (m.opacity = opacity))
    taglineMaterials.forEach((m) => (m.opacity = opacity))

    let target = 0
    if (distance > 0 && distance < SPLIT_START) {
      target = SPLIT_AMOUNT * easeOut((SPLIT_START - distance) / SPLIT_START)
    } else if (distance <= 0 && distance > SPLIT_END) {
      target = SPLIT_AMOUNT * easeOut((distance - SPLIT_END) / -SPLIT_END)
    }
    split.current = reducedMotion
      ? target
      : split.current + (target - split.current) * (1 - Math.exp(-delta * 5))
    const s = split.current
    const t = state.clock.elapsedTime
    const wobble = reducedMotion ? 0 : 1

    glyphs.name.forEach((g, i) => {
      const mesh = letters.current[i]
      if (!mesh) return
      const x = g.x + splitDirection(g.x, 0.65, 0.25) * s
      mesh.position.x = THREE.MathUtils.clamp(x, -MAX_X, MAX_X)
      mesh.position.y = NAME_Y + Math.sin(t * 0.7 + i * 0.5) * 0.015 * wobble
      mesh.rotation.z = Math.sin(t * 0.5 + i) * 0.02 * (1 + s) * wobble
    })
    glyphs.tagline.forEach((g, i) => {
      const mesh = words.current[i]
      if (!mesh) return
      const x = g.x + splitDirection(g.x, 0.5, 0.4) * s * 0.6
      mesh.position.x = THREE.MathUtils.clamp(x, -MAX_X, MAX_X)
      mesh.position.y = TAGLINE_Y + Math.sin(t * 0.6 + i * 0.3) * 0.008 * wobble
    })
    if (group.current && !reducedMotion) {
      group.current.position.y = SIGN_Y + Math.sin(t * 0.5) * 0.02
    }
  })

  return (
    <group ref={group} position={[0, SIGN_Y, z]} scale={[scale, scale, 1]}>
      {glyphs.name.map((g, i) => (
        <mesh
          key={`n${i}`}
          ref={(el) => {
            letters.current[i] = el
          }}
          position={[g.x, NAME_Y, 0]}
          material={nameMaterials[i]}
        >
          <planeGeometry args={[g.width, g.height]} />
        </mesh>
      ))}
      {glyphs.tagline.map((g, i) => (
        <mesh
          key={`t${i}`}
          ref={(el) => {
            words.current[i] = el
          }}
          position={[g.x, TAGLINE_Y, 0.3]}
          material={taglineMaterials[i]}
        >
          <planeGeometry args={[g.width, g.height]} />
        </mesh>
      ))}
    </group>
  )
}
