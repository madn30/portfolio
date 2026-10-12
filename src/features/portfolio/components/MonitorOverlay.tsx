import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, X } from 'lucide-react'
import type { StudioItem } from '@/features/world/studio/content'
import { studioRefs } from '@/features/world/studio/store'
import { accentHex } from '@/data/siteConfig'
import { skillCategories } from '@/data/skills'
import { useFocusTrap } from '@/shared/hooks/useFocusTrap'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { useTypewriter } from './useTypewriter'

const WIDE = '(min-width: 1024px)'
const SPRING = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease'
const SETTLE =
  'opacity 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)'
const CLOSE_MS = 600

function subscribeWide(callback: () => void): () => void {
  const media = window.matchMedia(WIDE)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

function useWide(): boolean {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE).matches,
    () => true,
  )
}

interface CardProps {
  item: StudioItem
  open: boolean
  onClose: () => void
}

function Card({ item, open, onClose }: CardProps) {
  const wide = useWide()
  const reducedMotion = useReducedMotion()
  const dialog = useRef<HTMLDivElement>(null)
  const backdrop = useRef<HTMLDivElement>(null)
  const { category } = item
  const accent = accentHex[category.accent]
  const title = item.skill ?? category.title
  const description = useTypewriter(category.blurb, open, reducedMotion)

  useFocusTrap(dialog, open)

  useEffect(() => {
    let frame = 0
    const tick = () => {
      const el = backdrop.current
      if (el) {
        const { x, y } = studioRefs.hole
        const mask = `radial-gradient(circle at ${x.toFixed(1)}% ${y.toFixed(1)}%, transparent 0 13%, black 34%)`
        el.style.maskImage = mask
        el.style.webkitMaskImage = mask
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  const reveal = (delay: number): CSSProperties => ({
    opacity: open ? 1 : 0,
    transform: open ? 'translateY(0)' : 'translateY(20px)',
    transition: reducedMotion ? 'none' : SETTLE,
    transitionDelay: open ? `${delay}ms` : '0ms',
  })

  const card: CSSProperties = wide
    ? {
        width: 'clamp(280px, 30vw, 440px)',
        right: 'clamp(2rem, 10vw, 16rem)',
        top: '50%',
        transform: open ? 'translateY(-50%) rotate(1deg)' : 'translate(150%, -50%) rotate(15deg)',
      }
    : {
        width: '90%',
        maxHeight: '58vh',
        bottom: '5.5rem',
        left: '50%',
        transform: open
          ? 'translate(-50%, 0) rotate(-1deg)'
          : 'translate(-50%, 120%) rotate(10deg)',
      }

  return (
    <div className="fixed inset-0 z-[45]" style={{ pointerEvents: open ? 'auto' : 'none' }}>
      <div
        ref={backdrop}
        aria-hidden="true"
        className="absolute inset-0 bg-ink/55 backdrop-blur-[6px]"
        style={{ opacity: open ? 1 : 0, transition: reducedMotion ? 'none' : 'opacity 0.8s ease' }}
        onClick={onClose}
      />
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="studio-screen-title"
        tabIndex={-1}
        className="sketch-border absolute flex flex-col gap-4 overflow-y-auto bg-cream p-6 text-ink shadow-sketch outline-none sm:p-8"
        style={{ ...card, opacity: open ? 1 : 0, transition: reducedMotion ? 'none' : SPRING }}
      >
        <div className="flex items-start justify-between gap-4" style={reveal(100)}>
          <div>
            <p className="torn-wrap inline-block">
              <span
                className="torn block px-2.5 py-0.5 font-hand text-lg leading-tight"
                style={{ color: accent }}
              >
                {item.skill
                  ? `${category.title} · one tool`
                  : `category 0${item.categoryIndex + 1}`}
              </span>
            </p>
            <h2 id="studio-screen-title" className="mt-2 text-3xl leading-[1.05] sm:text-4xl">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close the screen"
            data-autofocus
            className="sketch-border flex h-10 w-10 shrink-0 items-center justify-center bg-cream text-ink transition-transform hover:rotate-6"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-dashed border-ink/30 pb-3 font-sans text-sm text-charcoal"
          style={reveal(200)}
        >
          <strong className="text-ink">
            0{item.categoryIndex + 1} / 0{skillCategories.length}
          </strong>
          <span>{category.skills.length} tools</span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rotate-3 border border-ink"
              style={{ backgroundColor: accent }}
            />
            {category.title}
          </span>
        </div>

        <p className="min-h-[4.5rem] text-[15px] leading-relaxed text-graphite" style={reveal(300)}>
          <span aria-hidden="true">{description}</span>
          <span className="sr-only">{category.blurb}</span>
        </p>

        <ul
          className="flex flex-wrap gap-2"
          aria-label="Tools in this category"
          style={reveal(350)}
        >
          {category.skills.map((skill) => {
            const current = skill === item.skill
            return (
              <li
                key={skill}
                className="rounded-full border px-3 py-1 font-sans text-sm"
                style={{
                  borderColor: accent,
                  backgroundColor: current ? accent : `${accent}1a`,
                  color: current ? '#fbfaf7' : '#262421',
                }}
              >
                {skill}
              </li>
            )
          })}
        </ul>

        <div className="mt-auto pt-2" style={reveal(400)}>
          <button
            type="button"
            onClick={onClose}
            className="group flex w-full items-center justify-center gap-2 border-2 border-ink px-4 py-2.5 font-sans text-sm font-semibold uppercase tracking-[0.15em] text-ink transition-colors hover:bg-ink hover:text-cream"
            style={{ borderRadius: '2px 255px 3px 255px / 255px 5px 225px 3px' }}
          >
            Back to the tower
            <ArrowRight
              size={15}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
        </div>
      </div>
    </div>
  )
}

interface MonitorOverlayProps {
  item: StudioItem | null
  onClose: () => void
}

export function MonitorOverlay({ item, onClose }: MonitorOverlayProps) {
  const [shown, setShown] = useState<StudioItem | null>(item)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (item) {
      setShown(item)
      const timer = window.setTimeout(() => setOpen(true), 30)
      return () => window.clearTimeout(timer)
    }
    setOpen(false)
    const timer = window.setTimeout(() => setShown(null), CLOSE_MS)
    return () => window.clearTimeout(timer)
  }, [item])

  if (!shown) return null
  return createPortal(<Card item={shown} open={open} onClose={onClose} />, document.body)
}
