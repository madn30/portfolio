import { useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { openSection } from '@/app/navigation'
import { doors } from '@/data/siteConfig'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useWorld } from '@/store/worldStore'
import { gsap } from '@/utils/gsap'

interface StationNotesProps {
  visible: boolean
  touch: boolean
}

/**
 * Handwritten margin note that appears when the camera stands near a door (or a door is
 * hovered), with a real button so touch and keyboard users can enter without clicking the 3D door.
 */
export function StationNotes({ visible, touch }: StationNotesProps) {
  const station = useWorld((s) => s.station)
  const hovered = useWorld((s) => s.hoveredDoor)
  const entering = useWorld((s) => s.enteringDoor)
  const reducedMotion = useReducedMotion()
  const note = useRef<HTMLDivElement>(null)

  const door = hovered
    ? doors.find((d) => d.id === hovered)
    : station >= 0
      ? doors[station]
      : undefined
  const show = visible && door !== undefined && entering === null

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
            className={`sketch-border inline-flex items-center gap-2 bg-cream font-sans text-sm font-medium text-ink shadow-sketch transition-transform hover:-translate-y-0.5 ${
              touch ? 'px-5 py-3.5' : 'px-4 py-2.5'
            }`}
          >
            <span>
              Open <span className="sm:hidden">{door.label}</span>
            </span>
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
