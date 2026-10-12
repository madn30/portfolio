import { prefersReducedMotion } from '@/shared/hooks/useReducedMotion'
import { setWorld, worldStore } from '@/shared/store/worldStore'
import type { DoorSectionId } from '@/shared/types'
import { DOOR_PUSH_SECONDS, doorStationProgress, getDoor } from '@/shared/corridor/corridor'
import { walkThroughLoop, walkToProgress } from './walk'
import { navigate } from './router'

let pendingTimer = 0

const WALK_DURATION_MS = DOOR_PUSH_SECONDS * 1000

export function openSection(id: DoorSectionId, options: { immediate?: boolean } = {}): void {
  const state = worldStore.getState()
  const canWalk =
    !options.immediate &&
    state.sceneReady &&
    !state.sceneFailed &&
    !prefersReducedMotion() &&
    state.activeDoor === null

  if (!canWalk) {
    navigate({ section: id })
    return
  }
  if (state.enteringDoor === id) return

  window.clearTimeout(pendingTimer)
  setWorld({
    enteringDoor: id,
    hoveredDoor: null,
    introDone: true,
  })
  walkToProgress(doorStationProgress(getDoor(id)), false)
  pendingTimer = window.setTimeout(() => {
    if (worldStore.getState().enteringDoor === id) navigate({ section: id })
  }, WALK_DURATION_MS)
}

export function cancelPendingNavigation(): void {
  window.clearTimeout(pendingTimer)
  if (worldStore.getState().enteringDoor) setWorld({ enteringDoor: null })
}

export function closeSection(): void {
  cancelPendingNavigation()
  navigate({ section: 'home' })
}

export function goHome(): void {
  cancelPendingNavigation()
  navigate({ section: 'home' })
  walkToProgress(0, !prefersReducedMotion())
}

export function openProject(projectId: string): void {
  navigate({ section: 'projects', projectId })
}

export function closeProject(): void {
  navigate({ section: 'projects' })
}

export function walkThroughLoopDoor(): void {
  setWorld({ introDone: true })
  walkThroughLoop()
}

export function walkToDoor(id: DoorSectionId): void {
  setWorld({ introDone: true })
  walkToProgress(doorStationProgress(getDoor(id)), !prefersReducedMotion())
}
