import type * as THREE from 'three'
import { pencil, type Point } from '@/shared/graphics/roomTextures'
import { mulberry32 } from '@/shared/graphics/sketch'
import { CREAM, makeCanvas, ring, toTexture } from './shared'

export function createIdeaDoodleTexture(): THREE.Texture {
  const [canvas, ctx] = makeCanvas(256, 384)
  const random = mulberry32(83)
  pencil(ctx, ring(128, 70, 42, random), random, { fill: '#ffd34d', width: 2.8 })
  pencil(
    ctx,
    [
      [108, 108],
      [148, 108],
      [144, 134],
      [112, 134],
    ],
    random,
    { fill: '#8d99a6', width: 2.4 },
  )
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI * 0.9 + (i / 5) * Math.PI * 0.8
    pencil(
      ctx,
      [
        [128 + Math.cos(a) * 54, 70 + Math.sin(a) * 54],
        [128 + Math.cos(a) * 70, 70 + Math.sin(a) * 70],
      ],
      random,
      { close: false, width: 2, passes: 1, alpha: 0.7 },
    )
  }
  const arrow = (y: number) => {
    pencil(
      ctx,
      [
        [128, y],
        [128, y + 34],
      ],
      random,
      { close: false, width: 2.4 },
    )
    pencil(
      ctx,
      [
        [116, y + 22],
        [128, y + 36],
        [140, y + 22],
      ],
      random,
      {
        close: false,
        width: 2.4,
      },
    )
  }
  arrow(150)
  const gear: Point[] = []
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2
    const r = i % 4 < 2 ? 40 : 30
    gear.push([128 + Math.cos(a) * r, 250 + Math.sin(a) * r])
  }
  pencil(ctx, gear, random, { fill: '#8d99a6', width: 2.6 })
  pencil(ctx, ring(128, 250, 12, random), random, { fill: CREAM, width: 2.2 })
  arrow(300)
  pencil(
    ctx,
    [
      [94, 350],
      [162, 350],
      [152, 372],
      [104, 372],
    ],
    random,
    { fill: '#4f7fc9', width: 2.4 },
  )
  return toTexture(canvas)
}

export function createCoffeeBugTexture(): THREE.Texture {
  const [canvas, ctx] = makeCanvas(448, 256)
  const random = mulberry32(97)
  pencil(
    ctx,
    [
      [60, 90],
      [190, 90],
      [182, 222],
      [68, 222],
    ],
    random,
    { fill: CREAM, width: 2.8 },
  )
  pencil(
    ctx,
    ring(205, 150, 30, random).filter(([x]) => x >= 200),
    random,
    {
      close: false,
      width: 2.8,
    },
  )
  ctx.fillStyle = '#6b4226'
  ctx.beginPath()
  ctx.ellipse(125, 90, 62, 12, 0, 0, Math.PI * 2)
  ctx.fill()
  pencil(
    ctx,
    ring(125, 90, 62, random, 0.02).map(([x, y]) => [x, 90 + (y - 90) * 0.2]),
    random,
    {
      width: 2.2,
    },
  )
  for (const sx of [95, 125, 155]) {
    const pts: Point[] = []
    for (let i = 0; i <= 6; i++) pts.push([sx + Math.sin(i * 1.2 + sx) * 8, 70 - i * 9])
    pencil(ctx, pts, random, { close: false, width: 1.8, passes: 1, alpha: 0.55 })
  }
  const bug = ring(330, 160, 40, random, 0.06).map(([x, y]) => [x, 160 + (y - 160) * 1.3] as Point)
  pencil(ctx, bug, random, { fill: '#6fa85a', width: 2.6 })
  pencil(ctx, ring(330, 100, 18, random), random, { fill: '#3f7f3f', width: 2.4 })
  pencil(
    ctx,
    [
      [330, 112],
      [331, 210],
    ],
    random,
    { close: false, width: 2, passes: 1 },
  )
  for (const side of [-1, 1]) {
    for (const ly of [130, 160, 190]) {
      pencil(
        ctx,
        [
          [330 + side * 36, ly],
          [330 + side * 66, ly - 16],
        ],
        random,
        { close: false, width: 2, passes: 1 },
      )
    }
    pencil(
      ctx,
      [
        [330 + side * 10, 86],
        [330 + side * 26, 62],
      ],
      random,
      {
        close: false,
        width: 1.8,
        passes: 1,
      },
    )
  }
  pencil(
    ctx,
    [
      [300, 60],
      [360, 92],
    ],
    random,
    { close: false, width: 3, color: '#d2483c' },
  )
  pencil(
    ctx,
    [
      [360, 60],
      [300, 92],
    ],
    random,
    { close: false, width: 3, color: '#d2483c' },
  )
  return toTexture(canvas)
}

export function createMarkerTexture(): THREE.Texture {
  const [canvas, ctx] = makeCanvas(128, 128)
  const random = mulberry32(5)
  pencil(
    ctx,
    [
      [22, 26],
      [106, 26],
      [64, 104],
    ],
    random,
    { fill: '#d2483c', width: 3.2 },
  )
  return toTexture(canvas)
}
