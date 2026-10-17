import type { Project } from '@/shared/types'

export const projects: Project[] = [
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
    repoUrl: 'https://github.com/madn30/portfolio',
    year: '2026',
    accent: 'slate',
  },
  {
    id: 'wedding-rsvp',
    title: 'Wedding RSVP',
    description:
      'A full-stack wedding RSVP platform with WhatsApp invitations, a guest dashboard and a drag-and-drop seating planner.',
    details:
      'A MERN app in TypeScript with Hebrew RTL support. Admins manage events and guests, send personalised WhatsApp invites and scheduled reminders, track responses on a stats dashboard, and seat guests with a drag-and-drop table planner. Guests answer through a token-based RSVP page.',
    tags: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Zustand', 'WhatsApp'],
    image: '/images/projects/wedding-rsvp.svg',
    imageAlt: 'Line illustration of an envelope with an RSVP card and two rings',
    repoUrl: 'https://github.com/madn30/wedding-rsvp',
    year: '2026',
    accent: 'plum',
  },
  {
    id: 'droppilot',
    title: 'DropPilot',
    description:
      'An automated dropshipping system that finds supplier products, matches them to identical marketplace listings and runs the whole order flow.',
    details:
      'Imports CJ Dropshipping products, matches them to competitor eBay and Amazon listings with perceptual hashes, CLIP embeddings and Claude vision checks, scores demand from sales rank and Google Trends, then prices, lists, reprices and fulfils orders. A Next.js dashboard and a BullMQ worker share the domain code; every external API sits behind a mock adapter, so the full pipeline runs without keys.',
    tags: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'BullMQ', 'Claude API', 'Docker'],
    image: '/images/projects/droppilot.svg',
    imageAlt:
      'Line illustration of a parcel with a price tag and a paper plane flying a dotted route',
    repoUrl: 'https://github.com/madn30/droppilot',
    year: '2026',
    accent: 'ochre',
  },
  {
    id: 'mister-email',
    title: 'Mister Email',
    description: 'A Gmail-style mail client built as a single-page React app on Vite.',
    details:
      'A front-end exercise in rebuilding a familiar product: an inbox with list and detail views, composing and organising mail, written in React with Vite.',
    tags: ['React', 'Vite', 'JavaScript', 'SCSS'],
    image: '/images/projects/paper-trail.svg',
    imageAlt: 'Line illustration of a notebook with sketched sync arrows',
    repoUrl: 'https://github.com/madn30/misterEmail',
    year: '2024',
    accent: 'terracotta',
  },
  {
    id: 'cinema-management',
    title: 'Cinema Management',
    description:
      'A movies and subscription management system where users filter, view and reserve seats for films.',
    details:
      'Built during the MERN stack boot-camp. A React front-end with MobX state management over a Node.js and Express REST API with full CRUD on MongoDB.',
    tags: ['React', 'MobX', 'Node.js', 'Express', 'MongoDB', 'REST'],
    image: '/images/projects/lantern.svg',
    imageAlt: 'Line illustration of a lantern casting light over a chart',
    repoUrl: 'https://github.com/madn30/Cinema-Managment-Express-Node-MongoDB',
    year: '2021',
    accent: 'ochre',
  },
  {
    id: 'cheap-it',
    title: 'Cheap-IT',
    description:
      'A mobile app that connects people to get everyday tasks done at the most affordable cost for both sides.',
    details:
      'Final project at Ruppin Academic Center. A React Native app with Expo and Redux on the client, and a C# service over a SQL database on the server, so posting and picking up a task saves both parties time and money.',
    tags: ['React Native', 'Expo', 'Redux', 'C#', 'SQL'],
    image: '/images/projects/atlas-kit.svg',
    imageAlt: 'Line illustration of stacked UI blocks and a compass',
    repoUrl: 'https://github.com/madn30/Cheap-IT',
    year: '2020',
    accent: 'sage',
  },
]

export function getProjectById(id: string | undefined): Project | undefined {
  if (!id) return undefined
  return projects.find((p) => p.id === id)
}
