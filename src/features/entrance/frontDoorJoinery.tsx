import { accentHex } from '@/data/siteConfig'
import {
  BEVEL,
  BOTTOM_RAIL_Y,
  HANDLE_Y,
  LOCK_RAIL,
  PANELS,
  STILE,
  TOP_RAIL,
  type Box,
  type Side,
  handlePivotX,
  hatchRect,
  leafGrain,
  mirrorX,
} from '@/features/entrance/frontDoorGeometry'
import { CREAM, INK, LEAF_WIDTH, OPENING, WOOD, WOOD_DARK } from '@/features/entrance/shared'

const GRAIN: Record<Side, string> = { left: leafGrain(11), right: leafGrain(23) }
const BRASS = accentHex.ochre
const STEEL = accentHex.slate

interface FaceProps {
  side: Side
  painted: boolean
}

function Screw({ cx, cy, r = 1.6 }: { cx: number; cy: number; r?: number }) {
  return (
    <g stroke={INK} strokeWidth="0.8">
      <circle cx={cx} cy={cy} r={r} fill="none" />
      <path d={`M${cx - r * 0.7} ${cy - r * 0.7}L${cx + r * 0.7} ${cy + r * 0.7}`} />
    </g>
  )
}

function Panel({ box, painted }: { box: Box; painted: boolean }) {
  const field: Box = {
    x: box.x + BEVEL,
    y: box.y + BEVEL,
    width: box.width - 2 * BEVEL,
    height: box.height - 2 * BEVEL,
  }
  const right = box.x + box.width
  const bottom = box.y + box.height
  const shadowBottom = hatchRect(
    { x: field.x, y: field.y + field.height, width: field.width + BEVEL, height: BEVEL },
    3.2,
  )
  const shadowRight = hatchRect(
    { x: field.x + field.width, y: box.y, width: BEVEL, height: field.height + BEVEL },
    3.2,
  )
  return (
    <g>
      <rect
        x={box.x}
        y={box.y}
        width={box.width}
        height={box.height}
        fill={painted ? WOOD : 'none'}
        stroke={INK}
        strokeWidth="1.6"
      />
      <path
        d={`M${box.x} ${box.y}L${field.x} ${field.y}M${right} ${box.y}L${field.x + field.width} ${field.y}M${right} ${bottom}L${field.x + field.width} ${field.y + field.height}M${box.x} ${bottom}L${field.x} ${field.y + field.height}`}
        stroke={INK}
        strokeWidth="0.8"
        opacity="0.7"
      />
      <path d={shadowBottom + shadowRight} stroke={INK} strokeWidth="0.8" opacity="0.4" />
      <rect
        x={field.x}
        y={field.y}
        width={field.width}
        height={field.height}
        fill={painted ? WOOD_DARK : 'none'}
        stroke={INK}
        strokeWidth="0.8"
      />
      <path
        d={`M${field.x + 2} ${field.y + field.height - 2}V${field.y + 2}H${field.x + field.width - 2}`}
        fill="none"
        stroke={INK}
        strokeWidth="0.8"
        opacity={painted ? 0.9 : 0.5}
      />
      {painted && (
        <path
          d={hatchRect({ x: field.x + 4, y: field.y + 4, width: 16, height: 10 }, 3)}
          stroke={INK}
          strokeWidth="1.2"
          opacity="0.75"
        />
      )}
    </g>
  )
}

export function Joinery({ side, painted }: FaceProps) {
  const inner = LEAF_WIDTH - STILE
  const railBottom = LOCK_RAIL.y + LOCK_RAIL.height
  const gapX = mirrorX(side, LEAF_WIDTH - 3.2, 3.2)
  return (
    <g>
      <rect
        x="1.2"
        y="1.2"
        width={LEAF_WIDTH - 2.4}
        height={OPENING.height - 2.4}
        fill={painted ? WOOD : CREAM}
        stroke={INK}
        strokeWidth="2.4"
      />
      <path d={GRAIN[side]} fill="none" stroke={INK} strokeWidth="0.8" opacity="0.3" />
      <path
        d={`M${STILE} ${TOP_RAIL}H${inner}M${STILE} ${LOCK_RAIL.y}H${inner}M${STILE} ${railBottom}H${inner}M${STILE} ${BOTTOM_RAIL_Y}H${inner}M${STILE} 0V${OPENING.height}M${inner} 0V${OPENING.height}`}
        stroke={INK}
        strokeWidth="1.6"
        opacity="0.85"
      />
      {PANELS.map((box) => (
        <Panel key={box.y} box={box} painted={painted} />
      ))}
      <rect x={gapX} y="0" width="3.2" height={OPENING.height} fill={INK} opacity="0.55" />
    </g>
  )
}

