import type { DoorDefinition } from '@/data/siteConfig'
import { accentHex } from '@/data/siteConfig'
import { activateOnKey } from '@/shared/utils/keys'
import { doorMapY, INK, MAP, PAPER } from './mapGeometry'

interface MapDoorProps {
  door: DoorDefinition
  current: boolean
  hovered: boolean
  page: boolean
  onHover: (hovered: boolean) => void
  onSelect: () => void
}

export function MapDoor({ door, current, hovered, page, onHover, onSelect }: MapDoorProps) {
  const y = doorMapY(door)
  const left = door.side === 'left'
  const x = left ? MAP.left - 26 : MAP.right + 2
  const textX = left ? MAP.left - 40 : MAP.right + 40
  const accent = accentHex[door.accent]
  const lit = current || hovered

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`Door ${door.number}: ${door.label}`}
      aria-current={page ? 'page' : undefined}
      className="cursor-pointer outline-none"
      onClick={onSelect}
      onKeyDown={(event) => activateOnKey(event, onSelect)}
      onPointerEnter={() => onHover(true)}
      onPointerLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
    >
      <circle
        cx={MAP.centre}
        cy={y}
        r={hovered ? 8 : 7}
        fill={PAPER}
        stroke={lit ? accentHex.terracotta : INK}
        strokeWidth="1.2"
        strokeDasharray="2.5 2.5"
        className="transition-[r] duration-200"
      />
      <rect
        x={x}
        y={y - 12}
        width="24"
        height="24"
        fill={lit ? accent : PAPER}
        stroke={hovered ? accentHex.terracotta : INK}
        strokeWidth={current ? 2.6 : 1.8}
      />
      <text
        x={textX}
        y={y - 2}
        textAnchor={left ? 'end' : 'start'}
        fontFamily="Caveat, cursive"
        fontSize="20"
        fontWeight="600"
        fill={lit ? '#2f2a26' : '#4a443f'}
      >
        {door.number} {door.label}
      </text>
      <text
        x={textX}
        y={y + 16}
        textAnchor={left ? 'end' : 'start'}
        fontFamily="Caveat, cursive"
        fontSize="15"
        fill="#6b625a"
      >
        {door.note}
      </text>
    </g>
  )
}
