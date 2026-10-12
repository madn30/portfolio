import * as THREE from 'three'
import { mulberry32 } from '@/shared/graphics/sketch'

const METRES_PER_PX = 4.2 / 1024
const NAME_FONT = (px: number) => `600 ${px}px Fraunces, Georgia, serif`
const TAGLINE_FONT = (px: number) => `600 ${px}px Caveat, "Segoe Print", cursive`

export interface Glyph {
  text: string
  texture: THREE.Texture
  width: number
  height: number
  x: number
}

function measure(ctx: CanvasRenderingContext2D, font: string, text: string): number {
  ctx.font = font
  return ctx.measureText(text).width
}

interface LayoutOptions {
  font: (px: number) => string
  px: number
  maxWidthPx: number
  gapPx: number
  draw: (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, px: number) => void
}

function layout(tokens: string[], options: LayoutOptions): Glyph[] {
  const probe = document.createElement('canvas').getContext('2d')
  if (!probe) throw new Error('2D canvas context unavailable')
  let px = options.px
  const widths = () => tokens.map((t) => measure(probe, options.font(px), t))
  let ws = widths()
  const total = () => ws.reduce((a, b) => a + b, 0) + options.gapPx * (tokens.length - 1)
  while (total() > options.maxWidthPx && px > 24) {
    px -= 4
    ws = widths()
  }
  const pad = px * 0.18
  const heightPx = Math.ceil(px * 1.4)
  let cursor = -total() / 2
  return tokens.map((text, i) => {
    const w = ws[i]
    const canvasW = Math.ceil(w + pad * 2)
    const canvas = document.createElement('canvas')
    canvas.width = canvasW
    canvas.height = heightPx
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2D canvas context unavailable')
    ctx.font = options.font(px)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'
    options.draw(ctx, text, canvasW / 2, heightPx / 2, px)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    const x = (cursor + w / 2) * METRES_PER_PX
    cursor += w + options.gapPx
    return {
      text,
      texture,
      width: canvasW * METRES_PER_PX,
      height: heightPx * METRES_PER_PX,
      x,
    }
  })
}

export function createNameGlyphs(name: string): Glyph[] {
  const random = mulberry32(name.length * 31 + 11)
  const letters = name.split('')
  const glyphs = layout(letters, {
    font: NAME_FONT,
    px: 170,
    maxWidthPx: 940,
    gapPx: 0,
    draw: (ctx, text, x, y) => {
      if (text.trim() === '') return
      ctx.fillStyle = '#fbfaf7'
      ctx.fillText(text, x, y)
      ctx.strokeStyle = '#262421'
      ctx.lineWidth = 4
      ctx.strokeText(text, x, y)
      ctx.globalAlpha = 0.55
      ctx.lineWidth = 2
      ctx.strokeText(text, x + (random() - 0.5) * 7 + 2, y + (random() - 0.5) * 6 - 2)
      ctx.globalAlpha = 1
    },
  })
  return glyphs.filter((g) => g.text.trim() !== '')
}

export function createTaglineGlyphs(role: string): Glyph[] {
  const tokens = ['‹', ...role.split(/\s+/).filter(Boolean), '/›']
  return layout(tokens, {
    font: TAGLINE_FONT,
    px: 76,
    maxWidthPx: 900,
    gapPx: 22,
    draw: (ctx, text, x, y) => {
      ctx.fillStyle = '#c0693b'
      ctx.fillText(text, x, y)
    },
  })
}
