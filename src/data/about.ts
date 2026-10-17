import type { JourneyStop, TechBalloon } from '@/shared/types'

export const about = {
  summary:
    'Frontend developer from Hadera with 5 years of experience building production web applications in React and Angular for enterprise clients, currently developing point-of-sale and LLM-powered features for Super-Pharm.',
  experience:
    "I built a marketplace front-end from scratch at CodeSpread and a payments platform at Okoora. At realcommerce I led a bank upgrade to Angular 19 and now build Super-Pharm's point-of-sale in React. I studied software engineering at Ruppin and finished a MERN boot-camp.",
  quote: ['Build the quiet parts well,', 'and the loud parts take care of themselves.'],
  interests: [
    'Angular & React',
    'TypeScript',
    'State management',
    'UI libraries',
    'LLM-powered features',
    'Interactive 3D on the web',
    'Performance',
  ],
  philosophy: [
    { title: 'Clarity over cleverness', text: 'Code is read far more often than it is written.' },
    { title: 'Own the architecture', text: 'Be in the room when the system is being shaped.' },
    {
      title: 'Close to the design',
      text: 'The best screens come from working beside the designer.',
    },
  ],
  currentFocus:
    "Building Super-Pharm's point-of-sale and its LLM-powered features in React, and growing this corridor with React Three Fiber.",
  loopNote: '…and round again',
  journey: [
    {
      id: 'ruppin',
      title: 'Ruppin Academic Center',
      period: 'Practical Engineer, Software',
      text: 'Where the fundamentals were laid down.',
      landmark: 'school',
      accent: 'slate',
    },
    {
      id: 'codespread',
      title: 'CodeSpread',
      period: 'developer marketplace',
      text: 'Shipped a marketplace from scratch.',
      landmark: 'flag',
      accent: 'terracotta',
    },
    {
      id: 'okoora',
      title: 'Okoora',
      period: 'payments platform',
      text: 'Multi-currency, multi-screen, always on.',
      landmark: 'tree',
      accent: 'sage',
    },
    {
      id: 'realcommerce',
      title: 'Yael realcommerce',
      period: 'now',
      text: 'A bank in Angular, Super-Pharm in React.',
      landmark: 'house',
      accent: 'ochre',
    },
  ] satisfies JourneyStop[],
  techBalloons: [
    { label: 'Angular', size: 'large', accent: 'terracotta' },
    { label: 'React', size: 'large', accent: 'slate' },
    { label: 'TypeScript', size: 'large', accent: 'sage' },
    { label: 'RxJS', size: 'medium', accent: 'plum' },
    { label: 'Three.js', size: 'medium', accent: 'ochre' },
    { label: 'Node', size: 'medium', accent: 'sage' },
    { label: 'Tailwind', size: 'small', accent: 'slate' },
    { label: 'PostgreSQL', size: 'small', accent: 'terracotta' },
    { label: 'Figma', size: 'small', accent: 'plum' },
    { label: 'Vite', size: 'small', accent: 'ochre' },
  ] satisfies TechBalloon[],
}
