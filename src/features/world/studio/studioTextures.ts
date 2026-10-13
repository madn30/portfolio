import * as THREE from 'three'
import { wrapCanvasText } from '@/shared/graphics/canvasText'
import { logicalSize, makeCanvas, pencil } from '@/shared/graphics/roomTextures'
import { queuePaint } from '@/shared/graphics/paintQueue'
import { mulberry32 } from '@/shared/graphics/sketch'
import { createScreenTexture, type ScreenOptions } from '@/shared/graphics/textures/screen'

const SCREEN = '#1f2430'
const SCREEN_BAR = '#2d3445'
const SCREEN_TEXT = '#f4f1ea'
const SCREEN_NOTE = '#8fd0f5'
const INK = '#262421'
const HAND = 'Caveat, "Segoe Print", cursive'
const SERIF = 'Fraunces, Georgia, serif'
const SANS = '"Instrument Sans", system-ui, sans-serif'

interface Glyph {
  text: string
  size: number
  weight: number
}

export const GLYPHS: readonly Glyph[] = [
  { text: '{/}', size: 0.8, weight: 2 },
  { text: '</>', size: 0.8, weight: 2 },
  { text: '{ }', size: 0.7, weight: 1 },
  { text: ';', size: 0.5, weight: 3 },
  { text: '::', size: 0.4, weight: 2 },
  { text: '=>', size: 0.5, weight: 2 },
  { text: '//', size: 0.5, weight: 2 },
  { text: '&&', size: 0.4, weight: 1 },
  { text: '0', size: 0.3, weight: 4 },
  { text: '1', size: 0.3, weight: 4 },
  { text: '01', size: 0.35, weight: 3 },
  { text: '0101', size: 0.4, weight: 2 },
  { text: '00', size: 0.35, weight: 2 },
  { text: '↑', size: 0.4, weight: 2 },
  { text: '→', size: 0.4, weight: 1 },
  { text: '←', size: 0.4, weight: 1 },
  { text: '×', size: 0.3, weight: 2 },
  { text: '•', size: 0.25, weight: 3 },
  { text: '○', size: 0.3, weight: 2 },
  { text: '▪▪▪', size: 0.25, weight: 2 },
]

export const GLYPH_GRID = { columns: 5, rows: 4 } as const

function toTexture(canvas: HTMLCanvasElement): THREE.Texture {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

export function createGlyphAtlas(cell = 160): THREE.Texture {
  const [canvas, ctx] = makeCanvas(cell * GLYPH_GRID.columns, cell * GLYPH_GRID.rows)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  GLYPHS.forEach((glyph, i) => {
    const cx = (i % GLYPH_GRID.columns) * cell + cell / 2
    const cy = Math.floor(i / GLYPH_GRID.columns) * cell + cell / 2
    let size = cell * 0.52
    ctx.font = `600 ${size}px ${HAND}`
    const width = ctx.measureText(glyph.text).width
    if (width > cell * 0.88) {
      size *= (cell * 0.88) / width
      ctx.font = `600 ${size}px ${HAND}`
    }
    ctx.globalAlpha = 1
    ctx.fillStyle = INK
    ctx.fillText(glyph.text, cx, cy)
    ctx.globalAlpha = 0.35
    ctx.strokeStyle = INK
    ctx.lineWidth = Math.max(1, size * 0.03)
    ctx.strokeText(glyph.text, cx + size * 0.03, cy + size * 0.02)
  })
  ctx.globalAlpha = 1
  const texture = new THREE.CanvasTexture(canvas)
  texture.anisotropy = 4
  return texture
}

function scanlines(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
  for (let y = 2; y < height; y += 4) ctx.fillRect(0, y, width, 1)
}

function frame(ctx: CanvasRenderingContext2D, random: () => number, w: number, h: number): void {
  pencil(
    ctx,
    [
      [5, 5],
      [w - 5, 5],
      [w - 5, h - 5],
      [5, h - 5],
    ],
    random,
    { width: 2.4, jitter: 1.2, color: INK },
  )
}

export function createTvScreenTexture(options: ScreenOptions): THREE.Texture {
  const texture = createScreenTexture(options)
  const canvas: unknown = texture.image
  if (canvas instanceof HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (ctx)
      queuePaint(() => {
        scanlines(ctx, ...logicalSize(ctx))
        texture.needsUpdate = true
      })
  }
  return texture
}

interface SkillScreenOptions {
  skill: string
  category: string
  index: number
  accent: string
  portrait: boolean
  seed: number
}

export function createSkillScreenTexture({
  skill,
  category,
  index,
  accent,
  portrait,
  seed,
}: SkillScreenOptions): THREE.Texture {
  const width = portrait ? 320 : 640
  const height = portrait ? 592 : 384
  const [canvas, ctx] = makeCanvas(width, height)
  const texture = toTexture(canvas)
  queuePaint(() => {
    const random = mulberry32(seed * 31 + 7)
    const margin = portrait ? 26 : 36

    ctx.fillStyle = SCREEN
    ctx.fillRect(0, 0, width, height)

    const bar = portrait ? 44 : 38
    ctx.fillStyle = SCREEN_BAR
    ctx.fillRect(0, 0, width, bar)
    pencil(
      ctx,
      [
        [0, bar],
        [width, bar],
      ],
      random,
      { close: false, width: 2, jitter: 1 },
    )
    ctx.beginPath()
    ctx.arc(margin, bar / 2, 7, 0, Math.PI * 2)
    ctx.fillStyle = accent
    ctx.fill()
    ctx.strokeStyle = INK
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.fillStyle = '#9aa7bd'
    ctx.font = `500 ${portrait ? 15 : 17}px ${SANS}`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText(category.toLowerCase(), width - margin, bar / 2)

    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = accent
    ctx.font = `600 ${portrait ? 30 : 34}px ${HAND}`
    const top = bar + (portrait ? 64 : 58)
    ctx.fillText(`0${index}`, margin, top)

    ctx.fillStyle = SCREEN_TEXT
    const titleSize = portrait ? 40 : 54
    ctx.font = `500 ${titleSize}px ${SERIF}`
    const lines = wrapCanvasText(ctx, skill, width - margin * 2).slice(0, portrait ? 3 : 2)
    const lineHeight = titleSize * 1.12
    lines.forEach((line, i) => ctx.fillText(line, margin, top + 24 + lineHeight * (i + 1)))
    const underlineY = top + 24 + lineHeight * lines.length + 14
    const underlineW = Math.min(width - margin * 2, ctx.measureText(lines[lines.length - 1]).width)
    pencil(
      ctx,
      [
        [margin, underlineY],
        [margin + underlineW, underlineY + 2],
      ],
      random,
      { close: false, width: 3, jitter: 1.6, color: accent, alpha: 0.85 },
    )

    ctx.fillStyle = SCREEN_NOTE
    ctx.font = `500 ${portrait ? 26 : 28}px ${HAND}`
    ctx.fillText(`part of ${category}`, margin, underlineY + (portrait ? 48 : 46))

    scanlines(ctx, width, height)
    frame(ctx, random, width, height)
    texture.needsUpdate = true
  })
  return texture
}
