import type * as THREE from 'three'
import { makeCanvas, pencil, toTexture, type Point } from '@/shared/graphics/roomTextures'
import { mulberry32 } from '@/shared/graphics/sketch'

const INK = '#262421'
const RED = '#d2483c'

export function createLighthouseTexture(width = 512, height = 768, seed = 2): THREE.Texture {
  const [canvas, ctx] = makeCanvas(width, height)
  const random = mulberry32(seed * 19 + 5)
  const X = (f: number) => width * f
  const Y = (f: number) => height * f
  const cx = X(0.5)

  const rocks: Point[] = [
    [X(0.04), Y(0.98)],
    [X(0.1), Y(0.88)],
    [X(0.2), Y(0.91)],
    [X(0.29), Y(0.83)],
    [X(0.38), Y(0.87)],
    [X(0.5), Y(0.82)],
    [X(0.6), Y(0.86)],
    [X(0.71), Y(0.81)],
    [X(0.81), Y(0.89)],
    [X(0.9), Y(0.85)],
    [X(0.97), Y(0.98)],
  ]
  pencil(ctx, rocks, random, { fill: '#9aa3ab', width: 2.6, jitter: 1.8, color: INK })
  ctx.strokeStyle = INK
  ctx.lineCap = 'round'
  for (let i = 0; i < 26; i++) {
    const x = X(0.08 + random() * 0.84)
    const y = Y(0.87 + random() * 0.09)
    const len = 6 + random() * 18
    ctx.globalAlpha = 0.25 + random() * 0.35
    ctx.lineWidth = 1 + random() * 0.8
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + len * 0.7, y + len * 0.5 * (random() < 0.5 ? 1 : -1))
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  for (let i = 0; i < 6; i++) {
    const x = X(0.1 + random() * 0.8)
    pencil(
      ctx,
      [
        [x, Y(0.84 + random() * 0.06)],
        [x + (random() - 0.5) * 30, Y(0.95)],
      ],
      random,
      {
        close: false,
        width: 1.4,
        alpha: 0.5,
        passes: 1,
      },
    )
  }

  const baseY = Y(0.845)
  const topY = Y(0.37)
  const hwB = X(0.125)
  const hwT = X(0.085)
  const tower: Point[] = [
    [cx - hwB, baseY],
    [cx + hwB, baseY],
    [cx + hwT, topY],
    [cx - hwT, topY],
  ]
  pencil(ctx, tower, random, { fill: '#ffffff', width: 2.8, jitter: 1.3, color: INK })
  ctx.save()
  ctx.beginPath()
  tower.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
  ctx.closePath()
  ctx.clip()
  ctx.fillStyle = RED
  for (const band of [0.08, 0.42, 0.76]) {
    ctx.fillRect(cx - hwB, baseY + (topY - baseY) * (band + 0.17), hwB * 2, (baseY - topY) * 0.17)
  }
  ctx.fillStyle = 'rgba(38,52,80,0.22)'
  ctx.beginPath()
  ctx.moveTo(cx + hwB * 0.3, baseY)
  ctx.lineTo(cx + hwB, baseY)
  ctx.lineTo(cx + hwT, topY)
  ctx.lineTo(cx + hwT * 0.3, topY)
  ctx.closePath()
  ctx.fill()
  const courses = 11
  for (let c = 1; c < courses; c++) {
    const t = c / courses
    const y = baseY + (topY - baseY) * t
    const hw = hwB + (hwT - hwB) * t
    pencil(
      ctx,
      [
        [cx - hw - 4, y],
        [cx + hw + 4, y],
      ],
      random,
      {
        close: false,
        width: 1.3,
        alpha: 0.42,
        passes: 1,
        jitter: 0.8,
      },
    )
    const bricks = 3
    for (let b = 0; b < bricks; b++) {
      const bx = cx - hw + (hw * 2 * (b + (c % 2 ? 0.5 : 0.1))) / bricks
      const y2 = baseY + (topY - baseY) * ((c + 1) / courses)
      if (random() < 0.6)
        pencil(
          ctx,
          [
            [bx, y],
            [bx, y2],
          ],
          random,
          { close: false, width: 1.1, alpha: 0.3, passes: 1 },
        )
    }
  }
  ctx.restore()
  pencil(
    ctx,
    [
      [cx - X(0.03), baseY],
      [cx - X(0.03), Y(0.775)],
      [cx, Y(0.76)],
      [cx + X(0.03), Y(0.775)],
      [cx + X(0.03), baseY],
    ],
    random,
    { fill: '#7a4e2b', width: 2, jitter: 0.8, color: INK },
  )
  for (const wy of [0.63, 0.5]) {
    const hw = X(0.018)
    pencil(
      ctx,
      [
        [cx - hw, Y(wy)],
        [cx - hw, Y(wy - 0.04)],
        [cx, Y(wy - 0.05)],
        [cx + hw, Y(wy - 0.04)],
        [cx + hw, Y(wy)],
      ],
      random,
      { fill: '#ffd34d', width: 1.8, jitter: 0.6, color: INK },
    )
  }
  const galHw = X(0.135)
  pencil(
    ctx,
    [
      [cx - galHw, Y(0.37)],
      [cx + galHw, Y(0.37)],
      [cx + galHw * 0.92, Y(0.395)],
      [cx - galHw * 0.92, Y(0.395)],
    ],
    random,
    { fill: '#3b4250', width: 2.4, jitter: 1, color: INK },
  )
  pencil(
    ctx,
    [
      [cx - galHw, Y(0.33)],
      [cx + galHw, Y(0.33)],
    ],
    random,
    { close: false, width: 2 },
  )
  for (let i = 0; i <= 7; i++) {
    const x = cx - galHw + (galHw * 2 * i) / 7
    pencil(
      ctx,
      [
        [x, Y(0.33)],
        [x, Y(0.37)],
      ],
      random,
      { close: false, width: 1.6, passes: 1 },
    )
  }
  const lanHw = X(0.07)
  pencil(
    ctx,
    [
      [cx - lanHw, Y(0.33)],
      [cx - lanHw, Y(0.245)],
      [cx + lanHw, Y(0.245)],
      [cx + lanHw, Y(0.33)],
    ],
    random,
    { fill: '#ffe58a', width: 2.4, jitter: 0.9, color: INK },
  )
  for (let i = 1; i < 4; i++) {
    const x = cx - lanHw + (lanHw * 2 * i) / 4
    pencil(
      ctx,
      [
        [x, Y(0.245)],
        [x, Y(0.33)],
      ],
      random,
      { close: false, width: 1.3, alpha: 0.6, passes: 1 },
    )
  }
  const dome: Point[] = []
  for (let i = 0; i <= 14; i++) {
    const a = Math.PI - (Math.PI * i) / 14
    dome.push([cx + Math.cos(a) * lanHw * 1.15, Y(0.245) - Math.sin(a) * Y(0.06)])
  }
  pencil(ctx, dome, random, { fill: RED, width: 2.4, jitter: 1, color: INK })
  pencil(
    ctx,
    [
      [cx, Y(0.185)],
      [cx, Y(0.145)],
    ],
    random,
    { close: false, width: 2.2, passes: 1 },
  )
  ctx.fillStyle = INK
  ctx.beginPath()
  ctx.arc(cx, Y(0.14), 4, 0, Math.PI * 2)
  ctx.fill()
  return toTexture(canvas)
}
