import { Cat } from './Cat'
import { Tree } from './Tree'

interface StreetPropsProps {
  animate: boolean
}

export function StreetProps({ animate }: StreetPropsProps) {
  return (
    <svg
      viewBox="0 0 1600 900"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <Tree animate={animate} />
      <Cat animate={animate} />
    </svg>
  )
}
