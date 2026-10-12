import { closeSection, openSection } from '@/app/navigation'
import type { Route } from '@/app/router'
import { doors, sectionDescriptions } from '@/data/siteConfig'
import { useWorld } from '@/shared/store/worldStore'
import { getDoor } from '@/shared/corridor/corridor'

export function ScreenReaderNav({ route }: { route: Route }) {
  const entered = useWorld((s) => s.entered)
  const station = useWorld((s) => s.station)
  const current = route.section === 'home' ? null : getDoor(route.section)
  const nearest = station >= 0 ? doors[station] : null

  const whereabouts = !entered
    ? 'You are on the street outside. Open the front door to enter the corridor.'
    : current
      ? `You are in the ${current.label} room.`
      : nearest
        ? `You are in the corridor beside door ${nearest.number}, ${nearest.label}.`
        : 'You are in the corridor, at the entrance.'

  const announcement = current
    ? `Entered the ${current.label} room.`
    : entered
      ? 'In the corridor. Five doors line the walls.'
      : ''

  return (
    <>
      <nav aria-label="Rooms of the portfolio" className="sr-only">
        <h2>Rooms</h2>
        <p>{whereabouts}</p>
        {current && (
          <>
            <p>{sectionDescriptions[current.id]}</p>
            <button type="button" onClick={closeSection}>
              Back to the corridor
            </button>
            <h3>Other doors</h3>
          </>
        )}
        <ul>
          {doors
            .filter((door) => door.id !== route.section)
            .map((door) => (
              <li key={door.id}>
                <button type="button" onClick={() => openSection(door.id, { immediate: true })}>
                  {door.number} {door.label}: {door.note}
                </button>
              </li>
            ))}
        </ul>
      </nav>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </>
  )
}
