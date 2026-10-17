import { useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { useFocusTrap } from '@/shared/hooks/useFocusTrap'
import { TornSheet } from './TornSheet'

interface DropPanelProps {
  id: string
  open: boolean
  title: string
  label: string
  align: 'centre' | 'end'
  className?: string
  onClose: () => void
  children: ReactNode
}

export function DropPanel({
  id,
  open,
  title,
  label,
  align,
  className = '',
  onClose,
  children,
}: DropPanelProps) {
  const panel = useRef<HTMLDivElement>(null)
  useFocusTrap(panel, open)

  const place =
    align === 'centre' ? 'inset-x-4 flex justify-center sm:inset-x-6' : 'right-4 sm:right-6'

  return (
    <div className={`pointer-events-none fixed top-[env(safe-area-inset-top)] z-40 ${place}`}>
      <div
        id={id}
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        inert={!open}
        className={`drop-panel w-full ${className} ${open ? 'open' : ''}`}
      >
        <TornSheet className="px-5 pb-5 pt-4">
          <div className="flex items-center justify-between border-b-2 border-dashed border-ink/25 pb-2">
            <p className="caption text-charcoal">{title}</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-charcoal transition-transform hover:scale-110 hover:text-ink"
              aria-label={`Close ${title.toLowerCase()}`}
              data-autofocus
            >
              <X size={18} strokeWidth={2.2} aria-hidden="true" />
            </button>
          </div>
          {children}
        </TornSheet>
      </div>
    </div>
  )
}
