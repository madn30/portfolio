import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { gsap } from '@/shared/utils/gsap'

interface LoaderLabelProps {
  progress: RefObject<{ value: number }>
  startedAt: number
  hidden: boolean
  onPaper: boolean
}

function formatElapsed(ms: number): string {
  const seconds = Math.max(0, ms) / 1000
  const minutes = Math.floor(seconds / 60)
  const rest = (seconds % 60).toFixed(1).padStart(4, '0')
  return `${String(minutes).padStart(2, '0')}:${rest}`
}

export function LoaderLabel({ progress, startedAt, hidden, onPaper }: LoaderLabelProps) {
  const percent = useRef<HTMLSpanElement>(null)
  const elapsed = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const tick = () => {
      if (percent.current) {
        percent.current.textContent = `${Math.round(progress.current.value)}%`
      }
      if (elapsed.current) {
        elapsed.current.textContent = formatElapsed(performance.now() - startedAt)
      }
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [progress, startedAt])

  return (
    <div
      className={`absolute bottom-8 left-8 flex items-baseline gap-4 transition-opacity duration-500 md:bottom-12 md:left-12 ${
        hidden ? 'opacity-0' : 'opacity-100'
      } ${onPaper ? 'text-[#2a2825]' : 'text-ink'}`}
      aria-hidden="true"
    >
      <span ref={percent} className="font-display text-4xl font-medium tabular-nums">
        0%
      </span>
      <span
        ref={elapsed}
        className="font-sans text-xs uppercase tracking-[0.22em] tabular-nums opacity-60"
      >
        00:00.0
      </span>
    </div>
  )
}
