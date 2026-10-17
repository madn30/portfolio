import { useThree } from '@react-three/fiber'

/**
 * Tall screens pull the room's side-by-side content in towards the middle: the returned factor
 * is `narrow` there and 1 on wide screens.
 */
export function useLane(narrow = 0.5): number {
  return useThree((s) => s.viewport.aspect) < 1 ? narrow : 1
}
