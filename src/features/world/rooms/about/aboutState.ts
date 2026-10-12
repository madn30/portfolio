import { useSyncExternalStore } from 'react'
import type { MilestoneId } from './stream'

interface AboutState {
  station: MilestoneId | null
}

let state: AboutState = { station: null }
let flyHandler: ((id: MilestoneId) => void) | null = null
const listeners = new Set<() => void>()

function emit(next: AboutState): void {
  state = next
  listeners.forEach((listener) => listener())
}

export function setAbout(patch: Partial<AboutState>): void {
  const next = { ...state, ...patch }
  if ((Object.keys(patch) as (keyof AboutState)[]).every((key) => state[key] === next[key])) return
  emit(next)
}

export function registerFlyTo(handler: ((id: MilestoneId) => void) | null): void {
  flyHandler = handler
}

export function flyToMilestone(id: MilestoneId): void {
  flyHandler?.(id)
}

export function useAbout<T>(selector: (s: AboutState) => T): T {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => selector(state),
    () => selector(state),
  )
}
