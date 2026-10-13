import * as THREE from 'three'
import { makeCanvas } from './roomTextures'
import { mulberry32 } from './sketch'

export type CloudVariant = 'puffy' | 'long' | 'wisp'

const VARIANTS: Record<CloudVariant, { bumps: number; lift: number; alpha: number }> = {
  puffy: { bumps: 4, lift: 0.5, alpha: 0.9 },
  long: { bumps: 6, lift: 0.35, alpha: 0.8 },
  wisp: { bumps: 3, lift: 0.25, alpha: 0.6 },
}

export function createFluffyCloudTexture(
  seed = 1,
  width = 512,
  height = 320,
  variant: CloudVariant = 'puffy',
): THREE.Texture {
  const [canvas, ctx] = makeCanvas(width, height)
  const random = mulberry32(seed * 101 + 7)
  const shape = VARIANTS[variant]

  const left = width * 0.16
  const right = width * 0.84
  const baseY = height * 0.74
  const count = shape.bumps + Math.floor(random() * 3)
  const bumps = Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) / count
    const middle = 1 - Math.abs(t - 0.5) * 1.6
    const r = height * (0.15 + 0.15 * middle * shape.lift * 2 + random() * 0.05)
    return {
      x: left + t * (right - left) + (random() - 0.5) * width * 0.05,
      y: baseY - r * (shape.lift + 0.4 * middle),
      r,
    }
  })
  const base = {
    x: (left + right) / 2,
    y: baseY - height * 0.1,
    rx: (right - left) / 2 + height * 0.1,
    ry: height * 0.17,
  }

  const trace = (wobble: number) => {
    const j = () => (random() - 0.5) * wobble
    ctx.beginPath()
    for (const b of bumps) {
      ctx.moveTo(b.x + b.r, b.y)
      ctx.arc(b.x + j(), b.y + j(), b.r, 0, Math.PI * 2)
    }
    ctx.moveTo(base.x + base.rx, base.y)
    ctx.ellipse(base.x + j(), base.y + j(), base.rx, base.ry, 0, 0, Math.PI * 2)
  }

  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#262421'
  ctx.lineWidth = 7
  ctx.globalAlpha = shape.alpha
  trace(2)
  ctx.stroke()
  ctx.lineWidth = 4
  ctx.globalAlpha = shape.alpha * 0.6
  trace(5)
  ctx.stroke()
  ctx.globalAlpha = 1

  const fill = ctx.createLinearGradient(0, height * 0.2, 0, height * 0.9)
  fill.addColorStop(0, '#ffffff')
  fill.addColorStop(0.55, '#f6fafd')
  fill.addColorStop(1, '#dbe7f2')
  ctx.fillStyle = fill
  trace(0)
  ctx.fill()

  ctx.globalCompositeOperation = 'source-atop'
  const shade = ctx.createLinearGradient(0, height * 0.5, 0, height)
  shade.addColorStop(0, 'rgba(96,130,165,0)')
  shade.addColorStop(1, 'rgba(96,130,165,0.22)')
  ctx.fillStyle = shade
  ctx.fillRect(0, 0, width, height)
  ctx.globalCompositeOperation = 'source-over'

  ctx.save()
  trace(0)
  ctx.clip()
  ctx.strokeStyle = '#5f7f9f'
  ctx.lineWidth = 2.5
  ctx.globalAlpha = 0.45
  bumps.forEach((b, i) => {
    if (i === 0) return
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, Math.PI * 0.58, Math.PI * 0.92)
    ctx.stroke()
  })
  ctx.restore()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}
