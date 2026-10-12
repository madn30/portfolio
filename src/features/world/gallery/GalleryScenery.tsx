import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { createSketchPolyline } from '@/shared/graphics/sketch'
import { useScene } from '@/features/world/scene/SceneContext'
import { SketchEdges } from '@/features/world/corridor/components/SketchEdges'
import { LINE_HALF } from './galleryLayout'
import { PaintedBasicMaterial, type PaintUniforms } from './paintReveal'
import { createPlankTexture } from './plankTexture'
import { createHousesTexture, createRailingTexture, createSkylineTexture } from './sceneryTextures'

const DECK_NEAR = 1.2
const DECK_FAR = 6.5
const DECK_DEPTH = 6.2
const RAIL_Z = -5.95
const RAIL_H = 1.1
const RAIL_W = 18
const HOUSES_W = 12
const HOUSES_H = HOUSES_W / 2.357
const SKY_W = 24
const SKY_H = SKY_W / 2.357

interface GallerySceneryProps {
  paint: PaintUniforms
}

export function GalleryScenery({ paint }: GallerySceneryProps) {
  const { materials: scene, quality } = useScene()
  const textures = useMemo(() => {
    const floor = createPlankTexture(512, 1024, 7, 21)
    floor.wrapS = floor.wrapT = THREE.RepeatWrapping
    floor.repeat.set(1 / 2.8, 1 / 5.6)
    const railing = createRailingTexture(22)
    railing.repeat.set(RAIL_W / 2, 1)
    return { floor, railing, houses: createHousesTexture(23), skyline: createSkylineTexture(24) }
  }, [])
  const materials = useMemo(
    () => ({
      floor: new PaintedBasicMaterial(paint, { map: textures.floor, color: '#ffffff' }),
      railing: new PaintedBasicMaterial(paint, {
        map: textures.railing,
        transparent: true,
        alphaTest: 0.1,
        side: THREE.DoubleSide,
      }),
      houses: new PaintedBasicMaterial(paint, {
        map: textures.houses,
        transparent: true,
        alphaTest: 0.1,
        side: THREE.DoubleSide,
      }),
      skyline: new PaintedBasicMaterial(paint, {
        map: textures.skyline,
        transparent: true,
        alphaTest: 0.1,
        side: THREE.DoubleSide,
        fog: false,
      }),
      pole: new PaintedBasicMaterial(paint, { color: '#7a4e2b' }),
      rail: new PaintedBasicMaterial(paint, { color: '#a9713f' }),
    }),
    [paint, textures],
  )
  const geometries = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-DECK_NEAR, 0)
    shape.lineTo(DECK_NEAR, 0)
    shape.lineTo(DECK_FAR, DECK_DEPTH)
    shape.lineTo(-DECK_FAR, DECK_DEPTH)
    shape.closePath()
    const edge = createSketchPolyline(
      [
        new THREE.Vector3(-DECK_NEAR, 0.01, 0),
        new THREE.Vector3(-DECK_FAR, 0.01, -DECK_DEPTH),
        new THREE.Vector3(DECK_FAR, 0.01, -DECK_DEPTH),
        new THREE.Vector3(DECK_NEAR, 0.01, 0),
      ],
      { jitter: 0.015, subdivisions: 10, seed: 91, passes: 2 },
    )
    return {
      floor: new THREE.ShapeGeometry(shape),
      edge,
      railing: new THREE.PlaneGeometry(RAIL_W, RAIL_H),
      rail: new THREE.BoxGeometry(RAIL_W, 0.06, 0.08),
      pole: new THREE.CylinderGeometry(0.04, 0.05, 3.6, 7),
      houses: new THREE.PlaneGeometry(HOUSES_W, HOUSES_H),
      skyline: new THREE.PlaneGeometry(SKY_W, SKY_H),
    }
  }, [])
  useEffect(
    () => () => {
      Object.values(materials).forEach((m) => m.dispose())
      Object.values(textures).forEach((t) => t.dispose())
      Object.values(geometries).forEach((g) => g.dispose())
    },
    [materials, textures, geometries],
  )
  const skylineCopies = quality === 'low' ? [0] : [0, -SKY_W, SKY_W]

  return (
    <>
      <mesh
        position={[0, 0.002, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={geometries.floor}
        material={materials.floor}
      />
      <lineSegments geometry={geometries.edge} material={scene.line} />
      <mesh
        position={[0, RAIL_H / 2, RAIL_Z]}
        geometry={geometries.railing}
        material={materials.railing}
      />
      <group position={[0, RAIL_H + 0.03, RAIL_Z]}>
        <mesh geometry={geometries.rail} material={materials.rail} />
        <SketchEdges geometry={geometries.rail} seed={64} jitter={0.008} subdivisions={10} />
      </group>
      {[-LINE_HALF, LINE_HALF].map((x, i) => (
        <group key={x} position={[x, 1.8, -8.6]}>
          <mesh geometry={geometries.pole} material={materials.pole} />
          <SketchEdges
            geometry={geometries.pole}
            seed={66 + i}
            jitter={0.008}
            subdivisions={4}
            thresholdAngle={40}
          />
        </group>
      ))}
      {[0, -HOUSES_W, HOUSES_W].map((x) => (
        <mesh
          key={x}
          position={[x, HOUSES_H / 2 - 1, -11]}
          scale={[x === 0 ? 1 : -1, 1, 1]}
          geometry={geometries.houses}
          material={materials.houses}
        />
      ))}
      {skylineCopies.map((x) => (
        <mesh
          key={x}
          position={[x, SKY_H / 2 - 1.3, -19]}
          scale={[x === 0 ? 1 : -1, 1, 1]}
          geometry={geometries.skyline}
          material={materials.skyline}
        />
      ))}
    </>
  )
}
