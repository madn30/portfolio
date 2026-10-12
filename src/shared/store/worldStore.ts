import { useSyncExternalStore } from 'react'
import type { DoorSectionId } from '@/shared/types'

export interface WorldState {
  hoveredDoor: DoorSectionId | null
  enteringDoor: DoorSectionId | null
  activeDoor: DoorSectionId | null
  station: number
  sceneReady: boolean
  sceneFailed: boolean
  introDone: boolean
  transitionTick: number
  entered: boolean
  lap: number
  hotspotHint: string | null
  focusedProject: string | null
}

export const worldRefs = {
  scroll: 0,
  pointerX: 0,
  pointerY: 0,
  walkSpeed: 0,
  turnSpeed: 0,
}

type Listener = () => void

function createStore<T extends object>(initial: T) {
  let state = initial
  const listeners = new Set<Listener>()
  return {
    getState: () => state,
    setState: (partial: Partial<T> | ((prev: T) => Partial<T>)) => {
      const next = typeof partial === 'function' ? partial(state) : partial
      let changed = false
      for (const key in next) {
        if (state[key] !== next[key]) {
          changed = true
          break
        }
      }
      if (!changed) return
      state = { ...state, ...next }
      listeners.forEach((l) => l())
    },
    subscribe: (listener: Listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export const worldStore = createStore<WorldState>({
  hoveredDoor: null,
  enteringDoor: null,
  activeDoor: null,
  station: -1,
  sceneReady: false,
  sceneFailed: false,
  introDone: false,
  transitionTick: 0,
  entered: false,
  lap: 0,
  hotspotHint: null,
  focusedProject: null,
})

export function useWorld<T>(selector: (state: WorldState) => T): T {
  return useSyncExternalStore(
    worldStore.subscribe,
    () => selector(worldStore.getState()),
    () => selector(worldStore.getState()),
  )
}

export function useHasRoom(): boolean {
  return useWorld((state) => state.sceneReady && !state.sceneFailed)
}

export const setWorld = worldStore.setState
