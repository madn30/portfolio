import type * as THREE from 'three'
import { CREAM, GREY, INK, arc, makeCanvas, ring, toTexture } from './doodleDrawing'
import { pencil, type Point } from './roomTextures'
import { mulberry32 } from './sketch'

export const AVATAR_ASPECT = 320 / 560

const SKIN = '#f1d9c2'
const HAIR = '#6a4e3a'
const BEARD = '#7d5f47'
const SHIRT = '#8c7c6f'

function drawFace(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  random: () => number,
): void {
  const at = (x: number, y: number): Point => [cx + x * r, cy + y * r]
  const polar = (deg: number, radius: number): Point => [
    cx + Math.cos((deg * Math.PI) / 180) * r * radius,
    cy + Math.sin((deg * Math.PI) / 180) * r * radius,
  ]

  for (const side of [-1, 1]) {
    pencil(ctx, ring(cx + side * r * 0.99, cy + r * 0.02, r * 0.17, random), random, {
      fill: SKIN,
      width: 2,
    })
  }
  pencil(ctx, ring(cx, cy, r, random, 0.02), random, { fill: SKIN, width: 2.8 })

  const beard: Point[] = []
  for (let deg = -6; deg <= 186; deg += 12) beard.push(polar(deg, 1.035))
  beard.push(at(-0.9, -0.12), at(-0.72, 0.3), at(-0.42, 0.33), at(-0.16, 0.22), at(0, 0.26))
  beard.push(at(0.16, 0.22), at(0.42, 0.33), at(0.72, 0.3), at(0.9, -0.12))
  pencil(ctx, beard, random, { fill: BEARD, width: 2.2, color: HAIR, jitter: 1.6 })
  ctx.strokeStyle = HAIR
  ctx.lineWidth = 1.3
  ctx.globalAlpha = 0.55
  for (let i = 0; i < 46; i++) {
    const deg = 8 + random() * 164
    const [x, y] = polar(deg, 0.62 + random() * 0.36)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + (random() - 0.5) * 3, y + 3 + random() * 3)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  ctx.fillStyle = '#fdfcf8'
  ctx.beginPath()
  ctx.moveTo(...at(-0.4, 0.42))
  ctx.lineTo(...at(0.4, 0.42))
  ctx.quadraticCurveTo(...at(0.3, 0.78), ...at(0, 0.78))
  ctx.quadraticCurveTo(...at(-0.3, 0.78), ...at(-0.4, 0.42))
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = INK
  ctx.lineWidth = 2.2
  ctx.stroke()
  ctx.lineWidth = 1.2
  ctx.globalAlpha = 0.55
  ctx.beginPath()
  ctx.moveTo(...at(-0.33, 0.57))
  ctx.quadraticCurveTo(...at(0, 0.64), ...at(0.33, 0.57))
  ctx.stroke()
  ctx.globalAlpha = 1

  const hair: Point[] = []
  for (let deg = 196; deg <= 344; deg += 10) {
    const lift = Math.sin(((deg - 196) / 148) * Math.PI)
    const quiff = Math.exp(-(((deg - 262) / 34) ** 2)) * 0.2
    hair.push(polar(deg, 1.05 + lift * 0.12 + quiff + random() * 0.03))
  }
  hair.push(at(0.93, -0.22), at(0.74, -0.5), at(0.2, -0.64), at(-0.42, -0.6), at(-0.78, -0.46))
  hair.push(at(-0.94, -0.2))
  pencil(ctx, hair, random, { fill: HAIR, width: 2.6, jitter: 1.8 })
  ctx.strokeStyle = '#3f2d21'
  ctx.lineWidth = 1.5
  ctx.globalAlpha = 0.6
  for (let i = 0; i < 9; i++) {
    const x = -0.7 + i * 0.17
    ctx.beginPath()
    ctx.moveTo(...at(x, -0.58))
    ctx.quadraticCurveTo(...at(x - 0.12, -0.9), ...at(x - 0.3, -1.08 - random() * 0.08))
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  ctx.strokeStyle = HAIR
  ctx.lineCap = 'round'
  ctx.lineWidth = 4
  for (const side of [-1, 1]) {
    ctx.beginPath()
    ctx.moveTo(...at(side * 0.62, -0.3))
    ctx.quadraticCurveTo(...at(side * 0.42, -0.42), ...at(side * 0.2, -0.32))
    ctx.stroke()
  }
  for (const side of [-1, 1]) {
    arc(ctx, cx + side * r * 0.4, cy - r * 0.02, r * 0.17, Math.PI * 1.12, Math.PI * 1.88, 2.8)
  }
  arc(ctx, cx, cy + r * 0.08, r * 0.14, Math.PI * 0.2, Math.PI * 0.8, 2, 0.75)
  ctx.fillStyle = 'rgba(192,105,59,0.2)'
  for (const side of [-1, 1]) {
    ctx.beginPath()
    ctx.arc(cx + side * r * 0.62, cy + r * 0.2, r * 0.16, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function createAvatarFrames(count = 6, width = 320, height = 560): THREE.Texture[] {
  const frames: THREE.Texture[] = []
  for (let frame = 0; frame < count; frame++) {
    const [canvas, ctx] = makeCanvas(width, height)
    const random = mulberry32(77)
    const X = (f: number) => width * f
    const Y = (f: number) => height * f

    pencil(
      ctx,
      [
        [X(0.31), Y(0.59)],
        [X(0.48), Y(0.59)],
        [X(0.47), Y(0.895)],
        [X(0.325), Y(0.895)],
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
        [X(0.52), Y(0.59)],
        [X(0.69), Y(0.59)],
        [X(0.675), Y(0.895)],
        [X(0.53), Y(0.895)],
      ],
      random,
      {
        fill: GREY,
        width: 2.6,
      },
    )
    for (const cx of [0.395, 0.605]) {
      pencil(
        ctx,
        [
          [X(cx - 0.085), Y(0.9)],
          [X(cx + 0.075), Y(0.9)],
          [X(cx + 0.095), Y(0.93)],
          [X(cx - 0.09), Y(0.935)],
        ],
        random,
        { fill: CREAM, width: 2.4 },
      )
    }

    pencil(
      ctx,
      [
        [X(0.34), Y(0.315)],
        [X(0.66), Y(0.315)],
        [X(0.705), Y(0.595)],
        [X(0.295), Y(0.595)],
      ],
      random,
      { fill: SHIRT, width: 2.8 },
    )
    for (const [sx, dir] of [
      [0.34, -1],
      [0.66, 1],
    ]) {
      pencil(
        ctx,
        [
          [X(sx), Y(0.315)],
          [X(sx + dir * 0.085), Y(0.365)],
          [X(sx + dir * 0.06), Y(0.43)],
          [X(sx - dir * 0.01), Y(0.4)],
        ],
        random,
        { fill: SHIRT, width: 2.4 },
      )
    }
    ctx.fillStyle = SKIN
    ctx.beginPath()
    ctx.ellipse(X(0.5), Y(0.315), width * 0.075, height * 0.02, 0, 0, Math.PI)
    ctx.fill()
    arc(ctx, X(0.5), Y(0.312), width * 0.078, Math.PI * 0.08, Math.PI * 0.92, 2.2, 0.8)

    pencil(
      ctx,
      [
        [X(0.335), Y(0.34)],
        [X(0.26), Y(0.47)],
        [X(0.275), Y(0.585)],
      ],
      random,
      {
        close: false,
        width: 2.8,
      },
    )
    pencil(ctx, ring(X(0.28), Y(0.6), width * 0.035, random), random, { fill: SKIN, width: 2.2 })

    const t = count > 1 ? frame / (count - 1) : 0.5
    const angle = -0.62 + t * 1.24
    const elbow: Point = [X(0.815), Y(0.285)]
    const reach = height * 0.17
    const hand: Point = [elbow[0] + Math.sin(angle) * reach, elbow[1] - Math.cos(angle) * reach]
    pencil(ctx, [[X(0.665), Y(0.34)], elbow, hand], random, { close: false, width: 2.8 })
    pencil(ctx, ring(hand[0], hand[1], width * 0.04, random), random, { fill: SKIN, width: 2.2 })
    for (let finger = -1; finger <= 1; finger++) {
      const a = angle + finger * 0.32
      const base: Point = [
        hand[0] + Math.sin(a) * width * 0.03,
        hand[1] - Math.cos(a) * width * 0.03,
      ]
      const tip: Point = [
        hand[0] + Math.sin(a) * width * 0.075,
        hand[1] - Math.cos(a) * width * 0.075,
      ]
      pencil(ctx, [base, tip], random, { close: false, width: 2, passes: 1 })
    }
    if (t < 0.2 || t > 0.8) {
      const side = t < 0.2 ? -1 : 1
      for (let i = 0; i < 2; i++) {
        arc(
          ctx,
          hand[0] + side * width * (0.07 + i * 0.035),
          hand[1],
          width * (0.03 + i * 0.012),
          side < 0 ? Math.PI * 0.75 : -Math.PI * 0.25,
          side < 0 ? Math.PI * 1.25 : Math.PI * 0.25,
          1.8,
          0.55 - i * 0.15,
        )
      }
    }

    drawFace(ctx, X(0.5), Y(0.2), width * 0.165, random)

    frames.push(toTexture(canvas))
  }
  return frames
}
