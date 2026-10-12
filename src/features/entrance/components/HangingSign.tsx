import { useRef, type RefObject } from 'react'
import {
  BRASS,
  GLOW,
  INK,
  METAL,
  METAL_DARK,
  SIGN_PIVOT,
  WOOD_LIGHT,
} from '@/features/entrance/shared'
import { useTicker } from '@/features/entrance/useTicker'
import {
  ARM,
  BEVELS,
  BOARD,
  BOARD_DEPTH,
  BOARD_EDGE_HATCH,
  BOARD_RINGS,
  BRACE,
  BRACE_HIGHLIGHT,
  CHAIN_ANCHORS,
  CHIPS,
  DRIPS,
  FRAME_GRAIN,
  GRAIN,
  INNER,
  PANEL_SHADE,
  PINSTRIPE,
  PLATE,
  PLATE_BOLTS,
  REST_CHAINS,
  RIVETS,
  RULE,
  RULE_DOOR,
  RULE_DOOR_KNOB,
  RULE_DOOR_SPLIT,
  RULE_TICKS,
  SCROLLS,
  SCUFFS,
  SHADOWS,
  chainPath,
  rotateAbout,
} from './hangingSignGeometry'

interface HangingSignProps {
  animate: boolean
  gust: RefObject<number>
}

const STIFFNESS = 18
const DAMPING = 1.4
const FOLLOW_STIFFNESS = 90
const FOLLOW_DAMPING = 8
const SIGN_FONT = "'Barlow Semi Condensed', 'Barlow Condensed', 'Arial Narrow', sans-serif"
const PAINT = '#2e6a4e'
const PAINT_DARK = '#214d39'
const PAINT_LIGHT = '#4f8d69'
const GOLD_DARK = '#8a5a17'
const IRON_EDGE = '#6e7b88'
const LETTERING = {
  textAnchor: 'middle',
  dominantBaseline: 'middle',
  fontFamily: SIGN_FONT,
  fontSize: 42,
  fontWeight: 700,
  letterSpacing: 4,
} as const

