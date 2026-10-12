import { useEffect, useRef, useState } from 'react'
import { accentHex } from '@/data/siteConfig'
import { gsap } from '@/shared/utils/gsap'
import { activateOnKey } from '@/shared/utils/keys'
import { CREAM, INK, PAPER, wrapWords } from '@/features/entrance/shared'
import {
  BUBBLE_ORIGIN,
  BUBBLE_OUTLINE,
  BUBBLE_SECOND_PASS,
  BUBBLE_TEXT,
  DUCK_BEAK,
  DUCK_BILL,
  DUCK_BODY,
  DUCK_EYE,
  DUCK_HEAD,
  DUCK_ORIGIN,
  DUCK_SHEEN,
  DUCK_WING,
} from './rubberDuckGeometry'

interface RubberDuckProps {
  animate: boolean
}

const DUCK_QUOTES = [
  'Have you tried console.log()?',
  'Did you clear the cache?',
  'Works on my machine.',
  'Turn it off and on again?',
  'Maybe it is a CSS issue.',
  'Read the error message twice.',
  'Is it plugged in?',
  'It is always the dependency array.',
  'Ship it, then fix it.',
  'Hire me, I can help.',
]

export function RubberDuck({ animate }: RubberDuckProps) {
  const duck = useRef<SVGGElement>(null)
  const bubble = useRef<SVGGElement>(null)
  const [quote, setQuote] = useState<string | null>(null)

  useEffect(() => {
    const targets = [duck.current, bubble.current]
    return () => gsap.killTweensOf(targets)
  }, [])

  const quack = () => {
    if (quote || !bubble.current || !duck.current) return
    setQuote(DUCK_QUOTES[Math.floor(Math.random() * DUCK_QUOTES.length)])
    const speed = animate ? 1 : 0
    gsap
      .timeline({ defaults: { transformOrigin: '50% 100%' } })
      .to(duck.current, { y: -7, rotation: -8, duration: 0.14 * speed, ease: 'power2.out' })
      .to(duck.current, { y: 0, rotation: 6, duration: 0.18 * speed, ease: 'power2.in' })
      .to(duck.current, { rotation: 0, duration: 0.7 * speed, ease: 'elastic.out(1, 0.35)' })
    gsap.fromTo(
      bubble.current,
      { scale: 0 },
      {
        scale: 1,
        duration: 0.3 * speed,
        ease: 'back.out(1.7)',
        transformOrigin: '6% 100%',
      },
    )
    gsap.to(bubble.current, {
      scale: 0,
      duration: 0.2 * speed,
      ease: 'power2.in',
      delay: 3,
      onComplete: () => setQuote(null),
    })
  }

  return (
    <>
      <g
        role="button"
        tabIndex={0}
        aria-label="Ask the rubber duck for debugging advice"
        className="pointer-events-auto cursor-pointer outline-none"
        transform={`translate(${DUCK_ORIGIN.x} ${DUCK_ORIGIN.y})`}
        onClick={quack}
        onKeyDown={(event) => activateOnKey(event, quack)}
      >
        <g ref={duck}>
          <path
            d={DUCK_BODY}
            fill={accentHex.ochre}
            stroke={INK}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d={DUCK_WING} fill="none" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
          <circle
            cx={DUCK_HEAD.cx}
            cy={DUCK_HEAD.cy}
            r={DUCK_HEAD.r}
            fill={accentHex.ochre}
            stroke={INK}
            strokeWidth="1.6"
          />
          <path
            d={DUCK_BEAK}
            fill={accentHex.terracotta}
            stroke={INK}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path d={DUCK_BILL} fill="none" stroke={INK} strokeWidth="0.8" strokeLinecap="round" />
          <path
            d={DUCK_SHEEN}
            fill="none"
            stroke={INK}
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.75"
          />
          <circle
            cx={DUCK_EYE.cx}
            cy={DUCK_EYE.cy}
            r={DUCK_EYE.r}
            fill={PAPER}
            stroke={INK}
            strokeWidth="0.8"
          />
          <circle cx={DUCK_EYE.cx + 0.8} cy={DUCK_EYE.cy - 0.8} r="0.8" fill={INK} />
        </g>
      </g>
      <g transform={`translate(${BUBBLE_ORIGIN.x} ${BUBBLE_ORIGIN.y})`}>
        <g ref={bubble} transform="scale(0)">
          <path
            d={BUBBLE_OUTLINE}
            fill={CREAM}
            stroke={INK}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d={BUBBLE_SECOND_PASS}
            fill="none"
            stroke={INK}
            strokeWidth="0.8"
            strokeLinejoin="round"
            opacity="0.45"
          />
          <text
            x={BUBBLE_TEXT.x}
            y={BUBBLE_TEXT.y}
            textAnchor="middle"
            fontFamily="Caveat, cursive"
            fontSize="19"
            fontWeight="600"
            fill={INK}
          >
            {quote &&
              wrapWords(quote, 22).map((line, i) => (
                <tspan key={line} x={BUBBLE_TEXT.x} dy={i === 0 ? 0 : BUBBLE_TEXT.lineHeight}>
                  {line}
                </tspan>
              ))}
          </text>
        </g>
      </g>
    </>
  )
}
