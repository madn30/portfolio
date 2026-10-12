import { useSyncExternalStore } from 'react'

interface StudioState {
  open: string | null
}

let state: StudioState = { open: null }
const listeners = new Set<() => void>()

export const studioRefs = {
  hole: { x: 24, y: 50 },
  rotation: 0,
  fall: 0,
}

export function setStudioOpen(open: string | null): void {
  if (state.open === open) return
  state = { open }
  listeners.forEach((l) => l())
}

export function useStudio<T>(selector: (s: StudioState) => T): T {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => selector(state),
    () => selector(state),
  )
}
