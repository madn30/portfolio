import type { ExperienceEntry } from '@/shared/types'

export const experience: ExperienceEntry[] = [
  {
    id: 'freelance',
    company: 'Freelance',
    role: 'Full-Stack Developer',
    start: 'May 2026',
    end: 'Present',
    description:
      'Designed and built the operations system a large plant nursery uses every day: orders, plant inventory, delivery routes with live driver locations and real-time notifications, on the web and as iOS and Android apps.',
    technologies: ['React', 'TypeScript', 'Node.js', 'tRPC', 'PostgreSQL', 'Capacitor'],
  },
  {
    id: 'realcommerce',
    company: 'realcommerce by Yael Group',
    role: 'Frontend Web Developer',
    start: 'May 2024',
    end: 'Present',
    description:
      'Angular front-end development at realcommerce, the web agency of Yael Group, on client-facing web applications.',
    technologies: ['Angular', 'TypeScript', 'SCSS'],
  },
  {
    id: 'okoora',
    company: 'Okoora',
    role: 'Front End Web Developer (Angular)',
    start: 'Jan 2023',
    end: 'May 2024',
    description:
      'Built the front-end of Okoora ABCM, a financial platform that helps businesses manage transactions across multiple currencies.',
    technologies: [
      'Angular',
      'Angular Material',
      'TypeScript',
      'JavaScript',
      'SCSS',
      'Microsoft Azure',
    ],
  },
  {
    id: 'codespread',
    company: 'CodeSpread',
    role: 'Front End Web Developer (React)',
    start: 'Jun 2021',
    end: 'Dec 2022',
    description:
      'Developed the CodeSpread application front-end from scratch and maintained it: a marketplace whose matching algorithm pairs buyers with the right open-source developer for their project. Worked closely with the designer and two back-end teams, took an active role in defining the architecture of a new system, and joined product meetings.',
    technologies: ['React', 'Redux', 'TypeScript', 'Material UI', 'ES6', 'CSS Flexbox'],
  },
]
