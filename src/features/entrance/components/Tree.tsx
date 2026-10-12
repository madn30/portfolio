import { useRef } from 'react'
import { accentHex } from '@/data/siteConfig'
import {
  BARK,
  INK,
  LEAF,
  LEAF_DARK,
  LEAF_LIGHT,
  MOUSE,
  PINK,
  STONE,
  WOOD,
  WOOD_LIGHT,
} from '@/features/entrance/shared'
import { useTicker } from '@/features/entrance/useTicker'
import {
  BARK_STROKES,
  CLUSTERS,
  GRATE,
  KNOTS,
  LEAF_STARTS,
  LIMBS,
  PIT,
  ROOTS,
  TRUNK,
  TWIGS,
  leafPath,
} from './treeGeometry'

interface TreeProps {
  animate: boolean
}

const MOUSE_PIVOT = { x: 412, y: 408 }
const FORK = { x: 318, y: 440 }
const LEAF_PERIOD = 12
const LEAF_FALL = 7.5
const LEAF_GROUND = 754
const LAYER_FILL = [LEAF_DARK, LEAF, LEAF_LIGHT] as const
const LAYER_STROKE = [1.6, 2.4, 2.4] as const
const FALLING_LEAF = leafPath(-6, 0, 0, 12)

function fallingLeafPose(time: number) {
  const elapsed = time + LEAF_PERIOD - 4
  const t = elapsed % LEAF_PERIOD
  const start = LEAF_STARTS[Math.floor(elapsed / LEAF_PERIOD) % LEAF_STARTS.length]
  const drift = start.x > 330 ? 1 : -1
  const progress = Math.min(t / LEAF_FALL, 1)
  const y = start.y + (LEAF_GROUND - start.y) * progress * (0.8 + 0.2 * progress)
  const sweep = Math.min(t, LEAF_FALL)
  const x = start.x + drift * 34 * progress + Math.sin(sweep * 2.1) * 16
  const rotation = sweep * 130 + Math.sin(sweep * 3.1) * 35
  const opacity = t < LEAF_FALL ? 1 : Math.max(0, 1 - (t - LEAF_FALL) / 1.6)
  return { x, y, rotation, opacity }
}

