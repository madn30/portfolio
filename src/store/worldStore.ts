import { useSyncExternalStore } from 'react'
import type { DoorSectionId } from '@/types'

/**
 * Small external store for world-level UI state that several components share.
 * Values that change every frame (scroll progress, pointer) live in `worldRefs`
 * instead, so animation never triggers React renders.
 */
export interface WorldState {
  /** Door currently hovered in the 3D scene or the DOM navigation. */
  hoveredDoor: DoorSectionId | null
  /** Door the camera is walking toward (section opens once it arrives). */
  enteringDoor: DoorSectionId | null
  /** Door whose section is currently open (derived from the route). */
  activeDoor: DoorSectionId | null
  /** Index into `doors` of the nearest door while walking, or -1 at the entrance. */
  station: number
  /** Whether the WebGL scene rendered its first frame. */
  sceneReady: boolean
  /** The 3D scene failed to initialise; the DOM fallback is shown. */
  sceneFailed: boolean
  /** Visitor dismissed the intro overlay (either by scrolling or by the skip button). */
  introDone: boolean
  /** Number of times a scene transition has been requested; used to retrigger the wipe. */
  transitionTick: number
}

export const worldRefs = {
  /** 0 at the entrance, 1 at the end of the corridor. */
  scroll: 0,
  /** Normalised pointer position in [-1, 1]. */
  pointerX: 0,
  pointerY: 0,
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
})

export function useWorld<T>(selector: (state: WorldState) => T): T {
  return useSyncExternalStore(
    worldStore.subscribe,
    () => selector(worldStore.getState()),
    () => selector(worldStore.getState()),
  )
}

export const setWorld = worldStore.setState
