import type { ExperienceEntry } from '@/types'

/**
 * Professional timeline. These are PLACEHOLDER entries (isPlaceholder: true).
 * Replace with your real roles — the UI labels placeholders clearly.
 */
export const experience: ExperienceEntry[] = [
  {
    id: 'exp-1',
    company: '[Company Name]',
    role: 'Software Developer',
    start: '2024',
    end: 'Present',
    description:
      'Placeholder: describe the product, your responsibilities, and a concrete outcome you contributed to.',
    technologies: ['React', 'TypeScript', 'Node.js'],
    isPlaceholder: true,
  },
  {
    id: 'exp-2',
    company: '[Previous Company]',
    role: 'Frontend Developer',
    start: '2022',
    end: '2024',
    description: 'Placeholder: describe what you built, who you worked with, and what you learned.',
    technologies: ['Angular', 'JavaScript', 'Automated testing'],
    isPlaceholder: true,
  },
  {
    id: 'exp-3',
    company: '[First Role]',
    role: 'Junior Developer',
    start: '2020',
    end: '2022',
    description: 'Placeholder: early career role, internship, or significant freelance work.',
    technologies: ['HTML & CSS', 'JavaScript', 'Git'],
    isPlaceholder: true,
  },
]
