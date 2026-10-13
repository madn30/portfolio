import { startTransition, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface DeferredMountProps {
  children: ReactNode
}

/**
 * Mounts its children one commit after itself, inside a transition. The first render of an
 * R3F root is synchronous, so building a whole scene there is one long task; after this gate
 * the scheduler time-slices the build into short tasks instead.
 */
export function DeferredMount({ children }: DeferredMountProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    startTransition(() => setMounted(true))
  }, [])
  return mounted ? children : null
}
