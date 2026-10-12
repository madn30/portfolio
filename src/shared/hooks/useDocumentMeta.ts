import { useEffect } from 'react'
import { routeToHash } from '@/app/router'
import { sectionDescriptions, sectionTitles, siteConfig } from '@/data/siteConfig'
import type { SectionId } from '@/shared/types'

function setMeta(attribute: 'name' | 'property', key: string, content: string): void {
  document.querySelector(`meta[${attribute}="${key}"]`)?.setAttribute('content', content)
}

export function useDocumentMeta(section: SectionId): void {
  useEffect(() => {
    const base = `${siteConfig.name} — ${siteConfig.title}`
    const title = section === 'home' ? base : `${sectionTitles[section]} · ${base}`
    const description = sectionDescriptions[section]
    const url = `${window.location.origin}${window.location.pathname}${routeToHash({ section })}`
    document.title = title
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', url)
  }, [section])
}
