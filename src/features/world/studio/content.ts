import { skillCategories } from '@/data/skills'
import type { SkillCategory } from '@/shared/types'

export type DeviceKind = 'tv' | 'monitor' | 'phone'

export interface StudioItem {
  id: string
  device: DeviceKind
  category: SkillCategory
  categoryIndex: number
  skill: string | null
  seed: number
}

export const STUDIO_ITEMS: readonly StudioItem[] = skillCategories.flatMap(
  (category, categoryIndex) => {
    const base = categoryIndex * 100
    const items: StudioItem[] = [
      { id: `cat-${category.id}`, device: 'tv', category, categoryIndex, skill: null, seed: base },
    ]
    category.skills.forEach((skill, i) => {
      items.push({
        id: `skill-${category.id}-${i}`,
        device: (categoryIndex + i) % 3 === 1 ? 'phone' : 'monitor',
        category,
        categoryIndex,
        skill,
        seed: base + i + 1,
      })
    })
    return items
  },
)

export function findStudioItem(id: string): StudioItem | undefined {
  return STUDIO_ITEMS.find((item) => item.id === id)
}
