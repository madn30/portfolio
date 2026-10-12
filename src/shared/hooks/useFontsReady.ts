import { useEffect, useState } from 'react'

export function useFontsReady(): boolean {
  const [ready, setReady] = useState(() => document.fonts?.status === 'loaded')
  useEffect(() => {
    if (ready || !document.fonts) return
    let cancelled = false
    Promise.all([document.fonts.load('600 32px Caveat'), document.fonts.load('500 32px Fraunces')])
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [ready])
  return ready
}
