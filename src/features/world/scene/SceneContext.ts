import { createContext, useContext } from 'react'
import type { QualityTier } from '@/shared/types'
import type { SceneMaterials } from './materials'

export interface SceneContextValue {
  quality: QualityTier
  reducedMotion: boolean
  touch: boolean
  materials: SceneMaterials
}

export const SceneContext = createContext<SceneContextValue | null>(null)

export function useScene(): SceneContextValue {
  const value = useContext(SceneContext)
  if (!value) throw new Error('useScene must be used inside <CorridorScene>')
  return value
}
