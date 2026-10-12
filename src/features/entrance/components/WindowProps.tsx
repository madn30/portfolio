import { BugHunt } from './BugHunt'
import { PeekWindow } from './PeekWindow'
import { RubberDuck } from './RubberDuck'
import { INK, LEAF, WOOD, cloudPath } from '@/features/entrance/shared'

interface WindowPropsProps {
  animate: boolean
}

export function WindowProps({ animate }: WindowPropsProps) {
  return (
    <svg viewBox="0 0 1600 900" className="pointer-events-none absolute inset-0 h-full w-full">
      <defs>
        <clipPath id="window-pane">
          <rect x="1084" y="414" width="182" height="162" />
        </clipPath>
      </defs>

      <PeekWindow animate={animate} />

      <g data-entrance-reveal>
        <rect
          x="1048"
          y="640"
          width="254"
          height="56"
          rx="4"
          fill={WOOD}
          stroke={INK}
          strokeWidth="2.2"
        />
        <path d="M1060 652 H1290 M1060 684 H1290" stroke={INK} strokeWidth="1" opacity="0.5" />
        <path d={cloudPath(1090, 622, 34, 24, 8, 21)} fill={LEAF} stroke={INK} strokeWidth="1.8" />
        <path d={cloudPath(1150, 614, 40, 30, 9, 22)} fill={LEAF} stroke={INK} strokeWidth="1.8" />
        <rect
          x="1196"
          y="586"
          width="22"
          height="56"
          rx="10"
          fill={LEAF}
          stroke={INK}
          strokeWidth="1.8"
        />
        <rect
          x="1184"
          y="604"
          width="12"
          height="22"
          rx="6"
          fill={LEAF}
          stroke={INK}
          strokeWidth="1.6"
        />
        <RubberDuck animate={animate} />
      </g>

      <BugHunt animate={animate} />
    </svg>
  )
}
