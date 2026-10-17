import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import { about } from '@/data/about'
import { siteConfig } from '@/data/siteConfig'
import { AVATAR_ASPECT, createAvatarFrames, setAvatarLids } from '@/shared/graphics/avatarTexture'
import { createBlinker } from '@/shared/utils/blink'
import { useScene } from '@/features/world/scene/SceneContext'
import type { Flight, Vec3 } from '@/features/world/rooms/flight'
import { Note } from '@/features/world/rooms/shared'
import { SkyCard, SkyCloud } from '@/features/world/rooms/sky'
import { flyToMilestone } from './aboutState'
import { useLane } from './lane'
import { Milestone } from './Milestone'
import { easeInQuad, milestoneAt, approach } from './stream'

const SPREAD = 9

interface MilestoneHandle {
  flight: MutableRefObject<Flight>
}

function useHover(): [string | null, (id: string) => (on: boolean) => void] {
  const [hovered, setHovered] = useState<string | null>(null)
  const hover = (id: string) => (on: boolean) =>
    setHovered((current) => (on ? id : current === id ? null : current))
  return [hovered, hover]
}

function AvatarCloud({ groupRef }: { groupRef: MutableRefObject<THREE.Group | null> }) {
  const { reducedMotion } = useScene()
  const frames = useMemo(() => createAvatarFrames(3), [])
  const blink = useMemo(() => createBlinker(), [])
  const sprite = useRef<THREE.Sprite>(null)
  useEffect(() => () => frames.forEach((f) => f.dispose()), [frames])

  useFrame((state) => {
    if (reducedMotion || !sprite.current) return
    const step = Math.floor(state.clock.elapsedTime * 4) % 4
    const frame = frames[step === 3 ? 1 : step]
    setAvatarLids(frame, blink(state.clock.elapsedTime))
    sprite.current.material.map = frame
  })

  return (
    <group ref={groupRef} position={[4.3, 2.6, -0.6]}>
      <SkyCloud position={[0, 0, 0]} scale={2.6} seed={7} drift={0.02} />
      <sprite ref={sprite} position={[0, 1.5, 0.05]} scale={[2 * AVATAR_ASPECT, 2, 1]}>
        <spriteMaterial map={frames[0]} transparent depthWrite={false} />
      </sprite>
    </group>
  )
}

export function IntroMilestone({ flight }: MilestoneHandle) {
  const [hovered, hover] = useHover()
  const card = useRef<THREE.Group>(null)
  const avatar = useRef<THREE.Group | null>(null)
  const quoteA = useRef<THREE.Group>(null)
  const quoteB = useRef<THREE.Group>(null)
  const { reducedMotion } = useScene()
  const lane = useLane()
  const part = useLane(0.25)

  const onFrame = (ahead: number, t: number) => {
    const f = easeInQuad(approach(ahead, 16, 6))
    const bob = reducedMotion ? 0 : Math.sin(t * 0.8) * 0.15
    if (card.current) card.current.position.x = -f * SPREAD * 0.6 * part
    if (avatar.current)
      avatar.current.position.set(4.3 * lane + f * SPREAD * 0.35 * part, 2.6 + bob + f * 2, -0.6)
    if (quoteA.current) quoteA.current.position.x = f * SPREAD * 0.7 * part
    if (quoteB.current) quoteB.current.position.x = -f * SPREAD * 0.5 * part
  }

  return (
    <Milestone at={milestoneAt('intro')} flight={flight} onFrame={onFrame}>
      <SkyCloud position={[-4.2, 6.2, -1.6]} scale={3.2} seed={8} />
      <group ref={card}>
        <SkyCard
          wind={flight}
          position={[0, 4.7, 0]}
          rotation={[0, 0, 0.02]}
          width={5.6}
          height={2.6}
          eyebrow="who I am"
          title={siteConfig.name}
          body={siteConfig.headline}
          accent="sage"
          titleSize={128}
          bodySize={52}
          seed={301}
          label="Fly closer"
          hovered={hovered === 'name'}
          onHover={hover('name')}
          onActivate={() => flyToMilestone('intro')}
        />
      </group>
      <AvatarCloud groupRef={avatar} />
      <group ref={quoteA}>
        <Note lines={[about.quote[0]]} position={[0, 1.4, 0.2]} width={4.6} fontSize={44} />
      </group>
      <group ref={quoteB}>
        <Note
          lines={[about.quote[1]]}
          position={[0, 0.8, 0.2]}
          width={4.6}
          fontSize={44}
          color="#33485c"
        />
      </group>
    </Milestone>
  )
}

