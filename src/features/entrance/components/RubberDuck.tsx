import { useEffect, useRef, useState } from 'react'
import { accentHex } from '@/data/siteConfig'
import { gsap } from '@/shared/utils/gsap'
import { activateOnKey } from '@/shared/utils/keys'
import { CREAM, INK, wrapWords } from '@/features/entrance/shared'

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
]

export function RubberDuck({ animate }: RubberDuckProps) {
  const bubble = useRef<SVGGElement>(null)
  const [quote, setQuote] = useState<string | null>(null)

  useEffect(() => {
    const target = bubble.current
    return () => gsap.killTweensOf(target)
  }, [])

  const quack = () => {
    if (quote || !bubble.current) return
    setQuote(DUCK_QUOTES[Math.floor(Math.random() * DUCK_QUOTES.length)])
    gsap.fromTo(
      bubble.current,
      { scale: 0 },
      {
        scale: 1,
        duration: animate ? 0.3 : 0,
        ease: 'back.out(1.7)',
        transformOrigin: '10% 100%',
      },
    )
    gsap.to(bubble.current, {
      scale: 0,
      duration: animate ? 0.2 : 0,
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
        onClick={quack}
        onKeyDown={(event) => activateOnKey(event, quack)}
      >
        <ellipse
          cx="1244"
          cy="628"
          rx="18"
          ry="12"
          fill={accentHex.ochre}
          stroke={INK}
          strokeWidth="1.8"
        />
        <circle cx="1256" cy="612" r="10" fill={accentHex.ochre} stroke={INK} strokeWidth="1.8" />
        <path
          d="M1265 612 l10 3 l-10 3 Z"
          fill={accentHex.terracotta}
          stroke={INK}
          strokeWidth="1.2"
        />
        <circle cx="1258" cy="609" r="1.8" fill={INK} />
        <path d="M1232 626 q6 -6 12 0" fill="none" stroke={INK} strokeWidth="1.2" />
      </g>
      <g ref={bubble} transform="translate(1246 600) scale(0)">
        <path
          d="M-6 -70 H176 q8 0 8 8 V-14 q0 8 -8 8 H30 L10 6 L14 -6 H2 q-8 0 -8 -8 V-62 q0 -8 8 -8 Z"
          fill={CREAM}
          stroke={INK}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <text
          x="89"
          y="-44"
          textAnchor="middle"
          fontFamily="Caveat, cursive"
          fontSize="19"
          fontWeight="600"
          fill={INK}
        >
          {quote &&
            wrapWords(quote, 22).map((line, i) => (
              <tspan key={line} x="89" dy={i === 0 ? 0 : 20}>
                {line}
              </tspan>
            ))}
        </text>
      </g>
    </>
  )
}
