import type { AccentColor, DoorSectionId, SectionId, SocialLink } from '@/shared/types'

const social: SocialLink[] = [
  { id: 'github', label: 'GitHub', url: 'https://github.com/madn30' },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/in/idan-benabu-1944431b3/',
  },
]

export const siteConfig = {
  name: 'Idan Benabu',
  title: 'Front End Web Developer',
  headline: 'I build fast, careful interfaces in Angular and React.',
  tagline: 'Walk the corridor. Every door opens onto a piece of the work.',
  location: 'Tel Aviv, Israel',

  contact: {
    email: 'madn30@gmail.com',
    formEndpoint: '',
    closingMessage: 'The kettle is always on. Say hello.',
  },

  social,
}

export interface DoorDefinition {
  id: DoorSectionId
  label: string
  number: string
  side: 'left' | 'right'
  z: number
  accent: AccentColor
  note: string
}

export const doors: DoorDefinition[] = [
  {
    id: 'about',
    label: 'About',
    number: '01',
    side: 'left',
    z: -7.5,
    accent: 'sage',
    note: 'who I am',
  },
  {
    id: 'projects',
    label: 'Projects',
    number: '02',
    side: 'right',
    z: -14,
    accent: 'terracotta',
    note: 'things I built',
  },
  {
    id: 'skills',
    label: 'Skills',
    number: '03',
    side: 'left',
    z: -20.5,
    accent: 'ochre',
    note: 'tools I reach for',
  },
  {
    id: 'experience',
    label: 'Experience',
    number: '04',
    side: 'right',
    z: -27,
    accent: 'slate',
    note: 'where I have worked',
  },
  {
    id: 'contact',
    label: 'Contact',
    number: '05',
    side: 'left',
    z: -33.5,
    accent: 'plum',
    note: 'say hello',
  },
]

export const loopDoor = {
  code: ['while (true) {', '  explore();', '}'],
  note: 'back to the start',
}

export const sectionTitles: Record<SectionId, string> = {
  home: 'Entrance',
  about: 'About',
  projects: 'Projects',
  skills: 'Skills',
  experience: 'Experience',
  contact: 'Contact',
}

export const sectionDescriptions: Record<SectionId, string> = {
  home: `Portfolio of ${siteConfig.name}, a front-end web developer from ${siteConfig.location} who builds Angular and React applications. Explore an illustrated corridor of projects, skills, and experience.`,
  about: `Who ${siteConfig.name} is: a front-end developer from ${siteConfig.location}, how he works, and what he is focused on now.`,
  projects: `Selected projects by ${siteConfig.name}, each pegged to a clothesline in an illustrated gallery.`,
  skills: `The tools ${siteConfig.name} reaches for: Angular, React, TypeScript, web fundamentals, backend and tooling.`,
  experience: `Where ${siteConfig.name} has worked, told as a climb from one camp to the next.`,
  contact: `Get in touch with ${siteConfig.name}: email, GitHub and LinkedIn.`,
}

export const accentHex: Record<AccentColor, string> = {
  sage: '#8a9a7b',
  terracotta: '#c0693b',
  ochre: '#d3a44c',
  slate: '#6f7f8f',
  plum: '#8b6478',
}
