import type { SkillCategory } from '@/shared/types'

export const skillCategories: SkillCategory[] = [
  {
    id: 'angular',
    title: 'Angular',
    blurb: 'My daily driver for the last three years: typed, reactive, built to last.',
    skills: ['Angular', 'Angular Material', 'RxJS', 'TypeScript', 'SCSS', 'AngularJS'],
    accent: 'terracotta',
  },
  {
    id: 'react',
    title: 'React',
    blurb: 'From a marketplace built from scratch to the 3D corridor you are standing in.',
    skills: ['React', 'Redux', 'MobX', 'Material UI', 'React Native', 'Expo', 'Three.js'],
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
    skills: ['Node.js', 'Express', 'REST APIs', 'MongoDB', 'SQL', 'C#'],
    accent: 'slate',
  },
  {
    id: 'tooling',
    title: 'Tooling',
    blurb: 'Fast feedback loops so the team can ship with confidence.',
    skills: ['Git', 'Vite', 'npm', 'Microsoft Azure', 'ESLint & Prettier'],
    accent: 'plum',
  },
]
