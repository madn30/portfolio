import { useSyncExternalStore } from 'react'

let done = false
const listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function markLoaderDone(): void {
  if (done) return
  done = true
  listeners.forEach((listener) => listener())
}

export function useLoaderDone(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => done,
    () => done,
  )
}
