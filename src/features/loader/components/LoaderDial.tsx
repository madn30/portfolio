import type { RefObject } from 'react'

function Ring({ animate }: { animate: boolean }) {
  return (
    <svg
      width="150"
      height="150"
      viewBox="0 0 100 100"
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible"
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="#262421"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="10 15"
        opacity="0.8"
      >
        {animate && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="10s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="none"
        stroke="#262421"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="5 10"
        opacity="0.5"
      >
        {animate && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="360 50 50"
            to="0 50 50"
            dur="4s"
            repeatCount="indefinite"
          />
        )}
      </circle>
    </svg>
  )
}

interface PercentageProps {
  labelRef: RefObject<HTMLSpanElement | null>
  text: string
  animate: boolean
}

export function Percentage({ labelRef, text, animate }: PercentageProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-24">
      <div className="relative flex h-[150px] w-[150px] items-center justify-center">
        <Ring animate={animate} />
        <span
          ref={labelRef}
          className="font-display text-3xl font-semibold tabular-nums text-ink mix-blend-multiply"
        >
          {text}
        </span>
      </div>
      <p className="font-hand text-xl text-charcoal">sketching the corridor…</p>
    </div>
  )
}
