import type { ExperienceEntry } from '@/shared/types'

export const experience: ExperienceEntry[] = [
  {
    id: 'realcommerce',
    company: 'Yael realcommerce',
    role: 'Frontend Developer',
    start: 'May 2024',
    end: 'Present',
    description:
      "- Super-Pharm project (React), Jun 2026 – Present: the in-store point-of-sale for Israel's largest pharmacy chain, from cashier screens to self-checkout kiosks, including LLM-powered features.\n- Israel Discount Bank project (Angular), May 2024 – Jun 2026: led the upgrade from Angular 17 to 19 with zero downtime and built features for the bank's digital banking app.",
    technologies: ['React', 'Angular', 'TypeScript', 'Material UI', 'LLM APIs'],
  },
  {
    id: 'okoora',
    company: 'Okoora',
    role: 'Frontend Developer',
    start: 'Jan 2023',
    end: 'May 2024',
    description:
      'Delivered end-to-end features for a multi-currency business payments platform in Angular, Angular Material and SCSS, from design handoff to production. Collaborated with backend developers and managed code with Git Flow and pull-request reviews in Azure DevOps.',
    technologies: ['Angular', 'Angular Material', 'TypeScript', 'SCSS', 'Azure DevOps'],
  },
  {
    id: 'codespread',
    company: 'CodeSpread',
    role: 'Frontend Developer',
    start: 'Jun 2021',
    end: 'Dec 2022',
    description:
      'Built from scratch the entire front-end of a marketplace matching clients with open-source developers, serving hundreds of users. Engineered the single-page app in React, TypeScript, Redux and Material UI with one designer and two backend teams, and helped define the system architecture.',
    technologies: ['React', 'TypeScript', 'Redux', 'Material UI'],
  },
]
