import { useSyncExternalStore } from 'react'
import { experience } from '@/data/experience'

export const chapters = [...experience].reverse()

let selected = chapters.length - 1
const listeners = new Set<() => void>()

export function selectChapter(index: number): void {
  const next = ((index % chapters.length) + chapters.length) % chapters.length
  if (next === selected) return
  selected = next
  listeners.forEach((listener) => listener())
}

export function useChapter(): number {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => selected,
    () => selected,
  )
}
