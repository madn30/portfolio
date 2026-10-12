import * as THREE from 'three'
import { wrapCanvasText } from '@/shared/graphics/canvasText'
import { mulberry32 } from '@/shared/graphics/sketch'
import { sketchRect } from './pencilCanvas'

export interface ScreenOptions {
  index: number
  title: string
  blurb: string
  skills: string[]
  accent: string
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

export function createScreenTexture({
  index,
  title,
  blurb,
  skills,
  accent,
}: ScreenOptions): THREE.Texture {
  const width = 640
  const height = 416
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')
  const random = mulberry32(title.length * 17 + index)

  ctx.fillStyle = '#fbfaf7'
  ctx.fillRect(0, 0, width, height)

  const barHeight = 46
  ctx.fillStyle = '#f1efe9'
  ctx.fillRect(0, 0, width, barHeight)
  ctx.strokeStyle = '#262421'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, barHeight + (random() - 0.5) * 2)
  ctx.lineTo(width, barHeight + (random() - 0.5) * 2)
  ctx.stroke()
  ;[accent, '#d6d2c8', '#d6d2c8'].forEach((colour, i) => {
    ctx.beginPath()
    ctx.arc(28 + i * 26, barHeight / 2, 7, 0, Math.PI * 2)
    ctx.fillStyle = colour
    ctx.fill()
    ctx.lineWidth = 1.5
    ctx.stroke()
  })
  ctx.fillStyle = '#8a847c'
  ctx.font = `500 18px "Instrument Sans", system-ui, sans-serif`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${title.toLowerCase()}.ts`, width - 24, barHeight / 2)

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = accent
  ctx.font = `600 40px Caveat, "Segoe Print", cursive`
  ctx.fillText(`0${index}`, 30, 104)
  ctx.fillStyle = '#262421'
  ctx.font = `500 46px Fraunces, Georgia, serif`
  ctx.fillText(title, 86, 106)

  ctx.fillStyle = '#5c554e'
  ctx.font = `500 27px Caveat, "Segoe Print", cursive`
  const blurbLines = wrapCanvasText(ctx, blurb, width - 60).slice(0, 2)
  blurbLines.forEach((line, i) => ctx.fillText(line, 30, 146 + i * 32))

  ctx.font = `500 21px "Instrument Sans", system-ui, sans-serif`
  const pillHeight = 40
  const gap = 10
  let x = 30
  let y = 150 + blurbLines.length * 32
  for (const skill of skills) {
    const w = ctx.measureText(skill).width + 30
    if (x + w > width - 30) {
      x = 30
      y += pillHeight + gap
    }
    if (y + pillHeight > height - 16) break
    roundedRect(ctx, x, y, w, pillHeight, pillHeight / 2)
    ctx.fillStyle = `${accent}22`
    ctx.fill()
    ctx.strokeStyle = accent
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.fillStyle = '#262421'
    ctx.textBaseline = 'middle'
    ctx.fillText(skill, x + 15, y + pillHeight / 2 + 1)
    x += w + gap
  }

  ctx.strokeStyle = '#262421'
  ctx.lineJoin = 'round'
  sketchRect(ctx, random, 4, 4, width - 8, height - 8, 3)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}
