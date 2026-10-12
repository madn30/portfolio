import type { ReactNode } from 'react'
import { tornClipPath, tornPathD } from './tornEdge'

interface TornSheetProps {
  className?: string
  children: ReactNode
}

const INK = '#262421'
const AMPLITUDE = 2.5

export function TornSheet({ className = '', children }: TornSheetProps) {
  const d = tornPathD(AMPLITUDE)
  return (
    <div className="torn-wrap">
      <div className={`torn ${className}`} style={{ clipPath: tornClipPath(AMPLITUDE) }}>
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 z-10 h-full w-full"
        >
          <path
            d={d}
            fill="none"
            stroke={INK}
            strokeWidth="1.6"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={d}
            fill="none"
            stroke={INK}
            strokeWidth="1"
            strokeOpacity="0.35"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            transform="translate(0.5 0.6)"
          />
        </svg>
        {children}
      </div>
    </div>
  )
}
