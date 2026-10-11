import { useSyncExternalStore } from 'react'
import type { SectionId } from '@/types'

/**
 * Minimal hash-based router.
 *
 *   #/            → home (the corridor entrance)
 *   #/about       → About section
 *   #/projects    → Projects gallery
 *   #/projects/id → Project detail
 *
 * Hash routing keeps every section directly linkable and gives us free Back/Forward support
 * without requiring server configuration for deep links.
 */
export interface Route {
  section: SectionId
  projectId?: string
}

const SECTIONS: readonly SectionId[] = [
  'home',
  'about',
  'projects',
  'skills',
  'experience',
  'contact',
]

function isSectionId(value: string): value is SectionId {
  return (SECTIONS as readonly string[]).includes(value)
}

export function parseHash(hash: string): Route {
  const cleaned = hash.replace(/^#\/?/, '').replace(/\/+$/, '')
  if (!cleaned) return { section: 'home' }
  const [first, second] = cleaned.split('/')
  if (!first || !isSectionId(first)) return { section: 'home' }
  if (first === 'projects' && second) {
    return { section: 'projects', projectId: decodeURIComponent(second) }
  }
  return { section: first }
}

export function routeToHash(route: Route): string {
  if (route.section === 'home') return '#/'
  if (route.section === 'projects' && route.projectId) {
    return `#/projects/${encodeURIComponent(route.projectId)}`
  }
  return `#/${route.section}`
}

export function getRoute(): Route {
  return parseHash(window.location.hash)
}

export function navigate(route: Route, options: { replace?: boolean } = {}): void {
  const hash = routeToHash(route)
  if (window.location.hash === hash) return
  if (options.replace) {
    window.history.replaceState(null, '', hash)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else {
    window.location.hash = hash
  }
}

export function goBack(): void {
  // If the user landed directly on a section there may be no history entry to pop;
  // in that case fall back to home.
  if (window.history.length > 1 && window.history.state !== 'entry') {
    window.history.back()
  } else {
    navigate({ section: 'home' })
  }
}

let cachedHash = ''
let cachedRoute: Route = { section: 'home' }

function getSnapshot(): Route {
  const hash = window.location.hash
  if (hash !== cachedHash) {
    cachedHash = hash
    cachedRoute = parseHash(hash)
  }
  return cachedRoute
}

function subscribe(callback: () => void): () => void {
  window.addEventListener('hashchange', callback)
  window.addEventListener('popstate', callback)
  return () => {
    window.removeEventListener('hashchange', callback)
    window.removeEventListener('popstate', callback)
  }
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, getSnapshot, () => cachedRoute)
}
