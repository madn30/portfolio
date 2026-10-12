import { accentHex } from '@/data/siteConfig'
import { CREAM, INK, OPENING, PAPER, WOOD_DARK } from '@/features/entrance/shared'

export function Facade() {
  return (
    <svg
      viewBox="0 0 1600 900"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <pattern id="bricks" width="140" height="64" patternUnits="userSpaceOnUse">
          <rect
            x="3"
            y="3"
            width="134"
            height="26"
            rx="3"
            fill="none"
            stroke={INK}
            strokeWidth="1.1"
            opacity="0.32"
          />
          <rect
            x="-67"
            y="35"
            width="134"
            height="26"
            rx="3"
            fill="none"
            stroke={INK}
            strokeWidth="1.1"
            opacity="0.32"
          />
          <rect
            x="73"
            y="35"
            width="134"
            height="26"
            rx="3"
            fill="none"
            stroke={INK}
            strokeWidth="1.1"
            opacity="0.32"
          />
          <rect x="12" y="8" width="60" height="14" rx="4" fill={INK} opacity="0.035" />
          <rect x="90" y="40" width="40" height="14" rx="4" fill={INK} opacity="0.03" />
        </pattern>
        <pattern
          id="hatch"
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-35)"
        >
          <line x1="0" y1="0" x2="0" y2="12" stroke={INK} strokeWidth="1" opacity="0.12" />
        </pattern>
        <mask id="facade-hole">
          <rect width="1600" height="900" fill="#fff" />
          <rect
            x={OPENING.x}
            y={OPENING.y}
            width={OPENING.width}
            height={OPENING.height}
            fill="#000"
          />
        </mask>
      </defs>

      <g mask="url(#facade-hole)">
        <rect width="1600" height="900" fill={PAPER} />
        <rect width="1600" height="760" fill="url(#bricks)" />
        <rect y="760" width="1600" height="140" fill="#e9e6df" />
        <rect y="760" width="1600" height="140" fill="url(#hatch)" />
        <path d="M0 760 H1600" stroke={INK} strokeWidth="2.4" fill="none" />
        <g stroke={INK} strokeWidth="1.3" fill="none" opacity="0.6">
          <path d="M120 760 l-6 -14 M128 760 l2 -16 M136 760 l6 -12" />
          <path d="M1300 760 l-6 -14 M1308 760 l2 -16 M1316 760 l6 -12" />
          <path d="M1010 760 l-5 -12 M1017 760 l1 -15" />
          <path d="M470 760 l-5 -12 M477 760 l1 -15 M484 760 l5 -11" />
        </g>
        <rect
          x="686"
          y="416"
          width="228"
          height="346"
          fill={WOOD_DARK}
          stroke={INK}
          strokeWidth="3"
        />
        <path
          d="M690 420 V758 M910 420 V758 M690 420 H910"
          stroke={INK}
          strokeWidth="1"
          opacity="0.45"
          fill="none"
        />
        <circle cx="800" cy="416" r="16" fill={CREAM} stroke={INK} strokeWidth="2" />
        <circle cx="800" cy="416" r="7" fill="none" stroke={INK} strokeWidth="1.4" />
      </g>

      <g fill={CREAM} stroke={INK} strokeWidth="2" data-entrance-reveal>
        <ellipse cx="800" cy="788" rx="72" ry="20" />
        <ellipse cx="792" cy="836" rx="96" ry="26" />
        <ellipse cx="806" cy="890" rx="118" ry="30" />
      </g>

      <g data-entrance-reveal>
        <path
          d="M686 452 H650 q-14 0 -14 14 V468"
          fill="none"
          stroke={INK}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path d="M622 468 L636 456 L650 468 Z" fill={WOOD_DARK} stroke={INK} strokeWidth="1.8" />
        <rect x="622" y="468" width="28" height="36" fill={CREAM} stroke={INK} strokeWidth="2" />
        <path d="M636 468 V504 M622 486 H650" stroke={INK} strokeWidth="1" opacity="0.5" />
        <path d="M625 504 H647 L643 510 H629 Z" fill={WOOD_DARK} stroke={INK} strokeWidth="1.4" />
        <path
          d="M636 496 C 630 490, 631 484, 636 478 C 641 484, 642 490, 636 496 Z"
          fill={accentHex.ochre}
          stroke={INK}
          strokeWidth="1"
        />
      </g>
    </svg>
  )
}
