import { useEffect } from 'react'
import { setWorld, worldRefs } from '@/store/worldStore'
import { maxScrollTop, nearestStation } from '@/utils/corridor'

/**
 * Mirrors the page scroll into `worldRefs.scroll` (0..1) for the camera, and updates the
 * coarse "station" index in the store only when it actually changes, so React re-renders
 * stay rare while scrolling.
 */
export function useScrollProgress(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return
    let frame = 0

    const update = () => {
      frame = 0
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScrollTop()))
      worldRefs.scroll = progress
      const station = nearestStation(progress)
      const state = { station } as { station: number; introDone?: boolean }
      if (progress > 0.03) state.introDone = true
      setWorld(state)
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [enabled])
}
