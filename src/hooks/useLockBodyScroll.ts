import { useLayoutEffect } from 'react'

let lockCount = 0

/**
 * Prevents the page behind an overlay from scrolling. Reference-counted so nested
 * overlays (section panel + project modal) don't fight over the body class.
 */
export function useLockBodyScroll(locked: boolean): void {
  useLayoutEffect(() => {
    if (!locked) return
    lockCount += 1
    document.body.classList.add('scroll-locked')
    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) document.body.classList.remove('scroll-locked')
    }
  }, [locked])
}
