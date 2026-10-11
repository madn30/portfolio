import type { Project } from '@/types'

/**
 * Project gallery content.
 *
 * All entries below are PLACEHOLDER demo projects (isPlaceholder: true).
 * Replace them with your own work. Keep `id` stable because it is used in the URL hash
 * (#/projects/<id>). Omit `demoUrl` / `repoUrl` to hide the corresponding link — never
 * point them at a fake destination.
 */
export const projects: Project[] = [
  {
    id: 'paper-trail',
    title: 'Paper Trail',
    description:
      'A collaborative note-taking app with offline-first sync, hand-drawn annotations, and gentle conflict resolution.',
    details:
      'Placeholder description. Describe the problem, your role, the architecture you chose, and what you learned. Mention trade-offs honestly: what you would do differently next time.',
    tags: ['React', 'TypeScript', 'IndexedDB', 'Service Workers'],
    image: '/images/projects/paper-trail.svg',
    imageAlt: 'Line illustration of a notebook with sketched sync arrows',
    year: '2025',
    accent: 'terracotta',
    isPlaceholder: true,
  },
  {
    id: 'lantern',
    title: 'Lantern',
    description:
      'A lightweight observability dashboard that turns noisy logs into readable stories for small teams.',
    details:
      'Placeholder description. Explain the data pipeline, how you kept the UI responsive with large datasets, and the testing strategy.',
    tags: ['Node.js', 'WebSockets', 'Angular', 'PostgreSQL'],
    image: '/images/projects/lantern.svg',
    imageAlt: 'Line illustration of a lantern casting light over a chart',
    year: '2024',
    accent: 'ochre',
    isPlaceholder: true,
  },
  {
    id: 'atlas-kit',
    title: 'Atlas Kit',
    description:
      'A small design-system toolkit: accessible primitives, tokens, and documentation that teams actually read.',
    details:
      'Placeholder description. Talk about API design, accessibility audits, and how you measured adoption.',
    tags: ['TypeScript', 'React', 'Storybook', 'Testing Library'],
    image: '/images/projects/atlas-kit.svg',
    imageAlt: 'Line illustration of stacked UI blocks and a compass',
    year: '2024',
    accent: 'sage',
    isPlaceholder: true,
  },
  {
    id: 'corridor',
    title: 'This Portfolio',
    description:
      'An illustrated 3D corridor built with React Three Fiber, procedural geometry, and a hand-drawn line style.',
    details:
      'The site you are looking at. Procedural corridor geometry, jittered pencil outlines, canvas-generated paper textures, hash-based routing, and a DOM fallback when WebGL is unavailable.',
    tags: ['React', 'Three.js', 'React Three Fiber', 'GSAP', 'Vite'],
    image: '/images/projects/corridor.svg',
    imageAlt: 'Line illustration of a corridor with doors receding to a vanishing point',
    year: '2026',
    accent: 'slate',
    isPlaceholder: true,
  },
]

export function getProjectById(id: string | undefined): Project | undefined {
  if (!id) return undefined
  return projects.find((p) => p.id === id)
}
