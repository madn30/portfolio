import { useRef, type MutableRefObject } from 'react'
import { about } from '@/data/about'
import type { Flight } from '@/features/world/rooms/flight'
import { Note } from '@/features/world/rooms/shared'
import { SkyCloud } from '@/features/world/rooms/sky'
import { Milestone } from './Milestone'
import { easeInQuad, easeOutCubic, milestoneAt, approach } from './stream'
import { TechBalloon, type BalloonFactors, type BalloonSpot } from './TechBalloon'

const SPOTS: readonly BalloonSpot[] = [
  { x: -2.5, y: 2.6, z: 0.3, phase: 0 },
  { x: 2.5, y: 3.1, z: 0.2, phase: 1.5 },
  { x: 0, y: 3.6, z: 0.5, phase: 3 },
  { x: -4, y: 1.6, z: -0.3, phase: 0.8 },
  { x: 4, y: 2.1, z: -0.2, phase: 2.2 },
  { x: 0, y: 1.1, z: -0.4, phase: 4 },
  { x: -5.5, y: 3.1, z: -0.8, phase: 1.2 },
  { x: 5.5, y: 3.6, z: -0.7, phase: 2.8 },
  { x: -3, y: 5.1, z: -0.5, phase: 3.5 },
  { x: 3.5, y: 4.6, z: -0.6, phase: 4.5 },
]

export function BalloonsMilestone({ flight }: { flight: MutableRefObject<Flight> }) {
  const factors = useRef<BalloonFactors>({ reveal: 0, spread: 0, time: 0 })

  const onFrame = (ahead: number, t: number) => {
    factors.current.reveal = easeOutCubic(approach(ahead, 24, 9))
    factors.current.spread = easeInQuad(approach(ahead, 16, 8))
    factors.current.time = t
  }

  return (
    <Milestone at={milestoneAt('balloons')} flight={flight} onFrame={onFrame}>
      <Note lines={['tools']} position={[0, 7.0, 0.5]} width={2.4} fontSize={80} color="#8a8178" />
      <Note
        lines={['what I reach for, click to pop']}
        position={[0, 6.3, 0.5]}
        width={3.6}
        fontSize={52}
        color="#9a958c"
      />
      <SkyCloud position={[-6.2, 0.6, -2.0]} scale={3.0} seed={81} />
      <SkyCloud position={[6.4, 0.2, -1.6]} scale={2.6} seed={82} />
      {about.techBalloons.slice(0, SPOTS.length).map((balloon, i) => (
        <TechBalloon
          key={balloon.label}
          balloon={balloon}
          spot={SPOTS[i]}
          index={i}
          factors={factors}
        />
      ))}
    </Milestone>
  )
}
