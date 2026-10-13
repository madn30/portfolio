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

function once(check: () => boolean, listener: () => void): () => void {
  if (check()) {
    listener()
    return () => {}
  }
  const stop = subscribe(() => {
    if (!check()) return
    stop()
    listener()
  })
  return stop
}

// Fires when the sheet starts tearing (100 %), before the tear has played.
export function onLoaderDone(listener: () => void): () => void {
  return once(() => done, listener)
}

export function onLoaderFinished(listener: () => void): () => void {
  return once(() => finished, listener)
}

export function useLoaderDone(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => done,
    () => done,
  )
}
