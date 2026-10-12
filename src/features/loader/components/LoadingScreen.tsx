import { useEffect, useRef, useState } from 'react'
import { play } from '@/app/audio'
import { useFontsReady } from '@/shared/hooks/useFontsReady'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { useWorld } from '@/shared/store/worldStore'
import { gsap } from '@/shared/utils/gsap'
import { Percentage } from './LoaderDial'
import { markLoaderDone } from '@/features/loader/loaderStore'
import { PaperHalf } from '@/shared/components/PaperHalf'
import { createTearShape } from '@/shared/utils/tearPath'

const MIN_VISIBLE_MS = 1400
const DASH = 120

function tweenDuration(distance: number): number {
  if (distance > 60) return 1.5
  if (distance > 30) return 1
  if (distance > 10) return 0.6
  return 0.4
}

function paint(
  value: number,
  labels: (HTMLSpanElement | null)[],
  lines: (SVGPathElement | null)[],
): void {
  const clamped = Math.min(100, Math.max(0, value))
  const text = `${Math.round(clamped)}%`
  const offset = String(DASH - (DASH * clamped) / 100)
  for (const label of labels) if (label) label.textContent = text
  for (const line of lines) if (line) line.style.strokeDashoffset = offset
}

const SHAPE = createTearShape(7)

export function LoadingScreen() {
  const sceneReady = useWorld((s) => s.sceneReady)
  const fontsReady = useFontsReady()
  const reducedMotion = useReducedMotion()
  const [minElapsed, setMinElapsed] = useState(false)
  const [done, setDone] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const left = useRef<HTMLDivElement>(null)
  const right = useRef<HTMLDivElement>(null)
  const leftLabel = useRef<HTMLSpanElement>(null)
  const rightLabel = useRef<HTMLSpanElement>(null)
  const leftLine = useRef<SVGPathElement>(null)
  const rightLine = useRef<SVGPathElement>(null)
  const progress = useRef({ value: 0 })
  const exit = useRef<gsap.core.Timeline | null>(null)

  const ready = sceneReady && fontsReady && minElapsed
  const target = ready ? 100 : fontsReady ? 90 : 70

  useEffect(() => {
    const timer = window.setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    return () => {
      exit.current?.kill()
    }
  }, [])

  useEffect(() => {
    if (!reducedMotion || !ready) return
    markLoaderDone()
    setDone(true)
  }, [reducedMotion, ready])

  useEffect(() => {
    if (reducedMotion) return
    const state = progress.current
    const tween = gsap.to(state, {
      value: target,
      duration: tweenDuration(target - state.value),
      ease: 'power2.out',
      overwrite: true,
      onUpdate: () => {
        paint(
          state.value,
          [leftLabel.current, rightLabel.current],
          [leftLine.current, rightLine.current],
        )
        if (target < 100 || state.value < 99.5 || exit.current) return
        const rootElement = root.current
        const leftHalf = left.current
        const rightHalf = right.current
        markLoaderDone()
        if (!rootElement || !leftHalf || !rightHalf) {
          setDone(true)
          return
        }
        play('tear')
        exit.current = gsap
          .timeline({ onComplete: () => setDone(true) })
          .to({}, { duration: 0.1 })
          .to(
            leftHalf,
            { xPercent: -100, rotation: -2, duration: 1.8, ease: 'power3.inOut' },
            'tear',
          )
          .to(
            rightHalf,
            { xPercent: 100, rotation: 2, duration: 1.8, ease: 'power3.inOut' },
            'tear',
          )
          .to(rootElement, { opacity: 0, duration: 0.5 }, '-=0.5')
      },
    })
    return () => {
      tween.kill()
    }
  }, [target, reducedMotion])

  if (done) return null

  const text = reducedMotion ? `${target}%` : '0%'
  const dash = reducedMotion ? undefined : DASH

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[55]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Sketching the corridor</span>
      <PaperHalf side="left" shape={SHAPE} halfRef={left} lineRef={leftLine} dash={dash}>
        <Percentage labelRef={leftLabel} text={text} animate={!reducedMotion} />
      </PaperHalf>
      <PaperHalf side="right" shape={SHAPE} halfRef={right} lineRef={rightLine} dash={dash}>
        <Percentage labelRef={rightLabel} text={text} animate={!reducedMotion} />
      </PaperHalf>
    </div>
  )
}
