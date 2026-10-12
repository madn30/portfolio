import * as THREE from 'three'
import type { Point } from '@/shared/graphics/roomTextures'

export const INK = '#35322e'
export const CREAM = '#fbfaf7'
export const GREY = '#e9e6df'
export const TERRACOTTA = '#c0693b'
export const OCHRE = '#d3a44c'
export const SAGE = '#8a9a7b'
export const SLATE = '#6f7f8f'

export { makeCanvas } from '@/shared/graphics/roomTextures'

export function toTexture(canvas: HTMLCanvasElement): THREE.Texture {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

export function ring(
  cx: number,
  cy: number,
  r: number,
  random: () => number,
  wobble = 0.05,
): Point[] {
  const points: Point[] = []
  const steps = 28
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2
    const w = r * (1 + (random() - 0.5) * wobble * 2)
    points.push([cx + Math.cos(a) * w, cy + Math.sin(a) * w])
  }
  return points
}

export function wash(
  ctx: CanvasRenderingContext2D,
  color: string,
  alpha: number,
  draw: () => void,
): void {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  draw()
  ctx.restore()
}
