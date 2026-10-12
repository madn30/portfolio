import type { RefObject } from 'react'
import { accentHex } from '@/data/siteConfig'
import { skillCategories } from '@/data/skills'
import { mulberry32 } from '@/shared/graphics/sketch'
import {
  HANDLE_Y,
  PAINT_HIDDEN,
  handlePivotX,
  type Side,
} from '@/features/entrance/frontDoorGeometry'
import { CREAM, INK, LEAF_WIDTH, OPENING, WOOD, WOOD_DARK } from '@/features/entrance/shared'

const STICKERS = skillCategories
  .flatMap((category) => category.skills)
  .filter((skill) => skill.length <= 11)
  .slice(0, 8)
const ACCENTS = Object.values(accentHex)

const BRUSH = (() => {
  const random = mulberry32(5)
  let d = 'M0 0'
  for (let y = 0; y <= OPENING.height; y += 24) {
    d += ` L${(LEAF_WIDTH + 6 + random() * 14).toFixed(1)} ${y}`
  }
  return `${d} L0 ${OPENING.height} Z`
})()

function Sticker({ label, index, painted }: { label: string; index: number; painted: boolean }) {
  const offset = index % 2
  const x = 52
  const y = (index < 4 ? 45 : 51) + (index % 4) * 72 + (index < 4 ? offset * 6 : -offset * 6)
  const rotate = index < 4 ? (offset ? 6 : -7) : offset ? -5 : 8
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect
        x="-36"
        y="-19"
        width="72"
        height="38"
        rx="9"
        fill={painted ? ACCENTS[index % ACCENTS.length] : CREAM}
        stroke={INK}
        strokeWidth="1.6"
        opacity={painted ? 0.92 : 1}
      />
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Caveat, cursive"
        fontSize="22"
        fontWeight="600"
        fill={painted ? CREAM : INK}
      >
        {label}
      </text>
    </g>
  )
}

function Panels({ fill }: { fill: string }) {
  return (
    <g fill={fill} stroke={INK} strokeWidth="1.2" opacity={fill === 'none' ? 0.6 : 1}>
      <rect x="11" y="15" width="82" height="130" rx="3" />
      <rect x="11" y="175" width="82" height="130" rx="3" />
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
  const stickers = side === 'left' ? STICKERS.slice(0, 4) : STICKERS.slice(4, 8)
  const base = side === 'left' ? 0 : 4
  const pivotX = handlePivotX(side)
  const leverX = side === 'left' ? pivotX - 28 : pivotX
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
        <rect
          x="1.2"
          y="1.2"
          width="101.6"
          height="333.6"
          fill={CREAM}
          stroke={INK}
          strokeWidth="2.4"
        />
        <Panels fill="none" />
        {stickers.map((label, i) => (
          <Sticker key={label} label={label} index={base + i} painted={false} />
        ))}
        <g clipPath={`url(#door-paint-${side})`}>
          <rect
            x="1.2"
            y="1.2"
            width="101.6"
            height="333.6"
            fill={WOOD}
            stroke={INK}
            strokeWidth="2.4"
          />
          <Panels fill="#efe9dc" />
          {stickers.map((label, i) => (
            <Sticker key={label} label={label} index={base + i} painted />
          ))}
        </g>
        <g ref={handleRef}>
          <rect
            x={leverX}
            y={HANDLE_Y - 3.5}
            width="28"
            height="7"
            rx="3.5"
            fill={WOOD_DARK}
            stroke={INK}
            strokeWidth="1.5"
          />
          <circle cx={pivotX} cy={HANDLE_Y} r="5.5" fill={CREAM} stroke={INK} strokeWidth="1.6" />
          <circle cx={pivotX} cy={HANDLE_Y} r="1.6" fill={INK} />
        </g>
      </svg>
      <svg
        viewBox={`0 0 ${LEAF_WIDTH} ${OPENING.height}`}
        className="absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)]"
        aria-hidden="true"
      >
        <rect
          x="1.2"
          y="1.2"
          width="101.6"
          height="333.6"
          fill={WOOD}
          stroke={INK}
          strokeWidth="2.4"
        />
        <path
          d="M14 20 V316 M30 20 V316 M52 20 V316 M74 20 V316 M90 20 V316"
          stroke={INK}
          strokeWidth="1"
          opacity="0.35"
        />
      </svg>
    </div>
  )
}
