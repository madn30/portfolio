import { useEffect, useRef, type ReactNode } from 'react'
import { ArrowLeft, DoorOpen, MousePointerClick } from 'lucide-react'
import { closeSection, openSection } from '@/app/navigation'
import { accentHex, doors } from '@/data/siteConfig'
import { useFocusTrap } from '@/shared/hooks/useFocusTrap'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { useHasRoom } from '@/shared/store/worldStore'
import type { DoorSectionId } from '@/shared/types'
import { getDoor } from '@/shared/corridor/corridor'
import { gsap } from '@/shared/utils/gsap'
import { isTypingTarget } from '@/shared/utils/keys'
import { BareStrip } from './panel/BareStrip'
import { DoorStamps } from './panel/DoorStamps'
import { NeighbourDoors } from './panel/NeighbourDoors'

interface SectionPanelProps {
  id: DoorSectionId
  eyebrow?: string
  title: string
  intro?: string
  hint?: string
  onEscape?: () => void
  children: ReactNode
  wide?: boolean
  bare?: boolean
}

export function SectionPanel({
  id,
  eyebrow,
  title,
  intro,
  hint,
  onEscape,
  children,
  wide = false,
  bare = false,
}: SectionPanelProps) {
  const panel = useRef<HTMLDivElement>(null)
  const article = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const hasRoom = useHasRoom()
  const index = doors.findIndex((d) => d.id === id)
  const door = getDoor(id)
  const previous = doors[index - 1]
  const next = doors[index + 1]
  const accent = accentHex[door.accent]

  useFocusTrap(panel, true)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === 'Escape') {
        if (onEscape) onEscape()
        else closeSection()
        return
      }
      if (isTypingTarget(event.target)) return
      if (event.key === 'ArrowLeft' && previous) {
        event.preventDefault()
        openSection(previous.id, { immediate: true })
      } else if (event.key === 'ArrowRight' && next) {
        event.preventDefault()
        openSection(next.id, { immediate: true })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onEscape, previous, next])

  useEffect(() => {
    if (reducedMotion || !article.current) return
    const ctx = gsap.context(() => {
      gsap.from('[data-reveal]', {
        y: 22,
        opacity: 0,
        duration: 0.6,
        stagger: 0.07,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      })
    }, article)
    return () => ctx.revert()
  }, [id, reducedMotion])

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`section-${id}-title`}
      tabIndex={-1}
      className="panel-scroll pointer-events-none fixed inset-0 z-20 overflow-y-auto outline-none"
    >
      {bare ? (
        <BareStrip id={id} title={title} hint={hasRoom ? hint : undefined}>
          {children}
        </BareStrip>
      ) : (
        <div className="min-h-full lg:flex lg:justify-end">
          <article
            ref={article}
            className={`pointer-events-auto mt-[44vh] min-h-[56vh] border-t border-ink/15 bg-paper/95 px-5 pb-20 pt-8 shadow-[0_-12px_30px_rgba(60,45,30,0.08)] sm:px-8 lg:mt-0 lg:min-h-full lg:border-l lg:border-t-0 lg:pt-[5.4rem] lg:shadow-none ${
              wide ? 'lg:w-[54%] lg:max-w-4xl' : 'lg:w-[46%] lg:max-w-3xl'
            }`}
          >
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 sm:mb-10 lg:pr-16">
              <button
                type="button"
                onClick={closeSection}
                className="group inline-flex items-center gap-2 font-sans text-sm font-medium text-charcoal transition-colors hover:text-ink"
              >
                <ArrowLeft
                  size={15}
                  aria-hidden="true"
                  className="transition-transform group-hover:-translate-x-0.5"
                />
                <span>Back to the corridor</span>
              </button>

              <DoorStamps id={id} />
            </div>

            <header className="mb-10 sm:mb-14">
              <p
                data-reveal
                className="flex items-center gap-2 font-hand text-2xl"
                style={{ color: accent }}
              >
                <DoorOpen size={18} aria-hidden="true" />
                Door {door.number}
                {eyebrow && <span className="text-charcoal">· {eyebrow}</span>}
              </p>
              <h2
                id={`section-${id}-title`}
                data-reveal
                className="mt-2 text-4xl leading-[1.05] text-ink sm:text-5xl lg:text-6xl"
              >
                {title}
              </h2>
              {intro && (
                <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-graphite">
                  {intro}
                </p>
              )}
              {hint && hasRoom && (
                <p
                  data-reveal
                  className="mt-5 inline-flex max-w-xl items-start gap-2 font-hand text-lg leading-snug text-charcoal"
                >
                  <MousePointerClick size={17} aria-hidden="true" className="mt-1 shrink-0" />
                  <span>{hint}</span>
                </p>
              )}
            </header>

            {children}

            <NeighbourDoors previous={previous} next={next} />
            <p className="mt-4 hidden font-hand text-base text-pencil sm:block" aria-hidden="true">
              ← → walk to the next door · Esc back to the corridor
            </p>
          </article>
        </div>
      )}
    </div>
  )
}