export function HangingSign({ animate, gust }: HangingSignProps) {
  const board = useRef<SVGGElement>(null)
  const leftChain = useRef<SVGPathElement>(null)
  const rightChain = useRef<SVGPathElement>(null)
  const leftChainEdge = useRef<SVGPathElement>(null)
  const rightChainEdge = useRef<SVGPathElement>(null)
  const sway = useRef({
    angle: 0,
    velocity: 0,
    board: 0,
    boardVelocity: 0,
    phase: Math.random() * 100,
  })

  useTicker(animate, (time, delta) => {
    const element = board.current
    const left = leftChain.current
    const right = rightChain.current
    const leftEdge = leftChainEdge.current
    const rightEdge = rightChainEdge.current
    if (!element || !left || !right || !leftEdge || !rightEdge) return
    const state = sway.current
    const step = Math.min(delta, 0.05)
    const breeze = time + state.phase
    const wind = Math.sin(breeze * 2) * 0.05 + Math.sin(breeze * 0.7) * 0.02
    state.velocity += gust.current
    gust.current = 0
    state.velocity += (-(state.angle - wind) * STIFFNESS - state.velocity * DAMPING) * step
    state.angle += state.velocity * step
    state.boardVelocity +=
      (-(state.board - state.angle) * FOLLOW_STIFFNESS - state.boardVelocity * FOLLOW_DAMPING) *
      step
    state.board += state.boardVelocity * step
    const degrees = ((state.board * 180) / Math.PI).toFixed(3)
    element.setAttribute('transform', `rotate(${degrees} ${SIGN_PIVOT.x} ${SIGN_PIVOT.y})`)
    const leftPath = chainPath(
      CHAIN_ANCHORS[0],
      rotateAbout(BOARD_RINGS[0], SIGN_PIVOT, state.board),
      1,
    )
    const rightPath = chainPath(
      CHAIN_ANCHORS[1],
      rotateAbout(BOARD_RINGS[1], SIGN_PIVOT, state.board),
      -1,
    )
    left.setAttribute('d', leftPath)
    leftEdge.setAttribute('d', leftPath)
    right.setAttribute('d', rightPath)
    rightEdge.setAttribute('d', rightPath)
  })

  return (
    <svg
      viewBox="0 0 1600 900"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <g data-entrance-reveal>
        <g fill="none" stroke={INK} strokeLinecap="round" strokeLinejoin="round">
          {SHADOWS.map((d, i) => (
            <path key={i} d={d} strokeWidth="0.8" opacity={i === 2 ? 0.4 : 0.7} />
          ))}
          {SCROLLS.map((d, i) => (
            <g key={i}>
              <path d={d} stroke={METAL_DARK} strokeWidth="2.6" />
              <path d={d} stroke={IRON_EDGE} strokeWidth="0.7" transform="translate(-0.6 -0.6)" />
            </g>
          ))}
          <polygon points={BRACE} fill={METAL_DARK} strokeWidth="1.6" />
          <path d={BRACE_HIGHLIGHT} stroke={IRON_EDGE} strokeWidth="0.8" />
          <rect {...ARM} rx="2" fill={METAL_DARK} strokeWidth="1.6" />
          <path
            d={`M${ARM.x + 6} ${ARM.y + 2.2}H${ARM.x + ARM.width - 6}`}
            stroke={METAL}
            strokeWidth="0.9"
          />
          <rect {...PLATE} rx="3" fill={METAL_DARK} strokeWidth="1.6" />
          <rect
            x={PLATE.x + 4}
            y={PLATE.y + 4}
            width={PLATE.width - 8}
            height={PLATE.height - 8}
            rx="1.5"
            stroke={IRON_EDGE}
            strokeWidth="0.8"
          />
          <path
            d={`M${PLATE.x + 2.5} ${PLATE.y + 6}V${PLATE.y + PLATE.height - 6}`}
            stroke={METAL}
            strokeWidth="0.8"
          />
          {PLATE_BOLTS.map((bolt, i) => (
            <g key={i}>
              <circle cx={bolt.x} cy={bolt.y} r="3.2" fill={BRASS} strokeWidth="1.2" />
              <path
                d={`M${bolt.x - 2} ${bolt.y}H${bolt.x + 2}`}
                stroke={GOLD_DARK}
                strokeWidth="0.9"
              />
              <circle cx={bolt.x - 1} cy={bolt.y - 1.2} r="0.7" fill={GLOW} stroke="none" />
            </g>
          ))}
          {CHAIN_ANCHORS.map((anchor, i) => (
            <g key={i}>
              <path
                d={`M${anchor.x} ${ARM.y + ARM.height}V${anchor.y - 4}`}
                stroke={METAL_DARK}
                strokeWidth="2.4"
              />
              <circle cx={anchor.x} cy={anchor.y} r="4" stroke={METAL_DARK} strokeWidth="1.6" />
              <path
                d={`M${anchor.x - 2.2} ${anchor.y - 2}a3 3 0 0 1 3 -1.5`}
                stroke={METAL}
                strokeWidth="0.8"
              />
            </g>
          ))}
        </g>
        <g ref={board} stroke={INK} strokeLinecap="round" strokeLinejoin="round">
          <rect
            x={BOARD.x + BOARD_DEPTH}
            y={BOARD.y + BOARD_DEPTH}
            width={BOARD.width}
            height={BOARD.height}
            rx="6"
            fill={PAINT_DARK}
            strokeWidth="1.6"
          />
          <path d={BOARD_EDGE_HATCH} fill="none" strokeWidth="0.8" opacity="0.7" />
          <rect {...BOARD} rx="6" fill={PAINT_DARK} strokeWidth="2.4" />
          <g fill="none" stroke={PAINT_LIGHT} strokeWidth="0.7" opacity="0.5">
            {FRAME_GRAIN.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          <rect {...INNER} rx="2" fill={PAINT} strokeWidth="1.2" />
          <g fill="none" stroke={PAINT_LIGHT} strokeWidth="0.8" opacity="0.28">
            {GRAIN.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          <path d={PANEL_SHADE} fill="none" strokeWidth="0.7" opacity="0.4" />
          <rect {...PINSTRIPE} rx="1.5" fill="none" stroke={BRASS} strokeWidth="1.3" />
          <rect
            x={PINSTRIPE.x + 2.5}
            y={PINSTRIPE.y + 2.5}
            width={PINSTRIPE.width - 5}
            height={PINSTRIPE.height - 5}
            rx="1"
            fill="none"
            stroke={PAINT_LIGHT}
            strokeWidth="0.6"
            opacity="0.8"
          />
          <path d={BEVELS} fill="none" strokeWidth="0.8" opacity="0.55" />
          <g fill="none" stroke={PAINT_LIGHT} strokeWidth="1.1" opacity="0.75">
            {SCUFFS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          {CHIPS.map((d, i) => (
            <path key={i} d={d} fill={WOOD_LIGHT} strokeWidth="0.6" />
          ))}
          {DRIPS.map((d, i) => (
            <path key={i} d={d} fill={PAINT_DARK} stroke="none" opacity="0.7" />
          ))}
          {RIVETS.map((rivet, i) => (
            <g key={i}>
              <circle cx={rivet.x} cy={rivet.y} r="3.2" fill={BRASS} strokeWidth="1.2" />
              <path
                d={`M${rivet.x - 1.8} ${rivet.y - 1.8}L${rivet.x + 1.8} ${rivet.y + 1.8}`}
                stroke={GOLD_DARK}
                strokeWidth="0.9"
              />
              <circle cx={rivet.x - 1.1} cy={rivet.y - 1.2} r="0.7" fill={GLOW} stroke="none" />
            </g>
          ))}
          <text x="802" y="252" {...LETTERING} fill={GOLD_DARK} stroke="none">
            PORTFOLIO
          </text>
          <text x="800" y="250" {...LETTERING} fill={BRASS} strokeWidth="0.7">
            PORTFOLIO
          </text>
          <path d={RULE} fill="none" stroke={BRASS} strokeWidth="1.6" />
          <path d={RULE_TICKS} fill="none" stroke={BRASS} strokeWidth="1.2" />
          <path d={RULE_DOOR} fill={BRASS} strokeWidth="0.9" />
          <path d={RULE_DOOR_SPLIT} fill="none" stroke={GOLD_DARK} strokeWidth="0.7" />
          <circle cx={RULE_DOOR_KNOB.x} cy={RULE_DOOR_KNOB.y} r="0.7" fill={INK} stroke="none" />
          {BOARD_RINGS.map((ring, i) => (
            <g key={i} fill="none">
              <rect
                x={ring.x - 7}
                y={BOARD.y}
                width="14"
                height="6"
                rx="1"
                fill={METAL_DARK}
                strokeWidth="1.2"
              />
              <path
                d={`M${ring.x - 5} ${BOARD.y + 1.6}H${ring.x + 5}`}
                stroke={IRON_EDGE}
                strokeWidth="0.7"
              />
              <path d={`M${ring.x} ${BOARD.y}V${ring.y + 4}`} stroke={METAL_DARK} strokeWidth="2" />
              <circle cx={ring.x} cy={ring.y} r="4.5" stroke={GOLD_DARK} strokeWidth="2.6" />
              <circle cx={ring.x} cy={ring.y} r="4.5" stroke={BRASS} strokeWidth="1.6" />
              <path
                d={`M${ring.x - 3.2} ${ring.y - 2.4}a4 4 0 0 1 3 -2`}
                stroke={GLOW}
                strokeWidth="0.9"
              />
            </g>
          ))}
        </g>
        <g fill="none" strokeLinecap="round">
          <path ref={leftChain} d={REST_CHAINS[0]} stroke={METAL_DARK} strokeWidth="1.8" />
          <path ref={rightChain} d={REST_CHAINS[1]} stroke={METAL_DARK} strokeWidth="1.8" />
          <path ref={leftChainEdge} d={REST_CHAINS[0]} stroke={IRON_EDGE} strokeWidth="0.5" />
          <path ref={rightChainEdge} d={REST_CHAINS[1]} stroke={IRON_EDGE} strokeWidth="0.5" />
        </g>
      </g>
    </svg>
  )
}
