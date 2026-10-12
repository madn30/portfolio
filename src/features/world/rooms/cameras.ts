import type { DoorSectionId } from '@/shared/types'

export interface RoomCamera {
  position: readonly [number, number, number]
  look: readonly [number, number, number]
}

export const roomCameras: Record<DoorSectionId, RoomCamera> = {
  about: { position: [0, 1.7, -1.9], look: [0, 1.9, -10] },
  projects: { position: [0, 1.65, -1.8], look: [0, 2.05, -9] },
  skills: { position: [0, 1.8, -1.8], look: [0, 1.9, -9] },
  experience: { position: [0, 1.7, -1.9], look: [0, 2.6, -10] },
  contact: { position: [0, 1.75, -1.9], look: [0, 0.9, -11] },
}
