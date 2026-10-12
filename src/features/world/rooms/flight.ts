import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { isTypingTarget } from '@/shared/utils/keys'

export type Vec3 = [number, number, number]

export const SKY = '#8fd0f5'
export const HORIZON = '#d8f0ff'

const WHEEL_RATE = 0.03
const TOUCH_RATE = 0.12
const KEY_KICK = 7
const PAGE_KICK = 16
const MAX_SPEED = 18
const FRICTION = 0.93
const CRUISE = 0.25
const APPROACH = 7.5
const PATTERN = 40

export interface Flight {
  distance: number
  velocity: number
  goal: number | null
  started: boolean
  bank: number
  pitch: number
  speed: number
}

interface FlightOptions {
  active: boolean
}

interface FlightControls {
  flight: MutableRefObject<Flight>
  advance: (dt: number, reducedMotion: boolean) => void
  flyTo: (ahead: number) => void
}

function kick(f: Flight, amount: number): void {
  f.goal = null
  f.velocity = THREE.MathUtils.clamp(f.velocity + amount, -MAX_SPEED, MAX_SPEED)
}

export function useFlight({ active }: FlightOptions): FlightControls {
  const gl = useThree((state) => state.gl)
  const flight = useRef<Flight>({
    distance: 0,
    velocity: 0,
    goal: null,
    started: false,
    bank: 0,
    pitch: 0,
    speed: 0,
  })

  useEffect(() => {
    if (!active) return
    const canvas = gl.domElement
    const f = flight.current
    let touchY: number | null = null
    const onWheel = (event: WheelEvent) => kick(f, event.deltaY * WHEEL_RATE)
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? null
    }
    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY
      if (touchY === null || y === undefined) return
      kick(f, (touchY - y) * TOUCH_RATE)
      touchY = y
      event.preventDefault()
    }
    const onTouchEnd = () => {
      touchY = null
    }
    const onKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || event.metaKey || event.ctrlKey) return
      switch (event.key) {
        case 'ArrowDown':
          kick(f, KEY_KICK)
          break
        case 'ArrowUp':
          kick(f, -KEY_KICK)
          break
        case 'PageDown':
        case ' ':
          kick(f, event.shiftKey ? -PAGE_KICK : PAGE_KICK)
          break
        case 'PageUp':
          kick(f, -PAGE_KICK)
          break
        default:
          return
      }
      event.preventDefault()
    }
    canvas.addEventListener('wheel', onWheel, { passive: true })
    canvas.addEventListener('touchstart', onTouchStart, { passive: true })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)
    canvas.addEventListener('touchcancel', onTouchEnd)
    window.addEventListener('keydown', onKey)
    return () => {
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
      canvas.removeEventListener('touchcancel', onTouchEnd)
      window.removeEventListener('keydown', onKey)
    }
  }, [active, gl])

  return useMemo<FlightControls>(
    () => ({
      flight,
      advance: (dt, reducedMotion) => {
        const f = flight.current
        if (reducedMotion) {
          f.distance = Math.max(0, f.goal ?? f.distance + f.velocity / (60 * (1 - FRICTION)))
          f.velocity = 0
          f.goal = null
          f.bank = 0
          f.pitch = 0
          f.speed = 0
          return
        }
        if (f.goal !== null) {
          const diff = f.goal - f.distance
          f.distance += diff * (1 - Math.exp(-dt * 3))
          f.velocity = diff * 2
          if (Math.abs(diff) < 0.03) f.goal = null
        } else {
          f.distance += f.velocity * dt
          f.velocity *= Math.pow(FRICTION, dt * 60)
          if (Math.abs(f.velocity) < 0.01) f.velocity = 0
          if (active) f.distance += CRUISE * dt
        }
        if (f.distance <= 0) {
          f.distance = 0
          f.velocity = Math.max(0, f.velocity)
          if (f.goal !== null && f.goal < 0) f.goal = null
        }
        if (!f.started && f.distance > 0.5) f.started = true
        const progress = (((f.distance % PATTERN) + PATTERN) % PATTERN) / PATTERN
        const ease = f.started ? Math.min(1, (f.distance - 0.5) / 5) : 0
        const calm = 1 / (1 + Math.abs(f.velocity) / 5)
        const bank = Math.sin(progress * Math.PI * 2) * 0.12 * ease * calm
        const pitch = Math.sin(progress * Math.PI * 4) * 0.05 * ease * calm
        const k = 1 - Math.pow(0.2, dt)
        f.bank = THREE.MathUtils.lerp(f.bank, bank, k)
        f.pitch = THREE.MathUtils.lerp(f.pitch, pitch, k)
        f.speed = THREE.MathUtils.lerp(f.speed, f.velocity, 1 - Math.exp(-dt * 4))
      },
      flyTo: (ahead) => {
        const f = flight.current
        f.goal = f.distance + ahead - APPROACH
        f.velocity = 0
      },
    }),
    [active],
  )
}
