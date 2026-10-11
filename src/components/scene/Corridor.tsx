import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { doors } from '@/data/siteConfig'
import { CORRIDOR } from '@/utils/corridor'
import { createSketchPolyline, mulberry32 } from '@/utils/sketch'
import { getGradientTexture } from '@/utils/textures'
import { useScene } from './SceneContext'
import { SketchEdges } from './SketchEdges'

const { width, height, zStart, zEnd } = CORRIDOR
const HALF = width / 2
const LENGTH = zStart - zEnd
const Z_MID = (zStart + zEnd) / 2
const HOLE_HALF = CORRIDOR.door.width / 2 + 0.07
const HOLE_HEIGHT = CORRIDOR.door.height + 0.06

interface WallSegment {
  zFrom: number
  zTo: number
  yFrom: number
  yTo: number
}

/** Wall panels between door openings, plus the lintel above each opening. */
function sideWallSegments(side: 'left' | 'right'): WallSegment[] {
  const holes = doors
    .filter((d) => d.side === side)
    .map((d) => ({ from: d.z - HOLE_HALF, to: d.z + HOLE_HALF }))
    .sort((a, b) => b.from - a.from)
  const segments: WallSegment[] = []
  let cursor: number = zStart
  for (const hole of holes) {
    segments.push({ zFrom: cursor, zTo: hole.to, yFrom: 0, yTo: height })
    segments.push({ zFrom: hole.to, zTo: hole.from, yFrom: HOLE_HEIGHT, yTo: height })
    cursor = hole.from
  }
  segments.push({ zFrom: cursor, zTo: zEnd, yFrom: 0, yTo: height })
  return segments.filter((s) => s.zFrom - s.zTo > 0.01 && s.yTo - s.yFrom > 0.01)
}

function v(x: number, y: number, z: number): THREE.Vector3 {
  return new THREE.Vector3(x, y, z)
}

