import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { gsap } from '@/shared/utils/gsap'
import { activateOnKey } from '@/shared/utils/keys'
import { CREAM, INK, METAL_DARK } from '@/features/entrance/shared'
import { useTicker } from '@/features/entrance/useTicker'
import {
  BUG_ABDOMEN,
  BUG_ANTENNAE,
  BUG_EYE,
  BUG_EYES,
  BUG_HATCH,
  BUG_HEAD,
  BUG_HIGHLIGHTS,
  BUG_HOME,
  BUG_LEGS_A,
  BUG_LEGS_B,
  BUG_PIVOT,
  BUG_SEGMENTS,
  BUG_SHEEN,
  BUG_THORAX,
  BUG_THORAX_STRIPES,
  BUG_WING,
  BUG_WING_VEINS,
  SPLAT,
  SPLAT_DROPS,
  SPLAT_STREAKS,
} from './bugGeometry'

interface BugHuntProps {
  animate: boolean
}

const FLY_BODY = '#2f4d8f'
const FLY_SHEEN = '#4fb0bf'
const FLY_THORAX = '#46525e'
const FLY_HEAD = '#3a3f46'
const FLY_EYE = '#a63a2a'
const FLY_GUTS = '#2c3a2b'
const WING_REST = 60
const degrees = (radians: number) => ((radians * 180) / Math.PI).toFixed(2)

function Wing() {
  return (
    <>
      <path
        d={BUG_WING}
        fill={CREAM}
        fillOpacity="0.35"
        stroke={INK}
        strokeWidth="0.7"
        strokeOpacity="0.8"
        strokeLinejoin="round"
      />
      <path
        d={BUG_WING_VEINS}
        fill="none"
        stroke={METAL_DARK}
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.8"
      />
    </>
  )
}

