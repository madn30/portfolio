import type { AccentColor, DoorSectionId, SectionId, SocialLink } from '@/types'

/**
 * Central site configuration.
 * Everything with "[YOUR ...]" or "example" is placeholder content — replace it with your own.
 */
export const siteConfig = {
  name: '[YOUR NAME]',
  title: 'Software Developer',
  headline: 'I build thoughtful digital experiences.',
  tagline: 'Walk the corridor. Every door opens onto a piece of the work.',
  location: '[YOUR CITY]',

  contact: {
    /** Placeholder email on a reserved documentation domain. Replace with yours. */
    email: 'hello@example.com',
    /**
     * Optional form endpoint (e.g. Formspree, Basin, Getform, or your own API that accepts JSON).
     * Leave empty and the contact form falls back to composing an email in the visitor's mail client.
     * Example: 'https://formspree.io/f/your-form-id'
     */
    formEndpoint: '',
    closingMessage: 'The kettle is always on. Say hello.',
  },

  social: [
    // Replace these with your own profile URLs. Links with an empty url are hidden.
    { id: 'github', label: 'GitHub', url: 'https://github.com/' },
    { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/' },
  ] as SocialLink[],
}

export interface DoorDefinition {
  id: DoorSectionId
  label: string
  number: string
  /** Which wall of the corridor the door sits on. 'end' faces the camera at the far end. */
  side: 'left' | 'right' | 'end'
  /** Position along the corridor (negative = deeper). */
  z: number
  accent: AccentColor
  /** Short handwritten note shown near the door while walking. */
  note: string
}

/** Doors along the corridor, in walking order. */
export const doors: DoorDefinition[] = [
  {
    id: 'about',
    label: 'About',
    number: '01',
    side: 'left',
    z: -8,
    accent: 'sage',
    note: 'who I am',
  },
  {
    id: 'projects',
    label: 'Projects',
    number: '02',
    side: 'right',
    z: -16,
    accent: 'terracotta',
    note: 'things I built',
  },
  {
    id: 'skills',
    label: 'Skills',
    number: '03',
    side: 'left',
    z: -24,
    accent: 'ochre',
    note: 'tools I reach for',
  },
  {
    id: 'experience',
    label: 'Experience',
    number: '04',
    side: 'right',
    z: -32,
    accent: 'slate',
    note: 'where I have worked',
  },
  {
    id: 'contact',
    label: 'Contact',
    number: '05',
    side: 'end',
    z: -42,
    accent: 'plum',
    note: 'say hello',
  },
]

export const sectionTitles: Record<SectionId, string> = {
  home: 'Entrance',
  about: 'About',
  projects: 'Projects',
  skills: 'Skills',
  experience: 'Experience',
  contact: 'Contact',
}

export const accentHex: Record<AccentColor, string> = {
  sage: '#8a9a7b',
  terracotta: '#c0693b',
  ochre: '#d3a44c',
  slate: '#6f7f8f',
  plum: '#8b6478',
}
