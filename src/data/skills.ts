import type { SkillCategory } from '@/shared/types'

export const skillCategories: SkillCategory[] = [
  {
    id: 'angular',
    title: 'Angular',
    blurb: 'Three years of enterprise Angular, up to leading a bank upgrade to Angular 19.',
    skills: ['Angular', 'Angular Material', 'RxJS', 'TypeScript', 'SCSS', 'AngularJS'],
    accent: 'terracotta',
  },
  {
    id: 'react',
    title: 'React',
    blurb: 'From a marketplace built from scratch to a retail point-of-sale and this corridor.',
    skills: [
      'React',
      'Redux',
      'MobX',
      'Material UI',
      'React Native',
      'Expo',
      'Three.js',
      'Next.js',
      'React Query',
    ],
    accent: 'ochre',
  },
  {
    id: 'web',
    title: 'Web fundamentals',
    blurb: 'The layer underneath every framework, written with care.',
    skills: ['JavaScript', 'ES6+', 'HTML', 'CSS', 'Flexbox', 'Responsive layout'],
    accent: 'sage',
  },
  {
    id: 'backend',
    title: 'Backend',
    blurb: 'Enough server to build the whole product when the team is small.',
    skills: ['Node.js', 'Express', 'REST APIs', 'MongoDB', 'SQL', 'C#', 'LLM APIs'],
    accent: 'slate',
  },
  {
    id: 'tooling',
    title: 'Tooling',
    blurb: 'Fast feedback loops so the team can ship with confidence.',
    skills: ['Git', 'Vite', 'npm', 'Azure DevOps', 'ESLint & Prettier', 'Figma'],
    accent: 'plum',
  },
]
