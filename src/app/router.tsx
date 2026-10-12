import { useSyncExternalStore } from 'react'
import type { SectionId } from '@/shared/types'

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

function parseHash(hash: string): Route {
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

export function navigate(route: Route): void {
  const hash = routeToHash(route)
  if (window.location.hash === hash) return
  window.location.hash = hash
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
