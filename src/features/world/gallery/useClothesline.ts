import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { projects } from '@/data/projects'
import { gsap } from '@/shared/utils/gsap'
import { displayX, GAP, LINE_TOTAL, SLOTS } from './galleryLayout'

export interface ClotheslineState {
  scroll: number
  target: number
}

interface ClotheslineControls {
  line: MutableRefObject<ClotheslineState>
  advance: (dt: number) => void
  scrollToSlot: (slot: number, instant: boolean) => Promise<void>
  nearestSlot: (projectId: string) => number | null
}

const WHEEL_RATE = 0.004
const TOUCH_RATE = 0.008

export function useClothesline(enabled: boolean): ClotheslineControls {
  const gl = useThree((state) => state.gl)
  const line = useRef<ClotheslineState>({ scroll: 0, target: 0 })

  useEffect(() => {
    if (!enabled) return
    const canvas = gl.domElement
    const state = line.current
    let touchX: number | null = null
    const onWheel = (event: WheelEvent) => {
      state.target += (event.deltaY + event.deltaX) * WHEEL_RATE
    }
    const onTouchStart = (event: TouchEvent) => {
      touchX = event.touches[0]?.clientX ?? null
    }
    const onTouchMove = (event: TouchEvent) => {
      const x = event.touches[0]?.clientX
      if (touchX === null || x === undefined) return
      state.target += (touchX - x) * TOUCH_RATE
      touchX = x
      event.preventDefault()
    }
    const onTouchEnd = () => {
      touchX = null
    }
    canvas.addEventListener('wheel', onWheel, { passive: true })
    canvas.addEventListener('touchstart', onTouchStart, { passive: true })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)
    canvas.addEventListener('touchcancel', onTouchEnd)
    return () => {
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
      canvas.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [enabled, gl])

  useEffect(() => () => gsap.killTweensOf(line.current), [])

  return useMemo<ClotheslineControls>(
    () => ({
      line,
      advance: (dt) => {
        const state = line.current
        state.scroll = THREE.MathUtils.lerp(state.scroll, state.target, Math.min(1, dt * 5))
      },
      scrollToSlot: (slot, instant) =>
        new Promise((resolve) => {
          const state = line.current
          let diff = slot * GAP - state.scroll
          const half = LINE_TOTAL / 2
          while (diff > half) diff -= LINE_TOTAL
          while (diff < -half) diff += LINE_TOTAL
          const final = state.scroll + diff
          gsap.killTweensOf(state)
          if (instant) {
            state.scroll = final
            state.target = final
            resolve()
            return
          }
          gsap.to(state, {
            scroll: final,
            target: final,
            duration: 0.5,
            ease: 'power2.inOut',
            onComplete: resolve,
          })
        }),
      nearestSlot: (projectId) => {
        const index = projects.findIndex((p) => p.id === projectId)
        if (index === -1) return null
        let best: number | null = null
        let bestDistance = Infinity
        for (let slot = index; slot < SLOTS; slot += projects.length) {
          const distance = Math.abs(displayX(slot, line.current.scroll))
          if (distance < bestDistance) {
            bestDistance = distance
            best = slot
          }
        }
        return best
      },
    }),
    [],
  )
}
