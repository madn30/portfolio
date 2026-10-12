import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mulberry32 } from '@/shared/graphics/sketch'
import { createGlyphAtlas, GLYPH_GRID, GLYPHS } from '@/features/world/studio/studioTextures'
import { useScene } from '@/features/world/scene/SceneContext'
import { studioRefs } from './store'

const COUNT = { high: 60, medium: 48, low: 24 } as const
const X_HALF = 15
const Y_MIN = -8
const Y_MAX = 12
const Z_MIN = -15
const Z_MAX = -11
const BASE_OPACITY = 0.4

const VERTEX = `
attribute float aGlyph;
attribute float aOpacity;
uniform vec2 uGrid;
varying vec2 vUv;
varying float vOpacity;
#include <fog_pars_vertex>
void main() {
  float col = mod(aGlyph, uGrid.x);
  float row = floor(aGlyph / uGrid.x);
  vUv = (uv + vec2(col, uGrid.y - 1.0 - row)) / uGrid;
  vOpacity = aOpacity;
  vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`

const FRAGMENT = `
uniform sampler2D uAtlas;
uniform vec3 uColor;
varying vec2 vUv;
varying float vOpacity;
#include <fog_pars_fragment>
void main() {
  float alpha = texture2D(uAtlas, vUv).a * vOpacity;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(uColor, alpha);
  #include <fog_fragment>
  #include <colorspace_fragment>
}
`

interface Particle {
  glyph: number
  size: number
  x: number
  y: number
  z: number
  rotation: number
  drift: number
  spin: number
  parallax: number
  phase: number
  opacity: number
}

const TOTAL_WEIGHT = GLYPHS.reduce((sum, g) => sum + g.weight, 0)

function pickGlyph(random: () => number): number {
  let r = random() * TOTAL_WEIGHT
  for (let i = 0; i < GLYPHS.length; i++) {
    r -= GLYPHS[i].weight
    if (r <= 0) return i
  }
  return 0
}

function makeParticles(count: number): Particle[] {
  const random = mulberry32(21)
  return Array.from({ length: count }, () => {
    const glyph = pickGlyph(random)
    return {
      glyph,
      size: GLYPHS[glyph].size * 1.8,
      x: (random() - 0.5) * X_HALF * 2,
      y: Y_MIN + random() * (Y_MAX - Y_MIN),
      z: Z_MIN + random() * (Z_MAX - Z_MIN),
      rotation: random() * Math.PI * 2,
      drift: 0.1 + random() * 0.2,
      spin: (random() - 0.5) * 0.3,
      parallax: 0.3 + random() * 0.7,
      phase: random() * Math.PI * 2,
      opacity: BASE_OPACITY * (0.5 + random() * 0.5),
    }
  })
}

export function CodeParticles() {
  const { quality, reducedMotion } = useScene()
  const count = COUNT[quality]
  const particles = useMemo(() => makeParticles(count), [count])
  const offsets = useMemo(() => new Float32Array(count), [count])
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1)
    g.setAttribute(
      'aGlyph',
      new THREE.InstancedBufferAttribute(Float32Array.from(particles.map((p) => p.glyph)), 1),
    )
    g.setAttribute(
      'aOpacity',
      new THREE.InstancedBufferAttribute(Float32Array.from(particles.map((p) => p.opacity)), 1),
    )
    return g
  }, [particles])
  const atlas = useMemo(() => createGlyphAtlas(), [])
  const material = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uAtlas: { value: null },
          uGrid: { value: new THREE.Vector2(GLYPH_GRID.columns, GLYPH_GRID.rows) },
          uColor: { value: new THREE.Color('#ffe9b0') },
        },
      ]),
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthWrite: false,
      fog: true,
    })
    m.uniforms.uAtlas.value = atlas
    return m
  }, [atlas])
  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
      atlas.dispose()
    },
    [geometry, material, atlas],
  )

  const mesh = useRef<THREE.InstancedMesh>(null)
  const smooth = useRef(0)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const place = useCallback(
    (t: number, dt: number) => {
      const instanced = mesh.current
      if (!instanced) return
      smooth.current += (studioRefs.rotation - smooth.current) * (1 - Math.exp(-dt * 5))
      const span = Y_MAX - Y_MIN
      const width = X_HALF * 2
      particles.forEach((p, i) => {
        offsets[i] -= studioRefs.fall * dt * p.parallax * 1.5
        let y = p.y + offsets[i] + Math.sin(t * p.drift + p.phase) * 0.3
        while (y < Y_MIN) {
          offsets[i] += span
          y += span
        }
        while (y > Y_MAX) {
          offsets[i] -= span
          y -= span
        }
        const raw = p.x + smooth.current * 5 * p.parallax
        const x = ((((raw + X_HALF) % width) + width) % width) - X_HALF
        dummy.position.set(x, y, p.z)
        dummy.rotation.z = p.rotation + t * p.spin
        dummy.scale.setScalar(p.size)
        dummy.updateMatrix()
        instanced.setMatrixAt(i, dummy.matrix)
      })
      instanced.instanceMatrix.needsUpdate = true
    },
    [particles, offsets, dummy],
  )

  useEffect(() => place(0, 0), [place])

  useFrame((state, delta) => {
    if (reducedMotion) return
    place(state.clock.elapsedTime, Math.min(delta, 0.05))
  })

  return <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />
}
