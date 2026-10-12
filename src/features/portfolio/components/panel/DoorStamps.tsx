import { openSection } from '@/app/navigation'
import { accentHex, doors } from '@/data/siteConfig'
import type { DoorSectionId } from '@/shared/types'

export function DoorStamps({ id }: { id: DoorSectionId }) {
  return (
    <nav aria-label="Doors" className="flex items-center gap-1.5">
      {doors.map((d) => {
        const current = d.id === id
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => !current && openSection(d.id, { immediate: true })}
            aria-current={current ? 'page' : undefined}
            aria-label={`Door ${d.number}: ${d.label}`}
            title={d.label}
            className="group/stamp flex h-7 w-7 items-center justify-center"
          >
            <span
              className={`block h-3.5 w-3.5 rotate-3 border border-ink transition-transform group-hover/stamp:-translate-y-0.5 ${
                current ? '' : 'bg-cream'
              }`}
              style={current ? { backgroundColor: accentHex[d.accent] } : undefined}
            />
          </button>
        )
      })}
    </nav>
  )
}
