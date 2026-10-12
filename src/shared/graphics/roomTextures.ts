import * as THREE from 'three'

export function makeCanvas(
  width: number,
  height: number,
): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')
  return [canvas, ctx]
}

export function toTexture(canvas: HTMLCanvasElement): THREE.Texture {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export type Point = [number, number]

export const INK = '#35322e'

function wobble(points: Point[], random: () => number, jitter: number, step = 12): Point[] {
  const out: Point[] = []
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i]
    const [x1, y1] = points[i + 1]
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / step))
    for (let s = 0; s < n; s++) {
      const t = s / n
      out.push([
        x0 + (x1 - x0) * t + (random() - 0.5) * jitter * 2,
        y0 + (y1 - y0) * t + (random() - 0.5) * jitter * 2,
      ])
    }
  }
  out.push(points[points.length - 1])
  return out
}

interface PencilOptions {
  fill?: string
  close?: boolean
  width?: number
  jitter?: number
  passes?: number
  alpha?: number
  color?: string
}

export function pencil(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  random: () => number,
  {
    fill,
    close = true,
    width = 2.5,
    jitter = 1.4,
    passes = 2,
    alpha = 0.95,
    color = INK,
  }: PencilOptions = {},
): void {
  const path = close ? [...points, points[0]] : points
  if (fill) {
    ctx.beginPath()
    path.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()
  }
  ctx.strokeStyle = color
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (let p = 0; p < passes; p++) {
    const pts = wobble(path, random, jitter)
    ctx.globalAlpha = p === 0 ? alpha : alpha * 0.4
    ctx.lineWidth = p === 0 ? width : width * 0.6
    ctx.beginPath()
    pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}
