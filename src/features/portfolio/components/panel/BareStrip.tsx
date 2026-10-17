import type { ReactNode } from 'react'
import { ArrowLeft, MousePointerClick, Pointer } from 'lucide-react'
import { closeSection } from '@/app/navigation'
import { useDeviceProfile } from '@/shared/hooks/useDeviceProfile'
import type { DoorSectionId } from '@/shared/types'

interface BareStripProps {
  id: DoorSectionId
  title: string
  hint?: string
  children: ReactNode
}

export function BareStrip({ id, title, hint, children }: BareStripProps) {
  const { touch } = useDeviceProfile()
  const HintIcon = touch ? Pointer : MousePointerClick
  return (
    <div className="pointer-events-none fixed bottom-[env(safe-area-inset-bottom)] left-[env(safe-area-inset-left)] right-[env(safe-area-inset-right)] z-30 flex flex-wrap items-end justify-between gap-3 px-4 pb-4 sm:px-6 sm:pb-6">
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
            <HintIcon size={17} aria-hidden="true" className="mt-1 shrink-0" />
            <span>{hint}</span>
          </span>
        </p>
      )}
    </div>
  )
}