export function Tree({ animate }: TreeProps) {
  const crown = useRef<SVGGElement>(null)
  const mouse = useRef<SVGGElement>(null)
  const fallingLeaf = useRef<SVGGElement>(null)
  const clusters = useRef<(SVGGElement | null)[]>([])

  useTicker(animate, (time) => {
    const sway = Math.sin(time * 0.9) * 0.45 + Math.sin(time * 0.37) * 0.25
    crown.current?.setAttribute('transform', `rotate(${sway.toFixed(3)} ${FORK.x} ${FORK.y})`)
    CLUSTERS.forEach((cluster, i) => {
      const el = clusters.current[i]
      if (!el) return
      const angle = Math.sin(time * cluster.speed + cluster.phase) * cluster.amp
      el.setAttribute(
        'transform',
        `rotate(${angle.toFixed(3)} ${cluster.pivot.x} ${cluster.pivot.y})`,
      )
    })
    if (mouse.current) {
      const degrees = Math.sin(time * 1.5) * 4 + sway * 0.6
      mouse.current.setAttribute(
        'transform',
        `rotate(${degrees.toFixed(3)} ${MOUSE_PIVOT.x} ${MOUSE_PIVOT.y})`,
      )
    }
    if (fallingLeaf.current) {
      const pose = fallingLeafPose(time)
      fallingLeaf.current.setAttribute(
        'transform',
        `translate(${pose.x.toFixed(1)} ${pose.y.toFixed(1)}) rotate(${pose.rotation.toFixed(1)})`,
      )
      fallingLeaf.current.setAttribute('opacity', pose.opacity.toFixed(2))
    }
  })

  return (
    <g data-entrance-reveal>
      <ellipse
        cx={PIT.cx}
        cy={PIT.cy}
        rx={PIT.rx}
        ry={PIT.ry}
        fill={STONE}
        stroke={INK}
        strokeWidth="1.6"
      />
      <ellipse
        cx={PIT.cx}
        cy={PIT.cy}
        rx={PIT.innerRx}
        ry={PIT.innerRy}
        fill={BARK}
        stroke={INK}
        strokeWidth="1.2"
      />
      <path d={TRUNK} fill={BARK} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path
        d={ROOTS}
        fill={BARK}
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d={BARK_STROKES}
        fill="none"
        stroke={INK}
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path d={KNOTS} fill={WOOD_LIGHT} stroke={INK} strokeWidth="1.2" />
      <g ref={crown}>
        <path
          d={TWIGS}
          fill={WOOD}
          stroke={INK}
          strokeWidth="1.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {LIMBS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill={BARK}
            stroke={INK}
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {CLUSTERS.map((cluster, i) => (
          <g
            key={i}
            ref={(el) => {
              clusters.current[i] = el
            }}
          >
            <path
              d={cluster.outline}
              fill={LAYER_FILL[cluster.layer]}
              stroke={INK}
              strokeWidth={LAYER_STROKE[cluster.layer]}
              strokeLinejoin="round"
            />
            {cluster.hatch && (
              <path
                d={cluster.hatch}
                fill="none"
                stroke={INK}
                strokeWidth="0.8"
                strokeLinecap="round"
                opacity="0.55"
              />
            )}
            {cluster.leaves && (
              <path
                d={cluster.leaves}
                fill={LAYER_FILL[cluster.layer]}
                stroke={INK}
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            )}
          </g>
        ))}
        <g ref={mouse} fill={MOUSE} stroke={INK} strokeWidth="1.6" strokeLinejoin="round">
          <ellipse cx="409.5" cy="408" rx="2.4" ry="5.5" fill="none" strokeWidth="1.1" />
          <ellipse cx="414.5" cy="408" rx="2.4" ry="5.5" fill="none" strokeWidth="1.1" />
          <path d="M412 413.5 C 414.5 424, 409.5 436, 412 446" fill="none" strokeWidth="1.2" />
          <path
            d="M423 478 C 436 476, 441 466, 434 460 C 429.5 456.5, 425.5 462, 430 464.5"
            fill="none"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <ellipse cx="412" cy="476" rx="11.5" ry="9.5" />
          <ellipse cx="406.5" cy="486" rx="3.6" ry="2" strokeWidth="1.1" />
          <ellipse cx="417.5" cy="486" rx="3.6" ry="2" strokeWidth="1.1" />
          <circle cx="403.5" cy="450.5" r="5.8" />
          <circle cx="420.5" cy="450.5" r="5.8" />
          <circle cx="403.5" cy="450.5" r="3" fill={PINK} stroke="none" />
          <circle cx="420.5" cy="450.5" r="3" fill={PINK} stroke="none" />
          <circle cx="412" cy="459" r="9.5" />
          <circle cx="408.5" cy="446.5" r="2.6" strokeWidth="1.2" />
          <circle cx="415.5" cy="446.5" r="2.6" strokeWidth="1.2" />
          <circle cx="408.5" cy="457.5" r="1.7" fill={INK} stroke="none" />
          <circle cx="415.5" cy="457.5" r="1.7" fill={INK} stroke="none" />
          <path d="M412 462.5 l-2 2.6 h4 Z" fill={INK} stroke="none" />
          <path
            d="M410.5 466 q1.5 1.6 3 0 M405 463 l-8 -2 M405 465.5 l-8 1.5 M419 463 l8 -2 M419 465.5 l8 1.5"
            fill="none"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </g>
      </g>
      <path
        d={`M${PIT.cx - PIT.rx} ${PIT.cy} A${PIT.rx} ${PIT.ry} 0 0 0 ${PIT.cx + PIT.rx} ${PIT.cy}`}
        fill={STONE}
        stroke={INK}
        strokeWidth="1.6"
      />
      <path
        d={`M${PIT.cx - PIT.innerRx} ${PIT.cy} A${PIT.innerRx} ${PIT.innerRy} 0 0 0 ${PIT.cx + PIT.innerRx} ${PIT.cy}`}
        fill={BARK}
        stroke={INK}
        strokeWidth="1.2"
      />
      <path d={GRATE} fill="none" stroke={INK} strokeWidth="0.8" strokeLinecap="round" />
      <g
        ref={fallingLeaf}
        transform={`translate(${LEAF_STARTS[0].x} ${LEAF_STARTS[0].y})`}
        opacity={animate ? 1 : 0}
      >
        <path d={FALLING_LEAF} fill={accentHex.ochre} stroke={INK} strokeWidth="1.2" />
      </g>
    </g>
  )
}
