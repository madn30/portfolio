import { useRef, type MutableRefObject, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import type { Flight } from '@/features/world/rooms/flight'
import { aheadInCycle, CLIP_AHEAD, FOG_FAR, zForAhead } from './stream'

interface MilestoneProps {
  at: number
  depth?: number
  flight: MutableRefObject<Flight>
  onFrame?: (ahead: number, time: number, dt: number) => void
  children: ReactNode
}

export function Milestone({ at, depth = 0, flight, onFrame, children }: MilestoneProps) {
  const group = useRef<THREE.Group>(null)
  const callback = useRef(onFrame)
  callback.current = onFrame

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const ahead = aheadInCycle(at + depth, flight.current.distance) - depth
    g.position.z = zForAhead(ahead)
    g.visible = ahead > CLIP_AHEAD - depth && ahead < FOG_FAR + 12
    if (g.visible) callback.current?.(ahead, state.clock.elapsedTime, Math.min(delta, 0.05))
  })

  return (
    <group
      ref={group}
      position={[0, 0, zForAhead(aheadInCycle(at + depth, flight.current.distance) - depth)]}
    >
      {children}
    </group>
  )
}
