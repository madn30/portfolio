import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWorld } from '@/shared/store/worldStore'
import { createHazeTexture } from '@/shared/graphics/spriteTextures'
import { useScene } from '@/features/world/scene/SceneContext'
import { registerFlyTo, setAbout } from './aboutState'
import { BalloonsMilestone } from './BalloonsMilestone'
import { AboutMilestone, IntroMilestone, PrinciplesMilestone } from './ContentMilestones'
import { FocusMilestone } from './FocusMilestone'
import { JourneyMilestone } from './JourneyMilestone'
import { Rider } from './Rider'
import { FarClouds, SkyChunks } from './SkyChunks'
import { aheadInCycle, CAM_Z, milestoneAt, nearestMilestone } from './stream'
import { Birds, Motes, Sun } from '@/features/world/rooms/ambient'
import { useFlight, type Vec3 } from '@/features/world/rooms/flight'
import { SkyPaper } from '@/features/world/rooms/sky'

const PIVOT: Vec3 = [0, 1.7, CAM_Z]
const WARMUP_FRAMES = 25

function Haze() {
  const texture = useMemo(() => createHazeTexture('216,240,255'), [])
  useEffect(() => () => texture.dispose(), [texture])
  return (
    <mesh position={[0, -0.6, -25.5]} rotation={[0, 0, Math.PI]}>
      <planeGeometry args={[64, 9]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

export function AboutRoom() {
  const { quality, reducedMotion } = useScene()
  const active = useWorld((s) => s.activeDoor) === 'about'
  const { flight, advance, flyTo } = useFlight({ active })
  const root = useRef<THREE.Group>(null)
  const tilt = useRef<THREE.Group>(null)
  const warm = useRef(0)

  useEffect(() => {
    registerFlyTo((id) => flyTo(aheadInCycle(milestoneAt(id), flight.current.distance)))
    return () => registerFlyTo(null)
  }, [flyTo, flight])

  useEffect(() => {
    if (!active) setAbout({ station: null })
  }, [active])

  useFrame((_, delta) => {
    advance(Math.min(delta, 0.05), reducedMotion)
    const f = flight.current
    if (tilt.current) {
      tilt.current.rotation.z = -f.bank
      tilt.current.rotation.x = -f.pitch
    }
    if (active) setAbout({ station: nearestMilestone(f.distance) })
    if (warm.current <= WARMUP_FRAMES && root.current) {
      warm.current++
      const culled = warm.current > WARMUP_FRAMES
      root.current.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Sprite) {
          object.frustumCulled = culled
        }
      })
    }
  }, -1)

  return (
    <group ref={root}>
      <SkyPaper active={active} />
      <Haze />
      <Sun position={[5.2, 7.4, -15]} scale={2.4} />
      <Birds centre={[-8.5, 7.2, -20]} spread={1.8} seed={3} />
      <Motes centre={[0, 2.4, -9]} area={[12, 6, 12]} count={50} seed={1} />
      <Rider flight={flight} />
      <group position={PIVOT}>
        <group ref={tilt}>
          <group position={[-PIVOT[0], -PIVOT[1], -PIVOT[2]]}>
            {quality !== 'low' && <FarClouds flight={flight} />}
            <SkyChunks flight={flight} />
            <IntroMilestone flight={flight} />
            <AboutMilestone flight={flight} />
            <JourneyMilestone flight={flight} />
            <PrinciplesMilestone flight={flight} />
            <BalloonsMilestone flight={flight} />
            <FocusMilestone flight={flight} />
          </group>
        </group>
      </group>
    </group>
  )
}
