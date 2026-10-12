import { doors } from '@/data/siteConfig'
import type { DoorSectionId } from '@/shared/types'
import { LoopDoorMarker } from './LoopDoorMarker'
import { MapDoor } from './MapDoor'
import { MapPin } from './MapPin'
import { doorMapY, FLOOR, INK, MAP, PAPER, progressToMapY } from './mapGeometry'
import { PaintedRoom } from './PaintedRoom'

interface CorridorMapProps {
  page: DoorSectionId | null
  current: DoorSectionId | null
  hovered: DoorSectionId | null
  pinProgress: number
  onHover: (id: DoorSectionId | null) => void
  onSelect: (id: DoorSectionId) => void
  onSelectLoop: () => void
}

export function CorridorMap({
  page,
  current,
  hovered,
  pinProgress,
  onHover,
  onSelect,
  onSelectLoop,
}: CorridorMapProps) {
  const target = doors.find((d) => d.id === (hovered ?? page))
  const pinY = target ? doorMapY(target) : progressToMapY(pinProgress)

  return (
    <svg
      viewBox="0 0 360 440"
      className="mt-2 w-full"
      role="group"
      aria-label="Doors along the corridor"
    >
      <defs>
        <pattern
          id="map-hatch"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-45)"
        >
          <path d="M0 0 V6" stroke={INK} strokeOpacity="0.12" strokeWidth="1" />
        </pattern>
      </defs>

      {doors.map((door) => (
        <PaintedRoom
          key={door.id}
          door={door}
          revealed={hovered === door.id || current === door.id}
        />
      ))}

      <rect
        x={MAP.left}
        y={MAP.top}
        width={MAP.right - MAP.left}
        height={MAP.bottom + 20 - MAP.top}
        fill={FLOOR}
      />
      <path
        d={`M${MAP.left} ${MAP.bottom + 20} V${MAP.top} M${MAP.right} ${MAP.bottom + 20} V${MAP.top}`}
        fill="none"
        stroke={INK}
        strokeWidth="2"
      />
      <path
        d={`M${MAP.left - 6} ${MAP.bottom + 20} H${MAP.right + 6}`}
        stroke={INK}
        strokeWidth="2"
        strokeDasharray="3 3"
      />
      <circle
        cx={MAP.centre}
        cy={MAP.bottom}
        r="7"
        fill={PAPER}
        stroke={INK}
        strokeWidth="1.2"
        strokeDasharray="2.5 2.5"
        aria-hidden="true"
      />
      <text
        x={MAP.centre}
        y={MAP.bottom + 36}
        textAnchor="middle"
        fontFamily="Caveat, cursive"
        fontSize="17"
        fill="#6b625a"
      >
        entrance
      </text>

      <LoopDoorMarker onSelect={onSelectLoop} />

      {doors.map((door) => (
        <MapDoor
          key={door.id}
          door={door}
          current={current === door.id}
          hovered={hovered === door.id}
          page={page === door.id}
          onHover={(on) => onHover(on ? door.id : null)}
          onSelect={() => onSelect(door.id)}
        />
      ))}

      <MapPin x={MAP.centre} y={pinY} />
    </svg>
  )
}
