import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { isSafeExternalUrl } from '@/utils/links'

export interface ExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  icon?: ReactNode
  children: ReactNode
}

/** Renders nothing for empty or unsupported links. */
export function ExternalLink({ href, icon, children, className = '', ...rest }: ExternalLinkProps) {
  if (!isSafeExternalUrl(href)) return null
  const isMail = href.startsWith('mailto:')
  return (
    <a
      href={href}
      {...(isMail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
      className={`inline-flex items-center gap-1.5 font-sans font-medium text-ink underline decoration-terracotta/60 underline-offset-4 transition-colors hover:decoration-terracotta ${className}`}
      {...rest}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </a>
  )
}
