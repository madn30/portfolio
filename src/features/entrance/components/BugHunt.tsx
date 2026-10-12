import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/shared/utils/gsap'
import { activateOnKey } from '@/shared/utils/keys'
import { CREAM, INK, cloudPath } from '@/features/entrance/shared'
import { useTicker } from '@/features/entrance/useTicker'

interface BugHuntProps {
  animate: boolean
}

const HOME = { x: 1175, y: 330 }
const LEGS = 'M-8 -3 l-8 -5 M-9 1 l-9 1 M-8 5 l-8 5 M8 -3 l8 -5 M9 1 l9 1 M8 5 l8 5'

export function BugHunt({ animate }: BugHuntProps) {
  const bug = useRef<SVGGElement>(null)
  const splash = useRef<SVGGElement>(null)
  const label = useRef<SVGGElement>(null)
  const labelClip = useRef<SVGRectElement>(null)
  const position = useRef({ ...HOME })
  const [fixed, setFixed] = useState(false)

  useEffect(() => {
    const targets = [splash.current, label.current, labelClip.current]
    return () => gsap.killTweensOf(targets)
  }, [])

  useTicker(animate && !fixed, (time) => {
    const element = bug.current
    if (!element) return
    const dx = Math.sin(time * 0.8) * 42 + Math.sin(time * 1.5) * 14
    const dy = Math.cos(time * 0.6) * 28 + Math.cos(time * 1.1) * 14
    const tilt = Math.sin(time * 5) * 0.1 + Math.atan2(dy, dx) * 0.2
    position.current = { x: HOME.x + dx, y: HOME.y + dy }
    const degrees = ((tilt * 180) / Math.PI).toFixed(2)
    element.setAttribute(
      'transform',
      `translate(${position.current.x.toFixed(2)} ${position.current.y.toFixed(2)}) rotate(${degrees})`,
    )
  })

  const fixBug = () => {
    if (fixed) return
    const { x, y } = position.current
    setFixed(true)
    if (splash.current) {
      gsap.set(splash.current, { x, y, scale: 0, opacity: 1, transformOrigin: '50% 50%' })
      gsap.to(splash.current, { scale: 1, duration: animate ? 0.4 : 0, ease: 'back.out(1.7)' })
      gsap.to(splash.current, {
        opacity: 0,
        duration: animate ? 1 : 0,
        ease: 'power2.out',
        delay: 2.3,
      })
    }
    if (label.current && labelClip.current) {
      gsap.set(label.current, { x, y })
      gsap.fromTo(
        labelClip.current,
        { attr: { width: 0 } },
        { attr: { width: 220 }, duration: animate ? 0.8 : 0, ease: 'power1.inOut' },
      )
    }
  }

  return (
    <g>
      <defs>
        <clipPath id="bug-fixed-clip">
          <rect ref={labelClip} x="-110" y="-30" width="0" height="60" />
        </clipPath>
      </defs>
      {!fixed && (
        <g
          ref={bug}
          role="button"
          tabIndex={0}
          aria-label="Squash the bug"
          className="pointer-events-auto cursor-pointer outline-none"
          transform={`translate(${HOME.x} ${HOME.y})`}
          onClick={fixBug}
          onKeyDown={(event) => activateOnKey(event, fixBug)}
        >
          <circle r="18" fill="transparent" />
          <path d={LEGS} stroke={INK} strokeWidth="1.4" strokeLinecap="round" />
          <ellipse rx="9" ry="7" fill={CREAM} stroke={INK} strokeWidth="1.8" />
          <path d="M0 -7 V7" stroke={INK} strokeWidth="1.2" />
          <circle cx="-4" cy="-2" r="1.6" fill={INK} />
          <circle cx="4" cy="3" r="1.6" fill={INK} />
          <circle cx="-11" cy="0" r="4" fill={INK} />
          <path
            d="M-13 -3 l-5 -5 M-13 3 l-5 5"
            stroke={INK}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>
      )}
      <g ref={splash} opacity="0">
        <path d={cloudPath(0, 0, 40, 32, 9, 41)} fill={INK} opacity="0.85" />
        <circle cx="-48" cy="-22" r="5" fill={INK} opacity="0.8" />
        <circle cx="46" cy="18" r="4" fill={INK} opacity="0.8" />
        <circle cx="12" cy="-44" r="3" fill={INK} opacity="0.8" />
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
