import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { play } from '@/app/audio'
import { PaperHalf } from '@/shared/components/PaperHalf'
import { gsap } from '@/shared/utils/gsap'
import { createTearShape } from '@/shared/utils/tearPath'
import type { LoaderPhase } from '@/features/loader/phase'

const DASH = 120
const SHAPE = createTearShape(7)

interface PaperDomProps {
  phase: LoaderPhase
  progress: RefObject<{ value: number }>
  reducedMotion: boolean
  onDone: () => void
}

export function PaperDom({ phase, progress, reducedMotion, onDone }: PaperDomProps) {
  const left = useRef<HTMLDivElement>(null)
  const right = useRef<HTMLDivElement>(null)
  const leftLine = useRef<SVGPathElement>(null)
  const rightLine = useRef<SVGPathElement>(null)

  useEffect(() => {
    if (reducedMotion) return
    const tick = () => {
      const clamped = Math.min(100, Math.max(0, progress.current.value))
      const offset = String(DASH - (DASH * clamped) / 100)
      for (const line of [leftLine.current, rightLine.current]) {
        if (line) line.style.strokeDashoffset = offset
      }
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [progress, reducedMotion])

  useEffect(() => {
    if (phase !== 'tearing') return
    const leftHalf = left.current
    const rightHalf = right.current
    if (reducedMotion || !leftHalf || !rightHalf) {
      onDone()
      return
    }
    play('tear')
    const timeline = gsap
      .timeline({ onComplete: onDone })
      .to({}, { duration: 0.1 })
      .to(leftHalf, { xPercent: -100, rotation: -2, duration: 1.8, ease: 'power3.inOut' }, 'tear')
      .to(rightHalf, { xPercent: 100, rotation: 2, duration: 1.8, ease: 'power3.inOut' }, 'tear')
    return () => {
      timeline.kill()
    }
  }, [phase, reducedMotion, onDone])

  const dash = reducedMotion ? undefined : DASH

  return (
    <>
      <PaperHalf side="left" shape={SHAPE} halfRef={left} lineRef={leftLine} dash={dash} />
      <PaperHalf side="right" shape={SHAPE} halfRef={right} lineRef={rightLine} dash={dash} />
    </>
  )
}
