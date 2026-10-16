import { useEffect, useRef } from 'react'
import { ChevronsUp } from 'lucide-react'
import { useInspectHidden } from '@/shared/hooks/useInspectHidden'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { useWorld } from '@/shared/store/worldStore'
import { gsap } from '@/shared/utils/gsap'

interface WalkHintProps {
  visible: boolean
  touch: boolean
}

const SHOW_DELAY = 1.1

export function WalkHint({ visible, touch }: WalkHintProps) {
  const introDone = useWorld((s) => s.introDone)
  const entering = useWorld((s) => s.enteringDoor)
  const inspectHidden = useInspectHidden()
  const reducedMotion = useReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const show = visible && !introDone && !inspectHidden && entering === null

  useEffect(() => {
    const element = root.current
    if (!element) return
    if (reducedMotion) {
      gsap.set(element, { opacity: show ? 1 : 0, y: 0 })
      return
    }
    const tween = gsap.to(element, {
      opacity: show ? 1 : 0,
      y: show ? 0 : 10,
      duration: show ? 0.6 : 0.3,
      delay: show ? SHOW_DELAY : 0,
      ease: show ? 'power3.out' : 'power2.in',
      overwrite: true,
    })
    return () => {
      tween.kill()
    }
  }, [show, reducedMotion])

  useEffect(() => {
    if (reducedMotion || !root.current) return
    const ctx = gsap.context(() => {
      gsap.to('[data-walk-bob]', {
        y: touch ? -5 : 3,
        duration: 0.7,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
    }, root)
    return () => ctx.revert()
  }, [reducedMotion, touch])

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-28 z-10 flex justify-center opacity-0 lg:bottom-9"
    >
      <div className="flex items-center gap-3 text-ink">
        {touch ? (
          <ChevronsUp data-walk-bob size={26} strokeWidth={1.8} />
        ) : (
          <svg width="22" height="34" viewBox="0 0 22 34" fill="none" stroke="currentColor">
            <path
              d="M3.2 10.6 C3 5.4 6.4 2.2 11 2.1 C15.6 2 19.2 5.3 19 10.4 L18.7 23.4 C18.6 28.4 15.4 31.9 11 32 C6.6 32.1 3.4 28.6 3.3 23.6 Z"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path d="M11 2.3 L11 11.8" strokeWidth="0.9" opacity="0.45" />
            <rect
              data-walk-bob
              x="9.4"
              y="5.5"
              width="3.2"
              height="5"
              rx="1.6"
              fill="currentColor"
            />
          </svg>
        )}
        <span className="font-hand text-2xl leading-none">
          {touch ? 'Swipe up to walk' : 'Scroll to walk'}
        </span>
      </div>
    </div>
  )
}
