import type { MouseEvent } from 'react'
import { openSection } from '@/app/navigation'
import { routeToHash } from '@/app/router'
import { accentHex, doors } from '@/data/siteConfig'
import { setWorld, useWorld } from '@/shared/store/worldStore'
import type { DoorSectionId } from '@/shared/types'

interface StaticCorridorProps {
  reason: 'unsupported' | 'software' | 'failed'
}

type Quad = { path: string; labelX: number; labelY: number; knobX: number; knobY: number }

const DOOR_RATIO = 0.6

const leftTop = (x: number) => 30 + (120 * (x - 40)) / 290
const leftBottom = (x: number) => 440 - (130 * (x - 40)) / 290
const rightTop = (x: number) => 150 - (120 * (x - 470)) / 290
const rightBottom = (x: number) => 310 + (130 * (x - 470)) / 290

function wallDoor(
  x1: number,
  x2: number,
  top: (x: number) => number,
  bottom: (x: number) => number,
  knobOnRight: boolean,
): Quad {
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

const placements: Record<DoorSectionId, Quad> = {
  about: wallDoor(96, 152, leftTop, leftBottom, true),
  skills: wallDoor(196, 236, leftTop, leftBottom, true),
  contact: wallDoor(262, 290, leftTop, leftBottom, true),
  projects: wallDoor(648, 704, rightTop, rightBottom, false),
  experience: wallDoor(564, 604, rightTop, rightBottom, false),
}

function openDoor(id: DoorSectionId) {
  return (event: MouseEvent) => {
    event.preventDefault()
    openSection(id, { immediate: true })
  }
}

export function StaticCorridor({ reason }: StaticCorridorProps) {
  const hovered = useWorld((s) => s.hoveredDoor)

  return (
    <div className="relative mx-auto max-w-5xl px-5 pb-16 pt-24 sm:px-10">
      <p className="mb-4 font-hand text-xl text-charcoal">
        {reason === 'unsupported'
          ? 'Your browser cannot draw the 3D corridor, so here is the sketch instead.'
          : reason === 'software'
            ? 'This device has no graphics acceleration and would crawl through the 3D corridor, so here is the sketch instead.'
            : 'The 3D corridor could not start, so here is the sketch instead.'}
      </p>
      <svg
        viewBox="0 0 800 460"
        className="w-full"
        role="group"
        aria-label="Illustrated corridor with five doors. Each door is a link to a section. The double door at the far end leads back to the entrance."
      >
        <rect width="800" height="460" fill="#f4efe4" />
        <path d="M40 30 L330 150 L470 150 L760 30 Z" fill="#f6ecd6" />
        <path d="M40 30 L330 150 L330 310 L40 440 Z" fill="#efd49a" />
        <path d="M760 30 L470 150 L470 310 L760 440 Z" fill="#efd49a" />
        <path d="M40 348 L330 282 L330 310 L40 440 Z" fill="#8fb7a6" />
        <path d="M760 348 L470 282 L470 310 L760 440 Z" fill="#8fb7a6" />
        <path d="M330 150 H470 V310 H330 Z" fill="#e3c285" />
        <path d="M40 440 L330 310 L470 310 L760 440 Z" fill="#c8955c" />
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
        <g role="img" aria-label="Double door marked with an infinity sign">
          <path d="M374 310 V212 H426 V310 Z" fill="#a9713f" stroke="#2f2a26" strokeWidth="2.2" />
          <path d="M400 212 V310" stroke="#2f2a26" strokeWidth="1.4" />
          <text
            x="400"
            y="262"
            textAnchor="middle"
            fontFamily="Fraunces, serif"
            fontSize="26"
            fill="#ffd34d"
          >
            ∞
          </text>
          <text
            x="400"
            y="200"
            textAnchor="middle"
            fontFamily="Caveat, cursive"
            fontSize="15"
            fill="#6b625a"
          >
            while (true) explore()
          </text>
        </g>
        {doors.map((door) => {
          const p = placements[door.id]
          const accent = accentHex[door.accent]
          const isHovered = hovered === door.id
          return (
            <a
              key={door.id}
              href={routeToHash({ section: door.id })}
              onClick={openDoor(door.id)}
              onMouseEnter={() => setWorld({ hoveredDoor: door.id })}
              onMouseLeave={() => setWorld({ hoveredDoor: null })}
              onFocus={() => setWorld({ hoveredDoor: door.id })}
              onBlur={() => setWorld({ hoveredDoor: null })}
              aria-label={`Door ${door.number}: ${door.label}`}
              className="cursor-pointer outline-none"
            >
              <path
                d={p.path}
                fill={accent}
                stroke="#2f2a26"
                strokeWidth={isHovered ? 3 : 2.2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <circle
                cx={p.knobX}
                cy={p.knobY}
                r="3"
                fill="#ffd34d"
                stroke="#2f2a26"
                strokeWidth="1"
              />
              <text
                x={p.labelX}
                y={p.labelY}
                textAnchor="middle"
                fontFamily="Caveat, cursive"
                fontSize="20"
                fill="#2f2a26"
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
                onClick={openDoor(door.id)}
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
