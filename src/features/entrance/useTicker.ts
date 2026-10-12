import { useEffect, useRef } from 'react'
import { gsap } from '@/shared/utils/gsap'

type TickCallback = (time: number, delta: number) => void

export function useTicker(enabled: boolean, callback: TickCallback): void {
  const latest = useRef(callback)
  useEffect(() => {
    latest.current = callback
  }, [callback])
  useEffect(() => {
    if (!enabled) return
    const tick = (time: number, deltaTime: number) => latest.current(time, deltaTime / 1000)
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [enabled])
}
