import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { worldStore } from '@/shared/store/worldStore'
import { CORRIDOR } from '@/shared/corridor/corridor'
import { createFrameArtTexture } from '@/features/world/corridor/textures/frameArt'
import { InteractiveHotspot } from '@/features/world/corridor/components/InteractiveHotspot'
import { RevealMaterial } from '@/features/world/scene/RevealMaterial'
import { useScene } from '@/features/world/scene/SceneContext'
import { SketchEdges } from '@/features/world/corridor/components/SketchEdges'

const HALF = CORRIDOR.width / 2
const FRAME_W = 1.5
const FRAME_H = 1.02
const ART_W = 1.28
const ART_H = 0.8
const RELEASE_DISTANCE = 2.5

interface InspectableFrameProps {
  side: 'left' | 'right'
  z: number
  seed: number
  y?: number
}

const targetPos = new THREE.Vector3()
const targetQuat = new THREE.Quaternion()
const tiltQuat = new THREE.Quaternion()
const tiltEuler = new THREE.Euler()
const direction = new THREE.Vector3()
const targetScale = new THREE.Vector3()

export function InspectableFrame({ side, z, seed, y = 2 }: InspectableFrameProps) {
  const { materials, reducedMotion } = useScene()
  const camera = useThree((state) => state.camera)
  const aspect = useThree((state) => state.viewport.aspect)
  const mover = useRef<THREE.Group>(null)
  const paintedMesh = useRef<THREE.Mesh>(null)
  const [inspected, setInspected] = useState(false)
  const hovered = useRef(false)
  const paint = useRef(0)
  const pickedUpAt = useRef(0)

  const home = useMemo(() => {
    const sign = side === 'left' ? -1 : 1
    return {
      position: new THREE.Vector3(sign * (HALF - 0.05), y, z),
      quaternion: new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, side === 'left' ? Math.PI / 2 : -Math.PI / 2, 0),
      ),
    }
  }, [side, y, z])

  const frameGeometry = useMemo(() => new THREE.BoxGeometry(FRAME_W, FRAME_H, 0.04), [])
  const textures = useMemo(
    () => ({ sketch: createFrameArtTexture(seed), painted: createFrameArtTexture(seed, true) }),
    [seed],
  )
  const art = useMemo(
    () => ({
      sketch: new RevealMaterial({ map: textures.sketch, transparent: true, toneMapped: false }),
      painted: new THREE.MeshBasicMaterial({ map: textures.painted, toneMapped: false }),
    }),
    [textures],
  )
  useEffect(
    () => () => {
      frameGeometry.dispose()
      Object.values(textures).forEach((t) => t.dispose())
      Object.values(art).forEach((m) => m.dispose())
    },
    [frameGeometry, textures, art],
  )

  useEffect(() => {
    if (!inspected) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setInspected(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [inspected])

  useFrame((state, delta) => {
    const group = mover.current
    if (!group) return
    if (inspected) {
      const walkedAway = Math.abs(camera.position.z - pickedUpAt.current) > RELEASE_DISTANCE
      if (walkedAway || worldStore.getState().activeDoor !== null) {
        setInspected(false)
        return
      }
      camera.getWorldDirection(direction)
      const distance = THREE.MathUtils.clamp(1.3 + Math.max(0, 1.8 - aspect) * 1.5, 1.5, 2.8)
      targetPos.copy(camera.position).addScaledVector(direction, distance)
      tiltEuler.set(-state.pointer.y * 0.3, state.pointer.x * 0.3, 0)
      targetQuat.copy(camera.quaternion).multiply(tiltQuat.setFromEuler(tiltEuler))
      targetScale.setScalar(1.2)
    } else {
      targetPos.copy(home.position)
      targetQuat.copy(home.quaternion)
      targetScale.setScalar(1)
    }
    const k = reducedMotion ? 1 : 1 - Math.exp(-delta * 6)
    group.position.lerp(targetPos, k)
    group.quaternion.slerp(targetQuat, k)
    group.scale.lerp(targetScale, k)

    const paintTarget = hovered.current || inspected ? 1 : 0
    const next = reducedMotion
      ? paintTarget
      : paint.current + (paintTarget - paint.current) * (1 - Math.exp(-delta * 4))
    if (Math.abs(next - paint.current) > 0.0005) {
      paint.current = next
      art.sketch.progress = next
      if (paintedMesh.current) paintedMesh.current.visible = next > 0.001
    }
  })

  return (
    <group ref={mover} position={home.position} quaternion={home.quaternion}>
      <InteractiveHotspot
        label={inspected ? 'Put it back' : 'Take a closer look'}
        hitArea={[FRAME_W + 0.1, FRAME_H + 0.1, 0.2]}
        onHoverChange={(isHovered) => {
          hovered.current = isHovered
        }}
        onActivate={() => {
          pickedUpAt.current = camera.position.z
          setInspected((value) => !value)
        }}
      >
        <mesh geometry={frameGeometry} material={materials.woodDark} />
        <SketchEdges geometry={frameGeometry} seed={seed + 40} jitter={0.008} subdivisions={5} />
        <mesh ref={paintedMesh} visible={false} position={[0, 0, 0.021]} material={art.painted}>
          <planeGeometry args={[ART_W, ART_H]} />
        </mesh>
        <mesh position={[0, 0, 0.022]} material={art.sketch}>
          <planeGeometry args={[ART_W, ART_H]} />
        </mesh>
      </InteractiveHotspot>
      <mesh position={[0, FRAME_H / 2 + 0.06, 0.01]}>
        <sphereGeometry args={[0.012, 6, 6]} />
        <meshBasicMaterial color="#2f2a26" />
      </mesh>
    </group>
  )
}
