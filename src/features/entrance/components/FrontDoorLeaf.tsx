import type { RefObject } from 'react'
import { skillCategories } from '@/data/skills'
import { BackFace } from '@/features/entrance/frontDoorBack'
import {
  BRUSH,
  HANDLE_Y,
  PAINT_HIDDEN,
  type Side,
  handlePivotX,
  leverPath,
} from '@/features/entrance/frontDoorGeometry'
import {
  Backplate,
  Hinges,
  Joinery,
  KickPlate,
  Letterbox,
  Plaque,
} from '@/features/entrance/frontDoorJoinery'
import { Sticker } from '@/features/entrance/frontDoorSticker'
import { CREAM, INK, LEAF_WIDTH, OPENING, WOOD_DARK } from '@/features/entrance/shared'

const STICKERS = skillCategories
  .flatMap((category) => category.skills)
  .filter((skill) => skill.length <= 11)
  .slice(0, 8)

const LEVER: Record<Side, string> = { left: leverPath('left'), right: leverPath('right') }

function Face({ side, painted }: { side: Side; painted: boolean }) {
  const stickers = side === 'left' ? STICKERS.slice(0, 4) : STICKERS.slice(4, 8)
  const base = side === 'left' ? 0 : 4
  return (
    <g>
      <Joinery side={side} painted={painted} />
      <Hinges side={side} painted={painted} />
      <KickPlate painted={painted} />
      {side === 'left' ? <Letterbox painted={painted} /> : <Plaque painted={painted} />}
      <Backplate side={side} painted={painted} />
      {stickers.map((label, i) => (
        <Sticker key={label} label={label} index={base + i} painted={painted} />
      ))}
    </g>
  )
}

interface LeafProps {
  side: Side
  leafRef: RefObject<HTMLDivElement | null>
  paintRef: RefObject<SVGPathElement | null>
  handleRef: RefObject<SVGGElement | null>
}

export function Leaf({ side, leafRef, paintRef, handleRef }: LeafProps) {
  const pivotX = handlePivotX(side)
  const dir = side === 'left' ? -1 : 1
  return (
    <div
      ref={leafRef}
      className="absolute top-0 h-full will-change-transform [transform-style:preserve-3d]"
      style={{
        width: LEAF_WIDTH,
        [side]: 0,
        transformOrigin: side === 'left' ? '0% 50%' : '100% 50%',
      }}
    >
      <svg
        viewBox={`0 0 ${LEAF_WIDTH} ${OPENING.height}`}
        className="absolute inset-0 h-full w-full [backface-visibility:hidden]"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={`door-paint-${side}`}>
            <path ref={paintRef} d={BRUSH} transform={`translate(${PAINT_HIDDEN} 0)`} />
          </clipPath>
        </defs>
        <Face side={side} painted={false} />
        <g clipPath={`url(#door-paint-${side})`}>
          <Face side={side} painted />
        </g>
        <g ref={handleRef}>
          <path
            d={LEVER[side]}
            fill={WOOD_DARK}
            stroke={INK}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d={`M${pivotX + dir * 8} ${HANDLE_Y - 1.4}H${pivotX + dir * 22}`}
            stroke={INK}
            strokeWidth="0.8"
            opacity="0.6"
          />
          <circle cx={pivotX} cy={HANDLE_Y} r="6" fill={CREAM} stroke={INK} strokeWidth="1.6" />
          <circle cx={pivotX} cy={HANDLE_Y} r="1.6" fill={INK} />
        </g>
      </svg>
      <svg
        viewBox={`0 0 ${LEAF_WIDTH} ${OPENING.height}`}
        className="absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)]"
        aria-hidden="true"
      >
        <BackFace side={side} />
      </svg>
    </div>
  )
}
