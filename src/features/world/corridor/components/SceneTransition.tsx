import { useEffect, useMemo, useRef } from 'react'
import { play } from '@/app/audio'
import { PaperHalf } from '@/shared/components/PaperHalf'
import { createTearShape } from '@/shared/utils/tearPath'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { useWorld, worldStore } from '@/shared/store/worldStore'
import { gsap } from '@/shared/utils/gsap'

const WALK_DELAY = 0.3

export function SceneTransition() {
  const tick = useWorld((s) => s.transitionTick)
  const reducedMotion = useReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const left = useRef<HTMLDivElement>(null)
  const right = useRef<HTMLDivElement>(null)
  const shape = useMemo(() => createTearShape(tick * 7 + 11), [tick])

  useEffect(() => {
    const rootElement = root.current
    const leftHalf = left.current
    const rightHalf = right.current
    if (tick === 0 || reducedMotion || !rootElement || !leftHalf || !rightHalf) return
    const walking = worldStore.getState().enteringDoor !== null
    const delay = walking ? WALK_DELAY : 0
    const closeDuration = walking ? 0.5 : 0.6
    const hold = walking ? 0.3 : 0.2
    const timeline = gsap
      .timeline()
      .set(rootElement, { opacity: 1 })
      .set(leftHalf, { xPercent: -100, rotation: -2 })
      .set(rightHalf, { xPercent: 100, rotation: 2 })
      .call(() => play('tear'), undefined, delay)
      .to(
        leftHalf,
        { xPercent: 0, rotation: 0, duration: closeDuration, ease: 'power2.inOut' },
        delay,
      )
      .to(
        rightHalf,
        { xPercent: 0, rotation: 0, duration: closeDuration, ease: 'power2.inOut' },
        delay,
      )
      .call(() => play('tear'), undefined, `+=${hold}`)
      .to(leftHalf, { xPercent: -100, rotation: -2, duration: 1, ease: 'power3.inOut' }, 'open')
      .to(rightHalf, { xPercent: 100, rotation: 2, duration: 1, ease: 'power3.inOut' }, 'open')
      .to(rootElement, { opacity: 0, duration: 0.3 }, '-=0.3')
    return () => {
      timeline.kill()
      gsap.set(rootElement, { opacity: 0 })
    }
  }, [tick, reducedMotion])

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[45] opacity-0"
    >
      <PaperHalf side="left" shape={shape} halfRef={left} />
      <PaperHalf side="right" shape={shape} halfRef={right} />
    </div>
  )
}
