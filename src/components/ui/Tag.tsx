import type { ReactNode } from 'react'

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-ink/25 bg-cream/70 px-2.5 py-0.5 font-sans text-xs text-graphite">
      {children}
    </span>
  )
}
