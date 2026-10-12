import type { ReactNode, Ref } from 'react'

interface ChipButtonProps {
  ref: Ref<HTMLButtonElement>
  expanded: boolean
  controls: string
  label: string
  title: string
  tilt?: 'right' | 'left'
  onClick: () => void
  children: ReactNode
}

const chip = {
  right:
    'torn flex h-10 w-10 items-center justify-center text-ink transition-transform group-hover:rotate-3',
  left: 'torn flex h-10 w-10 items-center justify-center text-ink transition-transform group-hover:-rotate-3',
}

export function ChipButton({
  ref,
  expanded,
  controls,
  label,
  title,
  tilt = 'right',
  onClick,
  children,
}: ChipButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      className="torn-wrap group"
      aria-expanded={expanded}
      aria-controls={controls}
      aria-haspopup="dialog"
      aria-label={label}
      title={title}
      onClick={onClick}
    >
      <span className={chip[tilt]}>{children}</span>
    </button>
  )
}
