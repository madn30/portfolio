import type { SVGProps } from 'react'
import { accentHex } from '@/data/siteConfig'

type DoodleProps = SVGProps<SVGSVGElement>

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function DeskDoodle(props: DoodleProps) {
  return (
    <svg viewBox="0 0 160 110" aria-hidden="true" {...props}>
      <g {...stroke}>
        <path d="M14 64 Q13 62 16 62 L146 60 Q149 60 149 63 L150 70 L14 72 Z" />
        <path d="M24 72 L22 102 M140 70 L142 102" />
        <path d="M48 60 L50 28 Q50 24 54 24 L104 22 Q108 22 108 26 L108 58" />
        <path d="M56 32 L100 31 M56 40 L92 39 M56 48 L98 47" strokeWidth="1.2" opacity=".6" />
        <path d="M118 60 L116 46 Q116 42 120 42 L132 42 Q136 42 136 46 L134 60" />
        <path d="M121 42 Q126 30 130 42" strokeWidth="1.2" />
        <path d="M30 60 L30 50 L40 50 L40 60" />
      </g>
      <circle cx="126" cy="36" r="2.4" fill={accentHex.terracotta} />
    </svg>
  )
}

export function ToolboxDoodle(props: DoodleProps) {
  return (
    <svg viewBox="0 0 160 110" aria-hidden="true" {...props}>
      <g {...stroke}>
        <path d="M22 50 Q20 48 24 48 L136 46 Q140 46 140 50 L142 92 Q142 96 138 96 L26 98 Q22 98 22 94 Z" />
        <path d="M22 66 L142 64" strokeWidth="1.4" opacity=".7" />
        <path d="M66 48 L68 36 Q68 32 72 32 L90 32 Q94 32 94 36 L94 46" />
        <path d="M40 48 L44 18 M44 18 L54 26 M44 18 L36 26" />
        <path d="M110 48 L112 22 Q112 16 118 16 Q124 16 124 22 Q124 28 118 28 L116 48" />
        <path d="M80 74 L80 88 M74 80 L86 80" strokeWidth="1.4" opacity=".7" />
      </g>
      <circle cx="46" cy="18" r="2.4" fill={accentHex.terracotta} />
    </svg>
  )
}

export function EnvelopeDoodle(props: DoodleProps) {
  return (
    <svg viewBox="0 0 160 110" aria-hidden="true" {...props}>
      <g {...stroke}>
        <path d="M26 32 Q24 30 28 30 L132 28 Q136 28 136 32 L138 82 Q138 86 134 86 L30 88 Q26 88 26 84 Z" />
        <path d="M28 32 L82 64 L134 30" />
        <path d="M28 86 L70 56 M136 84 L96 56" strokeWidth="1.3" opacity=".6" />
        <path d="M60 14 Q82 2 104 14" strokeWidth="1.3" opacity=".6" />
      </g>
      <circle cx="82" cy="12" r="2.4" fill={accentHex.terracotta} />
    </svg>
  )
}
