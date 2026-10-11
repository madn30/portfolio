import { useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { doors } from '@/data/siteConfig'
import type { DeviceProfile } from '@/hooks/useDeviceProfile'
import { setWorld } from '@/store/worldStore'
import { CORRIDOR } from '@/utils/corridor'
import { disposeTextureCache } from '@/utils/textures'
import { Corridor } from './Corridor'
import { DebugBridge } from './DebugBridge'
import { Door } from './Door'
import { Lamp, PictureFrame, Plant } from './details'
import { acquireMaterials, releaseMaterials } from './materials'
import { SceneCamera } from './SceneCamera'
import { SceneContext, type SceneContextValue } from './SceneContext'
import { SceneLighting } from './SceneLighting'

interface CorridorSceneProps {
  profile: DeviceProfile
  reducedMotion: boolean
}

const DPR: Record<DeviceProfile['quality'], [number, number]> = {
  high: [1, 2],
  medium: [1, 1.5],
  low: [0.75, 1.25],
}

const HALF = CORRIDOR.width / 2

/**
 * The WebGL corridor. Everything inside is procedural, so there is nothing to download;
 * the first frame is reported to the store so the loading indicator can go away.
 */
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

  const detailed = quality !== 'low'

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
        gl.setClearColor('#f4efe4')
        gl.domElement.addEventListener('webglcontextlost', (event) => {
          event.preventDefault()
          setWorld({ sceneFailed: true })
        })
        setWorld({ sceneReady: true })
      }}
      onPointerMissed={() => setWorld({ hoveredDoor: null })}
    >
      <SceneContext.Provider value={context}>
        <color attach="background" args={['#f4efe4']} />
        <fog attach="fog" args={['#f4efe4', 9, 38]} />
        <SceneLighting />
        <SceneCamera />
        {import.meta.env.DEV && <DebugBridge />}
        <Corridor />
        {doors.map((door, index) => (
          <Door key={door.id} door={door} index={index} />
        ))}

        {/* Decorative details that reward exploration */}
        <Plant position={[-2.45, 0, 2.6]} seed={3} />
        {detailed && <Plant position={[2.4, 0, -20.5]} seed={5} />}
        <PictureFrame
          position={[HALF - 0.03, 2.0, -3.5]}
          rotation={[0, -Math.PI / 2, 0]}
          seed={1}
        />
        {detailed && (
          <PictureFrame
            position={[-HALF + 0.03, 2.05, -12.5]}
            rotation={[0, Math.PI / 2, 0]}
            seed={2}
          />
        )}
        {detailed && (
          <PictureFrame
            position={[HALF - 0.03, 1.95, -27.5]}
            rotation={[0, -Math.PI / 2, 0]}
            seed={3}
          />
        )}
        <Lamp position={[0, CORRIDOR.height, -2.5]} seed={1} />
        <Lamp position={[0, CORRIDOR.height, -13]} seed={2} />
        {detailed && <Lamp position={[0, CORRIDOR.height, -25]} seed={3} />}
        <Lamp position={[0, CORRIDOR.height, -37]} seed={4} />
      </SceneContext.Provider>
    </Canvas>
  )
}
