import type * as THREE from 'three'
import { INK, makeCanvas, pencil, toTexture, type Point } from '@/shared/graphics/roomTextures'
import { mulberry32 } from '@/shared/graphics/sketch'

export function createBarrelTexture(width = 512, height = 256, seed = 4): THREE.Texture {
  const [canvas, ctx] = makeCanvas(width, height)
  const random = mulberry32(seed * 7 + 9)
  ctx.fillStyle = '#ebe8e1'
  ctx.fillRect(0, 0, width, height)
  const staves = 12
  for (let s = 0; s < staves; s++) {
    const x = (s / staves) * width
    pencil(
      ctx,
      [
        [x, 0],
        [x, height],
      ],
      random,
      {
        close: false,
        width: 1.8,
        jitter: 1.5,
        alpha: 0.55,
        passes: 1,
      },
    )
  }
  for (const v of [0.22, 0.78]) {
    const y = height * (1 - v)
    const band = height * 0.075
    ctx.fillStyle = '#d6d2ca'
    ctx.fillRect(0, y - band / 2, width, band)
    pencil(
      ctx,
      [
        [0, y - band / 2],
        [width, y - band / 2],
      ],
      random,
      { close: false, width: 2.4, jitter: 1 },
    )
    pencil(
      ctx,
      [
        [0, y + band / 2],
        [width, y + band / 2],
      ],
      random,
      { close: false, width: 2.4, jitter: 1 },
    )
    ctx.fillStyle = INK
    ctx.globalAlpha = 0.8
    for (let r = 0; r < staves; r++) {
      const rx = ((r + 0.5) / staves) * width + (random() - 0.5) * 4
      ctx.beginPath()
      ctx.arc(rx, y + (random() - 0.5) * 3, 2.6, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }
  for (let s = 0; s < 6; s++) {
    const x = random() * width
    const y = height * (0.3 + random() * 0.4)
    for (let k = 0; k < 3; k++) {
      pencil(
        ctx,
        [
          [x + k * 5, y - 8 + random() * 4],
          [x + k * 5 + 4, y + 8 + random() * 4],
        ],
        random,
        { close: false, width: 1.2, alpha: 0.45, passes: 1, jitter: 0.6 },
      )
    }
  }
  return toTexture(canvas)
}

export function createSignBoardTexture(
  label: string,
  width = 512,
  height = 176,
  seed = 1,
): THREE.Texture {
  const [canvas, ctx] = makeCanvas(width, height)
  const random = mulberry32(seed * 53 + label.length)
  const m = 10
  const outline: Point[] = [
    [m + random() * 8, m + random() * 6],
    [width * 0.5, m - 2 + random() * 6],
    [width - m - random() * 8, m + random() * 8],
    [width - m + 2, height * 0.5],
    [width - m - random() * 10, height - m - random() * 6],
    [width * 0.5, height - m + 2 - random() * 6],
    [m + random() * 10, height - m - random() * 8],
    [m - 2, height * 0.5],
  ]
  pencil(ctx, outline, random, { fill: '#efece5', width: 3.2, jitter: 1.6 })
  ctx.save()
  ctx.beginPath()
  outline.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
  ctx.closePath()
  ctx.clip()
  ctx.strokeStyle = '#5b5752'
  ctx.lineCap = 'round'
  for (let g = 0; g < 11; g++) {
    const y = height * (0.08 + random() * 0.84)
    const amp = 2 + random() * 6
    ctx.globalAlpha = 0.14 + random() * 0.16
    ctx.lineWidth = 1 + random() * 1.2
    ctx.beginPath()
    ctx.moveTo(-5, y)
    ctx.bezierCurveTo(
      width * 0.3,
      y - amp,
      width * 0.6,
      y + amp,
      width + 5,
      y + (random() - 0.5) * 8,
    )
    ctx.stroke()
  }
  for (let k = 0; k < 2; k++) {
    const kx = width * (0.08 + random() * 0.84)
    const ky = height * (0.2 + random() * 0.6)
    ctx.globalAlpha = 0.35
    ctx.lineWidth = 1.3
    for (let r = 3; r < 11; r += 3.5) {
      ctx.beginPath()
      ctx.ellipse(kx, ky, r * 1.5, r, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
  ctx.restore()
  ctx.globalAlpha = 1
  const text = label.toUpperCase()
  let fontSize = Math.round(height * 0.44)
  const font = (px: number) =>
    `600 ${px}px "Instrument Sans", "Arial Rounded MT Bold", "Helvetica Neue", Arial, sans-serif`
  const spacing = fontSize * 0.08
  ctx.font = font(fontSize)
  const measure = () =>
    [...text].reduce((sum, ch) => sum + ctx.measureText(ch).width, 0) + spacing * (text.length - 1)
  let total = measure()
  while (total > width * 0.82 && fontSize > 20) {
    fontSize -= 2
    ctx.font = font(fontSize)
    total = measure()
  }
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.lineJoin = 'round'
  let x = (width - total) / 2
  const y = height * 0.53
  for (const ch of text) {
    const tilt = (random() - 0.5) * 0.06
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(tilt)
    ctx.strokeStyle = '#2f2c29'
    ctx.lineWidth = fontSize * 0.09
    ctx.strokeText(ch, 0, 0)
    ctx.fillStyle = '#6a6661'
    ctx.fillText(ch, 0, 0)
    ctx.restore()
    x += ctx.measureText(ch).width + spacing
  }
  return toTexture(canvas)
}