export function Hinges({ side, painted }: FaceProps) {
  const knuckleX = mirrorX(side, 0.8, 5)
  const plateX = mirrorX(side, 5.8, 7)
  return (
    <g>
      {[42, 168, 294].map((cy) => (
        <g key={cy}>
          <rect
            x={plateX}
            y={cy - 12}
            width="7"
            height="24"
            rx="1"
            fill={painted ? BRASS : 'none'}
            stroke={INK}
            strokeWidth="1.2"
          />
          <rect
            x={knuckleX}
            y={cy - 15}
            width="5"
            height="30"
            rx="2.5"
            fill={painted ? BRASS : CREAM}
            stroke={INK}
            strokeWidth="1.6"
          />
          <path
            d={`M${knuckleX} ${cy - 5}h5M${knuckleX} ${cy + 5}h5`}
            stroke={INK}
            strokeWidth="0.8"
          />
          <Screw cx={plateX + 3.5} cy={cy - 6} r={1.4} />
          <Screw cx={plateX + 3.5} cy={cy + 6} r={1.4} />
        </g>
      ))}
    </g>
  )
}

export function KickPlate({ painted }: { painted: boolean }) {
  const box: Box = { x: 9, y: 298, width: LEAF_WIDTH - 18, height: 30 }
  return (
    <g>
      <rect
        x={box.x}
        y={box.y}
        width={box.width}
        height={box.height}
        rx="1.2"
        fill={painted ? STEEL : 'none'}
        stroke={INK}
        strokeWidth="1.6"
      />
      <path d={hatchRect(box, 11)} stroke={INK} strokeWidth="0.8" opacity="0.35" />
      <Screw cx={box.x + 4} cy={box.y + 4} r={1.4} />
      <Screw cx={box.x + box.width - 4} cy={box.y + 4} r={1.4} />
      <Screw cx={box.x + 4} cy={box.y + box.height - 4} r={1.4} />
      <Screw cx={box.x + box.width - 4} cy={box.y + box.height - 4} r={1.4} />
    </g>
  )
}

export function Backplate({ side, painted }: FaceProps) {
  const p = handlePivotX(side)
  return (
    <g>
      <rect
        x={p - 7}
        y={HANDLE_Y - 23}
        width="14"
        height="51"
        rx="3"
        fill={painted ? BRASS : 'none'}
        stroke={INK}
        strokeWidth="1.6"
      />
      <Screw cx={p} cy={HANDLE_Y - 18} />
      <Screw cx={p} cy={HANDLE_Y + 23} />
      <circle cx={p} cy={HANDLE_Y + 13} r="2.4" fill={INK} />
      <rect x={p - 1.2} y={HANDLE_Y + 13} width="2.4" height="5" fill={INK} />
    </g>
  )
}

export function Letterbox({ painted }: { painted: boolean }) {
  const x = STILE + 2
  const y = HANDLE_Y - 9
  return (
    <g>
      <rect
        x={x}
        y={y}
        width="44"
        height="18"
        rx="2"
        fill={painted ? BRASS : 'none'}
        stroke={INK}
        strokeWidth="1.6"
      />
      <rect
        x={x + 7}
        y={y + 5}
        width="32"
        height="8"
        rx="1"
        fill="none"
        stroke={INK}
        strokeWidth="0.8"
      />
      <path
        d={hatchRect({ x: x + 6, y: y + 5, width: 32, height: 3 }, 2.4)}
        stroke={INK}
        strokeWidth="0.8"
        opacity="0.5"
      />
      <Screw cx={x + 3.5} cy={y + 9} r={1.4} />
      <Screw cx={x + 40.5} cy={y + 9} r={1.4} />
    </g>
  )
}

export function Plaque({ painted }: { painted: boolean }) {
  const x = LEAF_WIDTH - STILE - 2 - 40
  const y = HANDLE_Y - 9
  return (
    <g>
      <rect
        x={x}
        y={y}
        width="40"
        height="18"
        rx="2"
        fill={painted ? WOOD_DARK : 'none'}
        stroke={INK}
        strokeWidth="1.6"
      />
      <rect
        x={x + 2.5}
        y={y + 2.5}
        width="35"
        height="13"
        rx="1"
        fill="none"
        stroke={INK}
        strokeWidth="0.8"
        opacity="0.6"
      />
      <text
        x={x + 20}
        y={y + 9.5}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Caveat, cursive"
        fontSize="14"
        fontWeight="600"
        fill={INK}
      >
        Nº 1
      </text>
    </g>
  )
}
