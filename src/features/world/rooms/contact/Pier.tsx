import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { createDockTexture } from '@/features/world/rooms/contact/contactTextures'
import { createSketchPolyline } from '@/shared/graphics/sketch'
import { useScene } from '@/features/world/scene/SceneContext'
import { SketchEdges } from '@/features/world/corridor/components/SketchEdges'
import { useToonMaterials } from '@/features/world/rooms/helpers'
import { CRATE, PIER_LENGTH, PIER_WIDTH, type Vec3 } from './constants'
import { useFlat } from './drawing'

const LANTERN_POST: Vec3 = [1.45, 0.8, -4.2]
const BOLLARDS: Vec3[] = [
  [-PIER_WIDTH / 2 + 0.2, 0.2, -PIER_LENGTH + 0.3],
  [PIER_WIDTH / 2 - 0.2, 0.2, -PIER_LENGTH + 0.3],
]

function sag(from: Vec3, to: Vec3, drop: number, steps = 16): THREE.Vector3[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const s = i / steps
    return new THREE.Vector3(
      THREE.MathUtils.lerp(from[0], to[0], s),
      THREE.MathUtils.lerp(from[1], to[1], s) - drop * 4 * s * (1 - s),
      THREE.MathUtils.lerp(from[2], to[2], s),
    )
  })
}

export function Pier() {
  const { materials: scene, quality } = useScene()
  const gl = useThree((s) => s.gl)
  const materials = useToonMaterials({
    wood: '#a9713f',
    post: '#7a4e2b',
    crate: '#c8955c',
    paper: '#ffffff',
    lantern: '#ffd98a',
    rope: '#b89b6a',
  })
  const accent = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#d2483c', toneMapped: false }),
    [],
  )
  const texture = useMemo(() => {
    const dock = createDockTexture()
    dock.repeat.set(1, 2)
    dock.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())
    return dock
  }, [gl])
  const deckMaterial = useFlat(texture)
  const geometries = useMemo(
    () => ({
      deck: new THREE.BoxGeometry(PIER_WIDTH, 0.18, PIER_LENGTH),
      deckTop: new THREE.PlaneGeometry(PIER_WIDTH, PIER_LENGTH),
      pile: new THREE.BoxGeometry(0.16, 1.2, 0.16),
      bollard: new THREE.CylinderGeometry(0.11, 0.13, 0.4, 10),
      crate: new THREE.BoxGeometry(0.7, 0.68, 0.7),
      post: new THREE.BoxGeometry(0.1, 1.6, 0.1),
      lantern: new THREE.BoxGeometry(0.26, 0.34, 0.26),
      roof: new THREE.ConeGeometry(0.22, 0.16, 4),
      ring: new THREE.TorusGeometry(0.26, 0.06, 8, 20),
      coil: new THREE.TorusGeometry(0.2, 0.035, 6, 18),
      stripe: new THREE.BoxGeometry(0.13, 0.07, 0.13),
    }),
    [],
  )
  const rope = useMemo(
    () =>
      createSketchPolyline(
        [
          ...sag(
            [BOLLARDS[0][0], 0.38, BOLLARDS[0][2]],
            [BOLLARDS[1][0], 0.38, BOLLARDS[1][2]],
            0.3,
          ),
          ...sag(
            [BOLLARDS[1][0], 0.38, BOLLARDS[1][2]],
            [BOLLARDS[1][0] + 0.05, -0.55, BOLLARDS[1][2] + 0.1],
            0.1,
            6,
          ),
        ],
        { jitter: 0.01, subdivisions: 2, seed: 150, passes: 2 },
      ),
    [],
  )
  useEffect(
    () => () => {
      texture.dispose()
      accent.dispose()
      rope.dispose()
      Object.values(geometries).forEach((g) => g.dispose())
    },
    [texture, accent, rope, geometries],
  )

  return (
    <>
      <group position={[0, -0.09, -PIER_LENGTH / 2 - 0.1]}>
        <mesh geometry={geometries.deck} material={materials.wood} />
        <SketchEdges geometry={geometries.deck} seed={120} jitter={0.012} subdivisions={8} />
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.095, 0]}
          geometry={geometries.deckTop}
          material={deckMaterial}
        />
      </group>
      {[-PIER_WIDTH / 2 + 0.12, PIER_WIDTH / 2 - 0.12].flatMap((x) =>
        [-0.5, -PIER_LENGTH / 2, -PIER_LENGTH + 0.3].map((z) => (
          <group key={`${x}${z}`} position={[x, -0.6, z]}>
            <mesh geometry={geometries.pile} material={materials.post} />
            <SketchEdges
              geometry={geometries.pile}
              seed={121 + Math.round(z)}
              jitter={0.008}
              subdivisions={3}
              passes={1}
            />
          </group>
        )),
      )}
      {BOLLARDS.map((position, i) => (
        <group key={i} position={position}>
          <mesh geometry={geometries.bollard} material={materials.post} />
          <SketchEdges geometry={geometries.bollard} seed={160 + i} jitter={0.008} passes={1} />
        </group>
      ))}
      <lineSegments geometry={rope} material={scene.line} />

      <group position={CRATE}>
        <mesh geometry={geometries.crate} material={materials.crate} />
        <SketchEdges geometry={geometries.crate} seed={170} jitter={0.012} subdivisions={5} />
      </group>

      <group position={LANTERN_POST}>
        <mesh geometry={geometries.post} material={materials.post} />
        <SketchEdges geometry={geometries.post} seed={180} jitter={0.008} passes={1} />
        <group position={[0, 0.97, 0]}>
          <mesh geometry={geometries.lantern} material={materials.lantern} />
          <SketchEdges geometry={geometries.lantern} seed={181} jitter={0.008} />
          <mesh
            position={[0, 0.25, 0]}
            rotation={[0, Math.PI / 4, 0]}
            geometry={geometries.roof}
            material={materials.post}
          />
          <SketchEdges
            geometry={geometries.roof}
            position={[0, 0.25, 0]}
            rotation={[0, Math.PI / 4, 0]}
            seed={182}
            jitter={0.008}
            passes={1}
          />
        </group>
        <group position={[0, -0.05, 0.1]}>
          <mesh geometry={geometries.ring} material={materials.paper} />
          <SketchEdges
            geometry={geometries.ring}
            seed={183}
            jitter={0.008}
            subdivisions={2}
            passes={1}
            thresholdAngle={30}
          />
          {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((a) => (
            <mesh
              key={a}
              position={[Math.cos(a) * 0.26, Math.sin(a) * 0.26, 0]}
              rotation={[0, 0, a]}
              geometry={geometries.stripe}
              material={accent}
            />
          ))}
        </group>
      </group>

      {quality !== 'low' && (
        <group position={[0.85, 0.02, -2.2]} rotation={[-Math.PI / 2, 0, 0.4]}>
          {[0, 0.07, 0.14].map((z) => (
            <group key={z} position={[0, 0, z]}>
              <mesh geometry={geometries.coil} material={materials.rope} />
              <SketchEdges
                geometry={geometries.coil}
                seed={190 + z * 100}
                jitter={0.006}
                subdivisions={2}
                passes={1}
                thresholdAngle={30}
              />
            </group>
          ))}
        </group>
      )}
    </>
  )
}
