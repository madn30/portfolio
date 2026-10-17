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
    role: 'Frontend Developer',
    start: 'May 2024',
    end: 'Present',
    description:
      "Front-end developer on enterprise client projects. Since 2026 I build Super-Pharm's in-store point-of-sale in React, the cashier screens and self-checkout kiosks, including LLM-powered features. Before that, at Israel Discount Bank, I led the upgrade from Angular 17 to 19 with zero downtime and shipped features for its digital banking platform.",
    technologies: ['React', 'Angular', 'TypeScript', 'Material UI', 'LLM APIs'],
  },
  {
    id: 'okoora',
    company: 'Okoora',
    role: 'Frontend Developer (Angular)',
    start: 'Jan 2023',
    end: 'May 2024',
    description:
      'Delivered end-to-end features for a multi-currency business payments platform, from design handoff to production, working with the backend team through Git Flow and pull-request reviews in Azure DevOps.',
    technologies: [
      'Angular',
      'Angular Material',
      'TypeScript',
      'JavaScript',
      'SCSS',
      'Azure DevOps',
    ],
  },
  {
    id: 'codespread',
    company: 'CodeSpread',
    role: 'Frontend Developer (React)',
    start: 'Jun 2021',
    end: 'Dec 2022',
    description:
      'Built the entire front-end from scratch for a marketplace matching clients with open-source developers, serving hundreds of users. A single-page app built with one designer and two backend teams, and I helped define the system architecture.',
    technologies: ['React', 'Redux', 'TypeScript', 'Material UI', 'ES6', 'CSS Flexbox'],
  },
]
