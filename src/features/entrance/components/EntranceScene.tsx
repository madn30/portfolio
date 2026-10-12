import { useEffect, useRef, useState } from 'react'
import { play, unlockAudio } from '@/app/audio'
import { useLoaderDone } from '@/features/loader'
import { siteConfig } from '@/data/siteConfig'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { unlock } from '@/features/achievements'
import { setWorld } from '@/shared/store/worldStore'
import { gsap } from '@/shared/utils/gsap'
import { FRAME, OPENING, measureFrame, useFacadeFrame } from '@/features/entrance/shared'
import { Facade } from './Facade'
import { FrontDoor, type FrontDoorHandle } from './FrontDoor'
import { HangingSign } from './HangingSign'
import { StreetProps } from './StreetProps'
import { WindowProps } from './WindowProps'

function finish(): void {
  setWorld({ entered: true, introDone: false })
}

export function EntranceScene() {
  const reducedMotion = useReducedMotion()
  const loaderDone = useLoaderDone()
  const frame = useFacadeFrame()
  const root = useRef<HTMLDivElement>(null)
  const zoom = useRef<HTMLDivElement>(null)
  const badge = useRef<HTMLDivElement>(null)
  const door = useRef<FrontDoorHandle>(null)
  const gust = useRef(0)
  const [opening, setOpening] = useState(false)
  const animate = !reducedMotion

  useEffect(() => {
    if (reducedMotion || !loaderDone || !root.current) return
    const ctx = gsap.context(() => {
      gsap.from('[data-entrance-reveal]', {
        y: 18,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        delay: 0.4,
        ease: 'power3.out',
      })
    }, root)
    return () => ctx.revert()
  }, [reducedMotion, loaderDone])

  const enter = () => {
    if (opening) return
    setOpening(true)
    unlockAudio()
    play('open')
    unlock('explorer')
    const zoomElement = zoom.current
    const rootElement = root.current
    if (reducedMotion || !zoomElement || !rootElement || !door.current) {
      finish()
      return
    }
    gust.current = 0.6
    const { scale } = measureFrame()
    const zoomScale =
      Math.max(
        window.innerWidth / (OPENING.width * scale),
        window.innerHeight / (OPENING.height * scale),
      ) * 1.1
    const timeline = gsap.timeline({ onComplete: finish })
    door.current.swingOpen(timeline)
    if (badge.current) timeline.to(badge.current, { opacity: 0, y: 12, duration: 0.3 }, 0)
    timeline
      .to(
        zoomElement,
        {
          scale: zoomScale,
          duration: 1.8,
          ease: 'power2.inOut',
          transformOrigin: `${OPENING.x + OPENING.width / 2}px ${OPENING.y + OPENING.height / 2}px`,
        },
        0.3,
      )
      .to(rootElement, { opacity: 0, duration: 0.45, ease: 'power1.in' }, 1.65)
  }

  return (
    <div
      ref={root}
      className="fixed inset-0 z-40 overflow-hidden"
      aria-label="The street outside the portfolio"
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: FRAME.width,
          height: FRAME.height,
          transform: `translate(${frame.x}px, ${frame.y}px) scale(${frame.scale})`,
        }}
      >
        <div ref={zoom} className="relative h-full w-full will-change-transform">
          <Facade />
          <StreetProps animate={animate} />
          <WindowProps animate={animate} />
          <HangingSign animate={animate} gust={gust} />
          <FrontDoor ref={door} disabled={opening} animate={animate} onEnter={enter} />
        </div>
      </div>

      <div
        ref={badge}
        data-entrance-reveal
        className="pointer-events-none absolute left-4 top-3 sm:left-6 sm:top-4"
      >
        <div className="torn-wrap">
          <div className="torn px-5 py-2.5">
            <h1 className="font-display text-base leading-tight text-ink sm:text-lg">
              {siteConfig.name}
              <span className="font-hand text-base text-charcoal sm:text-lg">
                {' '}
                · {siteConfig.title}
              </span>
            </h1>
          </div>
        </div>
      </div>
    </div>
  )
}
