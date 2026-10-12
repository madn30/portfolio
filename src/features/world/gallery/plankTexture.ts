import type * as THREE from 'three'
import { INK, makeCanvas, pencil, toTexture } from '@/shared/graphics/roomTextures'
import { mulberry32 } from '@/shared/graphics/sketch'

export function createPlankTexture(
  width = 512,
  height = 1024,
  planks = 7,
  seed = 3,
): THREE.Texture {
  const [canvas, ctx] = makeCanvas(width, height)
  const random = mulberry32(seed * 41 + 2)
  const w = width / planks
  for (let p = 0; p < planks; p++) {
    const x0 = p * w
    ctx.fillStyle = p % 2 === 0 ? '#edeae3' : '#e7e4dd'
    ctx.fillRect(x0, 0, w, height)
    ctx.strokeStyle = '#4b4743'
    ctx.lineCap = 'round'
    const grains = 3 + Math.floor(random() * 3)
    for (let g = 0; g < grains; g++) {
      const gx = x0 + w * (0.15 + random() * 0.7)
      const top = random() * height * 0.5
      const len = height * (0.25 + random() * 0.6)
      const amp = 2 + random() * 5
      ctx.globalAlpha = 0.18 + random() * 0.22
      ctx.lineWidth = 1 + random() * 0.8
      ctx.beginPath()
      ctx.moveTo(gx, top)
      ctx.bezierCurveTo(
        gx + amp,
        top + len * 0.3,
        gx - amp,
        top + len * 0.7,
        gx + amp * 0.4,
        top + len,
      )
      ctx.stroke()
    }
    if (random() < 0.5) {
      const kx = x0 + w * (0.3 + random() * 0.4)
      const ky = random() * height
      ctx.globalAlpha = 0.5
      ctx.lineWidth = 1.4
      for (let r = 3; r < 10; r += 3) {
        ctx.beginPath()
        ctx.ellipse(kx, ky, r, r * 1.6, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 0.7
    ctx.fillStyle = INK
    for (const ny of [height * 0.03, height * 0.97]) {
      ctx.beginPath()
      ctx.arc(x0 + w / 2 + (random() - 0.5) * 6, ny + (random() - 0.5) * 6, 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1
  for (let p = 0; p <= planks; p++) {
    const x = Math.min(width - 1.5, Math.max(1.5, p * w))
    pencil(
      ctx,
      [
        [x, 0],
        [x, height],
      ],
      random,
      {
        close: false,
        width: 2.6,
        jitter: 1.2,
        alpha: 0.85,
      },
    )
  }
  return toTexture(canvas)
}
