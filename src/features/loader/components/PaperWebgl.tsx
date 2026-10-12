import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { play } from '@/app/audio'
import { gsap } from '@/shared/utils/gsap'
import type { LoaderPhase } from '@/features/loader/phase'

const PaperTearScene = lazy(() =>
  import('@/features/world/tear/PaperTearScene').then((m) => ({ default: m.PaperTearScene })),
)

const TEAR_SECONDS = 5

interface PaperWebglProps {
  phase: LoaderPhase
  onDone: () => void
}

export function PaperWebgl({ phase, onDone }: PaperWebglProps) {
  const tear = useRef({ t: 0 })
  const [live, setLive] = useState(false)

  useEffect(() => {
    if (phase !== 'tearing' || !live) return
    play('tear')
    const tween = gsap.to(tear.current, {
      t: 1,
      duration: TEAR_SECONDS,
      delay: 0.15,
      ease: 'power1.inOut',
      onComplete: onDone,
    })
    return () => {
      tween.kill()
    }
  }, [phase, live, onDone])

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className={`paper-sheet absolute inset-0 ${live ? 'opacity-0' : 'opacity-100'}`} />
      <Suspense fallback={null}>
        <PaperTearScene tear={tear} onReady={() => setLive(true)} />
      </Suspense>
    </div>
  )
}
