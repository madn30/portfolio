import { useEffect, useRef } from 'react'
import { BRASS, FUR as COAT, INK, LEAF_LIGHT, PAPER, PINK, RED } from '@/features/entrance/shared'
import { useTicker } from '@/features/entrance/useTicker'
import { blinkEnd, blinkNow, lidClosed, scheduleBlink } from '@/shared/utils/blink'
import {
  BACK_STRIPES,
  BIB,
  BODY,
  BROWS,
  CAT_BASE,
  CHEEK_STRIPES,
  COAT_FUR,
  COLLAR,
  EAR_LEFT,
  EAR_LEFT_INNER,
  EAR_PIVOT,
  EAR_RIGHT,
  EAR_RIGHT_INNER,
  EAR_TUFTS,
  FOREHEAD,
  HAUNCH,
  HAUNCH_FOLD,
  HAUNCH_STRIPES,
  HEAD,
  HIND_PAW,
  LEG_SPLIT,
  MOUTH,
  MUZZLE,
  NOSE,
  PAWS,
  RUFFS,
  SHADE,
  TAIL_ROOT,
  TAIL_SPLIT,
  TOES,
  WHISKERS,
  WHISKER_DOTS,
  eyesPath,
  tailPath,
  tailStripes,
} from './catGeometry'

interface CatProps {
  animate: boolean
}

const BELLY = '#fbe9d2'
const STRIPE = '#bf6a24'
const FLICK_SECONDS = 0.28
const GAZE_BLINK_JUMP = 3
const GAZE_BLINK_REST = 1.2
const SLOW_BLINK_CHANCE = 0.12
const OPEN_EYES = eyesPath(0)

