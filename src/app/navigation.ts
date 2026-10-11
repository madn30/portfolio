import { prefersReducedMotion } from '@/hooks/useReducedMotion'
import { setWorld, worldStore } from '@/store/worldStore'
import type { DoorSectionId } from '@/types'
import { doorStationProgress, getDoor, scrollToProgress } from '@/utils/corridor'
import { navigate } from './router'

let pendingTimer = 0

/** How long the camera walks toward a door before the section panel opens. */
export const WALK_DURATION_MS = 820

/**
 * Opens a section. With the 3D scene active (and motion allowed) the camera first walks to
 * the door and the door swings open; otherwise the section opens immediately.
 */
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
  setWorld((prev) => ({
    enteringDoor: id,
    hoveredDoor: null,
    introDone: true,
    transitionTick: prev.transitionTick + 1,
  }))
  // Keep the page scroll in sync so closing the section leaves you at this door.
  scrollToProgress(doorStationProgress(getDoor(id)), false)
  pendingTimer = window.setTimeout(() => {
    // The visitor may have navigated elsewhere while the camera was walking.
    if (worldStore.getState().enteringDoor === id) navigate({ section: id })
  }, WALK_DURATION_MS)
}

export function cancelPendingNavigation(): void {
  window.clearTimeout(pendingTimer)
  if (worldStore.getState().enteringDoor) setWorld({ enteringDoor: null })
}

/** Closes the open section and returns to the corridor at the same door. */
export function closeSection(): void {
  cancelPendingNavigation()
  navigate({ section: 'home' })
}

/** Closes everything and walks back to the entrance. */
export function goHome(): void {
  cancelPendingNavigation()
  navigate({ section: 'home' })
  // Wait for the body scroll lock to lift before scrolling.
  window.setTimeout(() => scrollToProgress(0, !prefersReducedMotion()), 40)
}

export function openProject(projectId: string): void {
  navigate({ section: 'projects', projectId })
}

export function closeProject(): void {
  navigate({ section: 'projects' })
}

/** Scrolls the corridor so the camera stands in front of a door without opening it. */
export function walkToDoor(id: DoorSectionId): void {
  setWorld({ introDone: true })
  scrollToProgress(doorStationProgress(getDoor(id)), !prefersReducedMotion())
}
