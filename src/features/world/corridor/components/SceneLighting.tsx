import { useEffect, useRef } from 'react'
import type * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useScene } from '@/features/world/scene/SceneContext'

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

  const ambient = quality === 'low' ? 2.6 : 2.0
  const hemisphere = quality === 'low' ? 0.6 : 0.6

  return (
    <>
      <ambientLight color="#ffffff" intensity={ambient} />
      <hemisphereLight color="#ffffff" groundColor="#b9b4aa" intensity={hemisphere} />
      <directionalLight
        ref={key}
        color="#ffffff"
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
