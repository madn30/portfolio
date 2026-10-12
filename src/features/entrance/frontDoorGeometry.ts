export type Side = 'left' | 'right'

export const HANDLE_Y = 160
export const PAINT_HIDDEN = -124

export function handlePivotX(side: Side): number {
  return side === 'left' ? 93 : 11
}

export function handlePivot(side: Side): string {
  return `${handlePivotX(side)} ${HANDLE_Y}`
}
