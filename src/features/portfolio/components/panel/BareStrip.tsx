import type { ReactNode } from 'react'
import { ArrowLeft, MousePointerClick } from 'lucide-react'
import { closeSection } from '@/app/navigation'
import type { DoorSectionId } from '@/shared/types'

interface BareStripProps {
  id: DoorSectionId
  title: string
  hint?: string
  children: ReactNode
}

export function BareStrip({ id, title, hint, children }: BareStripProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex flex-wrap items-end justify-between gap-3 px-4 pb-4 sm:px-6 sm:pb-6">
      <button
        type="button"
        onClick={closeSection}
        className="torn-wrap pointer-events-auto group inline-flex items-center"
        data-autofocus
      >
        <span className="torn flex items-center gap-2 px-3.5 py-1.5 font-sans text-sm font-medium text-charcoal transition-colors group-hover:text-ink">
          <ArrowLeft
            size={15}
            aria-hidden="true"
            className="transition-transform group-hover:-translate-x-0.5"
          />
          Back to the corridor
        </span>
      </button>
      <h2 id={`section-${id}-title`} className="sr-only">
        {title}
      </h2>
      <div className="sr-only">{children}</div>
      {hint && (
        <p className="torn-wrap pointer-events-auto max-w-xl">
          <span className="torn inline-flex items-start gap-2 px-3.5 py-1.5 font-hand text-lg leading-snug text-charcoal">
            <MousePointerClick size={17} aria-hidden="true" className="mt-1 shrink-0" />
            <span>{hint}</span>
          </span>
        </p>
      )}
    </div>
  )
}
