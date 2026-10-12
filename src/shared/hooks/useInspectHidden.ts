import { useSyncExternalStore } from 'react'

let hidden = false
const listeners = new Set<() => void>()
let installed = false

function onInspectChange(event: Event): void {
  const next = event instanceof CustomEvent && event.detail === true
  if (next === hidden) return
  hidden = next
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void): () => void {
  if (!installed) {
    window.addEventListener('inspectChange', onInspectChange)
    installed = true
  }
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useInspectHidden(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => hidden,
    () => false,
  )
}
