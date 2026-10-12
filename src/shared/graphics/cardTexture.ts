import * as THREE from 'three'
import { wrapCanvasText } from './canvasText'
import { mulberry32 } from './sketch'

export interface CardOptions {
  eyebrow?: string
  title?: string
  subtitle?: string
  body?: string
  footer?: string
  accent?: string
  width?: number
  height?: number
  titleSize?: number
  bodySize?: number
  seed?: number
}

function wobblyRect(
  ctx: CanvasRenderingContext2D,
  random: () => number,
  x: number,
  y: number,
  w: number,
  h: number,
  wobble: number,
): void {
  const corners = [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ]
  ctx.beginPath()
  for (let i = 0; i < 4; i++) {
    const [ax, ay] = corners[i]
    const [bx, by] = corners[(i + 1) % 4]
    const steps = 8
    for (let s = 0; s <= steps; s++) {
      const t = s / steps
      const px = ax + (bx - ax) * t + (random() - 0.5) * wobble
      const py = ay + (by - ay) * t + (random() - 0.5) * wobble
      if (i === 0 && s === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
  }
  ctx.closePath()
}

export function createCardTexture({
  eyebrow,
  title,
  subtitle,
  body,
  footer,
  accent = '#8a9a7b',
  width = 1024,
  height = 640,
  titleSize = 84,
  bodySize = 42,
  seed = 1,
}: CardOptions): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')
  const random = mulberry32(seed * 37 + 11)

  ctx.fillStyle = '#fbfaf7'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = 'rgba(60,45,30,0.035)'
  for (let i = 0; i < 140; i++) {
    ctx.fillRect(random() * width, random() * height, 2, 2)
  }

  const inset = Math.round(width * 0.028)
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#2a2724'
  ctx.lineWidth = 3
  ctx.globalAlpha = 0.85
  wobblyRect(ctx, random, inset, inset, width - inset * 2, height - inset * 2, 3)
  ctx.stroke()
  ctx.lineWidth = 1.5
  ctx.globalAlpha = 0.45
  wobblyRect(ctx, random, inset + 7, inset + 7, width - inset * 2 - 14, height - inset * 2 - 14, 4)
  ctx.stroke()
  ctx.globalAlpha = 1

  ctx.save()
  ctx.translate(width / 2, inset + 4)
  ctx.rotate((random() - 0.5) * 0.06)
  ctx.fillStyle = accent
  ctx.globalAlpha = 0.82
  ctx.fillRect(-width * 0.09, -16, width * 0.18, 32)
  ctx.restore()

  const maxWidth = width - inset * 2 - width * 0.1
  const top = inset + 44
  const available = height - top - inset - 24
  interface Block {
    font: string
    color: string
    lines: string[]
    lineHeight: number
    gap: number
  }
  const layout = (scale: number): Block[] => {
    const titlePx = titleSize * scale
    const bodyPx = bodySize * scale
    const eyebrowPx = Math.round(titlePx * 0.46)
    const blocks: Block[] = []
    if (eyebrow) {
      ctx.font = `600 ${eyebrowPx}px Caveat, "Segoe Print", cursive`
      blocks.push({
        font: ctx.font,
        color: accent,
        lines: [eyebrow],
        lineHeight: eyebrowPx * 1.05,
        gap: eyebrowPx * 0.2,
      })
    }
    if (title) {
      ctx.font = `600 ${titlePx}px Fraunces, "Iowan Old Style", Georgia, serif`
      blocks.push({
        font: ctx.font,
        color: '#1f1b18',
        lines: wrapCanvasText(ctx, title, maxWidth),
        lineHeight: titlePx * 1.08,
        gap: titlePx * 0.3,
      })
    }
    if (subtitle) {
      const px = Math.round(titlePx * 0.5)
      ctx.font = `italic 500 ${px}px Fraunces, "Iowan Old Style", Georgia, serif`
      blocks.push({
        font: ctx.font,
        color: '#5c554f',
        lines: wrapCanvasText(ctx, subtitle, maxWidth),
        lineHeight: px * 1.15,
        gap: px * 0.5,
      })
    }
    if (body) {
      ctx.font = `400 ${bodyPx}px "Instrument Sans", "Segoe UI", system-ui, sans-serif`
      const lines = body
        .split('\n')
        .filter((p) => p.trim())
        .flatMap((p, i) =>
          i ? ['', ...wrapCanvasText(ctx, p, maxWidth)] : wrapCanvasText(ctx, p, maxWidth),
        )
      blocks.push({
        font: ctx.font,
        color: '#4a443f',
        lines,
        lineHeight: bodyPx * 1.42,
        gap: footer ? bodyPx * 0.9 : 0,
      })
    }
    if (footer) {
      const px = Math.round(bodyPx * 1.05)
      ctx.font = `600 ${px}px Caveat, "Segoe Print", cursive`
      blocks.push({
        font: ctx.font,
        color: accent,
        lines: wrapCanvasText(ctx, footer, maxWidth),
        lineHeight: px * 1.1,
        gap: 0,
      })
    }
    return blocks
  }
  const heightOf = (blocks: Block[]) =>
    blocks.reduce((sum, b) => sum + b.lines.length * b.lineHeight + b.gap, 0)
  const widthOf = (blocks: Block[]) =>
    Math.max(
      1,
      ...blocks.flatMap((b) => {
        ctx.font = b.font
        return b.lines.map((line) => ctx.measureText(line).width)
      }),
    )
  let scale = 1
  let blocks = layout(scale)
  for (let i = 0; i < 4 && widthOf(blocks) > maxWidth; i++) {
    scale *= Math.max(0.5, (maxWidth / widthOf(blocks)) * 0.98)
    blocks = layout(scale)
  }
  for (let i = 0; i < 6 && heightOf(blocks) > available; i++) {
    scale *= Math.max(0.6, Math.min(0.95, available / heightOf(blocks)))
    blocks = layout(scale)
  }
  const total = heightOf(blocks)
  let y = Math.max(height / 2 - total / 2, top)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  for (const block of blocks) {
    ctx.font = block.font
    ctx.fillStyle = block.color
    for (const line of block.lines) {
      ctx.fillText(line, width / 2, y)
      y += block.lineHeight
    }
    y += block.gap
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}
