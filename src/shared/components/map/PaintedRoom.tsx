import { useEffect, useRef } from 'react'
import type { DoorDefinition } from '@/data/siteConfig'
import { accentHex } from '@/data/siteConfig'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { gsap } from '@/shared/utils/gsap'
import { roomBox } from './mapGeometry'

interface PaintedRoomProps {
  door: DoorDefinition
  revealed: boolean
}

export function PaintedRoom({ door, revealed }: PaintedRoomProps) {
  const clip = useRef<SVGRectElement>(null)
  const reducedMotion = useReducedMotion()
  const box = roomBox(door)
  const accent = accentHex[door.accent]
  const doorEdge = door.side === 'left' ? box.x + box.width : box.x

  useEffect(() => {
    const rect = clip.current
    if (!rect) return
    const tween = gsap.to(rect, {
      attr: {
        x: revealed && door.side === 'left' ? box.x : doorEdge,
        width: revealed ? box.width : 0,
      },
      duration: reducedMotion ? 0 : 0.5,
      ease: 'power2.out',
      overwrite: true,
    })
    return () => {
      tween.kill()
    }
  }, [revealed, reducedMotion, door.side, box.x, box.width, doorEdge])

  const floorLines = [0.3, 0.55, 0.8].map((t) => box.y + box.height * t)

  return (
    <g aria-hidden="true">
      <defs>
        <clipPath id={`map-room-${door.id}`}>
          <rect ref={clip} x={doorEdge} y={box.y - 2} width={0} height={box.height + 4} />
        </clipPath>
      </defs>
      <g clipPath={`url(#map-room-${door.id})`}>
        <rect
          x={box.x + 1}
          y={box.y + 1}
          width={box.width - 2}
          height={box.height - 2}
          rx="4"
          fill={accent}
          fillOpacity="0.22"
          stroke={accent}
          strokeWidth="1.4"
        />
        <rect
          x={box.x + 1}
          y={box.y + 1}
          width={box.width - 2}
          height={box.height - 2}
          rx="4"
          fill="url(#map-hatch)"
        />
        {floorLines.map((y) => (
          <path
            key={y}
            d={`M${box.x + 8} ${y} Q${box.x + box.width / 2} ${y - 2} ${box.x + box.width - 8} ${y + 1}`}
            fill="none"
            stroke={accent}
            strokeWidth="0.9"
            strokeOpacity="0.6"
          />
        ))}
      </g>
    </g>
  )
}
