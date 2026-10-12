import type * as THREE from 'three'
import { pencil, type Point } from '@/shared/graphics/roomTextures'
import { mulberry32 } from '@/shared/graphics/sketch'
import { CREAM, GREY, INK, TERRACOTTA, makeCanvas, ring, toTexture } from './shared'

export function createGrateTexture(): THREE.Texture {
  const [canvas, ctx] = makeCanvas(256, 128)
  const random = mulberry32(31)
  pencil(
    ctx,
    [
      [8, 8],
      [248, 8],
      [248, 120],
      [8, 120],
    ],
    random,
    { fill: GREY, width: 2.6 },
  )
  for (let y = 24; y < 116; y += 14) {
    pencil(
      ctx,
      [
        [22, y],
        [234, y + 1],
      ],
      random,
      { close: false, width: 2, passes: 1, alpha: 0.8 },
    )
  }
  for (const [x, y] of [
    [16, 16],
    [240, 16],
    [16, 112],
    [240, 112],
  ]) {
    ctx.fillStyle = INK
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fill()
  }
  return toTexture(canvas)
}

export function createDrawerFrontTexture(): THREE.Texture {
  const [canvas, ctx] = makeCanvas(256, 320)
  const random = mulberry32(44)
  ctx.fillStyle = CREAM
  ctx.fillRect(0, 0, 256, 320)
  for (const y of [18, 166]) {
    pencil(
      ctx,
      [
        [18, y],
        [238, y],
        [238, y + 134],
        [18, y + 134],
      ],
      random,
      { fill: GREY, width: 2.4 },
    )
    pencil(ctx, ring(128, y + 67, 11, random), random, { fill: TERRACOTTA, width: 2 })
  }
  return toTexture(canvas)
}

export function createStandingFrameTexture(): THREE.Texture {
  const [canvas, ctx] = makeCanvas(192, 240)
  const random = mulberry32(52)
  pencil(
    ctx,
    [
      [16, 14],
      [176, 14],
      [176, 226],
      [16, 226],
    ],
    random,
    { fill: GREY, width: 3 },
  )
  pencil(
    ctx,
    [
      [40, 38],
      [152, 38],
      [152, 202],
      [40, 202],
    ],
    random,
    { fill: CREAM, width: 2 },
  )
  const heart: Point[] = []
  for (let i = 0; i <= 40; i++) {
    const t = (i / 40) * Math.PI * 2
    heart.push([
      96 + 16 * Math.sin(t) ** 3 * 2.4,
      120 - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 2.4,
    ])
  }
  pencil(ctx, heart, random, { fill: 'rgba(192,105,59,0.5)', width: 2, color: TERRACOTTA })
  return toTexture(canvas)
}

export function createPottedTreeTexture(): THREE.Texture {
  const width = 384
  const height = 640
  const [canvas, ctx] = makeCanvas(width, height)
  const random = mulberry32(61)
  pencil(
    ctx,
    [
      [128, 540],
      [256, 540],
      [236, 630],
      [148, 630],
    ],
    random,
    { fill: 'rgba(192,105,59,0.35)', width: 2.8 },
  )
  pencil(
    ctx,
    [
      [118, 528],
      [266, 528],
      [262, 552],
      [122, 552],
    ],
    random,
    {
      fill: GREY,
      width: 2.6,
    },
  )
  pencil(
    ctx,
    [
      [184, 536],
      [188, 330],
      [196, 330],
      [200, 536],
    ],
    random,
    { fill: GREY, width: 2.6 },
  )
  for (const [bx, by, ex, ey] of [
    [190, 420, 120, 360],
    [192, 380, 270, 310],
    [190, 340, 150, 270],
  ]) {
    pencil(
      ctx,
      [
        [bx, by],
        [ex, ey],
      ],
      random,
      { close: false, width: 2.4 },
    )
  }
  const blobs: [number, number, number][] = [
    [192, 200, 110],
    [110, 270, 70],
    [280, 250, 76],
    [150, 120, 62],
    [250, 130, 66],
    [195, 300, 72],
  ]
  for (const [cx, cy, r] of blobs) {
    pencil(ctx, ring(cx, cy, r, random, 0.08), random, {
      fill: 'rgba(138,154,123,0.28)',
      width: 2.6,
    })
  }
  for (let i = 0; i < 14; i++) {
    const cx = 120 + random() * 150
    const cy = 120 + random() * 200
    pencil(
      ctx,
      [
        [cx, cy],
        [cx + 6 + random() * 10, cy - 8 - random() * 8],
      ],
      random,
      {
        close: false,
        width: 1.8,
        passes: 1,
        alpha: 0.6,
      },
    )
  }
  return toTexture(canvas)
}

export function createLampGrilleTexture(): THREE.Texture {
  const [canvas, ctx] = makeCanvas(512, 128)
  const random = mulberry32(72)
  for (let x = 16; x < 512; x += 24) {
    pencil(
      ctx,
      [
        [x, 6],
        [x + 1, 122],
      ],
      random,
      { close: false, width: 1.6, passes: 1, alpha: 0.55 },
    )
  }
  for (const y of [42, 86]) {
    pencil(
      ctx,
      [
        [6, y],
        [506, y + 1],
      ],
      random,
      { close: false, width: 1.6, passes: 1, alpha: 0.55 },
    )
  }
  return toTexture(canvas)
}
