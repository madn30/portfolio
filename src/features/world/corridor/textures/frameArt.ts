import type * as THREE from 'three'
import { pencil, type Point } from '@/shared/graphics/roomTextures'
import { mulberry32 } from '@/shared/graphics/sketch'
import { OCHRE, SLATE, TERRACOTTA, makeCanvas, ring, toTexture, wash } from './shared'

const FRAME_ART_KINDS = 4

export function createFrameArtTexture(seed: number, painted = false): THREE.Texture {
  const width = 512
  const height = 320
  const [canvas, ctx] = makeCanvas(width, height)
  const random = mulberry32(seed * 13 + 3)
  ctx.fillStyle = painted ? '#fff3d0' : '#f6efdc'
  ctx.fillRect(0, 0, width, height)
  const kind = seed % FRAME_ART_KINDS

  if (kind === 0) {
    wash(ctx, '#9cc4e8', painted ? 0.95 : 0.8, () => ctx.fillRect(0, 0, width, height * 0.72))
    const hills: Point[] = [[0, height]]
    for (let x = 0; x <= width; x += 20) {
      hills.push([x, 210 - Math.sin(x / 70 + seed) * 34 - random() * 8])
    }
    hills.push([width, height])
    pencil(ctx, hills, random, { fill: painted ? '#74b860' : '#5fa052', width: 2.6 })
    pencil(ctx, ring(390, 92, 36, random), random, {
      fill: painted ? '#ffd34d' : OCHRE,
      width: 2.4,
    })
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      pencil(
        ctx,
        [
          [390 + Math.cos(a) * 46, 92 + Math.sin(a) * 46],
          [390 + Math.cos(a) * 62, 92 + Math.sin(a) * 62],
        ],
        random,
        { close: false, width: 2, passes: 1, alpha: 0.7 },
      )
    }
  } else if (kind === 1) {
    const wall: Point[] = [
      [150, 270],
      [152, 150],
      [362, 152],
      [360, 272],
    ]
    const roof: Point[] = [
      [130, 156],
      [256, 70],
      [382, 158],
    ]
    pencil(ctx, wall, random, { fill: painted ? '#f7e3b0' : '#efd9a8', width: 2.6 })
    pencil(ctx, roof, random, { fill: painted ? '#d2483c' : TERRACOTTA, width: 2.6 })
    pencil(
      ctx,
      [
        [232, 272],
        [232, 202],
        [280, 202],
        [280, 272],
      ],
      random,
      { fill: painted ? '#a9713f' : '#7a4e2b', width: 2.2 },
    )
    for (const x of [172, 310]) {
      pencil(
        ctx,
        [
          [x, 178],
          [x + 34, 178],
          [x + 34, 212],
          [x, 212],
        ],
        random,
        { fill: painted ? '#bfe0f7' : '#9cc4e8', width: 2 },
      )
    }
    pencil(
      ctx,
      [
        [300, 120],
        [300, 82],
        [322, 82],
        [322, 136],
      ],
      random,
      { close: false, width: 2.2 },
    )
    pencil(
      ctx,
      [
        [20, 274],
        [width - 20, 272],
      ],
      random,
      { close: false, width: 2.2 },
    )
  } else if (kind === 2) {
    const colours = ['#d2483c', '#6fa85a', '#4f7fc9', OCHRE, '#8b6478']
    for (let i = 0; i < 5; i++) {
      const cx = 256 + (random() - 0.5) * 120
      const cy = 160 + (random() - 0.5) * 90
      const r = 36 + i * 26
      const from = random() * 2
      const to = from + 2.5 + random()
      const pts: Point[] = []
      for (let s = 0; s <= 24; s++) {
        const a = from + ((to - from) * s) / 24
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r])
      }
      pencil(ctx, pts, random, {
        close: false,
        width: painted ? 9 : 6,
        color: colours[i],
        alpha: painted ? 0.95 : 0.8,
        passes: 1,
      })
    }
  } else {
    wash(ctx, painted ? '#f7b97a' : '#f4c795', 0.9, () => ctx.fillRect(0, 0, width, height * 0.8))
    pencil(ctx, ring(120, 100, 30, random), random, {
      fill: painted ? '#e8553f' : '#d2483c',
      width: 2.2,
    })
    let x = 20
    while (x < width - 20) {
      const w = 30 + random() * 50
      const h = 60 + random() * 120
      const top = 250 - h
      pencil(
        ctx,
        [
          [x, 250],
          [x, top],
          [x + w, top],
          [x + w, 250],
        ],
        random,
        { fill: painted ? '#8695a6' : SLATE, width: 2.4 },
      )
      for (let wy = top + 14; wy < 240; wy += 22) {
        for (let wx = x + 8; wx < x + w - 10; wx += 16) {
          if (random() > 0.35) {
            ctx.fillStyle = painted ? '#ffd34d' : OCHRE
            ctx.globalAlpha = painted ? 1 : 0.9
            ctx.fillRect(wx, wy, 7, 9)
          }
        }
      }
      ctx.globalAlpha = 1
      x += w + 6 + random() * 10
    }
    pencil(
      ctx,
      [
        [14, 252],
        [width - 14, 250],
      ],
      random,
      { close: false, width: 2.4 },
    )
  }
  return toTexture(canvas)
}
