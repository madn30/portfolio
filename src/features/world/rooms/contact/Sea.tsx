import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { createWaveCrestTexture } from '@/features/world/rooms/contact/contactTextures'
import { createGradientTexture, createHazeTexture } from '@/shared/graphics/spriteTextures'
import { useScene } from '@/features/world/scene/SceneContext'
import { HAZE, HORIZON, PIER_LENGTH, SEA_DEPTH, SEA_LEVEL, SEA_WIDTH, SKY } from './constants'
import { createSeaTexture } from './seaTextures'

const WAVE_ROWS = [
  { z: -(PIER_LENGTH + 3.5), speed: 0.8, amplitude: 0.15, opacity: 1 },
  { z: -(PIER_LENGTH + 10), speed: 0.95, amplitude: 0.13, opacity: 0.88 },
  { z: -(PIER_LENGTH + 17), speed: 1.1, amplitude: 0.11, opacity: 0.76 },
  { z: -(PIER_LENGTH + 24), speed: 1.25, amplitude: 0.09, opacity: 0.64 },
]

export function Sea() {
  const { quality, reducedMotion } = useScene()
  const gl = useThree((s) => s.gl)
  const rows = useRef<(THREE.Mesh | null)[]>([])
  const visibleRows = quality === 'low' ? WAVE_ROWS.slice(0, 2) : WAVE_ROWS

  const textures = useMemo(() => {
    const sea = createSeaTexture(quality === 'low' ? 512 : 1024)
    sea.repeat.set(SEA_WIDTH / 5, SEA_DEPTH / 5)
    sea.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    const crest = createWaveCrestTexture()
    crest.repeat.set(SEA_WIDTH / 7, 1)
    crest.anisotropy = sea.anisotropy
    const sky = createGradientTexture([
      [0, SKY],
      [0.4, SKY],
      [0.7, HORIZON],
      [1, HORIZON],
    ])
    return { sea, haze: createHazeTexture(HAZE), crest, sky }
  }, [gl, quality])
  const materials = useMemo(
    () => ({
      sky: new THREE.MeshBasicMaterial({ map: textures.sky, side: THREE.BackSide, fog: false }),
      skyTop: new THREE.MeshBasicMaterial({ color: SKY, side: THREE.BackSide, fog: false }),
      sea: new THREE.MeshBasicMaterial({ map: textures.sea, toneMapped: false, fog: false }),
      haze: new THREE.MeshBasicMaterial({
        map: textures.haze,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        fog: false,
      }),
      rows: WAVE_ROWS.map(
        (row) =>
          new THREE.MeshBasicMaterial({
            map: textures.crest,
            transparent: true,
            opacity: row.opacity,
            depthWrite: false,
            side: THREE.DoubleSide,
            forceSinglePass: true,
            toneMapped: false,
          }),
      ),
    }),
    [textures],
  )
  const geometries = useMemo(
    () => ({
      sea: new THREE.PlaneGeometry(SEA_WIDTH, SEA_DEPTH),
      row: new THREE.PlaneGeometry(SEA_WIDTH, 1.4),
    }),
    [],
  )
  useEffect(
    () => () => {
      Object.values(textures).forEach((t) => t.dispose())
      materials.sky.dispose()
      materials.skyTop.dispose()
      materials.sea.dispose()
      materials.haze.dispose()
      materials.rows.forEach((m) => m.dispose())
      Object.values(geometries).forEach((g) => g.dispose())
    },
    [textures, materials, geometries],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    textures.sea.offset.x = (t * 0.006) % 1
    textures.sea.offset.y = (Math.sin(t * 0.25) * 0.004) % 1
    if (reducedMotion) return
    textures.crest.offset.x = (t * 0.004) % 1
    rows.current.forEach((mesh, i) => {
      if (!mesh) return
      const row = WAVE_ROWS[i]
      mesh.position.y = SEA_LEVEL + 0.02 + Math.sin(t * row.speed + i * 0.5) * row.amplitude
      mesh.position.x = Math.sin(t * 0.3 + i) * 0.3
    })
  })

  return (
    <>
      <mesh
        position={[0, 8, -SEA_DEPTH / 2 - 0.05]}
        material={[
          materials.sky,
          materials.sky,
          materials.skyTop,
          materials.skyTop,
          materials.sky,
          materials.sky,
        ]}
      >
        <boxGeometry args={[SEA_WIDTH, 40, SEA_DEPTH]} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, SEA_LEVEL, -SEA_DEPTH / 2 - 0.1]}
        geometry={geometries.sea}
        material={materials.sea}
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, SEA_LEVEL + 0.01, -SEA_DEPTH / 2 - 0.1]}
        geometry={geometries.sea}
        material={materials.haze}
      />
      {visibleRows.map((row, i) => (
        <mesh
          key={row.z}
          ref={(el) => {
            rows.current[i] = el
          }}
          rotation={[-Math.PI / 2.5, 0, 0]}
          position={[0, SEA_LEVEL + 0.02, row.z]}
          geometry={geometries.row}
          material={materials.rows[i]}
        />
      ))}
    </>
  )
}
