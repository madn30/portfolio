import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useWorld } from '@/store/worldStore'
import { gsap } from '@/utils/gsap'

/**
 * A sheet of paper that sweeps across the screen while the camera walks through a door,
 * hiding the hand-off between the 3D scene and the DOM section panel.
 */
export function SceneTransition() {
  const tick = useWorld((s) => s.transitionTick)
  const reducedMotion = useReducedMotion()
  const sheet = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (tick === 0 || reducedMotion || !sheet.current) return
    const element = sheet.current
    const timeline = gsap
      .timeline()
      .set(element, { clipPath: 'inset(0 100% 0 0)', opacity: 1 })
      .to(element, {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.42,
        delay: 0.3,
        ease: 'power2.inOut',
      })
      .to(
        element,
        { clipPath: 'inset(0 0 0 100%)', duration: 0.55, ease: 'power2.inOut' },
        '+=0.12',
      )
      .set(element, { opacity: 0 })
    return () => {
      timeline.kill()
      gsap.set(element, { opacity: 0, clipPath: 'inset(0 100% 0 0)' })
    }
  }, [tick, reducedMotion])

  return (
    <div
      ref={sheet}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[25] bg-cream opacity-0"
      style={{ clipPath: 'inset(0 100% 0 0)' }}
    >
      <div className="hatch absolute inset-0 opacity-40" />
    </div>
  )
}