export function Cat({ animate }: CatProps) {
  const body = useRef<SVGGElement>(null)
  const ear = useRef<SVGGElement>(null)
  const pupils = useRef<SVGGElement>(null)
  const eyes = useRef<SVGPathElement>(null)
  const eyesClip = useRef<SVGPathElement>(null)
  const tail = useRef<SVGPathElement>(null)
  const tailRings = useRef<SVGPathElement>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const state = useRef({
    x: 0,
    y: 0,
    blink: { start: 2.5, close: 0.07, hold: 0.03, open: 0.16 },
    blinkedAt: 0,
    nextFlick: 4,
    flickStart: -1,
  })

  useEffect(() => {
    if (!animate) return
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [animate])

  useTicker(animate, (time) => {
    const s = state.current
    const gazeX = pointer.current.x * 3
    const gazeY = pointer.current.y * 2
    const jump = Math.hypot(gazeX - s.x, gazeY - s.y)
    s.x += (gazeX - s.x) * 0.1
    s.y += (gazeY - s.y) * 0.1

    if (time >= blinkEnd(s.blink)) {
      s.blinkedAt = time
      s.blink = scheduleBlink(time, SLOW_BLINK_CHANCE)
    } else if (
      jump > GAZE_BLINK_JUMP &&
      time < s.blink.start &&
      time - s.blinkedAt > GAZE_BLINK_REST
    ) {
      s.blink = blinkNow(time)
    }
    const closed = lidClosed(s.blink, time)
    const eyesShape = eyesPath(closed)
    eyes.current?.setAttribute('d', eyesShape)
    eyesClip.current?.setAttribute('d', eyesShape)
    pupils.current?.setAttribute(
      'transform',
      `translate(${s.x.toFixed(2)} ${(s.y + closed * 0.8).toFixed(2)})`,
    )

    if (time >= s.nextFlick) {
      s.flickStart = time
      s.nextFlick = time + 5 + Math.random() * 6
    }
    const sinceFlick = time - s.flickStart
    const flick =
      sinceFlick >= 0 && sinceFlick < FLICK_SECONDS
        ? Math.sin((sinceFlick / FLICK_SECONDS) * Math.PI) * -14
        : 0
    ear.current?.setAttribute(
      'transform',
      `rotate(${flick.toFixed(2)} ${EAR_PIVOT.x} ${EAR_PIVOT.y})`,
    )

    const breath = 1.005 + Math.sin(time * 1.6) * 0.005
    body.current?.setAttribute(
      'transform',
      `translate(${CAT_BASE.x} ${CAT_BASE.y}) scale(${breath.toFixed(4)}) translate(${-CAT_BASE.x} ${-CAT_BASE.y})`,
    )

    const sway = Math.sin(time * 1.1) * 0.6 + Math.sin(time * 2.7) * 0.4
    tail.current?.setAttribute('d', tailPath(sway, TAIL_SPLIT))
    tailRings.current?.setAttribute('d', tailStripes(sway))
  })

  return (
    <g data-entrance-reveal fill={COAT} stroke={INK} strokeWidth="2" strokeLinejoin="round">
      <defs>
        <clipPath id="cat-eyes">
          <path ref={eyesClip} d={OPEN_EYES} />
        </clipPath>
      </defs>
      <g ref={body}>
        <path d={TAIL_ROOT} />
        <path d={HAUNCH} />
        <path
          d={HAUNCH_STRIPES}
          fill="none"
          stroke={STRIPE}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path d={HAUNCH_FOLD} fill="none" strokeWidth="1.6" strokeLinecap="round" />
        <path d={HIND_PAW} strokeWidth="1.6" strokeLinecap="round" />
        <path d={BODY} />
        <path d={BIB} fill={BELLY} stroke="none" />
        <path
          d={BACK_STRIPES}
          fill="none"
          stroke={STRIPE}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path d={LEG_SPLIT} fill="none" strokeWidth="1.6" strokeLinecap="round" />
        <path d={PAWS} strokeWidth="1.6" strokeLinecap="round" />
        <path d={TOES} fill="none" strokeWidth="0.8" strokeLinecap="round" />
        <path d={SHADE} fill="none" stroke={STRIPE} strokeWidth="0.7" strokeLinecap="round" />
        <path d={COLLAR} fill={RED} strokeWidth="1.6" />
        <circle cx="616" cy="674" r="4.2" fill={BRASS} strokeWidth="1.6" />
        <path d="M613.5 675 l5 0" fill="none" strokeWidth="0.8" strokeLinecap="round" />
        <path d={EAR_LEFT} />
        <path d={EAR_LEFT_INNER} fill={PINK} strokeWidth="0.8" />
        <g ref={ear}>
          <path d={EAR_RIGHT} />
          <path d={EAR_RIGHT_INNER} fill={PINK} strokeWidth="0.8" />
        </g>
        <path d={HEAD} />
        <path d={EAR_TUFTS} fill="none" strokeWidth="0.8" strokeLinecap="round" />
        <path d={RUFFS} fill="none" strokeWidth="1.6" strokeLinecap="round" />
        <path d={MUZZLE} fill={BELLY} stroke="none" />
        <path d={FOREHEAD} fill="none" stroke={STRIPE} strokeWidth="1.8" strokeLinecap="round" />
        <path
          d={CHEEK_STRIPES}
          fill="none"
          stroke={STRIPE}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path d={COAT_FUR} fill="none" strokeWidth="0.9" strokeLinecap="round" />
        <path ref={eyes} d={OPEN_EYES} fill={LEAF_LIGHT} strokeWidth="1.6" />
        <g clipPath="url(#cat-eyes)">
          <g ref={pupils} fill={INK} stroke="none">
            <ellipse cx="600" cy="621" rx="1.8" ry="5" />
            <ellipse cx="627" cy="622" rx="1.7" ry="4.8" />
          </g>
          <g fill={PAPER} stroke="none">
            <circle cx="601.6" cy="618.6" r="1.1" />
            <circle cx="628.4" cy="619.6" r="1" />
          </g>
        </g>
        <path d={BROWS} fill="none" strokeWidth="0.8" strokeLinecap="round" />
        <path d={NOSE} fill={PINK} strokeWidth="0.9" />
        <path d={MOUTH} fill="none" strokeWidth="1.4" strokeLinecap="round" />
        <path d={WHISKER_DOTS} fill="none" strokeWidth="1.4" strokeLinecap="round" />
        <path d={WHISKERS} fill="none" strokeWidth="0.8" strokeLinecap="round" />
      </g>
      <path ref={tail} d={tailPath(0, TAIL_SPLIT)} strokeLinecap="round" />
      <path
        ref={tailRings}
        d={tailStripes(0)}
        fill="none"
        stroke={STRIPE}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </g>
  )
}
