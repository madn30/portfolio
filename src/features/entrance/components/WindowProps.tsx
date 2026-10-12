import { BugHunt } from './BugHunt'
import { PeekWindow } from './PeekWindow'
import { RubberDuck } from './RubberDuck'
import { accentHex } from '@/data/siteConfig'
import {
  BRASS,
  INK,
  LEAF,
  LEAF_DARK,
  LEAF_LIGHT,
  METAL_DARK,
  WOOD,
  WOOD_DARK,
  WOOD_LIGHT,
} from '@/features/entrance/shared'
import { BOARDS, FERN, FLOWERS, IVY, PANE, PLANTER, ROSEMARY, SOIL, hatch } from './windowGeometry'

const SOIL_COLOUR = '#4b3828'

interface WindowPropsProps {
  animate: boolean
}

const planterRight = PLANTER.x + PLANTER.width
const planterBottom = PLANTER.y + PLANTER.height

function Brackets() {
  const left = PLANTER.x + 18
  const right = planterRight - 18
  return (
    <>
      <path
        d={`M${left} 602V642M${left} 606C${left} 628 ${left + 12} 634 ${left + 30} 640M${right} 602V642M${right} 606C${right} 628 ${right - 12} 634 ${right - 30} 640`}
        fill="none"
        stroke={METAL_DARK}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d={`M${left} 602V642M${left} 606C${left} 628 ${left + 12} 634 ${left + 30} 640M${right} 602V642M${right} 606C${right} 628 ${right - 12} 634 ${right - 30} 640`}
        fill="none"
        stroke={INK}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d={`M${left + 18} 636q6 -8 -2 -10q-6 -2 -4 6M${right - 18} 636q-6 -8 2 -10q6 -2 4 6`}
        fill="none"
        stroke={INK}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </>
  )
}

function Plants() {
  return (
    <>
      <path
        d="M1052 612 h22 l-3 22 h-16 Z"
        fill={accentHex.terracotta}
        stroke={INK}
        strokeWidth="1.6"
      />
      <rect
        x="1050"
        y="609"
        width="26"
        height="6"
        fill={accentHex.terracotta}
        stroke={INK}
        strokeWidth="1.6"
      />
      {ROSEMARY.map((frond, index) => (
        <g key={index}>
          <path d={frond.pinnae} stroke={LEAF_DARK} strokeWidth="1.6" strokeLinecap="round" />
          <path d={frond.spine} fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ))}
      {FERN.map((frond, index) => (
        <g key={index}>
          <path d={frond.pinnae} stroke={LEAF} strokeWidth="2.4" strokeLinecap="round" />
          <path
            d={frond.pinnae}
            stroke={INK}
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path d={frond.spine} fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ))}
      {FLOWERS.map((flower, index) => (
        <g key={index}>
          <path
            d={flower.stem}
            fill="none"
            stroke={LEAF_DARK}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path d={flower.leaf} fill={LEAF} stroke={INK} strokeWidth="0.8" />
          <path d={flower.petals} fill={flower.color} stroke={INK} strokeWidth="0.8" />
          <circle
            cx={flower.cx}
            cy={flower.cy}
            r="2.6"
            fill={BRASS}
            stroke={INK}
            strokeWidth="0.8"
          />
        </g>
      ))}
    </>
  )
}

function Ivy() {
  return (
    <>
      {IVY.map((vine, index) => (
        <g key={index}>
          <path
            d={vine.stem}
            fill="none"
            stroke={LEAF_DARK}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d={vine.leaves}
            fill={LEAF_LIGHT}
            stroke={INK}
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        </g>
      ))}
    </>
  )
}

function Planter() {
  return (
    <>
      <rect
        x={PLANTER.x}
        y={PLANTER.y}
        width={PLANTER.width}
        height={PLANTER.height}
        fill={WOOD}
        stroke={INK}
        strokeWidth="2.4"
      />
      <path d={BOARDS} stroke={INK} strokeWidth="0.8" opacity="0.45" />
      <path d={`M${PLANTER.x} ${PLANTER.y + 23}H${planterRight}`} stroke={INK} strokeWidth="1.6" />
      <rect
        x={PLANTER.x}
        y={PLANTER.y}
        width="10"
        height={PLANTER.height}
        fill={WOOD_DARK}
        stroke={INK}
        strokeWidth="1.6"
      />
      <rect
        x={planterRight - 10}
        y={PLANTER.y}
        width="10"
        height={PLANTER.height}
        fill={WOOD_DARK}
        stroke={INK}
        strokeWidth="1.6"
      />
      <path
        d={`M${PLANTER.x + 5} ${PLANTER.y + 8}v2M${PLANTER.x + 5} ${planterBottom - 8}v2M${planterRight - 5} ${PLANTER.y + 8}v2M${planterRight - 5} ${planterBottom - 8}v2`}
        stroke={INK}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <rect
        x={PLANTER.x - 4}
        y={PLANTER.y - 8}
        width={PLANTER.width + 8}
        height="8"
        fill={WOOD_LIGHT}
        stroke={INK}
        strokeWidth="1.6"
      />
      <path
        d={hatch(PLANTER.x + 4, planterBottom, PLANTER.width - 8, 8, 6)}
        stroke={INK}
        strokeWidth="0.8"
        opacity="0.45"
      />
    </>
  )
}

export function WindowProps({ animate }: WindowPropsProps) {
  return (
    <svg viewBox="0 0 1600 900" className="pointer-events-none absolute inset-0 h-full w-full">
      <defs>
        <clipPath id="window-pane">
          <rect x={PANE.x} y={PANE.y} width={PANE.width} height={PANE.height} />
        </clipPath>
      </defs>

      <PeekWindow animate={animate} />

      <g data-entrance-reveal>
        <Brackets />
        <path d={SOIL} fill={SOIL_COLOUR} stroke={INK} strokeWidth="0.8" />
        <Plants />
        <Planter />
        <Ivy />
        <RubberDuck animate={animate} />
      </g>

      <BugHunt animate={animate} />
    </svg>
  )
}
