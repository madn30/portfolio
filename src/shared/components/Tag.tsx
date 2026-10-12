import type { ReactNode } from 'react'

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-ink/25 bg-cream/70 px-2.5 py-0.5 font-sans text-xs text-graphite">
      {children}
    </span>
  )
}

interface TagListProps {
  items: readonly string[]
  label: string
  className: string
}

export function TagList({ items, label, className }: TagListProps) {
  return (
    <ul className={`${className} flex flex-wrap gap-1.5`} aria-label={label}>
      {items.map((item) => (
        <li key={item}>
          <Tag>{item}</Tag>
        </li>
      ))}
    </ul>
  )
}
