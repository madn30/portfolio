import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { about } from '@/data/about'
import { accentHex } from '@/data/siteConfig'
import type { JourneyStop } from '@/shared/types'
import { createIslandTexture, ISLAND_ASPECT } from './islandTexture'
import { InteractiveHotspot } from '@/features/world/corridor/components/InteractiveHotspot'
import { useScene } from '@/features/world/scene/SceneContext'
import { HoverLift } from '@/features/world/rooms/ambient'
import type { Flight } from '@/features/world/rooms/flight'
import { Note } from '@/features/world/rooms/shared'
import { SkyCloud } from '@/features/world/rooms/sky'
import { flyToMilestone } from './aboutState'
import { Milestone } from './Milestone'
import { easeOutQuad, milestoneAt, approach } from './stream'
import { useReveal } from './useReveal'

const WIDTH = 5.4
const DEPTH_GAP = 5.5
const SIDE = 5.6
const HEIGHT = WIDTH / ISLAND_ASPECT
const START_Y = -5

function sideOf(index: number): number {
  return index % 2 ? 1 : -1
}

function restY(index: number): number {
  return 2.6 + (index % 2) * 0.9
}

interface IslandProps {
  stop: JourneyStop
  index: number
  hovered: boolean
  onHover: (hovered: boolean) => void
}

function Island({ stop, index, hovered, onHover }: IslandProps) {
  const { touch } = useScene()
  const textures = useMemo(() => {
    const base = {
      title: stop.title,
      period: stop.period,
      landmark: stop.landmark,
      accent: accentHex[stop.accent],
      seed: 60 + index,
    }
    return {
      sketch: createIslandTexture(base),
      painted: createIslandTexture({ ...base, painted: true }),
    }
  }, [stop, index])
  const geometry = useMemo(() => new THREE.PlaneGeometry(WIDTH, HEIGHT), [])
  useEffect(
    () => () => {
      textures.sketch.dispose()
      textures.painted.dispose()
      geometry.dispose()
    },
    [textures, geometry],
  )
  const reveal = useReveal(textures.sketch, textures.painted)

  return (
    <InteractiveHotspot
      label={stop.text}
      onActivate={() => flyToMilestone('journey')}
      onHoverChange={(on) => {
        reveal.setHovered(on)
        onHover(on)
      }}
      hitArea={[WIDTH * 0.8, HEIGHT * 0.8, touch ? 1 : 0.4]}
    >
      <HoverLift hovered={hovered} lift={0.1} scale={1.03}>
        <mesh geometry={geometry} material={reveal.painted} position={[0, 0, -0.002]} />
        <mesh geometry={geometry} material={reveal.sketch} />
      </HoverLift>
    </InteractiveHotspot>
  )
}

export function JourneyMilestone({ flight }: { flight: MutableRefObject<Flight> }) {
  const { reducedMotion } = useScene()
  const [hovered, setHovered] = useState<string | null>(null)
  const groups = useRef<(THREE.Group | null)[]>([])

  const onFrame = (ahead: number, t: number) => {
    groups.current.forEach((group, i) => {
      if (!group) return
      const f = easeOutQuad(approach(ahead + i * DEPTH_GAP, 24, 9))
      const bob = reducedMotion ? 0 : Math.sin(t * 0.5 + i * 2) * 0.2
      group.position.y = START_Y + f * (restY(i) - START_Y) + bob
      group.rotation.z = reducedMotion ? 0 : Math.sin(t * 0.3 + i) * 0.05 * sideOf(i)
    })
  }

  return (
    <Milestone
      at={milestoneAt('journey')}
      depth={(about.journey.length - 1) * DEPTH_GAP}
      flight={flight}
      onFrame={onFrame}
    >
      <Note
        lines={['journey']}
        position={[0, 6.6, -0.4]}
        width={2.9}
        fontSize={80}
        color="#8a8178"
      />
      <Note
        lines={['my path so far']}
        position={[0, 5.9, -0.4]}
        width={2.6}
        fontSize={52}
        color="#9a958c"
      />
      <SkyCloud position={[0, 7.6, -2.2]} scale={2.6} seed={51} />
      {about.journey.map((stop, i) => (
        <group
          key={stop.id}
          ref={(el) => {
            groups.current[i] = el
          }}
          position={[sideOf(i) * (SIDE + (i % 3) * 0.5), START_Y, -i * DEPTH_GAP]}
        >
          <Island
            stop={stop}
            index={i}
            hovered={hovered === stop.id}
            onHover={(on) =>
              setHovered((current) => (on ? stop.id : current === stop.id ? null : current))
            }
          />
        </group>
      ))}
    </Milestone>
  )
}