export function AboutMilestone({ flight }: MilestoneHandle) {
  const [hovered, hover] = useHover()
  const left = useRef<THREE.Group>(null)
  const right = useRef<THREE.Group>(null)
  const lane = useLane(0.3)
  // Side by side on wide screens; stacked one above the other on tall ones.
  const stack = lane < 1 ? 1.5 : 0

  const onFrame = (ahead: number) => {
    const f = easeInQuad(approach(ahead, 14, 5))
    if (left.current) {
      left.current.position.x = (-2.6 - f * 1.6) * lane
      left.current.rotation.y = 0.08 + f * 0.14
    }
    if (right.current) {
      right.current.position.x = (2.6 + f * 1.6) * lane
      right.current.rotation.y = -0.08 - f * 0.14
    }
  }

  return (
    <Milestone at={milestoneAt('about')} flight={flight} onFrame={onFrame}>
      <SkyCloud position={[-4.0, 0.9, -2.0]} scale={3.4} seed={21} />
      <SkyCloud position={[3.6, 6.4, -2.0]} scale={2.6} seed={22} />
      <group ref={left} position={[-2.6, 0, 0]}>
        <SkyCard
          wind={flight}
          position={[0, 3.9 + stack, 0.2]}
          rotation={[0, 0, 0.03]}
          width={4.0}
          height={2.7}
          eyebrow="about me"
          title="Summary"
          body={about.summary}
          accent="sage"
          titleSize={88}
          bodySize={44}
          seed={302}
          label="Fly closer"
          hovered={hovered === 'summary'}
          onHover={hover('summary')}
          onActivate={() => flyToMilestone('about')}
        />
      </group>
      <group ref={right} position={[2.6, 0, 0]}>
        <SkyCard
          wind={flight}
          position={[0, 3.6 - stack, -0.4]}
          rotation={[0, 0, -0.03]}
          width={4.0}
          height={2.7}
          eyebrow="about me"
          title="Experience"
          body={about.experience}
          accent="slate"
          titleSize={88}
          bodySize={44}
          seed={303}
          label="Fly closer"
          hovered={hovered === 'experience'}
          onHover={hover('experience')}
          onActivate={() => flyToMilestone('about')}
        />
      </group>
    </Milestone>
  )
}

const PRINCIPLE_PLACES: readonly Vec3[] = [
  [-4.0, 2.4, 0.4],
  [0, 4.6, -0.6],
  [4.0, 2.8, 0.2],
]
const PRINCIPLE_ACCENTS = ['terracotta', 'ochre', 'plum'] as const

export function PrinciplesMilestone({ flight }: MilestoneHandle) {
  const [hovered, hover] = useHover()
  const groups = useRef<(THREE.Group | null)[]>([])
  const lane = useLane(0.3)

  const onFrame = (ahead: number) => {
    const f = easeInQuad(approach(ahead, 14, 5))
    groups.current.forEach((group, i) => {
      if (!group) return
      const [x, y, z] = PRINCIPLE_PLACES[i] ?? PRINCIPLE_PLACES[0]
      group.position.set((x + Math.sign(x) * f * 1.5) * lane, y + (x === 0 ? f * 0.6 : 0), z)
    })
  }

  return (
    <Milestone at={milestoneAt('principles')} flight={flight} onFrame={onFrame}>
      <Note
        lines={['principles']}
        position={[0, 6.6, -0.5]}
        width={3.2}
        fontSize={80}
        color="#262421"
      />
      <SkyCloud position={[-4.6, 0.8, -1.8]} scale={3.0} seed={43} />
      <SkyCloud position={[4.6, 6.2, -2.2]} scale={2.4} seed={44} />
      {about.philosophy.map((item, i) => (
        <group
          key={item.title}
          ref={(el) => {
            groups.current[i] = el
          }}
          position={PRINCIPLE_PLACES[i] ?? PRINCIPLE_PLACES[0]}
        >
          <SkyCard
            wind={flight}
            position={[0, 0, 0]}
            rotation={[0, (1 - i) * 0.1, (i % 2 ? -1 : 1) * 0.03]}
            width={2.9}
            height={2.1}
            eyebrow={`0${i + 1}`}
            title={item.title}
            body={item.text}
            accent={PRINCIPLE_ACCENTS[i % 3]}
            titleSize={104}
            bodySize={54}
            seed={310 + i}
            label={item.title}
            hovered={hovered === `principle-${i}`}
            onHover={hover(`principle-${i}`)}
            onActivate={() => flyToMilestone('principles')}
          />
        </group>
      ))}
    </Milestone>
  )
}
