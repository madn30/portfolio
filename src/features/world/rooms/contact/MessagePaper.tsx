import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { play } from '@/app/audio'
import {
  createMessagePaperTexture,
  drawMessagePaper,
  PAPER_LAYOUT,
  type PaperTarget,
} from './paperTexture'
import { InteractiveHotspot } from '@/features/world/corridor/components/InteractiveHotspot'
import { useScene } from '@/features/world/scene/SceneContext'
import { CRATE, type Vec3 } from './constants'
import { focusMessageField, lowerMessage, submitMessage, useMessage } from './messageStore'
import { createTornPaper, foldPaper } from './tornPaper'

const W = 1.2
const H = 1.5
const FOLD_SECONDS = 0.7
const FLIGHT_SECONDS = 2.6
const AWAY: Vec3 = [-4.5, 3.2, -16]

interface Pose {
  position: Vec3
  rotation: Vec3
  scale: number
}

const REST: Pose = {
  position: [CRATE[0], CRATE[1] + 0.54, CRATE[2] + 0.04],
  rotation: [-Math.PI / 2 + 0.5, 0, 0.12],
  scale: 0.5,
}
const RAISED: Pose = { position: [0, 1.3, -4.3], rotation: [-0.18, 0, 0.02], scale: 0.72 }
const RAISED_POSITION = new THREE.Vector3(...RAISED.position)

const LABELS: Record<PaperTarget, string> = {
  name: 'Write your name',
  email: 'Your email',
  message: 'Your message',
  send: 'Send',
  close: 'Put the paper down',
}

function smooth(t: number): number {
  const x = THREE.MathUtils.clamp(t, 0, 1)
  return x * x * (3 - 2 * x)
}

function hotspotPlace(target: PaperTarget): { position: Vec3; size: [number, number, number] } {
  const box = PAPER_LAYOUT[target]
  return {
    position: [(box.x + box.w / 2 - 0.5) * W, (0.5 - box.y - box.h / 2) * H, 0.03],
    size: [box.w * W, box.h * H, 0.06],
  }
}

