import * as THREE from 'three'
import type { Project } from '@/shared/types'
import { wrapCanvasText } from '@/shared/graphics/canvasText'
import { isSafeExternalUrl } from '@/shared/utils/links'
import { pencil, type Point } from '@/shared/graphics/roomTextures'
import { mulberry32 } from '@/shared/graphics/sketch'

const WIDTH = 1024
const HEIGHT = 820
const PAPER = '#fbfaf7'
const INK = '#262421'

export interface CardLink {
  label: string
  url: string
}

interface GalleryCardFaces {
  sketch: THREE.Texture
  painted: THREE.Texture
  back: THREE.Texture
  link: CardLink | null
}

function makeCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')
  return [canvas, ctx]
}

function toTexture(canvas: HTMLCanvasElement): THREE.Texture {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function rect(x: number, y: number, w: number, h: number): Point[] {
  return [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ]
}

function paper(ctx: CanvasRenderingContext2D, random: () => number, tint?: string): void {
  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  if (tint) {
    ctx.globalAlpha = 0.1
    ctx.fillStyle = tint
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    ctx.globalAlpha = 1
  }
  ctx.fillStyle = 'rgba(60,45,30,0.035)'
  for (let i = 0; i < 120; i++) ctx.fillRect(random() * WIDTH, random() * HEIGHT, 2, 2)
  const inset = 28
  pencil(ctx, rect(inset, inset, WIDTH - inset * 2, HEIGHT - inset * 2), random, {
    width: 3.2,
    jitter: 1.6,
    alpha: 0.9,
    color: INK,
  })
  pencil(ctx, rect(inset + 9, inset + 9, WIDTH - inset * 2 - 18, HEIGHT - inset * 2 - 18), random, {
    width: 1.4,
    jitter: 2,
    alpha: 0.4,
    passes: 1,
    color: INK,
  })
}

function tape(ctx: CanvasRenderingContext2D, random: () => number, accent: string): void {
  ctx.save()
  ctx.translate(WIDTH / 2, 30)
  ctx.rotate((random() - 0.5) * 0.08)
  ctx.globalAlpha = 0.8
  ctx.fillStyle = accent
  ctx.fillRect(-90, -16, 180, 32)
  ctx.restore()
}

function hatch(
  ctx: CanvasRenderingContext2D,
  random: () => number,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.strokeStyle = '#8f8a83'
  ctx.lineWidth = 1.4
  ctx.globalAlpha = 0.5
  for (let i = 0; i < 18; i++) {
    const t = (i + 0.5) / 18
    ctx.beginPath()
    ctx.moveTo(x + w * t + (random() - 0.5) * 6, y + 10)
    ctx.lineTo(x + w * t - h * 0.35 + (random() - 0.5) * 6, y + h - 10)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

interface FrontOptions {
  project: Project
  accent: string
  painted: boolean
  image?: HTMLImageElement
}

function drawFront(
  ctx: CanvasRenderingContext2D,
  { project, accent, painted, image }: FrontOptions,
) {
  const random = mulberry32(project.id.length * 131 + (painted ? 7 : 3))
  paper(ctx, random, painted ? accent : undefined)
  if (painted) tape(ctx, random, accent)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = painted ? accent : INK
  ctx.font = '600 72px Fraunces, "Iowan Old Style", Georgia, serif'
  ctx.fillText(project.title, WIDTH / 2, 118)
  if (project.year) {
    ctx.font = '600 40px Caveat, "Segoe Print", cursive'
    ctx.fillStyle = painted ? accent : '#5c554f'
    ctx.textAlign = 'right'
    ctx.fillText(project.year, WIDTH - 70, 70)
    ctx.textAlign = 'center'
  }
  const frame = { x: 80, y: 190, w: WIDTH - 160, h: HEIGHT - 290 }
  pencil(ctx, rect(frame.x, frame.y, frame.w, frame.h), random, {
    fill: painted ? '#ffffff' : '#f4f2ed',
    width: 2.4,
    jitter: 1.6,
    color: INK,
  })
  if (image) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(frame.x + 6, frame.y + 6, frame.w - 12, frame.h - 12)
    ctx.clip()
    ctx.drawImage(image, frame.x + 6, frame.y + 6, frame.w - 12, frame.h - 12)
    if (!painted) {
      ctx.globalCompositeOperation = 'saturation'
      ctx.fillStyle = '#808080'
      ctx.fillRect(frame.x, frame.y, frame.w, frame.h)
      ctx.globalCompositeOperation = 'source-over'
    }
    ctx.restore()
  } else {
    hatch(ctx, random, frame.x, frame.y, frame.w, frame.h)
  }
  if (project.isPlaceholder) {
    ctx.font = '600 34px Caveat, "Segoe Print", cursive'
    ctx.fillStyle = '#5c554f'
    ctx.textAlign = 'left'
    ctx.fillText('demo content', 74, HEIGHT - 58)
  }
}

function cardLink(project: Project): CardLink | null {
  if (isSafeExternalUrl(project.demoUrl)) return { label: 'Open live demo', url: project.demoUrl }
  if (isSafeExternalUrl(project.repoUrl)) return { label: 'Source on GitHub', url: project.repoUrl }
  return null
}

function drawBack(
  ctx: CanvasRenderingContext2D,
  project: Project,
  accent: string,
  link: CardLink | null,
) {
  const random = mulberry32(project.id.length * 97 + 5)
  paper(ctx, random)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '600 44px Caveat, "Segoe Print", cursive'
  ctx.fillStyle = accent
  ctx.fillText('project details', WIDTH / 2, 86)
  ctx.font = '600 54px Fraunces, "Iowan Old Style", Georgia, serif'
  ctx.fillStyle = INK
  ctx.fillText(project.title, WIDTH / 2, 148)
  ctx.font = '400 32px "Instrument Sans", "Segoe UI", system-ui, sans-serif'
  ctx.fillStyle = '#4a443f'
  const lines = wrapCanvasText(ctx, project.description, WIDTH - 220).slice(0, 6)
  let y = 212
  for (const line of lines) {
    ctx.fillText(line, WIDTH / 2, y)
    y += 42
  }
  y += 18
  ctx.font = '600 38px Caveat, "Segoe Print", cursive'
  ctx.fillStyle = accent
  ctx.fillText('built with', WIDTH / 2, y)
  y += 48
  ctx.font = '500 26px "Instrument Sans", "Segoe UI", system-ui, sans-serif'
  const chips = project.tags.slice(0, 6).map((tag) => ({ tag, w: ctx.measureText(tag).width + 40 }))
  let x = WIDTH / 2 - (chips.reduce((sum, c) => sum + c.w + 14, 0) - 14) / 2
  if (x < 90) x = 90
  for (const chip of chips) {
    if (x + chip.w > WIDTH - 90) break
    pencil(ctx, rect(x, y - 22, chip.w, 44), random, {
      width: 1.8,
      jitter: 1.2,
      alpha: 0.75,
      color: INK,
    })
    ctx.fillStyle = INK
    ctx.fillText(chip.tag, x + chip.w / 2, y + 1)
    x += chip.w + 14
  }
  const button = { x: WIDTH * 0.22, y: HEIGHT * 0.78, w: WIDTH * 0.56, h: HEIGHT * 0.12 }
  if (link) {
    pencil(ctx, rect(button.x, button.y, button.w, button.h), random, {
      fill: '#f1efea',
      width: 3,
      jitter: 1.8,
      color: INK,
    })
    ctx.font = '600 44px Caveat, "Segoe Print", cursive'
    ctx.fillStyle = INK
    ctx.fillText(`${link.label} ↗`, WIDTH / 2, button.y + button.h / 2 + 2)
  } else {
    ctx.font = '600 34px Caveat, "Segoe Print", cursive'
    ctx.fillStyle = '#5c554f'
    ctx.fillText('no public links for this one yet', WIDTH / 2, button.y + button.h / 2)
  }
}

export function createGalleryCardFaces(project: Project, accent: string): GalleryCardFaces {
  const [sketchCanvas, sketchCtx] = makeCanvas()
  const [paintedCanvas, paintedCtx] = makeCanvas()
  const [backCanvas, backCtx] = makeCanvas()
  const link = cardLink(project)
  drawFront(sketchCtx, { project, accent, painted: false })
  drawFront(paintedCtx, { project, accent, painted: true })
  drawBack(backCtx, project, accent, link)
  const sketch = toTexture(sketchCanvas)
  const painted = toTexture(paintedCanvas)
  const back = toTexture(backCanvas)
  if (project.image) {
    const image = new Image()
    image.onload = () => {
      drawFront(sketchCtx, { project, accent, painted: false, image })
      drawFront(paintedCtx, { project, accent, painted: true, image })
      sketch.needsUpdate = true
      painted.needsUpdate = true
    }
    image.src = project.image
  }
  return { sketch, painted, back, link }
}
