import { useEffect, useRef } from 'react'
import type { DoorSectionId } from '@/shared/types'
import { useInspectHidden } from '@/shared/hooks/useInspectHidden'
import { useWorld, worldRefs } from '@/shared/store/worldStore'
import { createBlinker, type BlinkCue } from '@/shared/utils/blink'
import { gsap } from '@/shared/utils/gsap'

const LID = 'absolute -left-[20vw] w-[140vw] bg-[#17120f] shadow-[0_0_48px_32px_#17120f]'
const OUTDOORS: ReadonlySet<DoorSectionId> = new Set(['about', 'projects', 'experience', 'contact'])
const TURN_BLINK = 0.9
const YAWN_AFTER = 25
const SQUINT = 0.22
const ADAPT_RATE = 1.5

export function WalkerEyes() {
  const activeDoor = useWorld((s) => s.activeDoor)
  const inspecting = useInspectHidden()
  const upper = useRef<HTMLDivElement>(null)
  const lower = useRef<HTMLDivElement>(null)
  const glare = useRef<HTMLDivElement>(null)
  const gloom = useRef<HTMLDivElement>(null)
  const vignette = useRef<HTMLDivElement>(null)
  const eyes = useRef({ glare: 0, gloom: 0, idle: 0, edges: 0, cue: null as BlinkCue | null })
  const holding = useRef(false)
  const lastDoor = useRef(activeDoor)

  useEffect(() => {
    holding.current = inspecting || activeDoor !== null
  }, [inspecting, activeDoor])

  useEffect(() => {
    const from = lastDoor.current
    lastDoor.current = activeDoor
    if (from === activeDoor) return
    eyes.current.cue = 'now'
    if (activeDoor && OUTDOORS.has(activeDoor)) eyes.current.glare = 1
    if (!activeDoor && from && OUTDOORS.has(from)) eyes.current.gloom = 1
  }, [activeDoor])

  useEffect(() => {
    const blink = createBlinker()
    const tick = (time: number, deltaTime: number) => {
      const e = eyes.current
      const dt = Math.min(deltaTime / 1000, 0.05)
      const fade = Math.exp(-dt * ADAPT_RATE)
      e.glare *= fade
      e.gloom *= fade
      e.idle = worldRefs.walkSpeed < 0.02 && !holding.current ? e.idle + dt : 0

      let cue = e.cue ?? (holding.current ? 'hold' : undefined)
      e.cue = null
      if (!cue && worldRefs.turnSpeed > TURN_BLINK) cue = 'now'
      if (!cue && e.idle > YAWN_AFTER) {
        cue = 'slow'
        e.idle = 0
      }
      const closed = Math.max(blink(time, cue), e.glare * SQUINT)

      if (upper.current) {
        upper.current.style.transform = `translateY(${((closed - 1) * 112).toFixed(2)}%)`
      }
      if (lower.current) {
        lower.current.style.transform = `translateY(${((1 - closed) * 140).toFixed(2)}%)`
      }
      if (glare.current) glare.current.style.opacity = (e.glare * 0.5).toFixed(3)
      if (gloom.current) gloom.current.style.opacity = (e.gloom * 0.35).toFixed(3)
      const edges = lastDoor.current ? 0 : 0.45 + worldRefs.walkSpeed * 0.55
      e.edges += (edges - e.edges) * (1 - Math.exp(-dt * 3))
      if (vignette.current) vignette.current.style.opacity = e.edges.toFixed(3)
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[5]">
        <div
          ref={vignette}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_58%,rgba(23,18,15,0.42)_100%)]"
        />
        <div ref={glare} className="absolute inset-0 bg-white opacity-0" />
        <div ref={gloom} className="absolute inset-0 bg-[#17120f] opacity-0" />
      </div>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[50] overflow-hidden">
        <div
          ref={upper}
          className={`${LID} top-0 h-[84vh] rounded-b-[50%_30%] will-change-transform`}
          style={{ transform: 'translateY(-112%)' }}
        />
        <div
          ref={lower}
          className={`${LID} bottom-0 h-[30vh] rounded-t-[50%_40%] will-change-transform`}
          style={{ transform: 'translateY(140%)' }}
        />
      </div>
    </>
  )
}
