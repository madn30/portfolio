import { useImperativeHandle, useRef, type Ref } from 'react'
import { play } from '@/app/audio'
import { gsap } from '@/shared/utils/gsap'
import { Leaf } from './FrontDoorLeaf'
import { PAINT_HIDDEN, handlePivot } from '@/features/entrance/frontDoorGeometry'
import { OPENING, canHover } from '@/features/entrance/shared'

export interface FrontDoorHandle {
  swingOpen: (timeline: gsap.core.Timeline) => void
}

interface FrontDoorProps {
  ref: Ref<FrontDoorHandle>
  disabled: boolean
  animate: boolean
  onEnter: () => void
}

const OPEN_ANGLE = 96
const AJAR_ANGLE = 4.6

export function FrontDoor({ ref, disabled, animate, onEnter }: FrontDoorProps) {
  const left = useRef<HTMLDivElement>(null)
  const right = useRef<HTMLDivElement>(null)
  const leftPaint = useRef<SVGPathElement>(null)
  const rightPaint = useRef<SVGPathElement>(null)
  const leftHandle = useRef<SVGGElement>(null)
  const rightHandle = useRef<SVGGElement>(null)

  useImperativeHandle(
    ref,
    () => ({
      swingOpen: (timeline) => {
        const targets = [left.current, right.current, leftHandle.current, rightHandle.current]
        gsap.killTweensOf(targets)
        if (leftHandle.current && rightHandle.current) {
          timeline
            .to(
              leftHandle.current,
              { rotation: 23, svgOrigin: handlePivot('left'), duration: 0.15 },
              0,
            )
            .to(
              rightHandle.current,
              { rotation: -23, svgOrigin: handlePivot('right'), duration: 0.15 },
              0,
            )
        }
        if (left.current && right.current) {
          timeline
            .to(left.current, { rotationY: OPEN_ANGLE, duration: 0.9, ease: 'power2.out' }, 0.1)
            .to(right.current, { rotationY: -OPEN_ANGLE, duration: 0.9, ease: 'power2.out' }, 0.1)
        }
      },
    }),
    [],
  )

  const hover = (on: boolean) => {
    if (disabled || !canHover()) return
    if (on) play('creak')
    if (left.current && right.current) {
      const duration = animate ? 0.3 : 0
      gsap.to(left.current, { rotationY: on ? AJAR_ANGLE : 0, duration, overwrite: true })
      gsap.to(right.current, { rotationY: on ? -AJAR_ANGLE : 0, duration, overwrite: true })
    }
    if (leftHandle.current && rightHandle.current) {
      const duration = animate ? 0.2 : 0
      gsap.to(leftHandle.current, {
        rotation: on ? 6 : 0,
        svgOrigin: handlePivot('left'),
        duration,
        overwrite: true,
      })
      gsap.to(rightHandle.current, {
        rotation: on ? -6 : 0,
        svgOrigin: handlePivot('right'),
        duration,
        overwrite: true,
      })
    }
    if (leftPaint.current && rightPaint.current) {
      const duration = on ? 0.8 : 0.5
      gsap.to([leftPaint.current, rightPaint.current], {
        x: on ? 0 : PAINT_HIDDEN,
        duration: animate ? duration : 0,
        overwrite: true,
      })
    }
  }

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label="Open the front door and walk into the corridor"
      className="absolute cursor-pointer rounded-sm outline-offset-8"
      style={{ left: OPENING.x, top: OPENING.y, width: OPENING.width, height: OPENING.height }}
      onClick={onEnter}
      onPointerEnter={() => hover(true)}
      onPointerLeave={() => hover(false)}
    >
      <span
        className="block h-full w-full"
        style={{ perspective: '1400px', perspectiveOrigin: '50% 50%' }}
      >
        <Leaf side="left" leafRef={left} paintRef={leftPaint} handleRef={leftHandle} />
        <Leaf side="right" leafRef={right} paintRef={rightPaint} handleRef={rightHandle} />
      </span>
    </button>
  )
}
