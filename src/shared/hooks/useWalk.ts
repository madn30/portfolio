import { useEffect } from 'react'
import { distanceToProgress, lapOf, stepWalk, walkBy } from '@/app/walk'
import { isUnlocked, unlock } from '@/features/achievements'
import { setWorld, worldRefs, worldStore } from '@/shared/store/worldStore'
import { nearestStation } from '@/shared/corridor/corridor'
import { isTypingTarget } from '@/shared/utils/keys'
import { prefersReducedMotion } from './useReducedMotion'

const WHEEL_STEP = 0.009
const TOUCH_STEP = 0.014
const KEY_STEP = 1.4
const PAGE_STEP = 4.5

export function useWalk(enabled: boolean, blocked: boolean): void {
  useEffect(() => {
    if (!enabled) return

    const onWheel = (event: WheelEvent) => {
      if (blocked) return
      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1
      walkBy(event.deltaY * scale * WHEEL_STEP)
      event.preventDefault()
    }

    let touchY: number | null = null
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? null
    }
    const onTouchMove = (event: TouchEvent) => {
      if (blocked || touchY === null) return
      const y = event.touches[0]?.clientY
      if (y === undefined) return
      walkBy((touchY - y) * TOUCH_STEP)
      touchY = y
      event.preventDefault()
    }
    const onTouchEnd = () => {
      touchY = null
    }

    const onKey = (event: KeyboardEvent) => {
      if (blocked || isTypingTarget(event.target) || event.metaKey || event.ctrlKey) return
      switch (event.key) {
        case 'ArrowDown':
          walkBy(KEY_STEP)
          break
        case 'ArrowUp':
          walkBy(-KEY_STEP)
          break
        case 'PageDown':
        case ' ':
          walkBy(event.shiftKey ? -PAGE_STEP : PAGE_STEP)
          break
        case 'PageUp':
          walkBy(-PAGE_STEP)
          break
        default:
          return
      }
      event.preventDefault()
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKey)
    }
  }, [enabled, blocked])

  useEffect(() => {
    if (!enabled) return
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const distance = stepWalk(dt, prefersReducedMotion())
      const progress = distanceToProgress(distance)
      worldRefs.scroll = progress
      const station = nearestStation(progress)
      const lap = lapOf(distance)
      const prev = worldStore.getState()
      if (station !== prev.station || lap !== prev.lap || (!prev.introDone && progress > 0.03)) {
        setWorld({ station, lap, introDone: prev.introDone || progress > 0.03 })
      }
      if (lap !== 0 && !isUnlocked('looper')) unlock('looper')
      if (progress > 0.12 && !isUnlocked('wanderer')) unlock('wanderer')
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [enabled])
}
