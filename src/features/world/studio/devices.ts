import * as THREE from 'three'
import { createSketchPolyline } from '@/shared/graphics/sketch'
import type { DeviceKind } from './content'

interface DeviceSize {
  width: number
  height: number
  depth: number
}

export const DEVICE_SIZE: Record<DeviceKind, DeviceSize> = {
  tv: { width: 1.6, height: 1.19, depth: 0.7 },
  monitor: { width: 1.6, height: 1.0, depth: 0.1 },
  phone: { width: 0.6, height: 1.14, depth: 0.07 },
}

export const SCREEN_SIZE: Record<DeviceKind, [number, number]> = {
  tv: [1.3, 0.845],
  monitor: [1.42, 0.84],
  phone: [0.52, 0.96],
}

function box(size: DeviceSize): THREE.BoxGeometry {
  return new THREE.BoxGeometry(size.width, size.height, size.depth)
}

function plane([w, h]: [number, number]): THREE.PlaneGeometry {
  return new THREE.PlaneGeometry(w, h)
}

function v(x: number, y: number, z: number): THREE.Vector3 {
  return new THREE.Vector3(x, y, z)
}

export function createDeviceGeometries() {
  return {
    tvBody: box(DEVICE_SIZE.tv),
    tvHump: new THREE.BoxGeometry(1.1, 0.82, 0.3),
    tvScreen: plane(SCREEN_SIZE.tv),
    tvKnob: new THREE.CylinderGeometry(0.05, 0.05, 0.05, 10),
    tvFoot: new THREE.BoxGeometry(0.14, 0.08, 0.4),
    tvAntenna: createSketchPolyline(
      [v(-0.35, 1.42, -0.3), v(0.25, 0.6, -0.15), v(0.8, 1.35, -0.3)],
      {
        jitter: 0.012,
        subdivisions: 4,
        seed: 311,
        passes: 2,
      },
    ),
    monitorBody: box(DEVICE_SIZE.monitor),
    monitorScreen: plane(SCREEN_SIZE.monitor),
    monitorNeck: new THREE.BoxGeometry(0.12, 0.22, 0.08),
    monitorFoot: new THREE.BoxGeometry(0.64, 0.04, 0.3),
    monitorCable: createSketchPolyline(
      [v(0.35, -0.45, -0.06), v(0.5, -0.9, -0.3), v(0.3, -1.35, -0.2), v(0.45, -1.7, -0.4)],
      { jitter: 0.02, subdivisions: 4, seed: 312, passes: 1 },
    ),
    phoneBody: box(DEVICE_SIZE.phone),
    phoneScreen: plane(SCREEN_SIZE.phone),
    phoneButton: new THREE.BoxGeometry(0.03, 0.12, 0.02),
    glow: new THREE.PlaneGeometry(1, 1),
  }
}

export type DeviceGeometries = ReturnType<typeof createDeviceGeometries>

export function disposeDeviceGeometries(geometries: DeviceGeometries): void {
  Object.values(geometries).forEach((g) => g.dispose())
}
