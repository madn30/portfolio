import { useCallback, useEffect, useRef, useState } from 'react'
import { ErrorBoundary } from '@/shared/components/ErrorFallback'
import { useFontsReady } from '@/shared/hooks/useFontsReady'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { useWorld } from '@/shared/store/worldStore'
import { gsap } from '@/shared/utils/gsap'
import { markLoaderDone, markLoaderFinished } from '@/features/loader/loaderStore'
import type { LoaderPhase } from '@/features/loader/phase'
import { LoaderLabel } from './LoaderLabel'
import { PaperDom } from './PaperDom'
import { PaperWebgl } from './PaperWebgl'

const MIN_VISIBLE_MS = 1400
const FADE_SECONDS = 0.5

function tweenDuration(distance: number): number {
  if (distance > 60) return 1.5
  if (distance > 30) return 1
  if (distance > 10) return 0.6
  return 0.4
}

interface LoadingScreenProps {
  lightweight: boolean
  /** Phones skip the paper tear: a plain sheet fades away at 100% instead. */
  skipTear: boolean
}

export function LoadingScreen({ lightweight, skipTear }: LoadingScreenProps) {
  const sceneReady = useWorld((s) => s.sceneReady)
  const fontsReady = useFontsReady()
  const reducedMotion = useReducedMotion()
  const [minElapsed, setMinElapsed] = useState(false)
  const [phase, setPhase] = useState<LoaderPhase>('loading')
  const [webglFailed, setWebglFailed] = useState(false)
  const progress = useRef({ value: 0 })
  const startedAt = useRef(performance.now())
  const root = useRef<HTMLDivElement>(null)

  const ready = sceneReady && fontsReady && minElapsed
  const target = ready ? 100 : fontsReady ? 90 : 70
  const use3D = !lightweight && !skipTear && !reducedMotion && !webglFailed

  useEffect(() => {
    const timer = window.setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!reducedMotion) return
    progress.current.value = target
    if (!ready) return
    markLoaderDone()
    markLoaderFinished()
    setPhase('done')
  }, [reducedMotion, ready, target])

  useEffect(() => {
    if (reducedMotion) return
    const state = progress.current
    const tween = gsap.to(state, {
      value: target,
      duration: tweenDuration(target - state.value),
      ease: 'power2.out',
      overwrite: true,
      onUpdate: () => {
        if (target < 100 || state.value < 99.5) return
        markLoaderDone()
        setPhase((current) => (current === 'loading' ? 'tearing' : current))
      },
    })
    return () => {
      tween.kill()
    }
  }, [target, reducedMotion])

  const finish = useCallback(() => {
    markLoaderFinished()
    setPhase('done')
  }, [])

  useEffect(() => {
    if (!skipTear || phase !== 'tearing' || !root.current) return
    const tween = gsap.to(root.current, {
      opacity: 0,
      duration: FADE_SECONDS,
      ease: 'power2.out',
      onComplete: finish,
    })
    return () => {
      tween.kill()
    }
  }, [skipTear, phase, finish])

  if (phase === 'done') return null

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[55]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading the corridor</span>
      {skipTear ? (
        <div className="paper-sheet absolute inset-0" />
      ) : use3D ? (
        <ErrorBoundary fallback={null} onError={() => setWebglFailed(true)}>
          <PaperWebgl phase={phase} onDone={finish} />
        </ErrorBoundary>
      ) : (
        <PaperDom phase={phase} progress={progress} reducedMotion={reducedMotion} onDone={finish} />
      )}
      <LoaderLabel
        progress={progress}
        startedAt={startedAt.current}
        hidden={phase === 'tearing'}
        onPaper={use3D}
      />
    </div>
  )
}
