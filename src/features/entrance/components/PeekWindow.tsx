import { useEffect, useRef } from 'react'
import { gsap } from '@/shared/utils/gsap'
import { CREAM, INK, LEAF, PAPER, WOOD, canHover } from '@/features/entrance/shared'

interface PeekWindowProps {
  animate: boolean
}

export function PeekWindow({ animate }: PeekWindowProps) {
  const avatar = useRef<SVGGElement>(null)

  useEffect(() => {
    const target = avatar.current
    return () => gsap.killTweensOf(target)
  }, [])

  const peek = (out: boolean) => {
    if (!animate || !canHover() || !avatar.current) return
    gsap.to(avatar.current, {
      x: out ? 0 : 150,
      rotation: out ? 6 : 0,
      transformOrigin: '50% 100%',
      duration: out ? 0.5 : 0.4,
      ease: out ? 'back.out(1.7)' : 'power2.in',
      overwrite: true,
    })
  }

  return (
    <g data-entrance-reveal onPointerEnter={() => peek(true)} onPointerLeave={() => peek(false)}>
      <rect
        x="1070"
        y="400"
        width="210"
        height="190"
        fill={CREAM}
        stroke={INK}
        strokeWidth="3"
        className="pointer-events-auto"
      />
      <rect x="1084" y="414" width="182" height="162" fill={PAPER} stroke={INK} strokeWidth="1.6" />
      <g clipPath="url(#window-pane)">
        <g ref={avatar} transform="translate(150 0)">
          <path
            d="M1130 576 C 1134 540, 1150 530, 1175 530 C 1200 530, 1216 540, 1220 576 Z"
            fill={LEAF}
            stroke={INK}
            strokeWidth="2"
          />
          <path
            d="M1214 544 C 1228 530, 1236 516, 1238 498"
            fill="none"
            stroke={INK}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="1240" cy="492" r="8" fill={CREAM} stroke={INK} strokeWidth="1.8" />
          <path
            d="M1236 486 l-2 -7 M1241 485 l1 -8 M1246 487 l4 -6"
            stroke={INK}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="1175" cy="500" r="26" fill={CREAM} stroke={INK} strokeWidth="2" />
          <path
            d="M1150 492 C 1152 472, 1166 466, 1178 470 C 1186 464, 1198 470, 1200 490"
            fill={CREAM}
            stroke={INK}
            strokeWidth="2"
          />
          <circle cx="1166" cy="500" r="2.2" fill={INK} />
          <circle cx="1184" cy="500" r="2.2" fill={INK} />
          <path
            d="M1166 512 q9 8 18 0"
            fill="none"
            stroke={INK}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>
      </g>
      <path d="M1175 414 V576 M1084 495 H1266" stroke={INK} strokeWidth="2" />
      <rect x="1056" y="590" width="238" height="14" fill={WOOD} stroke={INK} strokeWidth="2" />
    </g>
  )
}
