import { useEffect, useState } from 'react'

const MS_PER_CHAR = 15
const MAX_MS = 2500
const DELAY_MS = 300

export function useTypewriter(text: string, active: boolean, instant: boolean): string {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) {
      setCount(0)
      return
    }
    if (instant || text.length === 0) {
      setCount(text.length)
      return
    }
    const perChar = Math.min(MS_PER_CHAR, MAX_MS / text.length)
    const start = performance.now() + DELAY_MS
    let frame = 0
    const tick = (now: number) => {
      const next = Math.max(0, Math.min(text.length, Math.floor((now - start) / perChar)))
      setCount(next)
      if (next < text.length) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [text, active, instant])

  return text.slice(0, count)
}
