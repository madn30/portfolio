import { useEffect, useMemo, useRef, type ComponentType, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { doors, type DoorDefinition } from '@/data/siteConfig'
import { useWorld } from '@/shared/store/worldStore'
import type { DoorSectionId } from '@/shared/types'
import { doorPosition, doorRotationY } from '@/shared/corridor/corridor'
import { getDoorTilt } from '@/features/world/navigation/doorTilt'
import { useScene } from '@/features/world/scene/SceneContext'
import { RoomClipper } from './roomClip'
import { AboutRoom } from './about/AboutRoom'
import { ContactRoom } from './contact/ContactRoom'
import { ExperienceRoom } from './experience/ExperienceRoom'
import { ProjectsRoom } from './projects/ProjectsRoom'
import { SkillsRoom } from './skills/SkillsRoom'

const ROOMS: Record<DoorSectionId, ComponentType> = {
  about: AboutRoom,
  projects: ProjectsRoom,
  skills: SkillsRoom,
  experience: ExperienceRoom,
  contact: ContactRoom,
}

function RoomAnchor({ door, children }: { door: DoorDefinition; children: ReactNode }) {
  const group = useRef<THREE.Group>(null)
  const { materials } = useScene()
  const clipper = useMemo(() => {
    const shared = Object.values(materials).filter(
      (value): value is THREE.Material => typeof value !== 'function',
    )
    return new RoomClipper(door.side, new Set(shared))
  }, [door.side, materials])
  useEffect(() => () => clipper.dispose(), [clipper])
  const place = () => {
    if (!group.current) return
    const tilt = getDoorTilt(door.id, door.z)
    const [x, , z] = doorPosition(door, door.z, tilt)
    group.current.position.set(x, 0, z)
    group.current.rotation.y = doorRotationY(door, tilt)
    clipper.apply(group.current)
  }
  useFrame(place)
  const [x, , z] = doorPosition(door, door.z, getDoorTilt(door.id, door.z))
  return (
    <group
      ref={group}
      position={[x, 0, z]}
      rotation={[0, doorRotationY(door, getDoorTilt(door.id, door.z)), 0]}
    >
      {children}
    </group>
  )
}

export function Rooms() {
  const hovered = useWorld((s) => s.hoveredDoor)
  const entering = useWorld((s) => s.enteringDoor)
  const active = useWorld((s) => s.activeDoor)
  const station = useWorld((s) => s.station)

  return (
    <>
      {doors.map((door, index) => {
        const visible =
          hovered === door.id || entering === door.id || active === door.id || station === index
        if (!visible) return null
        const Room = ROOMS[door.id]
        return (
          <RoomAnchor key={door.id} door={door}>
            <Room />
          </RoomAnchor>
        )
      })}
    </>
  )
}
