import { useEffect, useState } from 'react'

/**
 * True once the frame that mounted the caller has been painted. The first animation frame
 * after the commit runs before that paint, the second runs after it, so anything gated on
 * this is requested only after the app's own first paint (not the static shell in index.html).
 */
export function useAfterFirstPaint(): boolean {
  const [painted, setPainted] = useState(false)
  useEffect(() => {
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setPainted(true))
    })
    return () => cancelAnimationFrame(frame)
  }, [])
  return painted
}
