export type SectionId = 'home' | 'about' | 'projects' | 'skills' | 'experience' | 'contact'

export type DoorSectionId = Exclude<SectionId, 'home'>

export type AccentColor = 'sage' | 'terracotta' | 'ochre' | 'slate' | 'plum'

export interface Project {
  id: string
  title: string
  description: string
  details?: string
  tags: string[]
  image: string
  imageAlt: string
  demoUrl?: string
  repoUrl?: string
  year?: string
  accent: AccentColor
  isPlaceholder?: boolean
  isPrivate?: boolean
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
  url: string
}

export type QualityTier = 'high' | 'medium' | 'low'
export type DeviceKind = 'desktop' | 'tablet' | 'mobile'

export interface JourneyStop {
  id: string
  title: string
  period: string
  text: string
  landmark: 'school' | 'flag' | 'tree' | 'house'
  accent: AccentColor
}

export interface TechBalloon {
  label: string
  size: 'large' | 'medium' | 'small'
  accent: AccentColor
}
