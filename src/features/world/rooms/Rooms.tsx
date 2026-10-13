import {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type * as THREE from 'three'
import { doors, type DoorDefinition } from '@/data/siteConfig'
import { useWorld } from '@/shared/store/worldStore'
import type { DoorSectionId } from '@/shared/types'
import { doorPosition, doorRotationY } from '@/shared/corridor/corridor'
import { getDoorTilt } from '@/features/world/navigation/doorTilt'
import { useScene } from '@/features/world/scene/SceneContext'
import { pendingPaints } from '@/shared/graphics/paintQueue'
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

interface ProgramProperties {
  currentProgram?: { isReady: () => boolean }
}

// Drops every material whose program has linked (or that was disposed meanwhile, as dev
// StrictMode does once on mount) and reports whether the set is empty.
function programsReady(gl: THREE.WebGLRenderer, pending: Set<THREE.Material>): boolean {
  pending.forEach((material) => {
    const { currentProgram } = gl.properties.get(material) as ProgramProperties
    if (!currentProgram || currentProgram.isReady()) pending.delete(material)
  })
  return pending.size === 0
}

function RoomAnchor({ door, children }: { door: DoorDefinition; children: ReactNode }) {
  const group = useRef<THREE.Group>(null)
  const { materials } = useScene()
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)
  const scene = useThree((s) => s.scene)
  const compiling = useRef<Set<THREE.Material> | null>(null)
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
    // Link the room's shaders in parallel and let its textures paint over a few frames,
    // keeping it hidden until both are done, so reaching a door never stalls the walk.
    if (compiling.current === null) {
      group.current.visible = false
      compiling.current = gl.compile(group.current, camera, scene)
    }
    if (!group.current.visible && programsReady(gl, compiling.current) && pendingPaints() === 0) {
      group.current.visible = true
    }
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
  const lap = useWorld((s) => s.lap)
  const [reachedFirst, setReachedFirst] = useState(false)
  useEffect(() => {
    if (station === 0) setReachedFirst(true)
  }, [station])
  // The first room is built while the loader still covers the scene and kept until the
  // walker reaches its door, so stepping in from the street never pays for it.
  const warmFirst = station === -1 && lap === 0 && active === null && !reachedFirst
  const wanted = doors
    .filter(
      (door, index) =>
        hovered === door.id ||
        entering === door.id ||
        active === door.id ||
        station === index ||
        (warmFirst && index === 0),
    )
    .map((door) => door.id)
    .join(',')
  // Mount through a transition so React builds a room's textures and geometry over
  // several frames instead of one long commit that freezes the walk.
  const [mounted, setMounted] = useState(wanted)
  useEffect(() => {
    startTransition(() => setMounted(wanted))
  }, [wanted])
  const ids = useMemo(() => new Set(mounted.split(',')), [mounted])

  return (
    <>
      {doors.map((door) => {
        if (!ids.has(door.id)) return null
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
