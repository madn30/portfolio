import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { CORRIDOR, LOOP_SHIFT } from '@/shared/corridor/corridor'
import { createSketchPolyline, mulberry32 } from '@/shared/graphics/sketch'
import { getGradientTexture } from '@/shared/graphics/textures/surfaces'
import { CorridorWalls } from './CorridorWalls'
import { useScene } from '@/features/world/scene/SceneContext'
import { SketchEdges } from './SketchEdges'

const { width, height, zStart, zEnd, zBeyond } = CORRIDOR
const HALF = width / 2
const LENGTH = zStart - zBeyond
const Z_MID = (zStart + zBeyond) / 2
const LOOP_HOLE_HALF = CORRIDOR.loopDoor.width / 2 + 0.07
const LOOP_HOLE_HEIGHT = CORRIDOR.loopDoor.height + 0.06
const RUG_Z = [1.2, 1.2 - LOOP_SHIFT]

function v(x: number, y: number, z: number): THREE.Vector3 {
  return new THREE.Vector3(x, y, z)
}

export function Corridor() {
  const { materials, quality } = useScene()
  const detailed = quality !== 'low'

  const inkLines = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = []
    const sub = detailed ? 40 : 16
    const seam = (points: THREE.Vector3[], seed: number) =>
      geometries.push(
        createSketchPolyline(points, { jitter: 0.02, subdivisions: sub, seed, passes: 2 }),
      )
    seam([v(-HALF, 0, zStart), v(-HALF, 0, zBeyond)], 1)
    seam([v(HALF, 0, zStart), v(HALF, 0, zBeyond)], 2)
    seam([v(-HALF, height, zStart), v(-HALF, height, zBeyond)], 3)
    seam([v(HALF, height, zStart), v(HALF, height, zBeyond)], 4)
    for (const z of [zEnd, zEnd + LOOP_SHIFT]) {
      seam([v(-HALF, 0, z), v(HALF, 0, z)], 5)
      seam([v(-HALF, height, z), v(HALF, height, z)], 6)
      seam([v(-HALF, 0, z), v(-HALF, height, z)], 7)
      seam([v(HALF, 0, z), v(HALF, height, z)], 8)
    }
    return geometries
  }, [detailed])

  const softLines = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = []
    const random = mulberry32(2024)
    const planks = [-2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5]
    if (detailed) {
      const xs = [-HALF, ...planks, HALF]
      for (let i = 0; i < xs.length - 1; i++) {
        let z = zStart - random() * 2
        while (z > zStart - LOOP_SHIFT) {
          for (const zz of [z, z - LOOP_SHIFT]) {
            if (zz <= zBeyond) continue
            geometries.push(
              createSketchPolyline([v(xs[i], 0.002, zz), v(xs[i + 1], 0.002, zz)], {
                jitter: 0.01,
                subdivisions: 3,
                seed: 300 + i * 50 + Math.round(z),
              }),
            )
          }
          z -= 1.6 + random() * 2.4
        }
      }
    }
    return geometries
  }, [detailed])

  useEffect(
    () => () => {
      inkLines.forEach((g) => g.dispose())
      softLines.forEach((g) => g.dispose())
    },
    [inkLines, softLines],
  )

  const beamGeometry = useMemo(() => new THREE.BoxGeometry(width, 0.16, 0.22), [])
  useEffect(() => () => beamGeometry.dispose(), [beamGeometry])

  const aoVertical = useMemo(() => {
    const t = getGradientTexture().clone()
    t.needsUpdate = true
    return t
  }, [])
  const aoHorizontal = useMemo(() => {
    const t = getGradientTexture().clone()
    t.center.set(0.5, 0.5)
    t.rotation = Math.PI / 2
    t.needsUpdate = true
    return t
  }, [])
  const aoMaterials = useMemo(() => {
    const make = (map: THREE.Texture) =>
      new THREE.MeshBasicMaterial({
        color: '#5f5b55',
        transparent: true,
        opacity: 0.12,
        alphaMap: map,
        depthWrite: false,
      })
    return { wall: make(aoVertical), floor: make(aoHorizontal) }
  }, [aoVertical, aoHorizontal])
  useEffect(
    () => () => {
      aoVertical.dispose()
      aoHorizontal.dispose()
      Object.values(aoMaterials).forEach((m) => m.dispose())
    },
    [aoVertical, aoHorizontal, aoMaterials],
  )

  const rugMaterial = useMemo(
    () => new THREE.MeshToonMaterial({ color: '#e9e5dc', gradientMap: materials.wall.gradientMap }),
    [materials],
  )
  useEffect(() => () => rugMaterial.dispose(), [rugMaterial])

  const beams = useMemo(() => {
    const spacing = detailed ? 6 : 12
    const lap: number[] = []
    for (let z = 2; z > 2 - LOOP_SHIFT; z -= spacing) lap.push(z)
    return lap
      .flatMap((z) => [z, z - LOOP_SHIFT, z + LOOP_SHIFT])
      .filter((z) => z < zStart - 0.5 && z > zBeyond + 0.5)
      .sort((a, b) => b - a)
  }, [detailed])

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, Z_MID]}
        material={materials.floor}
        receiveShadow
      >
        <planeGeometry args={[width, LENGTH]} />
      </mesh>
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, height, Z_MID]}
        material={materials.ceiling}
      >
        <planeGeometry args={[width, LENGTH]} />
      </mesh>

      <CorridorWalls />

      {[zEnd, zEnd + LOOP_SHIFT].map((z) => (
        <group key={z}>
          <mesh position={[-(HALF + LOOP_HOLE_HALF) / 2, height / 2, z]} material={materials.wall}>
            <planeGeometry args={[HALF - LOOP_HOLE_HALF, height]} />
          </mesh>
          <mesh position={[(HALF + LOOP_HOLE_HALF) / 2, height / 2, z]} material={materials.wall}>
            <planeGeometry args={[HALF - LOOP_HOLE_HALF, height]} />
          </mesh>
          <mesh position={[0, (LOOP_HOLE_HEIGHT + height) / 2, z]} material={materials.wall}>
            <planeGeometry args={[LOOP_HOLE_HALF * 2, height - LOOP_HOLE_HEIGHT]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, height / 2, zBeyond]} material={materials.wall}>
        <planeGeometry args={[width, height]} />
      </mesh>

      {inkLines.map((g, i) => (
        <lineSegments key={`ink${i}`} geometry={g} material={materials.line} />
      ))}
      {softLines.map((g, i) => (
        <lineSegments key={`soft${i}`} geometry={g} material={materials.lineSoft} />
      ))}

      {beams.map((z, i) => (
        <group key={`beam${i}`} position={[0, height - 0.08, z]}>
          <mesh geometry={beamGeometry} material={materials.woodDark} castShadow={false} />
          <SketchEdges geometry={beamGeometry} seed={700 + i} jitter={0.01} subdivisions={5} />
        </group>
      ))}

      <mesh
        position={[-HALF + 0.005, 0.3, Z_MID]}
        rotation={[0, Math.PI / 2, Math.PI]}
        material={aoMaterials.wall}
      >
        <planeGeometry args={[LENGTH, 0.6]} />
      </mesh>
      <mesh
        position={[HALF - 0.005, 0.3, Z_MID]}
        rotation={[0, -Math.PI / 2, Math.PI]}
        material={aoMaterials.wall}
      >
        <planeGeometry args={[LENGTH, 0.6]} />
      </mesh>
      <mesh
        position={[-HALF + 0.3, 0.003, Z_MID]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        material={aoMaterials.floor}
      >
        <planeGeometry args={[LENGTH, 0.6]} />
      </mesh>
      <mesh
        position={[HALF - 0.3, 0.003, Z_MID]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        material={aoMaterials.floor}
      >
        <planeGeometry args={[LENGTH, 0.6]} />
      </mesh>

      {RUG_Z.map((z) => (
        <group key={z} position={[0, 0.004, z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} material={rugMaterial} receiveShadow>
            <planeGeometry args={[2.4, 3.2]} />
          </mesh>
          <RugOutline />
        </group>
      ))}
    </group>
  )
}

function RugOutline() {
  const { materials } = useScene()
  const geometry = useMemo(() => {
    const outer = [
      v(-1.2, 0.002, 1.6),
      v(1.2, 0.002, 1.6),
      v(1.2, 0.002, -1.6),
      v(-1.2, 0.002, -1.6),
      v(-1.2, 0.002, 1.6),
    ]
    const inner = [
      v(-1.0, 0.002, 1.4),
      v(1.0, 0.002, 1.4),
      v(1.0, 0.002, -1.4),
      v(-1.0, 0.002, -1.4),
      v(-1.0, 0.002, 1.4),
    ]
    const a = createSketchPolyline(outer, { jitter: 0.02, subdivisions: 8, seed: 11, passes: 2 })
    const b = createSketchPolyline(inner, { jitter: 0.015, subdivisions: 6, seed: 12 })
    const merged = new THREE.BufferGeometry()
    const pa = a.getAttribute('position').array as Float32Array
    const pb = b.getAttribute('position').array as Float32Array
    const combined = new Float32Array(pa.length + pb.length)
    combined.set(pa)
    combined.set(pb, pa.length)
    merged.setAttribute('position', new THREE.BufferAttribute(combined, 3))
    a.dispose()
    b.dispose()
    return merged
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  return <lineSegments geometry={geometry} material={materials.line} />
}
