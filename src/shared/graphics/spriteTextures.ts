import type * as THREE from 'three'
import { makeCanvas, toTexture } from './roomTextures'
import { mulberry32 } from './sketch'

export function createBirdTexture(size = 128): THREE.Texture {
  const [canvas, ctx] = makeCanvas(size, size)
  ctx.strokeStyle = '#262421'
  ctx.lineWidth = size * 0.045
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(size * 0.08, size * 0.6)
  ctx.quadraticCurveTo(size * 0.3, size * 0.25, size * 0.5, size * 0.58)
  ctx.quadraticCurveTo(size * 0.7, size * 0.25, size * 0.92, size * 0.6)
  ctx.stroke()
  return toTexture(canvas)
}

export function createDotTexture(size = 32): THREE.Texture {
  const [canvas, ctx] = makeCanvas(size, size)
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.6)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return toTexture(canvas)
}

export function createSunTexture(size = 256, seed = 5): THREE.Texture {
  const [canvas, ctx] = makeCanvas(size, size)
  const random = mulberry32(seed * 17 + 3)
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.2

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#262421'

  ctx.fillStyle = '#ffe27a'
  ctx.beginPath()
  const steps = 28
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2
    const wobble = r * (1 + (random() - 0.5) * 0.05)
    const x = cx + Math.cos(a) * wobble
    const y = cy + Math.sin(a) * wobble
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
  ctx.lineWidth = 3
  ctx.stroke()

  const rays = 16
  ctx.strokeStyle = '#f5a623'
  for (let pass = 0; pass < 2; pass++) {
    ctx.lineWidth = pass === 0 ? 4 : 2
    ctx.globalAlpha = pass === 0 ? 1 : 0.6
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * Math.PI * 2 + (random() - 0.5) * 0.08
      const inner = r * 1.22 + random() * r * 0.1
      const outer = inner + r * (0.35 + random() * 0.6)
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner)
      ctx.lineTo(
        cx + Math.cos(a + (random() - 0.5) * 0.05) * outer,
        cy + Math.sin(a + (random() - 0.5) * 0.05) * outer,
      )
      ctx.stroke()
    }
  }
  return toTexture(canvas)
}

export function createHazeTexture(color = '216,240,255', height = 256): THREE.Texture {
  const [canvas, ctx] = makeCanvas(4, height)
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, `rgba(${color},0.85)`)
  gradient.addColorStop(0.25, `rgba(${color},0.45)`)
  gradient.addColorStop(0.6, `rgba(${color},0.1)`)
  gradient.addColorStop(1, `rgba(${color},0)`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 4, height)
  return toTexture(canvas)
}

export function createGradientTexture(stops: [number, string][], height = 256): THREE.Texture {
  const [canvas, ctx] = makeCanvas(4, height)
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  for (const [offset, color] of stops) gradient.addColorStop(offset, color)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 4, height)
  return toTexture(canvas)
}

export function createWalkerShadowTexture(width = 128, height = 256): THREE.Texture {
  const [canvas, ctx] = makeCanvas(width, height)
  const away = width * 4
  const cx = width / 2 - away
  ctx.shadowColor = '#ffffff'
  ctx.shadowBlur = width * 0.13
  ctx.shadowOffsetX = away
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.ellipse(cx, height * 0.2, width * 0.15, height * 0.085, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(cx - width * 0.08, height * 0.27)
  ctx.quadraticCurveTo(cx - width * 0.34, height * 0.3, cx - width * 0.34, height * 0.44)
  ctx.lineTo(cx - width * 0.26, height)
  ctx.lineTo(cx + width * 0.26, height)
  ctx.lineTo(cx + width * 0.34, height * 0.44)
  ctx.quadraticCurveTo(cx + width * 0.34, height * 0.3, cx + width * 0.08, height * 0.27)
  ctx.closePath()
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.globalCompositeOperation = 'destination-in'
  const fade = ctx.createLinearGradient(0, height * 0.7, 0, height)
  fade.addColorStop(0, 'rgba(255,255,255,1)')
  fade.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = fade
  ctx.fillRect(0, 0, width, height)
  return toTexture(canvas)
}
