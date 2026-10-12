import { activateOnKey } from '@/shared/utils/keys'
import { DOOR_WOOD, INK, MAP } from './mapGeometry'

interface LoopDoorMarkerProps {
  onSelect: () => void
}

export function LoopDoorMarker({ onSelect }: LoopDoorMarkerProps) {
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label="Walk to the far door and start the corridor again"
      className="cursor-pointer outline-none focus-visible:[&>rect]:stroke-terracotta"
      onClick={onSelect}
      onKeyDown={(event) => activateOnKey(event, onSelect)}
    >
      <rect
        x={MAP.left + 1}
        y={MAP.top - 26}
        width={13}
        height={26}
        fill={DOOR_WOOD}
        stroke={INK}
        strokeWidth="1.8"
      />
      <rect
        x={MAP.centre + 1}
        y={MAP.top - 26}
        width={13}
        height={26}
        fill={DOOR_WOOD}
        stroke={INK}
        strokeWidth="1.8"
      />
      <text
        x={MAP.centre}
        y={MAP.top - 32}
        textAnchor="middle"
        fontFamily="Fraunces, serif"
        fontSize="22"
        fill="#4f7fc9"
      >
        ∞
      </text>
      <text
        x={MAP.centre}
        y={MAP.top - 54}
        textAnchor="middle"
        fontFamily="Caveat, cursive"
        fontSize="16"
        fill="#6b625a"
      >
        start again
      </text>
    </g>
  )
}
