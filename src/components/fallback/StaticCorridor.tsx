import { openSection } from '@/app/navigation'
import { routeToHash } from '@/app/router'
import { accentHex, doors } from '@/data/siteConfig'
import { setWorld, useWorld } from '@/store/worldStore'

interface StaticCorridorProps {
  /** Why the fallback is shown; used for a short explanatory line. */
  reason: 'unsupported' | 'failed'
}

/**
 * Illustrated 2D corridor for browsers without WebGL (or when the 3D scene crashes).
 * The doors are real links, so every section stays reachable.
 */
export function StaticCorridor({ reason }: StaticCorridorProps) {
  const hovered = useWorld((s) => s.hoveredDoor)

  // One-point perspective helpers: wall top/bottom edges converge on the vanishing point.
  const leftTop = (x: number) => 30 + (120 * (x - 40)) / 290
  const leftBottom = (x: number) => 440 - (130 * (x - 40)) / 290
  const rightTop = (x: number) => 150 - (120 * (x - 470)) / 290
  const rightBottom = (x: number) => 310 + (130 * (x - 470)) / 290
  const DOOR_RATIO = 0.6

  type Quad = { path: string; labelX: number; labelY: number; knobX: number; knobY: number }
  const wallDoor = (
    x1: number,
    x2: number,
    top: (x: number) => number,
    bottom: (x: number) => number,
    knobOnRight: boolean,
  ): Quad => {
    const b1 = bottom(x1)
    const b2 = bottom(x2)
    const t1 = b1 - DOOR_RATIO * (b1 - top(x1))
    const t2 = b2 - DOOR_RATIO * (b2 - top(x2))
    const knobX = knobOnRight ? x2 - (x2 - x1) * 0.18 : x1 + (x2 - x1) * 0.18
    const kb = bottom(knobX)
    return {
      path: `M${x1} ${b1} L${x1} ${t1} L${x2} ${t2} L${x2} ${b2} Z`,
      labelX: (x1 + x2) / 2,
      labelY: Math.max(b1, b2) + 22,
      knobX,
      knobY: kb - 0.45 * DOOR_RATIO * (kb - top(knobX)),
    }
  }
  const placements: Record<string, Quad> = {
    about: wallDoor(96, 152, leftTop, leftBottom, true),
    skills: wallDoor(214, 248, leftTop, leftBottom, true),
    projects: wallDoor(648, 704, rightTop, rightBottom, false),
    experience: wallDoor(552, 586, rightTop, rightBottom, false),
    contact: {
      path: 'M378 310 L378 214 L422 214 L422 310 Z',
      labelX: 400,
      labelY: 332,
      knobX: 414,
      knobY: 266,
    },
  }

  return (
    <div className="relative mx-auto max-w-5xl px-5 pb-16 sm:px-10">
      <p className="mb-4 font-hand text-xl text-charcoal">
        {reason === 'unsupported'
          ? 'Your browser cannot draw the 3D corridor, so here is the sketch instead.'
          : 'The 3D corridor could not start, so here is the sketch instead.'}
      </p>
      <svg
        viewBox="0 0 800 460"
        className="w-full"
        role="group"
        aria-label="Illustrated corridor with five doors. Each door is a link to a section."
      >
        <rect width="800" height="460" fill="#f4efe4" />
        <g
          fill="none"
          stroke="#2f2a26"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M40 440 L330 310 L470 310 L760 440" />
          <path d="M40 30 L330 150 L470 150 L760 30" />
          <path d="M40 30 L40 440 M760 30 L760 440 M330 150 L330 310 M470 150 L470 310" />
          <path d="M40 348 L330 282 M760 348 L470 282" strokeWidth="1.2" opacity=".5" />
          <path
            d="M120 440 L350 310 M680 440 L450 310 M240 440 L390 310 M560 440 L410 310"
            strokeWidth="1"
            opacity=".3"
          />
          <path d="M330 150 L470 150 M330 160 L470 160" strokeWidth="1.2" opacity=".5" />
        </g>
        {doors.map((door) => {
          const p = placements[door.id]
          const accent = accentHex[door.accent]
          const isHovered = hovered === door.id
          return (
            <a
              key={door.id}
              href={routeToHash({ section: door.id })}
              onClick={(event) => {
                event.preventDefault()
                openSection(door.id, { immediate: true })
              }}
              onMouseEnter={() => setWorld({ hoveredDoor: door.id })}
              onMouseLeave={() => setWorld({ hoveredDoor: null })}
              onFocus={() => setWorld({ hoveredDoor: door.id })}
              onBlur={() => setWorld({ hoveredDoor: null })}
              aria-label={`Door ${door.number}: ${door.label}`}
              className="cursor-pointer outline-none"
            >
              <path
                d={p.path}
                fill={isHovered ? `${accent}33` : '#f7f2e8'}
                stroke="#2f2a26"
                strokeWidth={isHovered ? 3 : 2.2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <circle cx={p.knobX} cy={p.knobY} r="3" fill={accent} />
              <text
                x={p.labelX}
                y={p.labelY}
                textAnchor="middle"
                fontFamily="Caveat, cursive"
                fontSize="20"
                fill={isHovered ? accent : '#2f2a26'}
              >
                {door.number} {door.label}
              </text>
            </a>
          )
        })}
      </svg>

      <nav aria-label="Sections (list)" className="mt-10">
        <h2 className="font-hand text-2xl text-terracotta">Or pick a door from the list</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {doors.map((door) => (
            <li key={door.id}>
              <a
                href={routeToHash({ section: door.id })}
                onClick={(event) => {
                  event.preventDefault()
                  openSection(door.id, { immediate: true })
                }}
                className="sketch-border flex items-center gap-3 bg-cream px-4 py-3 text-ink shadow-sketch transition-transform hover:-translate-y-0.5"
              >
                <span className="font-hand text-xl text-terracotta">{door.number}</span>
                <span className="font-display text-lg">{door.label}</span>
                <span className="ml-auto font-hand text-base text-charcoal">{door.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
