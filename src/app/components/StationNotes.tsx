import { useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { openSection } from '@/app/navigation'
import { doors } from '@/data/siteConfig'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { useWorld } from '@/shared/store/worldStore'
import { gsap } from '@/shared/utils/gsap'
import { useInspectHidden } from '@/shared/hooks/useInspectHidden'

interface StationNotesProps {
  visible: boolean
  touch: boolean
}

export function StationNotes({ visible, touch }: StationNotesProps) {
  const station = useWorld((s) => s.station)
  const hovered = useWorld((s) => s.hoveredDoor)
  const entering = useWorld((s) => s.enteringDoor)
  const reducedMotion = useReducedMotion()
  const inspectHidden = useInspectHidden()
  const note = useRef<HTMLDivElement>(null)

  const door = hovered
    ? doors.find((d) => d.id === hovered)
    : station >= 0
      ? doors[station]
      : undefined
  const show = visible && !inspectHidden && door !== undefined && entering === null

  useEffect(() => {
    const element = note.current
    if (!element) return
    if (reducedMotion) {
      gsap.set(element, { opacity: show ? 1 : 0, y: 0 })
      return
    }
    const tween = gsap.to(element, {
      opacity: show ? 1 : 0,
      y: show ? 0 : 12,
      duration: show ? 0.45 : 0.25,
      ease: show ? 'power3.out' : 'power2.in',
      overwrite: true,
    })
    return () => {
      tween.kill()
    }
  }, [show, door?.id, reducedMotion])

  return (
    <div
      ref={note}
      className={`fixed bottom-6 left-4 z-20 opacity-0 sm:left-6 sm:bottom-8 ${show ? '' : 'pointer-events-none'}`}
      aria-live="polite"
      aria-hidden={!show}
    >
      {door && (
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <p className="font-hand text-2xl leading-tight text-charcoal">
              Door {door.number} · <span className="text-ink">{door.label}</span>
            </p>
            <p className="font-hand text-lg leading-tight text-charcoal/90">— {door.note}</p>
          </div>
          <button
            type="button"
            onClick={() => openSection(door.id)}
            tabIndex={show ? 0 : -1}
            className="torn-wrap transition-transform hover:-translate-y-0.5"
          >
            <span
              className={`torn inline-flex items-center gap-2 font-sans text-sm font-medium text-ink ${
                touch ? 'px-6 py-4' : 'px-5 py-3'
              }`}
            >
              <span>
                Open <span className="sm:hidden">{door.label}</span>
              </span>
              <ArrowRight size={15} aria-hidden="true" />
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