function Legs({ legRef, d }: { legRef: RefObject<SVGPathElement | null>; d: string }) {
  return (
    <path
      ref={legRef}
      d={d}
      fill="none"
      stroke={INK}
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

function Body() {
  return (
    <>
      <ellipse
        cx={BUG_ABDOMEN.cx}
        rx={BUG_ABDOMEN.rx}
        ry={BUG_ABDOMEN.ry}
        fill={FLY_BODY}
        stroke={INK}
        strokeWidth="1.4"
      />
      <path d={BUG_SHEEN} fill={FLY_SHEEN} opacity="0.85" />
      <path d={BUG_SEGMENTS} fill="none" stroke={INK} strokeWidth="0.8" opacity="0.7" />
      <ellipse
        cx={BUG_THORAX.cx}
        rx={BUG_THORAX.rx}
        ry={BUG_THORAX.ry}
        fill={FLY_THORAX}
        stroke={INK}
        strokeWidth="1.4"
      />
      <path d={BUG_THORAX_STRIPES} fill="none" stroke={INK} strokeWidth="0.9" opacity="0.6" />
      <path
        d={BUG_HATCH}
        clipPath="url(#bug-body-clip)"
        fill="none"
        stroke={INK}
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d={BUG_HIGHLIGHTS}
        fill="none"
        stroke={CREAM}
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.75"
      />
    </>
  )
}

function Head() {
  return (
    <>
      <ellipse
        cx={BUG_HEAD.cx}
        rx={BUG_HEAD.rx}
        ry={BUG_HEAD.ry}
        fill={FLY_HEAD}
        stroke={INK}
        strokeWidth="1.2"
      />
      {BUG_EYES.map(({ cx, cy, angle }) => (
        <g key={cy} transform={`rotate(${angle} ${cx} ${cy})`}>
          <ellipse
            cx={cx}
            cy={cy}
            rx={BUG_EYE.rx}
            ry={BUG_EYE.ry}
            fill={FLY_EYE}
            stroke={INK}
            strokeWidth="0.7"
          />
          <circle cx={cx - 0.9} cy={cy - 0.5} r="0.55" fill={CREAM} opacity="0.9" />
        </g>
      ))}
      <path d={BUG_ANTENNAE} fill="none" stroke={INK} strokeWidth="0.8" strokeLinecap="round" />
    </>
  )
}

export function BugHunt({ animate }: BugHuntProps) {
  const bug = useRef<SVGGElement>(null)
  const wingTop = useRef<SVGGElement>(null)
  const wingBottom = useRef<SVGGElement>(null)
  const legsA = useRef<SVGPathElement>(null)
  const legsB = useRef<SVGPathElement>(null)
  const splash = useRef<SVGGElement>(null)
  const drops = useRef<SVGGElement>(null)
  const label = useRef<SVGGElement>(null)
  const labelClip = useRef<SVGRectElement>(null)
  const position = useRef({ ...BUG_HOME })
  const heading = useRef(0)
  const [fixed, setFixed] = useState(false)

  useEffect(() => {
    const targets = [splash.current, drops.current, label.current, labelClip.current]
    return () => gsap.killTweensOf(targets)
  }, [])

  useTicker(animate && !fixed, (time, delta) => {
    const element = bug.current
    if (!element) return
    const dx = Math.sin(time * 0.8) * 40 + Math.sin(time * 1.5) * 12
    const dy = Math.cos(time * 0.6) * 24 + Math.cos(time * 1.1) * 12
    const vx = Math.cos(time * 0.8) * 32 + Math.cos(time * 1.5) * 18
    const vy = -Math.sin(time * 0.6) * 14.4 - Math.sin(time * 1.1) * 13.2
    const turn = Math.atan2(vy, vx) + Math.PI - heading.current
    heading.current += Math.atan2(Math.sin(turn), Math.cos(turn)) * Math.min(1, delta * 6)
    position.current = { x: BUG_HOME.x + dx, y: BUG_HOME.y + dy }
    const x = position.current.x + Math.sin(time * 23) * 1.4
    const y = position.current.y + Math.cos(time * 29) * 1.4
    const bank = heading.current + Math.sin(time * 5) * 0.08
    element.setAttribute(
      'transform',
      `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${degrees(bank)})`,
    )
    const beat = (40 + (Math.sin(time * 40) + 1) * 22).toFixed(1)
    wingTop.current?.setAttribute('transform', `rotate(-${beat} ${BUG_PIVOT.wing} 0)`)
    wingBottom.current?.setAttribute(
      'transform',
      `scale(1 -1) rotate(-${beat} ${BUG_PIVOT.wing} 0)`,
    )
    const swing = Math.sin(time * 12) * 7
    legsA.current?.setAttribute('transform', `rotate(${swing.toFixed(1)} ${BUG_PIVOT.legs} 0)`)
    legsB.current?.setAttribute('transform', `rotate(${(-swing).toFixed(1)} ${BUG_PIVOT.legs} 0)`)
  })

  const fixBug = () => {
    if (fixed) return
    const { x, y } = position.current
    const speed = animate ? 1 : 0
    setFixed(true)
    if (splash.current && drops.current) {
      gsap.set(splash.current, { x, y, scale: 0, opacity: 1, transformOrigin: '50% 50%' })
      gsap.to(splash.current, { scale: 1, duration: 0.4 * speed, ease: 'back.out(1.7)' })
      gsap.fromTo(
        drops.current,
        { scale: 0.2, opacity: 0, transformOrigin: '50% 50%' },
        { scale: 1, opacity: 1, duration: 0.5 * speed, delay: 0.08 * speed, ease: 'power3.out' },
      )
      gsap.to(splash.current, {
        opacity: 0,
        duration: 1 * speed,
        ease: 'power2.out',
        delay: 2.3,
      })
    }
    if (label.current && labelClip.current) {
      gsap.set(label.current, { x, y })
      gsap.fromTo(
        labelClip.current,
        { attr: { width: 0 } },
        { attr: { width: 220 }, duration: 0.8 * speed, ease: 'power1.inOut' },
      )
    }
  }

  return (
    <g>
      <defs>
        <clipPath id="bug-fixed-clip">
          <rect ref={labelClip} x="-110" y="-30" width="0" height="60" />
        </clipPath>
        <clipPath id="bug-body-clip">
          <ellipse cx={BUG_ABDOMEN.cx} rx={BUG_ABDOMEN.rx} ry={BUG_ABDOMEN.ry} />
          <ellipse cx={BUG_THORAX.cx} rx={BUG_THORAX.rx} ry={BUG_THORAX.ry} />
        </clipPath>
      </defs>
      {!fixed && (
        <g
          ref={bug}
          role="button"
          tabIndex={0}
          aria-label="Squash the bug"
          className="pointer-events-auto cursor-pointer outline-none"
          transform={`translate(${BUG_HOME.x} ${BUG_HOME.y})`}
          onClick={fixBug}
          onKeyDown={(event) => activateOnKey(event, fixBug)}
        >
          <circle r="20" fill="transparent" />
          <Legs legRef={legsA} d={BUG_LEGS_A} />
          <Legs legRef={legsB} d={BUG_LEGS_B} />
          <Body />
          <g ref={wingTop} transform={`rotate(-${WING_REST} ${BUG_PIVOT.wing} 0)`}>
            <Wing />
          </g>
          <g ref={wingBottom} transform={`scale(1 -1) rotate(-${WING_REST} ${BUG_PIVOT.wing} 0)`}>
            <Wing />
          </g>
          <Head />
        </g>
      )}
      <g ref={splash} opacity="0">
        <path d={SPLAT} fill={FLY_GUTS} />
        <path d={SPLAT_STREAKS} fill={FLY_GUTS} opacity="0.85" />
        <g ref={drops}>
          {SPLAT_DROPS.map((drop) => (
            <ellipse
              key={`${drop.cx},${drop.cy}`}
              cx={drop.cx}
              cy={drop.cy}
              rx={drop.rx}
              ry={drop.ry}
              transform={`rotate(${drop.angle} ${drop.cx} ${drop.cy})`}
              fill={FLY_GUTS}
              opacity="0.85"
            />
          ))}
        </g>
      </g>
      <g ref={label} clipPath="url(#bug-fixed-clip)">
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="Caveat, cursive"
          fontSize="40"
          fontWeight="700"
          fill={INK}
          stroke={CREAM}
          strokeWidth="6"
          paintOrder="stroke"
        >
          BUG FIXED!
        </text>
      </g>
    </g>
  )
}
