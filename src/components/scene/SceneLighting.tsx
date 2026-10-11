import { useEffect, useRef } from 'react'
import type * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useScene } from './SceneContext'

/**
 * Warm, flat lighting: a hemisphere for the paper tone, one key light from the entrance for
 * gentle shadows (desktop only), and the door and pendant lights handled by their owners.
 */
export function SceneLighting() {
  const { quality } = useScene()
  const key = useRef<THREE.DirectionalLight>(null)
  const scene = useThree((state) => state.scene)
  const shadows = quality === 'high'

  useEffect(() => {
    const light = key.current
    if (!light) return
    light.target.position.set(0, 0, -20)
    scene.add(light.target)
    return () => {
      scene.remove(light.target)
    }
  }, [scene])

  // The low tier has no point lights, so the base lighting carries more of the warmth.
  const ambient = quality === 'low' ? 1.25 : 0.85
  const hemisphere = quality === 'low' ? 0.75 : 0.55

  return (
    <>
      <ambientLight color="#fff6e8" intensity={ambient} />
      <hemisphereLight color="#fbf6ec" groundColor="#b89b78" intensity={hemisphere} />
      <directionalLight
        ref={key}
        color="#fff1d6"
        intensity={0.9}
        position={[3.5, 7, 9]}
        castShadow={shadows}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={8}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={70}
      />
    </>
  )
}
