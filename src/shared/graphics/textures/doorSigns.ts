import * as THREE from 'three'
import { mulberry32 } from '@/shared/graphics/sketch'
import { sketchRect } from './pencilCanvas'
import { cachedTexture } from './surfaces'

export function createInfinityTexture(
  half: 'left' | 'right',
  { color = '#4f7fc9', width = 256, height = 652 } = {},
): THREE.Texture {
  return cachedTexture(`infinity-${half}-${color}-${width}x${height}`, () =>
    drawInfinity(half, color, width, height),
  )
}

function drawInfinity(
  half: 'left' | 'right',
  color: string,
  width: number,
  height: number,
): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')

  const random = mulberry32(half === 'left' ? 17 : 23)
  const cx = half === 'left' ? width : 0
  const cy = height * 0.4
  const a = width * 0.72
  ctx.strokeStyle = color
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const passes = [
    { alpha: 0.9, width: 7, offset: 0 },
    { alpha: 0.5, width: 4, offset: 4 },
    { alpha: 0.35, width: 3, offset: -3 },
  ]
  for (const pass of passes) {
    ctx.globalAlpha = pass.alpha
    ctx.lineWidth = pass.width
    ctx.beginPath()
    const steps = 160
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2
      const d = 1 + Math.sin(t) * Math.sin(t)
      const x = cx + (a * Math.cos(t)) / d + pass.offset + (random() - 0.5) * 2
      const y = cy + (a * Math.sin(t) * Math.cos(t)) / d + pass.offset * 0.6 + (random() - 0.5) * 2
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

export function createArrowTexture(size = 256): THREE.Texture {
  return cachedTexture(`arrow-${size}`, () => drawArrow(size))
}

function drawArrow(size: number): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size / 2
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')
  const random = mulberry32(9)
  ctx.strokeStyle = '#262421'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (let pass = 0; pass < 2; pass++) {
    ctx.globalAlpha = pass === 0 ? 0.9 : 0.4
    ctx.lineWidth = pass === 0 ? 5 : 3
    ctx.beginPath()
    ctx.moveTo(20, size * 0.18)
    ctx.quadraticCurveTo(size * 0.5, size * 0.1 + (random() - 0.5) * 8, size - 30, size * 0.34)
    ctx.moveTo(size - 70, size * 0.2)
    ctx.lineTo(size - 30, size * 0.34)
    ctx.lineTo(size - 74, size * 0.42)
    ctx.stroke()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function createSignTexture(label: string, width = 512, height = 160): THREE.Texture {
  return cachedTexture(`sign-${label}-${width}x${height}`, () => drawSign(label, width, height))
}

function drawSign(label: string, width: number, height: number): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')
  const random = mulberry32(label.length * 3 + 1)
  ctx.fillStyle = '#e6c48f'
  ctx.fillRect(0, 0, width, height)
  ctx.strokeStyle = 'rgba(122, 78, 43, 0.4)'
  ctx.lineWidth = 1.2
  for (let i = 0; i < 9; i++) {
    const y = 12 + random() * (height - 24)
    ctx.beginPath()
    ctx.moveTo(8, y)
    ctx.bezierCurveTo(
      width * 0.3,
      y + (random() - 0.5) * 10,
      width * 0.7,
      y + (random() - 0.5) * 10,
      width - 8,
      y,
    )
    ctx.stroke()
  }
  ctx.strokeStyle = '#262421'
  ctx.lineJoin = 'round'
  sketchRect(ctx, random, 6, 6, width - 12, height - 12, 3.4)
  ctx.fillStyle = '#262421'
  for (const [x, y] of [
    [22, 22],
    [width - 22, 22],
    [22, height - 22],
    [width - 22, height - 22],
  ]) {
    ctx.beginPath()
    ctx.arc(x, y, 3.5, 0, Math.PI * 2)
    ctx.fill()
  }
  let size = 86
  ctx.font = `700 ${size}px Fraunces, Georgia, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  while (ctx.measureText(label.toUpperCase()).width > width * 0.82 && size > 36) {
    size -= 4
    ctx.font = `700 ${size}px Fraunces, Georgia, serif`
  }
  ctx.fillStyle = '#262421'
  ctx.fillText(label.toUpperCase(), width / 2, height / 2 + 4)
  ctx.globalAlpha = 0.35
  ctx.lineWidth = 1.5
  ctx.strokeText(label.toUpperCase(), width / 2 + 2, height / 2 + 6)
  ctx.globalAlpha = 1
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}
