import * as THREE from 'three'
import { makeCanvas, pencil, type Point } from '@/shared/graphics/roomTextures'
import { mulberry32 } from '@/shared/graphics/sketch'

const INK = '#35322e'
const CREAM = '#fbfaf7'

function toTexture(canvas: HTMLCanvasElement): THREE.Texture {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
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

export function createClothespinTexture(accent: string, size = 128): THREE.Texture {
  const [canvas, ctx] = makeCanvas(size, size * 1.5)
  const random = mulberry32(accent.length * 11 + 3)
  const w = size
  const h = size * 1.5
  for (const side of [-1, 1]) {
    const x = w / 2 + side * w * 0.17
    const prong: Point[] = [
      [x - w * 0.11, h * 0.08],
      [x + w * 0.11, h * 0.08],
      [x + w * 0.09, h * 0.95],
      [x - w * 0.09, h * 0.95],
    ]
    pencil(ctx, prong, random, { fill: CREAM, width: 3, jitter: 1.2, color: INK })
  }
  ctx.beginPath()
  ctx.arc(w / 2, h * 0.46, w * 0.17, 0, Math.PI * 2)
  ctx.fillStyle = accent
  ctx.fill()
  ctx.strokeStyle = INK
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(w / 2, h * 0.46, w * 0.08, 0, Math.PI * 2)
  ctx.lineWidth = 2
  ctx.stroke()
  return toTexture(canvas)
}

export function createRailingTexture(seed = 1, width = 512, height = 256): THREE.Texture {
  const [canvas, ctx] = makeCanvas(width, height)
  const random = mulberry32(seed * 29 + 1)
  const railH = height * 0.09
  pencil(ctx, rect(0, railH * 0.3, width, railH), random, {
    fill: '#e6e3dc',
    width: 3,
    jitter: 1.2,
  })
  pencil(ctx, rect(0, height - railH * 1.6, width, railH), random, {
    fill: '#e6e3dc',
    width: 3,
    jitter: 1.2,
  })
  const balusters = 7
  for (let i = 0; i < balusters; i++) {
    const x = ((i + 0.5) / balusters) * width
    const bw = width * 0.03
    pencil(ctx, rect(x - bw / 2, railH * 1.2, bw, height - railH * 2.8), random, {
      fill: '#efece6',
      width: 2.4,
      jitter: 1,
    })
  }
  const texture = toTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  return texture
}

function windows(
  ctx: CanvasRenderingContext2D,
  random: () => number,
  x: number,
  y: number,
  w: number,
  h: number,
  cols: number,
  rows: number,
  alpha: number,
): void {
  const cw = w / (cols * 2 + 1)
  const rh = h / (rows * 2 + 1)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (random() < 0.12) continue
      const wx = x + cw * (c * 2 + 1)
      const wy = y + rh * (r * 2 + 1)
      pencil(ctx, rect(wx, wy, cw, rh), random, {
        fill: random() < 0.3 ? '#dedbd4' : undefined,
        width: 1.6,
        jitter: 0.9,
        passes: 1,
        alpha,
      })
    }
  }
}

export function createHousesTexture(seed = 2, width = 1024, height = 436): THREE.Texture {
  const [canvas, ctx] = makeCanvas(width, height)
  const random = mulberry32(seed * 43 + 7)
  const ground = height * 0.96
  let x = 10
  while (x < width - 60) {
    const w = 110 + random() * 110
    const h = 120 + random() * 150
    const top = ground - h
    const roof = 40 + random() * 50
    const body = rect(x, top, w, h)
    pencil(ctx, body, random, { fill: random() < 0.5 ? CREAM : '#f1efe9', width: 2.8, jitter: 1.4 })
    const peak: Point[] = [
      [x - 10, top + 4],
      [x + w / 2, top - roof],
      [x + w + 10, top + 4],
    ]
    pencil(ctx, peak, random, { fill: '#e2dfd8', width: 2.8, jitter: 1.4 })
    if (random() < 0.6) {
      const cx = x + w * (0.2 + random() * 0.5)
      pencil(ctx, rect(cx, top - roof * 0.55, 18, roof * 0.5), random, {
        fill: '#dcd8d0',
        width: 2,
        jitter: 1,
      })
    }
    windows(ctx, random, x + 10, top + 16, w - 20, h - 60, 2, 1 + Math.floor(h / 110), 0.8)
    const dw = w * 0.2
    pencil(ctx, rect(x + w / 2 - dw / 2, ground - 44, dw, 44), random, {
      fill: '#dcd8d0',
      width: 2,
      jitter: 1,
    })
    x += w + 26 + random() * 30
  }
  pencil(
    ctx,
    [
      [0, ground],
      [width, ground],
    ],
    random,
    { close: false, width: 3, jitter: 1.4 },
  )
  return toTexture(canvas)
}

export function createSkylineTexture(seed = 3, width = 1024, height = 436): THREE.Texture {
  const [canvas, ctx] = makeCanvas(width, height)
  const random = mulberry32(seed * 61 + 13)
  const ground = height * 0.98
  let x = 0
  while (x < width - 30) {
    const w = 60 + random() * 90
    const h = 150 + random() * 260
    const top = ground - h
    pencil(ctx, rect(x, top, w, h), random, {
      fill: random() < 0.5 ? '#f0eee9' : '#e9e6e0',
      width: 2.4,
      jitter: 1.2,
      alpha: 0.7,
    })
    if (random() < 0.4) {
      pencil(
        ctx,
        [
          [x + w / 2, top],
          [x + w / 2, top - 30 - random() * 40],
        ],
        random,
        { close: false, width: 2, jitter: 0.8, alpha: 0.6, passes: 1 },
      )
    }
    windows(
      ctx,
      random,
      x + 8,
      top + 14,
      w - 16,
      h - 30,
      2 + Math.floor(w / 60),
      Math.floor(h / 48),
      0.45,
    )
    x += w + 6 + random() * 18
  }
  return toTexture(canvas)
}
