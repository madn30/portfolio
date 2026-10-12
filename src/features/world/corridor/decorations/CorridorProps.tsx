import { CORRIDOR, lapCopies } from '@/shared/corridor/corridor'
import { Plant } from '@/features/world/scene/details'
import { useScene } from '@/features/world/scene/SceneContext'
import { Cabinet, Grate, PottedTree, SideTable } from './furniture'
import { InspectableFrame } from './InspectableFrame'
import { Lamp } from './Lamp'

type Side = 'left' | 'right'

interface FrameSpot {
  side: Side
  z: number
  seed: number
  y: number
}

const FRAMES: FrameSpot[] = [
  { side: 'right', z: -3.5, seed: 1, y: 2.0 },
  { side: 'left', z: -16.6, seed: 2, y: 2.05 },
  { side: 'right', z: -23, seed: 3, y: 1.95 },
  { side: 'left', z: -37.5, seed: 4, y: 2.05 },
]
const LAMPS = [-2.5, -13, -25, -37]
const OPTIONAL_LAMP = -25

function opposite(side: Side): Side {
  return side === 'left' ? 'right' : 'left'
}

export function CorridorProps() {
  const { quality } = useScene()
  const detailed = quality !== 'low'
  return (
    <>
      {FRAMES.flatMap((frame) =>
        lapCopies(frame.z).map((z) => (
          <InspectableFrame
            key={`frame${frame.seed}@${z}`}
            side={frame.side}
            z={z}
            seed={frame.seed}
            y={frame.y}
          />
        )),
      )}
      {detailed &&
        FRAMES.flatMap((frame) =>
          lapCopies(frame.z).map((z) => (
            <Grate key={`grate${frame.seed}@${z}`} side={opposite(frame.side)} z={z} />
          )),
        )}
      {LAMPS.filter((z) => detailed || z !== OPTIONAL_LAMP).flatMap((lampZ, i) =>
        lapCopies(lampZ).map((z) => (
          <Lamp key={`lamp${lampZ}@${z}`} position={[0, CORRIDOR.height, z]} seed={i + 1} />
        )),
      )}
      {lapCopies(2.6).map((z) => (
        <Plant key={`plant-a@${z}`} position={[-2.45, 0, z]} seed={3} />
      ))}
      {detailed &&
        lapCopies(-18.5).map((z) => <Plant key={`plant-b@${z}`} position={[2.4, 0, z]} seed={5} />)}
      {lapCopies(-27).map((z) => (
        <SideTable key={`table@${z}`} side="left" z={z} />
      ))}
      {lapCopies(-33.5).map((z) => (
        <Cabinet key={`cabinet@${z}`} side="right" z={z} />
      ))}
      {lapCopies(-40.5).map((z) => (
        <PottedTree key={`tree@${z}`} side="left" z={z} />
      ))}
    </>
  )
}
