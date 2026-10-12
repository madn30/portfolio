import type { ReactNode } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { closeSection, openSection } from '@/app/navigation'
import { accentHex, type DoorDefinition } from '@/data/siteConfig'

interface NeighbourLinkProps {
  direction: 'back' | 'forward'
  onClick: () => void
  children: ReactNode
}

function NeighbourLink({ direction, onClick, children }: NeighbourLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2 font-sans text-sm text-charcoal hover:text-ink"
    >
      {direction === 'back' && (
        <ArrowLeft
          size={15}
          aria-hidden="true"
          className="transition-transform group-hover:-translate-x-0.5"
        />
      )}
      {children}
      {direction === 'forward' && (
        <ArrowRight
          size={15}
          aria-hidden="true"
          className="transition-transform group-hover:translate-x-0.5"
        />
      )}
    </button>
  )
}

function DoorName({ door }: { door: DoorDefinition }) {
  return (
    <span>
      <span className="font-hand text-base" style={{ color: accentHex[door.accent] }}>
        {door.number}
      </span>{' '}
      {door.label}
    </span>
  )
}

interface NeighbourDoorsProps {
  previous: DoorDefinition | undefined
  next: DoorDefinition | undefined
}

export function NeighbourDoors({ previous, next }: NeighbourDoorsProps) {
  return (
    <nav
      aria-label="Neighbouring doors"
      className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-ink/20 pt-8"
    >
      {previous ? (
        <NeighbourLink
          direction="back"
          onClick={() => openSection(previous.id, { immediate: true })}
        >
          <DoorName door={previous} />
        </NeighbourLink>
      ) : (
        <span />
      )}
      {next ? (
        <NeighbourLink
          direction="forward"
          onClick={() => openSection(next.id, { immediate: true })}
        >
          <DoorName door={next} />
        </NeighbourLink>
      ) : (
        <NeighbourLink direction="forward" onClick={closeSection}>
          <span>Back to the corridor</span>
        </NeighbourLink>
      )}
    </nav>
  )
}
