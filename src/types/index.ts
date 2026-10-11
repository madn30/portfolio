export type SectionId = 'home' | 'about' | 'projects' | 'skills' | 'experience' | 'contact'

export type DoorSectionId = Exclude<SectionId, 'home'>

export type AccentColor = 'sage' | 'terracotta' | 'ochre' | 'slate' | 'plum'

export interface Project {
  /** Stable identifier used in URLs (#/projects/<id>). */
  id: string
  title: string
  description: string
  /** Longer description shown in the project detail view. */
  details?: string
  tags: string[]
  /** Path under /public, e.g. /images/projects/example.svg */
  image: string
  imageAlt: string
  demoUrl?: string
  repoUrl?: string
  year?: string
  accent: AccentColor
  /** Marks demo content so it is clearly labelled in the UI. */
  isPlaceholder?: boolean
}

export interface SkillCategory {
  id: string
  title: string
  blurb: string
  skills: string[]
  accent: AccentColor
}

export interface ExperienceEntry {
  id: string
  company: string
  role: string
  start: string
  end: string
  description: string
  technologies: string[]
  isPlaceholder?: boolean
}

export interface SocialLink {
  id: 'github' | 'linkedin' | 'other'
  label: string
  /** Leave empty to hide the link. */
  url: string
}

export type QualityTier = 'high' | 'medium' | 'low'
export type DeviceKind = 'desktop' | 'tablet' | 'mobile'
