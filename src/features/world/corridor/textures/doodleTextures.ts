import type * as THREE from 'three'
import { CREAM, INK, arc, makeCanvas, ring, toTexture } from '@/shared/graphics/doodleDrawing'
import { pencil, type Point } from '@/shared/graphics/roomTextures'
import { mulberry32 } from '@/shared/graphics/sketch'

export type DoodleKind =
  'plane' | 'ball' | 'pencil' | 'mug' | 'star' | 'circle' | 'squiggle' | 'bubble' | 'code'

export function createDoodleTexture(kind: DoodleKind, seed = 1, size = 256): THREE.Texture {
  const [canvas, ctx] = makeCanvas(size, size)
  const random = mulberry32(seed * 31 + 7)
  const S = (f: number) => size * f

  switch (kind) {
    case 'plane': {
      const nose: Point = [S(0.9), S(0.12)]
      const tailTop: Point = [S(0.1), S(0.42)]
      const tailBottom: Point = [S(0.3), S(0.88)]
      const keel: Point = [S(0.36), S(0.5)]
      pencil(ctx, [nose, tailTop, keel], random, { fill: CREAM, width: 2.6 })
      pencil(ctx, [nose, keel, tailBottom], random, { fill: '#bcd3ea', width: 2.6 })
      pencil(ctx, [nose, keel], random, { close: false, width: 2, alpha: 0.6 })
      break
    }
    case 'ball': {
      pencil(ctx, ring(S(0.5), S(0.5), S(0.36), random, 0.12), random, {
        fill: '#f0c95a',
        width: 2.8,
      })
      for (let i = 0; i < 7; i++) {
        const a = random() * Math.PI * 2
        const r = S(0.12 + random() * 0.2)
        const mid: Point = [
          S(0.5) + (random() - 0.5) * S(0.12),
          S(0.5) + (random() - 0.5) * S(0.12),
        ]
        const end: Point = [mid[0] + Math.cos(a) * r, mid[1] + Math.sin(a) * r]
        const bend: Point = [
          (mid[0] + end[0]) / 2 + (random() - 0.5) * S(0.08),
          (mid[1] + end[1]) / 2 + (random() - 0.5) * S(0.08),
        ]
        pencil(ctx, [mid, bend, end], random, { close: false, width: 1.8, alpha: 0.6, passes: 1 })
      }
      break
    }
    case 'pencil': {
      const dir = { x: Math.SQRT1_2, y: -Math.SQRT1_2 }
      const nrm = { x: Math.SQRT1_2, y: Math.SQRT1_2 }
      const half = S(0.055)
      const at = (along: number, across: number): Point => [
        S(0.16) + dir.x * along + nrm.x * across,
        S(0.84) + dir.y * along + nrm.y * across,
      ]
      const body = S(0.64)
      pencil(ctx, [at(0, -half), at(body, -half), at(body, half), at(0, half)], random, {
        fill: '#ffd34d',
        width: 2.6,
      })
      pencil(ctx, [at(body, -half), at(body + S(0.14), 0), at(body, half)], random, {
        fill: '#e6c48f',
        width: 2.4,
      })
      pencil(
        ctx,
        [at(body + S(0.09), -half * 0.35), at(body + S(0.14), 0), at(body + S(0.09), half * 0.35)],
        random,
        {
          fill: INK,
          width: 1.6,
        },
      )
      pencil(
        ctx,
        [at(S(0.04), -half), at(S(0.1), -half), at(S(0.1), half), at(S(0.04), half)],
        random,
        {
          fill: '#8d99a6',
          width: 1.8,
        },
      )
      pencil(
        ctx,
        [
          at(-S(0.02), -half * 0.85),
          at(S(0.04), -half),
          at(S(0.04), half),
          at(-S(0.02), half * 0.85),
        ],
        random,
        {
          fill: '#e88b8b',
          width: 1.8,
        },
      )
      pencil(ctx, [at(S(0.12), -half * 0.3), at(body - S(0.02), -half * 0.3)], random, {
        close: false,
        width: 1.4,
        alpha: 0.45,
        passes: 1,
      })
      break
    }
    case 'mug': {
      pencil(
        ctx,
        [
          [S(0.3), S(0.42)],
          [S(0.68), S(0.42)],
          [S(0.66), S(0.84)],
          [S(0.32), S(0.84)],
        ],
        random,
        { fill: '#4f7fc9', width: 2.8 },
      )
      arc(ctx, S(0.7), S(0.6), S(0.11), -Math.PI * 0.5, Math.PI * 0.5, 2.8)
      arc(ctx, S(0.7), S(0.6), S(0.06), -Math.PI * 0.5, Math.PI * 0.5, 2, 0.6)
      ctx.fillStyle = '#7fa3dc'
      ctx.beginPath()
      ctx.ellipse(S(0.49), S(0.42), S(0.19), S(0.05), 0, 0, Math.PI * 2)
      ctx.fill()
      arc(ctx, S(0.49), S(0.42), S(0.19), 0, Math.PI * 2, 2.4)
      ctx.fillStyle = '#6b4226'
      ctx.beginPath()
      ctx.ellipse(S(0.49), S(0.42), S(0.14), S(0.03), 0, 0, Math.PI * 2)
      ctx.fill()
      pencil(
        ctx,
        [
          [S(0.36), S(0.58)],
          [S(0.62), S(0.58)],
        ],
        random,
        {
          close: false,
          width: 2,
          alpha: 0.9,
          color: CREAM,
          passes: 1,
        },
      )
      for (const sx of [0.4, 0.49, 0.58]) {
        const x = S(sx)
        const pts: Point[] = []
        for (let i = 0; i <= 6; i++) {
          pts.push([x + Math.sin(i * 1.1 + sx * 10) * S(0.025), S(0.34) - i * S(0.035)])
        }
        pencil(ctx, pts, random, { close: false, width: 1.8, alpha: 0.5, passes: 1 })
      }
      break
    }
    case 'star': {
      const c = S(0.5)
      const long = S(0.4)
      const short = S(0.17)
      pencil(
        ctx,
        [
          [c, c - long],
          [c, c + long],
        ],
        random,
        { close: false, width: 3, color: '#e0a63a' },
      )
      pencil(
        ctx,
        [
          [c - long, c],
          [c + long, c],
        ],
        random,
        { close: false, width: 3, color: '#e0a63a' },
      )
      for (const [dx, dy] of [
        [1, 1],
        [1, -1],
      ]) {
        pencil(
          ctx,
          [
            [c - dx * short, c - dy * short],
            [c + dx * short, c + dy * short],
          ],
          random,
          {
            close: false,
            width: 2.2,
            alpha: 0.8,
            color: '#e0a63a',
          },
        )
      }
      break
    }
    case 'circle': {
      pencil(ctx, ring(S(0.5), S(0.5), S(0.36), random, 0.08), random, {
        width: 3,
        alpha: 0.85,
        color: '#4f7fc9',
      })
      break
    }
    case 'squiggle': {
      const pts: Point[] = []
      for (let i = 0; i <= 24; i++) {
        const t = i / 24
        pts.push([S(0.08 + t * 0.84), S(0.5) + Math.sin(t * Math.PI * 4) * S(0.14)])
      }
      pencil(ctx, pts, random, { close: false, width: 3, alpha: 0.85, color: '#d2483c' })
      break
    }
    case 'bubble': {
      pencil(ctx, ring(S(0.58), S(0.42), S(0.3), random, 0.08), random, {
        fill: CREAM,
        width: 2.8,
      })
      pencil(ctx, ring(S(0.26), S(0.74), S(0.08), random, 0.1), random, {
        fill: CREAM,
        width: 2.2,
      })
      pencil(ctx, ring(S(0.12), S(0.9), S(0.045), random, 0.1), random, {
        fill: CREAM,
        width: 2,
      })
      break
    }
    case 'code': {
      ctx.fillStyle = INK
      ctx.font = `700 ${S(0.42)}px "JetBrains Mono", "Fira Code", monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('</>', S(0.5), S(0.52))
      break
    }
  }
  return toTexture(canvas)
}
