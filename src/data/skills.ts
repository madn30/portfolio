import type { SkillCategory } from '@/types'

/**
 * Skills grouped by category. Edit freely.
 * No proficiency percentages on purpose — list what you actually use.
 */
export const skillCategories: SkillCategory[] = [
  {
    id: 'frontend',
    title: 'Frontend',
    blurb: 'Interfaces that feel considered, from layout to the last micro-interaction.',
    skills: [
      'React',
      'TypeScript',
      'JavaScript',
      'Angular',
      'HTML & CSS',
      'Three.js',
      'Accessibility',
    ],
    accent: 'terracotta',
  },
  {
    id: 'backend',
    title: 'Backend',
    blurb: 'Services that are boring in the best way: predictable, observable, documented.',
    skills: ['Node.js', 'REST APIs', 'PostgreSQL', 'Authentication', 'Caching'],
    accent: 'ochre',
  },
  {
    id: 'architecture',
    title: 'Architecture',
    blurb: 'Choosing the simplest structure that will survive the next requirement.',
    skills: ['Component design', 'State management', 'Design systems', 'Performance budgets'],
    accent: 'sage',
  },
  {
    id: 'tooling',
    title: 'Tooling',
    blurb: 'Fast feedback loops so the team can ship with confidence.',
    skills: ['Git', 'Vite', 'ESLint & Prettier', 'CI/CD', 'npm'],
    accent: 'slate',
  },
  {
    id: 'testing',
    title: 'Testing',
    blurb: 'Tests that describe behaviour, not implementation details.',
    skills: ['Automated testing', 'Unit tests', 'Integration tests', 'End-to-end tests'],
    accent: 'plum',
  },
]
