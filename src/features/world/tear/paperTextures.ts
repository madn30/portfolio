import * as THREE from 'three'
import { mulberry32 } from '@/shared/graphics/sketch'
import { makeCanvas } from '@/shared/graphics/roomTextures'

const ALBEDO_SIZE = 1024
const NORMAL_SIZE = 512

function tileable(
  size: number,
  draw: (x: number, y: number) => void,
  x: number,
  y: number,
  margin: number,
): void {
  draw(x, y)
  if (x < margin) draw(x + size, y)
  if (x > size - margin) draw(x - size, y)
  if (y < margin) draw(x, y + size)
  if (y > size - margin) draw(x, y - size)
}

const ALPHA_STEPS = 4
const WIDTH_STEPS = 3

/**
 * Thousands of short strokes, batched into one path per (alpha, width) bucket so the canvas
 * strokes a dozen paths instead of tens of thousands. Random draws happen in the same order
 * as before, so the fibre positions are unchanged; only alpha and width are quantised.
 */
function fibres(
  ctx: CanvasRenderingContext2D,
  size: number,
  count: number,
  random: () => number,
  colour: (alpha: number) => string,
): void {
  ctx.lineCap = 'round'
  const paths: (Path2D | undefined)[] = []
  for (let i = 0; i < count; i++) {
    const x = random() * size
    const y = random() * size
    const length = 2 + random() * 9
    const angle = random() * Math.PI
    const alphaStep = Math.min(ALPHA_STEPS - 1, Math.floor(random() * ALPHA_STEPS))
    const widthStep = Math.min(WIDTH_STEPS - 1, Math.floor(random() * WIDTH_STEPS))
    const bucket = alphaStep * WIDTH_STEPS + widthStep
    const path = (paths[bucket] ??= new Path2D())
    const dx = Math.cos(angle) * length
    const dy = Math.sin(angle) * length
    tileable(
      size,
      (fx, fy) => {
        path.moveTo(fx, fy)
        path.lineTo(fx + dx, fy + dy)
      },
      x,
      y,
      12,
    )
  }
  paths.forEach((path, bucket) => {
    if (!path) return
    const alphaStep = Math.floor(bucket / WIDTH_STEPS)
    const widthStep = bucket % WIDTH_STEPS
    ctx.strokeStyle = colour(0.02 + ((alphaStep + 0.5) / ALPHA_STEPS) * 0.05)
    ctx.lineWidth = 0.6 + ((widthStep + 0.5) / WIDTH_STEPS) * 0.9
    ctx.stroke(path)
  })
}

export function createPaperAlbedo(): THREE.Texture {
  const [canvas, ctx] = makeCanvas(ALBEDO_SIZE, ALBEDO_SIZE)
  const random = mulberry32(41)
  ctx.fillStyle = '#faf9f7'
  ctx.fillRect(0, 0, ALBEDO_SIZE, ALBEDO_SIZE)
  fibres(ctx, ALBEDO_SIZE, 26000, random, (a) => `rgba(70, 60, 50, ${a})`)
  fibres(ctx, ALBEDO_SIZE, 16000, random, (a) => `rgba(255, 255, 255, ${a * 1.6})`)
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(60, 50, 40, ${0.04 + random() * 0.08})`
    ctx.beginPath()
    ctx.arc(random() * ALBEDO_SIZE, random() * ALBEDO_SIZE, 0.4 + random() * 0.9, 0, Math.PI * 2)
    ctx.fill()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.anisotropy = 4
  return texture
}

export function normalFromHeight(
  ctx: CanvasRenderingContext2D,
  size: number,
  strength: number,
): void {
  const height = ctx.getImageData(0, 0, size, size)
  const normal = ctx.createImageData(size, size)
  const src = height.data
  const dst = normal.data
  for (let y = 0; y < size; y++) {
    const row = y * size
    const up = ((y + size - 1) % size) * size
    const down = ((y + 1) % size) * size
    for (let x = 0; x < size; x++) {
      const left = (x + size - 1) % size
      const right = (x + 1) % size
      const dx = (src[(row + right) * 4] - src[(row + left) * 4]) / 255
      const dy = (src[(down + x) * 4] - src[(up + x) * 4]) / 255
      const nx = -dx * strength
      const ny = dy * strength
      const inv = 1 / Math.sqrt(nx * nx + ny * ny + 1)
      const i = (row + x) * 4
      dst[i] = (nx * inv * 0.5 + 0.5) * 255
      dst[i + 1] = (ny * inv * 0.5 + 0.5) * 255
      dst[i + 2] = inv * 255
      dst[i + 3] = 255
    }
  }
  ctx.putImageData(normal, 0, 0)
}

export function createPaperNormal(): THREE.Texture {
  const [canvas, ctx] = makeCanvas(NORMAL_SIZE, NORMAL_SIZE)
  const random = mulberry32(97)
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, NORMAL_SIZE, NORMAL_SIZE)
  fibres(ctx, NORMAL_SIZE, 9000, random, (a) => `rgba(255, 255, 255, ${a * 4})`)
  fibres(ctx, NORMAL_SIZE, 9000, random, (a) => `rgba(0, 0, 0, ${a * 4})`)
  normalFromHeight(ctx, NORMAL_SIZE, 2)
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return texture
}

export function createFibreSprite(): THREE.Texture {
  const size = 32
  const [canvas, ctx] = makeCanvas(size, size)
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}
