import { useRef, type RefObject } from 'react'
import { CREAM, INK, SIGN_PIVOT, WOOD, WOOD_DARK } from '@/features/entrance/shared'
import { useTicker } from '@/features/entrance/useTicker'

interface HangingSignProps {
  animate: boolean
  gust: RefObject<number>
}

const STIFFNESS = 18
const DAMPING = 1.4

export function HangingSign({ animate, gust }: HangingSignProps) {
  const swing = useRef<SVGGElement>(null)
  const sway = useRef({ angle: 0, velocity: 0, phase: Math.random() * 100 })

  useTicker(animate, (time, delta) => {
    const element = swing.current
    if (!element) return
    const state = sway.current
    const step = Math.min(delta, 0.05)
    const wind = Math.sin((time + state.phase) * 2) * 0.05
    state.velocity += gust.current
    gust.current = 0
    state.velocity += (-(state.angle - wind) * STIFFNESS - state.velocity * DAMPING) * step
    state.angle += state.velocity * step
    const degrees = ((state.angle * 180) / Math.PI).toFixed(3)
    element.setAttribute('transform', `rotate(${degrees} ${SIGN_PIVOT.x} ${SIGN_PIVOT.y})`)
  })

  return (
    <svg
      viewBox="0 0 1600 900"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <g data-entrance-reveal>
        <rect
          x="656"
          y="140"
          width="288"
          height="34"
          rx="5"
          fill={WOOD}
          stroke={INK}
          strokeWidth="2.4"
        />
        <path d="M670 150 H930 M676 164 H920" stroke={INK} strokeWidth="1" opacity="0.5" />
        <circle cx="672" cy="157" r="4" fill={WOOD_DARK} stroke={INK} strokeWidth="1.2" />
        <circle cx="928" cy="157" r="4" fill={WOOD_DARK} stroke={INK} strokeWidth="1.2" />
        <g ref={swing}>
          <path
            d="M700 174 V214 M900 174 V214"
            stroke={INK}
            strokeWidth="2"
            strokeDasharray="4 3"
          />
          <circle cx="700" cy="176" r="4" fill="none" stroke={INK} strokeWidth="1.4" />
          <circle cx="900" cy="176" r="4" fill="none" stroke={INK} strokeWidth="1.4" />
          <rect
            x="662"
            y="214"
            width="276"
            height="76"
            rx="7"
            fill={CREAM}
            stroke={INK}
            strokeWidth="2.6"
          />
          <rect
            x="668"
            y="220"
            width="264"
            height="64"
            rx="5"
            fill="none"
            stroke={INK}
            strokeWidth="1"
            opacity="0.4"
          />
          <text
            x="800"
            y="254"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="Fraunces, Georgia, serif"
            fontSize="46"
            fontWeight="600"
            letterSpacing="5"
            fill={INK}
          >
            PORTFOLIO
          </text>
        </g>
      </g>
    </svg>
  )
}
