import { useSyncExternalStore } from 'react'

type AchievementId =
  'explorer' | 'wanderer' | 'guest' | 'critic' | 'skywalker' | 'director' | 'looper' | 'sociable'

interface Achievement {
  id: AchievementId
  title: string
  hint: string
}

export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: 'explorer', title: 'Explorer', hint: 'Open the front door' },
  { id: 'wanderer', title: 'Wanderer', hint: 'Walk the corridor' },
  { id: 'guest', title: 'Guest', hint: 'Step into a room' },
  { id: 'critic', title: 'Art critic', hint: 'Inspect a project' },
  { id: 'skywalker', title: 'Sky walker', hint: 'Throw a paper plane' },
  { id: 'director', title: 'Director', hint: 'Spin the studio monitors' },
  { id: 'sociable', title: 'Sociable', hint: 'Find a way to say hello' },
  { id: 'looper', title: 'Looper', hint: 'Walk through the door at the end' },
]

const STORAGE_KEY = 'illustrated-corridor.achievements'

interface AchievementState {
  unlocked: readonly AchievementId[]
}

function load(): AchievementId[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const known = new Set(ACHIEVEMENTS.map((a) => a.id))
    return parsed.filter(
      (id): id is AchievementId => typeof id === 'string' && known.has(id as AchievementId),
    )
  } catch {
    return []
  }
}

let state: AchievementState = { unlocked: load() }
const listeners = new Set<() => void>()

function emit(next: AchievementState): void {
  state = next
  listeners.forEach((l) => l())
}

export function isUnlocked(id: AchievementId): boolean {
  return state.unlocked.includes(id)
}

function persist(unlocked: readonly AchievementId[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked))
  } catch {
    return
  }
}

export function unlock(id: AchievementId): void {
  if (isUnlocked(id)) return
  const unlocked = [...state.unlocked, id]
  persist(unlocked)
  emit({ unlocked })
}

export function useAchievements<T>(selector: (s: AchievementState) => T): T {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => selector(state),
    () => selector(state),
  )
}
