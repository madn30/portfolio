import { useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import type { DeviceProfile } from '@/shared/hooks/useDeviceProfile'
import { useFontsReady } from '@/shared/hooks/useFontsReady'
import { setWorld } from '@/shared/store/worldStore'
import { CORRIDOR, doorInstances, LOOP_SHIFT } from '@/shared/corridor/corridor'
import { disposeTextureCache } from '@/shared/graphics/textures/surfaces'
import { Corridor } from './Corridor'
import { DebugBridge } from '@/features/world/scene/DebugBridge'
import { CorridorProps } from '@/features/world/corridor/decorations/CorridorProps'
import { CorridorDoodles } from './CorridorDoodles'
import { Door } from '@/features/world/navigation/Door'
import { LoopDoor } from '@/features/world/navigation/LoopDoor'
import { Rooms } from '@/features/world/rooms/Rooms'
import { acquireMaterials, releaseMaterials } from '@/features/world/scene/materials'
import { SceneCamera } from './SceneCamera'
import { SceneContext, type SceneContextValue } from '@/features/world/scene/SceneContext'
import { SceneLighting } from './SceneLighting'
import { TitleSign } from './TitleSign'
import { WalkerHand } from './WalkerHand'
import { WalkerShadow } from './WalkerShadow'

interface CorridorSceneProps {
  profile: DeviceProfile
  reducedMotion: boolean
}

const DPR: Record<DeviceProfile['quality'], [number, number]> = {
  high: [1, 2],
  medium: [1, 1.5],
  low: [0.75, 1.25],
}

const PAPER = '#f6ecd6'
const TITLE_Z = CORRIDOR.cameraStartZ - 5.6

export default function CorridorScene({ profile, reducedMotion }: CorridorSceneProps) {
  const { quality, touch } = profile
  const [materials] = useState(() => acquireMaterials())

  useEffect(
    () => () => {
      releaseMaterials()
      disposeTextureCache()
    },
    [],
  )

  const context = useMemo<SceneContextValue>(
    () => ({ quality, reducedMotion, touch, materials }),
    [quality, reducedMotion, touch, materials],
  )
  const doorsAlongCorridor = useMemo(() => doorInstances(), [])
  const fontsReady = useFontsReady()

  return (
    <Canvas
      className="!fixed inset-0 z-0"
      style={{ position: 'fixed' }}
      dpr={DPR[quality]}
      shadows={quality === 'high'}
      frameloop="always"
      camera={{
        fov: 54,
        near: 0.1,
        far: 80,
        position: [0, CORRIDOR.cameraHeight, CORRIDOR.cameraStartZ],
      }}
      gl={{
        antialias: quality !== 'low',
        powerPreference: 'high-performance',
        alpha: false,
        toneMapping: THREE.NoToneMapping,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(PAPER)
        gl.localClippingEnabled = true
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault()
          setWorld({ sceneFailed: true })
        })
        setWorld({ sceneReady: true })
      }}
      onPointerMissed={() => setWorld({ hoveredDoor: null })}
    >
      <SceneContext.Provider value={context}>
        <color attach="background" args={[PAPER]} />
        <fog attach="fog" args={[PAPER, 8, 27]} />
        <SceneLighting />
        <SceneCamera />
        <WalkerShadow />
        <WalkerHand />
        {import.meta.env.DEV && <DebugBridge />}
        <Corridor />
        <CorridorDoodles z={TITLE_Z} />
        <CorridorDoodles z={TITLE_Z - LOOP_SHIFT} />
        <group key={fontsReady ? 'fonts' : 'fallback'}>
          <TitleSign z={TITLE_Z} />
          <TitleSign z={TITLE_Z - LOOP_SHIFT} />
          {doorsAlongCorridor.map((d) => (
            <Door key={`${d.door.id}@${d.z}`} door={d.door} index={d.index} z={d.z} twin={d.twin} />
          ))}
          <LoopDoor />
          <LoopDoor zOffset={LOOP_SHIFT} />
        </group>
        <Rooms />
        <CorridorProps />
      </SceneContext.Provider>
    </Canvas>
  )
}
