import { useEffect, useRef } from 'react'
import { CREAM, INK, cloudPath } from '@/features/entrance/shared'
import { useTicker } from '@/features/entrance/useTicker'

interface StreetPropsProps {
  animate: boolean
}

const MOUSE_PIVOT = { x: 412, y: 408 }
const EYE_Y = 640
const BLINK_SECONDS = 0.16

export function StreetProps({ animate }: StreetPropsProps) {
  const mouse = useRef<SVGGElement>(null)
  const pupils = useRef<SVGGElement>(null)
  const lids = useRef<SVGRectElement>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const eyes = useRef({ x: 0, y: 0, nextBlink: 2.5, blinkStart: -1 })

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
    if (mouse.current) {
      const degrees = ((Math.sin(time * 1.5) * 0.07 * 180) / Math.PI).toFixed(3)
      mouse.current.setAttribute(
        'transform',
        `rotate(${degrees} ${MOUSE_PIVOT.x} ${MOUSE_PIVOT.y})`,
      )
    }
    const state = eyes.current
    state.x += (pointer.current.x * 3.5 - state.x) * 0.1
    state.y += (pointer.current.y * 3 - state.y) * 0.1
    pupils.current?.setAttribute(
      'transform',
      `translate(${state.x.toFixed(2)} ${state.y.toFixed(2)})`,
    )
    if (time >= state.nextBlink) {
      state.blinkStart = time
      state.nextBlink = time + 3 + Math.random() * 4
    }
    const since = time - state.blinkStart
    const closed =
      since >= 0 && since < BLINK_SECONDS ? Math.sin((since / BLINK_SECONDS) * Math.PI) : 0
    lids.current?.setAttribute('height', (closed * 16).toFixed(2))
  })

  return (
    <svg
      viewBox="0 0 1600 900"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="cat-head">
          <circle cx="590" cy="642" r="27" />
        </clipPath>
      </defs>

      <g data-entrance-reveal>
        <path
          d="M292 760 C 302 660, 276 570, 298 470 C 312 440, 330 420, 338 400 M298 470 C 322 480, 352 520, 342 760 M310 505 C 270 470, 240 430, 232 392 M326 455 C 350 430, 380 420, 412 408"
          fill="none"
          stroke={INK}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d={cloudPath(290, 300, 190, 120, 14, 3)}
          fill={CREAM}
          stroke={INK}
          strokeWidth="2.4"
        />
        <path
          d={cloudPath(330, 215, 170, 110, 13, 5)}
          fill={CREAM}
          stroke={INK}
          strokeWidth="2.4"
        />
        <path d={cloudPath(230, 345, 110, 80, 11, 7)} fill={CREAM} stroke={INK} strokeWidth="2.2" />
        <path d={cloudPath(430, 320, 100, 70, 10, 9)} fill={CREAM} stroke={INK} strokeWidth="2.2" />
        <path
          d={cloudPath(300, 150, 110, 60, 10, 11)}
          fill={CREAM}
          stroke={INK}
          strokeWidth="2.2"
        />
        <g fill="none" stroke={INK} strokeWidth="1.2" opacity="0.5">
          <path d="M215 300 q20 -18 42 -4 M330 250 q18 -14 40 2 M250 370 q14 -12 32 -2 M400 330 q16 -14 34 -2" />
        </g>
        <g ref={mouse} fill={CREAM} stroke={INK} strokeWidth="1.8" strokeLinejoin="round">
          <path
            d="M412 408 C 418 422, 406 436, 412 452"
            fill="none"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <ellipse cx="412" cy="463" rx="13" ry="9.5" />
          <circle cx="403" cy="455" r="4.5" />
          <circle cx="421" cy="455" r="4.5" />
          <circle cx="407" cy="461" r="1.6" fill={INK} stroke="none" />
          <circle cx="417" cy="461" r="1.6" fill={INK} stroke="none" />
          <path d="M412 466 l-2 3 h4 Z" fill={INK} stroke="none" />
          <path
            d="M398 468 l-9 -2 M398 471 l-9 2 M426 468 l9 -2 M426 471 l9 2"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </g>
      </g>

      <g data-entrance-reveal fill={CREAM} stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
        <path d="M560 760 C 548 720, 556 672, 590 664 C 624 672, 634 718, 622 760 Z" />
        <path d="M622 752 C 648 748, 660 724, 646 700" fill="none" strokeLinecap="round" />
        <circle cx="590" cy="642" r="28" />
        <path d="M568 626 l-6 -26 l22 14 Z M612 626 l6 -26 l-22 14 Z" />
        <ellipse cx="580" cy={EYE_Y} rx="5.5" ry="6.5" strokeWidth="1.3" />
        <ellipse cx="600" cy={EYE_Y} rx="5.5" ry="6.5" strokeWidth="1.3" />
        <g ref={pupils} fill={INK} stroke="none">
          <circle cx="580" cy={EYE_Y} r="2.6" />
          <circle cx="600" cy={EYE_Y} r="2.6" />
        </g>
        <g clipPath="url(#cat-head)">
          <rect ref={lids} x="570" y="632" width="40" height="0" fill={CREAM} stroke="none" />
        </g>
        <path
          d="M586 650 l4 4 l4 -4 M572 652 l-14 -2 M608 652 l14 -2 M574 658 l-13 3 M606 658 l13 3"
          fill="none"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}
