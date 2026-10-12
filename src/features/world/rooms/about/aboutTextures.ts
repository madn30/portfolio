import * as THREE from 'three'
import { makeCanvas, pencil, type Point } from '@/shared/graphics/roomTextures'
import { mulberry32 } from '@/shared/graphics/sketch'

export const INK = '#35322e'
export const CREAM = '#fbfaf7'
export const GREY = '#e9e6df'
export const HAND = 'Caveat, "Segoe Print", cursive'
export const SERIF = 'Fraunces, "Iowan Old Style", Georgia, serif'

export { makeCanvas }

export function toTexture(canvas: HTMLCanvasElement): THREE.Texture {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

export function oval(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  random: () => number,
  steps = 40,
): Point[] {
  const points: Point[] = []
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2
    const w = 1 + (random() - 0.5) * 0.03
    points.push([cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w])
  }
  return points
}

export function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  color = INK,
  maxWidth = ctx.canvas.width * 0.92,
): void {
  ctx.font = font
  const wide = ctx.measureText(text).width
  if (wide > maxWidth) {
    ctx.font = font.replace(/([\d.]+)px/, (_, px: string) => `${(Number(px) * maxWidth) / wide}px`)
  }
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x, y)
}

export function wash(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  alpha: number,
): void {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.beginPath()
  points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export function hatch(
  ctx: CanvasRenderingContext2D,
  clip: Point[],
  random: () => number,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  gap = 14,
): void {
  ctx.save()
  ctx.beginPath()
  clip.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
  ctx.closePath()
  ctx.clip()
  for (let x = x0 - (y1 - y0); x < x1; x += gap) {
    pencil(
      ctx,
      [
        [x, y1],
        [x + (y1 - y0) * 0.6, y0],
      ],
      random,
      {
        close: false,
        width: 1.4,
        alpha: 0.35,
        passes: 1,
      },
    )
  }
  ctx.restore()
}

export interface SketchOptions {
  accent: string
  painted?: boolean
  seed?: number
}

export const BALLOON_ASPECT = 320 / 560

export function createPartyBalloonTexture(
  { accent, painted = false, seed = 3 }: SketchOptions,
  text: string,
  width = 320,
  height = 560,
): THREE.Texture {
  const [canvas, ctx] = makeCanvas(width, height)
  const random = mulberry32(seed * 41 + 9)
  const cx = width / 2
  const cy = height * 0.36
  const rx = width * 0.4
  const ry = height * 0.28
  const body = oval(cx, cy, rx, ry, random, 48)
  pencil(ctx, body, random, { fill: painted ? accent : CREAM, width: 3, jitter: 1.4 })
  if (painted) {
    wash(ctx, oval(cx - rx * 0.35, cy - ry * 0.4, rx * 0.22, ry * 0.3, random, 20), CREAM, 0.45)
  } else {
    hatch(ctx, body, random, cx + rx * 0.35, cx + rx, cy - ry, cy + ry, 15)
  }
  const knotY = cy + ry + 6
  pencil(
    ctx,
    [
      [cx, knotY - 10],
      [cx + 16, knotY + 16],
      [cx - 16, knotY + 16],
    ],
    random,
    { fill: painted ? accent : GREY, width: 2.4 },
  )
  const string: Point[] = []
  for (let i = 0; i <= 10; i++) {
    const t = i / 10
    string.push([cx + Math.sin(t * Math.PI * 2.2) * 22, knotY + 18 + t * (height - knotY - 40)])
  }
  pencil(ctx, string, random, { close: false, width: 2.2, jitter: 1.0, alpha: 0.8 })
  const size = text.length > 8 ? width * 0.15 : width * 0.19
  label(ctx, text, cx, cy + 4, `600 ${size}px ${HAND}`, painted ? CREAM : INK, rx * 1.6)
  return toTexture(canvas)
}
