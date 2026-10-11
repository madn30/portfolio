import { useEffect, useRef, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, DoorOpen, X } from 'lucide-react'
import { closeSection, openSection } from '@/app/navigation'
import { doors } from '@/data/siteConfig'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { DoorSectionId } from '@/types'
import { gsap } from '@/utils/gsap'

interface SectionPanelProps {
  id: DoorSectionId
  eyebrow?: string
  title: string
  intro?: string
  children: ReactNode
  /** Wider layout for galleries. */
  wide?: boolean
}

/**
 * The room behind a door: a paper panel over the scene with a heading, close controls,
 * focus management, Escape to close, and next/previous door links.
 */
export function SectionPanel({
  id,
  eyebrow,
  title,
  intro,
  children,
  wide = false,
}: SectionPanelProps) {
  const panel = useRef<HTMLDivElement>(null)
  const article = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const index = doors.findIndex((d) => d.id === id)
  const door = doors[index]
  const previous = doors[index - 1]
  const next = doors[index + 1]

  useFocusTrap(panel, true)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) closeSection()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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
      className="panel-scroll fixed inset-0 z-20 overflow-y-auto bg-paper/95 outline-none"
    >
      {/* Sits just below the global header so neither control covers the other. */}
      <button
        type="button"
        onClick={closeSection}
        className="sketch-border fixed right-4 top-[4.4rem] z-30 flex h-11 w-11 items-center justify-center bg-cream text-ink shadow-sketch transition-transform hover:rotate-6 sm:right-6 sm:top-[4.9rem]"
        aria-label="Close section and return to the corridor"
        data-autofocus
      >
        <X size={18} aria-hidden="true" />
      </button>

      <article
        ref={article}
        className={`mx-auto px-5 pb-20 pt-[4.6rem] sm:px-8 sm:pt-[5.4rem] ${wide ? 'max-w-6xl' : 'max-w-3xl'}`}
      >
        <button
          type="button"
          onClick={closeSection}
          className="group mb-8 inline-flex items-center gap-2 font-sans text-sm font-medium text-charcoal transition-colors hover:text-ink sm:mb-10"
        >
          <ArrowLeft
            size={15}
            aria-hidden="true"
            className="transition-transform group-hover:-translate-x-0.5"
          />
          <span>Back to the corridor</span>
        </button>

        <header className="mb-10 sm:mb-14">
          <p data-reveal className="flex items-center gap-2 font-hand text-2xl text-terracotta">
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
        </header>

        {children}

        <nav
          aria-label="Neighbouring doors"
          className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-ink/20 pt-8"
        >
          {previous ? (
            <button
              type="button"
              onClick={() => openSection(previous.id, { immediate: true })}
              className="group inline-flex items-center gap-2 font-sans text-sm text-charcoal hover:text-ink"
            >
              <ArrowLeft
                size={15}
                aria-hidden="true"
                className="transition-transform group-hover:-translate-x-0.5"
              />
              <span>
                <span className="font-hand text-base text-terracotta">{previous.number}</span>{' '}
                {previous.label}
              </span>
            </button>
          ) : (
            <span />
          )}
          {next ? (
            <button
              type="button"
              onClick={() => openSection(next.id, { immediate: true })}
              className="group inline-flex items-center gap-2 font-sans text-sm text-charcoal hover:text-ink"
            >
              <span>
                <span className="font-hand text-base text-terracotta">{next.number}</span>{' '}
                {next.label}
              </span>
              <ArrowRight
                size={15}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={closeSection}
              className="group inline-flex items-center gap-2 font-sans text-sm text-charcoal hover:text-ink"
            >
              <span>Back to the corridor</span>
              <ArrowRight
                size={15}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          )}
        </nav>
      </article>
    </div>
  )
}
