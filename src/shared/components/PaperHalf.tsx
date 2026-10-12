import type { ReactNode, Ref } from 'react'
import type { TearShape } from '@/shared/utils/tearPath'

interface PaperHalfProps {
  side: 'left' | 'right'
  shape: TearShape
  halfRef: Ref<HTMLDivElement>
  lineRef?: Ref<SVGPathElement>
  dash?: number
  children?: ReactNode
}

export function PaperHalf({ side, shape, halfRef, lineRef, dash, children }: PaperHalfProps) {
  return (
    <div
      ref={halfRef}
      className="absolute inset-0 bg-cream will-change-transform"
      style={{ clipPath: side === 'left' ? shape.leftClip : shape.rightClip }}
    >
      <div className="hatch absolute inset-0 opacity-30" />
      {children}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          ref={lineRef}
          d={shape.path}
          fill="none"
          stroke="#262421"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          pathLength={dash}
          style={dash ? { strokeDasharray: dash, strokeDashoffset: dash } : undefined}
        />
      </svg>
    </div>
  )
}
