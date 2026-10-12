import { accentHex } from '@/data/siteConfig'
import { INK } from './mapGeometry'

interface MapPinProps {
  x: number
  y: number
}

export function MapPin({ x, y }: MapPinProps) {
  return (
    <g
      role="img"
      aria-label="Your position"
      className="map-pin"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      <ellipse cx="0" cy="1.5" rx="6" ry="2.2" fill={INK} fillOpacity="0.18" />
      <path
        d="M0 0 C-6.5 -8 -8 -14 -8 -18 A8 8 0 0 1 8 -18 C8 -14 6.5 -8 0 0 Z"
        fill={accentHex.terracotta}
        stroke={INK}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="0" cy="-18" r="3" fill="#fbfaf7" stroke={INK} strokeWidth="1" />
    </g>
  )
}
