import { useSyncExternalStore } from 'react'

let done = false
let finished = false
const listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notify(): void {
  listeners.forEach((listener) => listener())
}

export function markLoaderDone(): void {
  if (done) return
  done = true
  notify()
}

export function markLoaderFinished(): void {
  if (finished) return
  finished = true
  notify()
}

export function onLoaderFinished(listener: () => void): () => void {
  if (finished) {
    listener()
    return () => {}
  }
  const stop = subscribe(() => {
    if (!finished) return
    stop()
    listener()
  })
  return stop
}

export function useLoaderDone(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => done,
    () => done,
  )
}
