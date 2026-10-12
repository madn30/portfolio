import { useLayoutEffect } from 'react'

let lockCount = 0

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
