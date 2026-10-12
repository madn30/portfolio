import type { QualityTier } from '@/shared/types'
import { mulberry32 } from '@/shared/graphics/sketch'
import { STUDIO_ITEMS, type StudioItem } from './content'

export const TOWER = {
  radius: 2.2,
  perRing: 4,
  spacing: 2.5,
  position: [0, -4, -7] as const,
  bottom: -1.5,
  podium: [0, 1.7, -4.2] as const,
} as const

export interface TowerSlot {
  x: number
  z: number
  baseY: number
  rot: number
}

export function pickTowerItems(quality: QualityTier): StudioItem[] {
  const chosen = STUDIO_ITEMS.filter(
    (item, i) => quality !== 'low' || item.skill === null || i % 3 !== 2,
  )
  const random = mulberry32(9)
  for (let i = chosen.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[chosen[i], chosen[j]] = [chosen[j], chosen[i]]
  }
  return chosen
}

export function towerSlots(count: number): { slots: TowerSlot[]; totalHeight: number } {
  const step = (Math.PI * 2) / TOWER.perRing
  const slots: TowerSlot[] = []
  for (let i = 0; i < count; i++) {
    const ring = Math.floor(i / TOWER.perRing)
    const angle = (i % TOWER.perRing) * step + (ring % 2 ? step / 2 : 0)
    slots.push({
      x: Math.cos(angle) * TOWER.radius,
      z: Math.sin(angle) * TOWER.radius,
      baseY: ring * TOWER.spacing + (Math.sin(i * 1.7) + Math.cos(i * 2.3)) * 0.4,
      rot: -angle + Math.PI / 2,
    })
  }
  const ys = slots.map((s) => s.baseY)
  const span = ys.length ? Math.max(...ys) - Math.min(...ys) : 0
  return { slots, totalHeight: Math.max(TOWER.spacing * 3, span + TOWER.spacing) }
}