export function Corridor() {
  const { materials, quality } = useScene()
  const detailed = quality !== 'low'

  const leftSegments = useMemo(() => sideWallSegments('left'), [])
  const rightSegments = useMemo(() => sideWallSegments('right'), [])

  // Pencil seams: floor/ceiling edges, dado rails, far-wall corners.
  const inkLines = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = []
    const sub = detailed ? 40 : 16
    const seam = (points: THREE.Vector3[], seed: number) =>
      geometries.push(
        createSketchPolyline(points, { jitter: 0.02, subdivisions: sub, seed, passes: 2 }),
      )

    seam([v(-HALF, 0, zStart), v(-HALF, 0, zEnd)], 1)
    seam([v(HALF, 0, zStart), v(HALF, 0, zEnd)], 2)
    seam([v(-HALF, height, zStart), v(-HALF, height, zEnd)], 3)
    seam([v(HALF, height, zStart), v(HALF, height, zEnd)], 4)
    seam([v(-HALF, 0, zEnd), v(HALF, 0, zEnd)], 5)
    seam([v(-HALF, height, zEnd), v(HALF, height, zEnd)], 6)
    seam([v(-HALF, 0, zEnd), v(-HALF, height, zEnd)], 7)
    seam([v(HALF, 0, zEnd), v(HALF, height, zEnd)], 8)
    // Dado rail, interrupted by the door openings.
    const rail = (side: 'left' | 'right', x: number, seedBase: number) => {
      sideWallSegments(side)
        .filter((s) => s.yFrom === 0)
        .forEach((s, i) => {
          seam([v(x, 1.05, s.zFrom), v(x, 1.05, s.zTo)], seedBase + i)
          seam([v(x, 0.98, s.zFrom), v(x, 0.98, s.zTo)], seedBase + 10 + i)
        })
    }
    rail('left', -HALF + 0.01, 20)
    rail('right', HALF - 0.01, 40)
    return geometries
  }, [detailed])

  // Floorboards: long soft strokes plus staggered joints.
  const softLines = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = []
    const random = mulberry32(2024)
    const planks = [-2.25, -1.5, -0.75, 0, 0.75, 1.5, 2.25]
    planks.forEach((x, i) => {
      geometries.push(
        createSketchPolyline([v(x, 0.002, zStart), v(x, 0.002, zEnd)], {
          jitter: 0.015,
          subdivisions: detailed ? 48 : 20,
          seed: 100 + i,
        }),
      )
    })
    if (detailed) {
      const xs = [-HALF, ...planks, HALF]
      for (let i = 0; i < xs.length - 1; i++) {
        let z = zStart - random() * 2
        while (z > zEnd) {
          geometries.push(
            createSketchPolyline([v(xs[i], 0.002, z), v(xs[i + 1], 0.002, z)], {
              jitter: 0.01,
              subdivisions: 3,
              seed: 300 + i * 50 + Math.round(z),
            }),
          )
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
  const skirtingGeometries = useMemo(
    () =>
      [...leftSegments, ...rightSegments]
        .filter((s) => s.yFrom === 0)
        .map((s) => new THREE.BoxGeometry(0.06, 0.12, s.zFrom - s.zTo)),
    [leftSegments, rightSegments],
  )
  useEffect(
    () => () => {
      beamGeometry.dispose()
      skirtingGeometries.forEach((g) => g.dispose())
    },
    [beamGeometry, skirtingGeometries],
  )

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
        color: '#4a3a2a',
        transparent: true,
        opacity: 0.22,
        alphaMap: map,
        depthWrite: false,
      })
    return {
      wallLeft: make(aoVertical),
      floorLeft: make(aoHorizontal),
      floorRight: make(aoHorizontal),
    }
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
    () => new THREE.MeshToonMaterial({ color: '#c9a184', gradientMap: materials.wall.gradientMap }),
    [materials],
  )
  useEffect(() => () => rugMaterial.dispose(), [rugMaterial])

  const beams = useMemo(() => {
    const list: number[] = []
    for (let z = 2; z > zEnd + 1; z -= 6) list.push(z)
    return detailed ? list : list.filter((_, i) => i % 2 === 0)
  }, [detailed])

  const skirtingSegments = [...leftSegments, ...rightSegments].filter((s) => s.yFrom === 0)
  const leftCount = leftSegments.filter((s) => s.yFrom === 0).length

  return (
    <group>
      {/* Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, Z_MID]}
        material={materials.floor}
        receiveShadow
      >
        <planeGeometry args={[width, LENGTH]} />
      </mesh>

      {/* Ceiling */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, height, Z_MID]}
        material={materials.ceiling}
      >
        <planeGeometry args={[width, LENGTH]} />
      </mesh>

      {/* Side walls */}
      {leftSegments.map((s, i) => (
        <mesh
          key={`l${i}`}
          position={[-HALF, (s.yFrom + s.yTo) / 2, (s.zFrom + s.zTo) / 2]}
          rotation={[0, Math.PI / 2, 0]}
          material={materials.wall}
          receiveShadow
        >
          <planeGeometry args={[s.zFrom - s.zTo, s.yTo - s.yFrom]} />
        </mesh>
      ))}
      {rightSegments.map((s, i) => (
        <mesh
          key={`r${i}`}
          position={[HALF, (s.yFrom + s.yTo) / 2, (s.zFrom + s.zTo) / 2]}
          rotation={[0, -Math.PI / 2, 0]}
          material={materials.wall}
          receiveShadow
        >
          <planeGeometry args={[s.zFrom - s.zTo, s.yTo - s.yFrom]} />
        </mesh>
      ))}

      {/* Far wall with an opening for the last door */}
      <mesh position={[-(HALF + HOLE_HALF) / 2, height / 2, zEnd]} material={materials.wall}>
        <planeGeometry args={[HALF - HOLE_HALF, height]} />
      </mesh>
      <mesh position={[(HALF + HOLE_HALF) / 2, height / 2, zEnd]} material={materials.wall}>
        <planeGeometry args={[HALF - HOLE_HALF, height]} />
      </mesh>
      <mesh position={[0, (HOLE_HEIGHT + height) / 2, zEnd]} material={materials.wall}>
        <planeGeometry args={[HOLE_HALF * 2, height - HOLE_HEIGHT]} />
      </mesh>

      {/* Pencil seams and floorboards */}
      {inkLines.map((g, i) => (
        <lineSegments key={`ink${i}`} geometry={g} material={materials.line} />
      ))}
      {softLines.map((g, i) => (
        <lineSegments key={`soft${i}`} geometry={g} material={materials.lineSoft} />
      ))}

      {/* Skirting boards */}
      {skirtingSegments.map((s, i) => {
        const left = i < leftCount
        return (
          <group
            key={`sk${i}`}
            position={[left ? -HALF + 0.03 : HALF - 0.03, 0.06, (s.zFrom + s.zTo) / 2]}
          >
            <mesh geometry={skirtingGeometries[i]} material={materials.woodDark} />
            <SketchEdges
              geometry={skirtingGeometries[i]}
              seed={500 + i}
              jitter={0.008}
              subdivisions={4}
            />
          </group>
        )
      })}

      {/* Ceiling beams give the perspective a rhythm */}
      {beams.map((z, i) => (
        <group key={`beam${i}`} position={[0, height - 0.08, z]}>
          <mesh geometry={beamGeometry} material={materials.woodDark} castShadow={false} />
          <SketchEdges geometry={beamGeometry} seed={700 + i} jitter={0.01} subdivisions={5} />
        </group>
      ))}

      {/* Fake ambient occlusion where walls meet the floor */}
      <mesh
        position={[-HALF + 0.005, 0.3, Z_MID]}
        rotation={[0, Math.PI / 2, Math.PI]}
        material={aoMaterials.wallLeft}
      >
        <planeGeometry args={[LENGTH, 0.6]} />
      </mesh>
      <mesh
        position={[HALF - 0.005, 0.3, Z_MID]}
        rotation={[0, -Math.PI / 2, Math.PI]}
        material={aoMaterials.wallLeft}
      >
        <planeGeometry args={[LENGTH, 0.6]} />
      </mesh>
      <mesh
        position={[-HALF + 0.3, 0.003, Z_MID]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        material={aoMaterials.floorLeft}
      >
        <planeGeometry args={[LENGTH, 0.6]} />
      </mesh>
      <mesh
        position={[HALF - 0.3, 0.003, Z_MID]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        material={aoMaterials.floorRight}
      >
        <planeGeometry args={[LENGTH, 0.6]} />
      </mesh>

      {/* Entrance rug */}
      <group position={[0, 0.004, 1.2]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={rugMaterial} receiveShadow>
          <planeGeometry args={[2.4, 3.2]} />
        </mesh>
        <RugOutline />
      </group>
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
