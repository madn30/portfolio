import type { ExperienceEntry } from '@/shared/types'

export const experience: ExperienceEntry[] = [
  {
    id: 'super-pharm',
    company: 'Yael realcommerce',
    role: 'Frontend Developer (React) · Super-Pharm project',
    start: 'Jun 2026',
    end: 'Present',
    description:
      "Develop the in-store point-of-sale system for Super-Pharm, Israel's largest pharmacy and retail chain: the cashier checkout screens and the self-checkout kiosks. Joined mid-stream and shipped production features within the first weeks, turning Figma designs into reusable Material UI components and building LLM-powered features into the checkout.",
    technologies: ['React', 'TypeScript', 'Material UI', 'LLM APIs', 'Figma'],
  },
  {
    id: 'discount-bank',
    company: 'Yael realcommerce',
    role: 'Frontend Developer (Angular) · Israel Discount Bank project',
    start: 'May 2024',
    end: 'Jun 2026',
    description:
      "Led the upgrade of the bank's application from Angular 17 to Angular 19 with zero production downtime. Developed customer-facing features for the digital banking platform, shipping with product, backend and QA through the bank's regulated release and security review process.",
    technologies: ['Angular', 'TypeScript', 'RxJS', 'SCSS'],
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
