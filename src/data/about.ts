import type { JourneyStop, TechBalloon } from '@/shared/types'

export const about = {
  summary:
    'I am a front-end developer from Tel Aviv with five years of building web applications in Angular and React, and I also build full-stack products end to end, from Node APIs to the database. I like interfaces that stay quick and predictable as the product grows, and I care about the details users never notice because they just work.',
  experience:
    'I have shipped a developer marketplace from scratch at CodeSpread, a multi-currency financial platform at Okoora, and I now build Angular front-ends at realcommerce by Yael Group. I also freelance, and built the system a large plant nursery runs on every day. I hold a B.E. in Software Engineering from Ruppin Academic Center and finished a MERN stack boot-camp on top of it.',
  quote: ['Build the quiet parts well,', 'and the loud parts take care of themselves.'],
  interests: [
    'Angular & React',
    'TypeScript',
    'State management',
    'UI libraries',
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
    'Building this corridor with React Three Fiber, and going deeper into Angular signals and modern TypeScript.',
  loopNote: '…and round again',
  journey: [
    {
      id: 'ruppin',
      title: 'Ruppin Academic Center',
      period: 'B.E. Software Engineering',
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
      period: 'financial platform',
      text: 'Multi-currency, multi-screen, always on.',
      landmark: 'tree',
      accent: 'sage',
    },
    {
      id: 'realcommerce',
      title: 'realcommerce by Yael Group',
      period: 'now',
      text: 'Angular front-ends for large clients.',
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