export function MessagePaper() {
  const { quality, reducedMotion, touch } = useScene()
  const group = useRef<THREE.Group>(null)
  const flight = useRef<number | null>(null)
  const sentSeen = useRef<number | null>(null)
  const [hovered, setHovered] = useState<PaperTarget | null>(null)
  const [blink, setBlink] = useState(true)
  const values = useMessage((s) => s.values)
  const active = useMessage((s) => s.active)
  const status = useMessage((s) => s.status)
  const error = useMessage((s) => s.error)
  const hasBackend = useMessage((s) => s.hasBackend)
  const raised = useMessage((s) => s.raised)
  const sentTick = useMessage((s) => s.sentTick)

  const paper = useMemo(
    () => createTornPaper(W, H, quality === 'low' ? 10 : 14, quality === 'low' ? 13 : 18),
    [quality],
  )
  const sheet = useMemo(() => createMessagePaperTexture(), [])
  const materials = useMemo(
    () => ({
      front: new THREE.MeshBasicMaterial({
        map: sheet.texture,
        transparent: true,
        alphaTest: 0.05,
        side: THREE.FrontSide,
        toneMapped: false,
      }),
      back: new THREE.MeshBasicMaterial({ color: '#f4f2ec', side: THREE.BackSide }),
    }),
    [sheet],
  )
  useEffect(
    () => () => {
      paper.geometry.dispose()
      sheet.texture.dispose()
      materials.front.dispose()
      materials.back.dispose()
    },
    [paper, sheet, materials],
  )

  useEffect(() => {
    if (!active) {
      setBlink(true)
      return
    }
    const timer = window.setInterval(() => setBlink((b) => !b), 530)
    return () => window.clearInterval(timer)
  }, [active])

  const button = status === 'sending' ? 'Sending…' : hasBackend ? 'Send message' : 'Compose email'
  const note =
    status === 'sent'
      ? 'Sent — thank you!'
      : status === 'error'
        ? 'Sending failed. Email me instead.'
        : ''
  useEffect(() => {
    drawMessagePaper(sheet.ctx, {
      values,
      active,
      hovered,
      cursor: blink,
      button,
      note,
      error,
      closable: raised,
    })
    sheet.texture.needsUpdate = true
  }, [sheet, values, active, hovered, blink, button, note, error, raised])

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    if (sentSeen.current === null) sentSeen.current = sentTick
    if (sentTick !== sentSeen.current) {
      sentSeen.current = sentTick
      play('tear')
      if (!reducedMotion) flight.current = t
    }
    if (flight.current !== null) {
      const elapsed = t - flight.current
      if (elapsed < FOLD_SECONDS) {
        foldPaper(paper, smooth(elapsed / FOLD_SECONDS))
        const k = 1 - Math.exp(-delta * 8)
        g.position.lerp(RAISED_POSITION, k)
        g.scale.setScalar(g.scale.x + (RAISED.scale - g.scale.x) * k)
        g.rotation.x += (RAISED.rotation[0] - g.rotation.x) * k
        g.rotation.y += (RAISED.rotation[1] - g.rotation.y) * k
        g.rotation.z += (RAISED.rotation[2] - g.rotation.z) * k
      } else if (elapsed < FOLD_SECONDS + FLIGHT_SECONDS) {
        const f = smooth((elapsed - FOLD_SECONDS) / FLIGHT_SECONDS)
        g.position.set(
          THREE.MathUtils.lerp(RAISED.position[0], AWAY[0], f),
          THREE.MathUtils.lerp(RAISED.position[1], AWAY[1], f) + Math.sin(f * Math.PI) * 0.8,
          THREE.MathUtils.lerp(RAISED.position[2], AWAY[2], f),
        )
        g.scale.setScalar(RAISED.scale * (1 - f * 0.85))
        g.rotation.set(RAISED.rotation[0], f * 1.4, Math.sin(elapsed * 5) * 0.18)
      } else {
        foldPaper(paper, 0)
        flight.current = null
        g.scale.setScalar(0)
        g.position.set(...REST.position)
        g.rotation.set(...REST.rotation)
      }
      return
    }
    const target = raised ? RAISED : REST
    const k = reducedMotion ? 1 : 1 - Math.exp(-delta * 6)
    g.position.x += (target.position[0] - g.position.x) * k
    g.position.y += (target.position[1] - g.position.y) * k
    g.position.z += (target.position[2] - g.position.z) * k
    const scale = g.scale.x + (target.scale - g.scale.x) * k
    g.scale.setScalar(scale)
    const flutter = reducedMotion ? 0 : Math.sin(t * 0.5) * 0.005
    const tilt = hovered ? 0.015 : 0
    g.rotation.x += (target.rotation[0] - g.rotation.x) * k
    g.rotation.y += (target.rotation[1] - g.rotation.y) * k
    g.rotation.z += (target.rotation[2] + tilt + flutter - g.rotation.z) * k
  })

  const hover = (target: PaperTarget) => (on: boolean) =>
    setHovered((prev) => (on ? target : prev === target ? null : prev))
  const depth = touch ? 0.2 : 0.06

  return (
    <group ref={group} position={REST.position} rotation={REST.rotation} scale={REST.scale}>
      <InteractiveHotspot
        label={raised ? 'Leave a note' : 'Pick up the paper'}
        onActivate={() => focusMessageField(raised ? 'message' : 'name')}
      >
        <mesh geometry={paper.geometry} material={materials.front} />
        <mesh geometry={paper.geometry} material={materials.back} />
      </InteractiveHotspot>
      {(['name', 'email', 'message'] as const).map((field) => {
        const place = hotspotPlace(field)
        return (
          <InteractiveHotspot
            key={field}
            label={LABELS[field]}
            onActivate={() => focusMessageField(field)}
            onHoverChange={hover(field)}
            hitArea={[place.size[0], place.size[1], depth]}
            hitAreaPosition={place.position}
          >
            <group />
          </InteractiveHotspot>
        )
      })}
      <InteractiveHotspot
        label={button}
        onActivate={submitMessage}
        onHoverChange={hover('send')}
        hitArea={[hotspotPlace('send').size[0], hotspotPlace('send').size[1], depth]}
        hitAreaPosition={hotspotPlace('send').position}
      >
        <group />
      </InteractiveHotspot>
      <InteractiveHotspot
        label={LABELS.close}
        onActivate={lowerMessage}
        onHoverChange={hover('close')}
        hitArea={[hotspotPlace('close').size[0], hotspotPlace('close').size[1], depth]}
        hitAreaPosition={hotspotPlace('close').position}
        disabled={!raised}
      >
        <group />
      </InteractiveHotspot>
    </group>
  )
}
