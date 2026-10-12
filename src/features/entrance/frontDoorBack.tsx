import { type Side, grainStrokes, hatchRect } from '@/features/entrance/frontDoorGeometry'
import { CREAM, INK, LEAF_WIDTH, OPENING, WOOD, WOOD_DARK } from '@/features/entrance/shared'

const BOARDS = [0, 21, 42, 63, 84, LEAF_WIDTH]
const LEDGES = [30, 160, 288]
const LEDGE_HEIGHT = 22
const LEDGE_X = 6
const LEDGE_WIDTH = LEAF_WIDTH - 12

const BOARD_GRAIN = BOARDS.slice(0, -1)
  .map((x, i) =>
    grainStrokes(41 + i, { x, y: 0, width: BOARDS[i + 1] - x, height: OPENING.height }, 6, true),
  )
  .join('')

const BOARD_LINES = BOARDS.slice(1, -1)
  .map((x) => `M${x} 0V${OPENING.height}M${x + 1.4} 0V${OPENING.height}`)
  .join('')

const LEDGE_SHADOW = LEDGES.map((y) =>
  hatchRect({ x: LEDGE_X, y: y + LEDGE_HEIGHT, width: LEDGE_WIDTH, height: 4 }, 3),
).join('')

function brace(top: number, bottom: number): string {
  return `M${LEDGE_X + 2} ${bottom}L${LEAF_WIDTH - LEDGE_X - 14} ${top}H${LEAF_WIDTH - LEDGE_X - 2}L${LEDGE_X + 14} ${bottom}Z`
}

const BRACES = [
  brace(LEDGES[0] + LEDGE_HEIGHT, LEDGES[1]),
  brace(LEDGES[1] + LEDGE_HEIGHT, LEDGES[2]),
].join('')

const BOLT_X = BOARDS.slice(0, -1).map((x, i) => (x + BOARDS[i + 1]) / 2)

function Bolt({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g stroke={INK} strokeWidth="1.2">
      <circle cx={cx} cy={cy} r="2.4" fill={CREAM} />
      <circle cx={cx} cy={cy} r="0.6" fill={INK} stroke="none" />
    </g>
  )
}

export function BackFace({ side }: { side: Side }) {
  return (
    <g transform={side === 'right' ? `translate(${LEAF_WIDTH} 0) scale(-1 1)` : undefined}>
      <rect
        x="1.2"
        y="1.2"
        width={LEAF_WIDTH - 2.4}
        height={OPENING.height - 2.4}
        fill={WOOD}
        stroke={INK}
        strokeWidth="2.4"
      />
      <path d={BOARD_GRAIN} fill="none" stroke={INK} strokeWidth="0.8" opacity="0.3" />
      <path d={BOARD_LINES} stroke={INK} strokeWidth="0.8" opacity="0.6" />
      <path d={LEDGE_SHADOW} stroke={INK} strokeWidth="0.8" opacity="0.45" />
      {LEDGES.map((y) => (
        <rect
          key={y}
          x={LEDGE_X}
          y={y}
          width={LEDGE_WIDTH}
          height={LEDGE_HEIGHT}
          fill={WOOD_DARK}
          stroke={INK}
          strokeWidth="1.6"
        />
      ))}
      <path d={BRACES} fill={WOOD_DARK} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      {LEDGES.map((y) => BOLT_X.map((cx) => <Bolt key={`${cx}-${y}`} cx={cx} cy={y + 11} />))}
      {[42, 168, 294].map((cy) => (
        <rect
          key={cy}
          x="0.8"
          y={cy - 15}
          width="5"
          height="30"
          rx="2.5"
          fill={CREAM}
          stroke={INK}
          strokeWidth="1.6"
        />
      ))}
    </g>
  )
}
