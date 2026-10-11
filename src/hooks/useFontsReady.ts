import { useEffect, useState } from 'react'

/**
 * Resolves once the web fonts have loaded so canvas-drawn labels can be redrawn with the
 * intended typefaces instead of the fallback font.
 */
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
