import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { DeferredMount } from '@/features/world/scene/DeferredMount'
import { Fibres } from './Fibres'
import { Hands } from './Hands'
import {
  createPaperMaterial,
  createPaperUniforms,
  createShadowMaterial,
  tearMatrix,
} from './paperMaterial'
import { createPaperAlbedo, createPaperNormal } from './paperTextures'
import { createTearProfile, handPosition, tearPose, TEAR_MARGIN } from './tearProfile'

export interface TearDriver {
  t: number
}

interface PaperTearSceneProps {
  tear: RefObject<TearDriver>
  onReady: () => void
}

const SIDES = [-1, 1] as const
const SEGMENTS: [number, number] = [110, 150]
const FOV = 32

function FitCamera() {
  const camera = useThree((s) => s.camera)
  useLayoutEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return
    camera.position.set(0, 0, 1 / Math.tan((FOV * Math.PI) / 360))
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

function StudioEnvironment() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  useLayoutEffect(() => {
    const generator = new THREE.PMREMGenerator(gl)
    const room = new RoomEnvironment()
    const target = generator.fromScene(room, 0.04)
    gl.setRenderTarget(null)
    scene.environment = target.texture
    scene.environmentIntensity = 0.42
    return () => {
      scene.environment = null
      target.dispose()
      generator.dispose()
      room.dispose()
    }
  }, [gl, scene])
  return null
}

function TearRig({ tear }: { tear: RefObject<TearDriver> }) {
  const aspect = useThree((s) => s.size.width / s.size.height)
  const profile = useMemo(() => createTearProfile(23), [])
  const matrix = useMemo(() => tearMatrix(profile), [profile])
  const textures = useMemo(() => ({ albedo: createPaperAlbedo(), normal: createPaperNormal() }), [])
  const width = aspect + TEAR_MARGIN * 2
  const height = 2 + TEAR_MARGIN * 2
  const uniforms = useMemo(
    () => SIDES.map((side) => createPaperUniforms(side, (side * aspect) / 2, matrix)),
    [aspect, matrix],
  )
  const materials = useMemo(
    () => uniforms.map((u) => createPaperMaterial(textures, u)),
    [uniforms, textures],
  )
  const shadow = useMemo(() => createShadowMaterial(matrix), [matrix])
  const length = useRef(0)
  const backLight = useRef<THREE.DirectionalLight>(null)
  const keyLight = useRef<THREE.DirectionalLight>(null)

  useEffect(() => {
    textures.albedo.repeat.set(width * 1.5, height * 1.5)
    textures.normal.repeat.set(width * 2.5, height * 2.5)
  }, [textures, width, height])

  useEffect(() => () => materials.forEach((material) => material.dispose()), [materials])
  useEffect(() => () => shadow.dispose(), [shadow])
  useEffect(
    () => () => {
      textures.albedo.dispose()
      textures.normal.dispose()
    },
    [textures],
  )

  useFrame(() => {
    const pose = tearPose(tear.current.t, aspect)
    const back = backLight.current
    const key = keyLight.current
    uniforms.forEach((u, i) => {
      const [hx, hy] = handPosition(profile, SIDES[i], pose)
      if (back?.shadow.map) {
        u.uBackShadowMap.value = back.shadow.map.texture
        u.uBackShadowMatrix.value.copy(back.shadow.matrix)
      }
      if (key?.shadow.map) {
        u.uFrontShadowMap.value = key.shadow.map.texture
        u.uFrontShadowMatrix.value.copy(key.shadow.matrix)
      }
      u.uContact.value = key?.shadow.map ? pose.reach : 0
      u.uLength.value = pose.length
      u.uPull.value = pose.pull
      u.uWedge.value = pose.wedge
      u.uGrip.value = pose.grip * (1 - 0.92 * pose.reach)
      u.uShade.value = back?.shadow.map ? pose.shade : 0
      u.uHold.value = pose.reach
      u.uTension.value = pose.reach * (0.5 + pose.wedge / 0.8) + Math.min(1, pose.pull)
      u.uHandPos.value.set(hx, hy)
    })
    shadow.uniforms.uLength.value = pose.length
    shadow.uniforms.uPull.value = pose.pull
    shadow.uniforms.uWedge.value = pose.wedge
    length.current = pose.length
  })

  return (
    <>
      <ambientLight intensity={0.22} />
      <directionalLight
        ref={keyLight}
        position={[-1.3, 2.4, 3.4]}
        intensity={1.05}
        castShadow
        shadow-radius={5}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.01}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-camera-left={-aspect - 0.5}
        shadow-camera-right={aspect + 0.5}
        shadow-camera-top={1.5}
        shadow-camera-bottom={-1.5}
      />
      <directionalLight position={[2, -1.5, 3]} intensity={0.25} />
      <directionalLight
        ref={backLight}
        position={[0.4, 0.8, -4]}
        intensity={0.001}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        shadow-camera-near={0.5}
        shadow-camera-far={10}
        shadow-camera-left={-aspect - 0.5}
        shadow-camera-right={aspect + 0.5}
        shadow-camera-top={1.5}
        shadow-camera-bottom={-1.5}
      />
      <mesh material={shadow} position={[0, 0, -0.08]}>
        <planeGeometry args={[aspect * 2 + 1, 3]} />
      </mesh>
      {materials.map((material, i) => (
        <mesh
          key={SIDES[i]}
          material={material}
          position={[(SIDES[i] * aspect) / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[width, height, SEGMENTS[0], SEGMENTS[1]]} />
        </mesh>
      ))}
      <Fibres profile={profile} length={length} />
      <DeferredMount>
        <Hands tear={tear} profile={profile} />
      </DeferredMount>
    </>
  )
}

/** Reports the first frame drawn after the paper has mounted, so the CSS sheet only fades then. */
function Ready({ onReady }: { onReady: () => void }) {
  const reported = useRef(false)
  useFrame(() => {
    if (reported.current) return
    reported.current = true
    onReady()
  })
  return null
}

export function PaperTearScene({ tear, onReady }: PaperTearSceneProps) {
  return (
    <Canvas
      className="!absolute inset-0"
      style={{ position: 'absolute' }}
      dpr={[1, 2]}
      frameloop="always"
      shadows
      camera={{ fov: FOV, near: 0.1, far: 20 }}
      gl={{ alpha: true, antialias: true, toneMapping: THREE.NoToneMapping }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <FitCamera />
      <DeferredMount>
        <StudioEnvironment />
        <TearRig tear={tear} />
        <Ready onReady={onReady} />
      </DeferredMount>
    </Canvas>
  )
}
