import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { gsap } from '@/utils/gsap'

interface ModalProps {
  open: boolean
  onClose: () => void
  labelledBy: string
  children: ReactNode
  /** Rendered in the top-right corner next to the close button. */
  actions?: ReactNode
}

/**
 * Accessible dialog: focus trap, Escape to close, backdrop click, body scroll lock,
 * and a restrained paper reveal.
 */
export function Modal({ open, onClose, labelledBy, children, actions }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null)
  const backdrop = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useFocusTrap(panel, open)
  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return
    // Capture phase so the nested dialog wins over the section panel's Escape handler.
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault()
        event.stopImmediatePropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, onClose])

  useEffect(() => {
    if (!open || reducedMotion || !panel.current || !backdrop.current) return
    const ctx = gsap.context(() => {
      gsap.from(backdrop.current, { opacity: 0, duration: 0.3 })
      gsap.from(panel.current, { y: 28, opacity: 0, duration: 0.5, ease: 'power3.out' })
    })
    return () => ctx.revert()
  }, [open, reducedMotion])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        ref={backdrop}
        className="absolute inset-0 bg-ink/35"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className="panel-scroll relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-cream shadow-[0_-8px_40px_rgba(47,42,38,0.18)] outline-none sm:rounded-2xl sm:shadow-[8px_12px_0_0_rgba(47,42,38,0.12)] sm:border sm:border-ink/40"
      >
        <div className="sticky top-0 z-10 flex items-center justify-end gap-2 bg-cream/95 px-4 pt-3 pb-1">
          {actions}
          <button
            type="button"
            onClick={onClose}
            className="sketch-border flex h-10 w-10 items-center justify-center bg-cream text-ink transition-transform hover:rotate-6"
            aria-label="Close dialog"
            data-autofocus
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="px-5 pb-8 pt-1 sm:px-10 sm:pb-10">{children}</div>
      </div>
    </div>
  )
}
