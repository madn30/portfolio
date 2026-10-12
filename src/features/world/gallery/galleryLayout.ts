import * as THREE from 'three'
import { projects } from '@/data/projects'
import type { Project } from '@/shared/types'
import type { RoomCamera } from '@/features/world/rooms/cameras'

export const CARD = { w: 1.25, h: 1.0, drop: 0.56 } as const

export const GAP = 1.7
export const SLOTS = Math.max(projects.length, Math.ceil(12 / projects.length) * projects.length)
export const LINE_TOTAL = SLOTS * GAP
export const LINE_HALF = Math.max(11, LINE_TOTAL / 2 + 1)

export const INSPECT: readonly [number, number, number] = [0, 1.75, -4.1]

export function slotProject(slot: number): Project {
  return projects[slot % projects.length]
}

export function displayX(slot: number, scroll: number): number {
  const half = LINE_TOTAL / 2
  const raw = slot * GAP - scroll
  return ((((raw + half) % LINE_TOTAL) + LINE_TOTAL) % LINE_TOTAL) - half
}

export function createLineCurve(): THREE.CatmullRomCurve3 {
  const profile: [number, number, number][] = [
    [-1, 3.4, -8.6],
    [-0.5, 2.95, -7.6],
    [0, 2.7, -6.8],
    [0.5, 2.95, -7.6],
    [1, 3.4, -8.6],
  ]
  return new THREE.CatmullRomCurve3(
    profile.map(([x, y, z]) => new THREE.Vector3(x * LINE_HALF, y, z)),
  )
}

export function pointOnLine(
  curve: THREE.CatmullRomCurve3,
  x: number,
  target: THREE.Vector3,
): THREE.Vector3 {
  const u = THREE.MathUtils.clamp((x + LINE_HALF) / (LINE_HALF * 2), 0, 1)
  return curve.getPointAt(u, target)
}

export function projectFocusPose(projectId: string): RoomCamera | null {
  if (!projects.some((p) => p.id === projectId)) return null
  return { position: [0, 1.8, -2.0], look: INSPECT }
}
