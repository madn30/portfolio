import type * as THREE from 'three'
import { pencil, type Point } from '@/shared/graphics/roomTextures'
import { mulberry32 } from '@/shared/graphics/sketch'
import {
  CREAM,
  GREY,
  HAND,
  INK,
  SERIF,
  hatch,
  label,
  makeCanvas,
  oval,
  toTexture,
  wash,
  type SketchOptions,
} from '@/features/world/rooms/about/aboutTextures'
import { drawLandmark, strata, tuft } from './islandDetails'

export const ISLAND_ASPECT = 1024 / 768

export interface IslandOptions extends SketchOptions {
  title: string
  period: string
  landmark: 'school' | 'flag' | 'tree' | 'house'
}

export function createIslandTexture(
  { title, period, landmark, accent, painted = false, seed = 4 }: IslandOptions,
  width = 1024,
  height = 768,
): THREE.Texture {
  const [canvas, ctx] = makeCanvas(width, height)
  const random = mulberry32(seed * 29 + 13)
  const cx = width / 2
  const top = height * 0.46
  const rx = width * 0.36
  const ry = height * 0.075
  const depth = height * 0.46

  const rock: Point[] = [[cx - rx, top]]
  const steps = 14
  for (let i = 1; i < steps; i++) {
    const t = i / steps
    const taper = Math.pow(Math.sin(t * Math.PI), 0.75)
    const spike = i % 2 ? 1 : 0.62 + random() * 0.2
    rock.push([
      cx - rx + t * rx * 2 + (random() - 0.5) * 26,
      top + taper * depth * spike * (0.75 + random() * 0.3),
    ])
  }
  rock.push([cx + rx, top])
  pencil(ctx, rock, random, { fill: painted ? '#dcd7cc' : CREAM, width: 3, jitter: 2 })
  strata(ctx, rock, random, cx, rx, top, depth)
  hatch(ctx, rock, random, cx + rx * 0.2, cx + rx, top, top + depth, 16)

  for (let i = 0; i < 5; i++) {
    const x = cx - rx * 0.7 + random() * rx * 1.4
    const y0 = top + depth * (0.35 + random() * 0.3)
    const root: Point[] = []
    for (let k = 0; k <= 5; k++) {
      root.push([x + Math.sin(k * 1.4 + i) * 7, y0 + k * (9 + random() * 6)])
    }
    pencil(ctx, root, random, { close: false, width: 1.5, alpha: 0.6, passes: 1 })
  }
  for (let i = 0; i < 4; i++) {
    const x = cx - rx * 0.8 + random() * rx * 1.6
    const y = top + depth * (0.75 + random() * 0.3)
    pencil(ctx, oval(x, y, 7 + random() * 7, 5 + random() * 5, random, 10), random, {
      fill: painted ? '#dcd7cc' : CREAM,
      width: 1.8,
    })
  }

  const soil = oval(cx, top + ry * 0.5, rx * 1.01, ry * 1.05, random, 48)
  pencil(ctx, soil, random, { fill: painted ? '#cfc8ba' : GREY, width: 2.4, jitter: 1.4 })
  const grass = oval(cx, top, rx * 1.03, ry, random, 56)
  pencil(ctx, grass, random, { fill: painted ? accent : '#f1efe9', width: 3, jitter: 1.4 })
  if (painted) wash(ctx, grass, CREAM, 0.4)
  for (let i = 0; i < 26; i++) {
    const a = Math.PI * (0.05 + random() * 0.9)
    const edge = i < 14
    const r = edge ? 1 : random() * 0.85
    tuft(ctx, cx + Math.cos(a) * rx * r * (i % 2 ? 1 : -1), top + Math.sin(a) * ry * r, random)
  }
  for (let i = 0; i < 3; i++) {
    const x = cx - rx * 0.75 + i * rx * 0.3 + random() * 20
    const y = top - ry * 0.1 + random() * ry * 0.5
    pencil(ctx, oval(x, y - 12, 26 + random() * 12, 18, random, 16), random, {
      fill: painted ? accent : GREY,
      width: 2.2,
    })
  }
  const path: Point[] = []
  for (let k = 0; k <= 8; k++) {
    const t = k / 8
    path.push([cx - rx * 0.5 + t * rx * 0.95, top + ry * 0.45 - Math.sin(t * Math.PI) * ry * 0.5])
  }
  pencil(ctx, path, random, { close: false, width: 2, alpha: 0.4, passes: 1 })

  drawLandmark(ctx, landmark, cx + rx * 0.5, top - ry * 0.25, random, accent, painted)

  const signX = cx - rx * 0.3
  const signY = top - height * 0.2
  const signW = rx * 1.15
  const signH = height * 0.15
  for (const px of [signX - signW * 0.32, signX + signW * 0.32]) {
    pencil(
      ctx,
      [
        [px, signY + signH / 2],
        [px, top + ry * 0.1],
      ],
      random,
      { close: false, width: 3.2 },
    )
  }
  pencil(
    ctx,
    [
      [signX - signW / 2, signY - signH / 2],
      [signX + signW / 2, signY - signH / 2 + 4],
      [signX + signW / 2 - 4, signY + signH / 2],
      [signX - signW / 2 + 3, signY + signH / 2 - 3],
    ],
    random,
    { fill: CREAM, width: 2.8 },
  )
  label(
    ctx,
    title,
    signX,
    signY - signH * 0.16,
    `600 ${width * 0.036}px ${SERIF}`,
    INK,
    signW * 0.88,
  )
  label(
    ctx,
    period,
    signX,
    signY + signH * 0.24,
    `600 ${width * 0.034}px ${HAND}`,
    painted ? INK : accent,
    signW * 0.88,
  )
  return toTexture(canvas)
}
