import { useSyncExternalStore } from 'react'
import type { DoorSectionId } from '@/shared/types'

export type SoundName = 'creak' | 'open' | 'doorOpen' | 'close' | 'tear' | 'step'
export type AmbienceId = 'corridor' | DoorSectionId

interface AudioState {
  muted: boolean
  unlocked: boolean
  music: number
  sfx: number
}

export interface Levels {
  music: number
  sfx: number
}

export const STORAGE_KEY = 'illustrated-corridor.audio'
export const LEVELS_KEY = 'illustrated-corridor.audio.levels'

export function clamp(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function loadMuted(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'muted'
  } catch {
    return false
  }
}

function loadLevels(): Levels {
  try {
    const raw = window.localStorage.getItem(LEVELS_KEY)
    if (!raw) return { music: 1, sfx: 1 }
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return { music: 1, sfx: 1 }
    const { music, sfx } = parsed as Record<string, unknown>
    return {
      music: typeof music === 'number' ? clamp(music) : 1,
      sfx: typeof sfx === 'number' ? clamp(sfx) : 1,
    }
  } catch {
    return { music: 1, sfx: 1 }
  }
}

export let state: AudioState = { muted: loadMuted(), unlocked: false, ...loadLevels() }
const listeners = new Set<() => void>()

export function emit(next: AudioState): void {
  state = next
  listeners.forEach((l) => l())
}

export function useAudio<T>(selector: (s: AudioState) => T): T {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => selector(state),
    () => selector(state),
  )
}

export function store(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    return
  }
}
