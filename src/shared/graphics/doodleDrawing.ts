import * as THREE from 'three'
import type { Point } from './roomTextures'

export const INK = '#35322e'
export const CREAM = '#fbfaf7'
export const GREY = '#e9e6df'
export const ACCENT = '#c0693b'

export { makeCanvas } from './roomTextures'

export function toTexture(canvas: HTMLCanvasElement): THREE.Texture {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function ring(
  cx: number,
  cy: number,
  r: number,
  random: () => number,
  wobble = 0.04,
): Point[] {
  const points: Point[] = []
  const steps = 26
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2
    const w = r * (1 + (random() - 0.5) * wobble * 2)
    points.push([cx + Math.cos(a) * w, cy + Math.sin(a) * w])
  }
  return points
}

export function arc(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  from: number,
  to: number,
  width = 2.4,
  alpha = 0.95,
): void {
  ctx.strokeStyle = INK
  ctx.lineCap = 'round'
  for (let pass = 0; pass < 2; pass++) {
    ctx.globalAlpha = pass === 0 ? alpha : alpha * 0.4
    ctx.lineWidth = pass === 0 ? width : width * 0.6
    ctx.beginPath()
    ctx.arc(x + pass * 1.2, y + pass * 0.8, r, from, to)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}
