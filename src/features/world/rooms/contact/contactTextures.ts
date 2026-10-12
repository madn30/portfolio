import * as THREE from 'three'
import { makeCanvas, pencil, toTexture, type Point } from '@/shared/graphics/roomTextures'
import { mulberry32 } from '@/shared/graphics/sketch'

const INK = '#262421'
const FOAM = '#ffffff'

export function createDockTexture(
  width = 512,
  height = 1024,
  planks = 12,
  seed = 8,
): THREE.Texture {
  const [canvas, ctx] = makeCanvas(width, height)
  const random = mulberry32(seed * 37 + 4)
  const h = height / planks
  const gap = 5
  ctx.fillStyle = '#5a3a20'
  ctx.fillRect(0, 0, width, height)
  for (let p = 0; p < planks; p++) {
    const y0 = p * h + gap / 2
    const y1 = (p + 1) * h - gap / 2
    const split = width * (0.42 + random() * 0.26)
    const columns: [number, number][] = [
      [gap / 2, split - gap / 2],
      [split + gap / 2, width - gap / 2],
    ]
    for (const [x0, x1] of columns) {
      const outline: Point[] = [
        [x0 + random() * 3, y0 + random() * 3],
        [x1 - random() * 3, y0 + random() * 3],
        [x1 - random() * 3, y1 - random() * 3],
        [x0 + random() * 3, y1 - random() * 3],
      ]
      pencil(ctx, outline, random, {
        fill: p % 2 === 0 ? '#c8955c' : '#bb8850',
        width: 2.4,
        jitter: 1.1,
        color: INK,
      })
      ctx.strokeStyle = '#7a4e2b'
      ctx.lineCap = 'round'
      const grains = 2 + Math.floor(random() * 3)
      for (let g = 0; g < grains; g++) {
        const gy = y0 + (y1 - y0) * (0.2 + random() * 0.6)
        const start = x0 + (x1 - x0) * random() * 0.5
        const len = (x1 - x0) * (0.25 + random() * 0.5)
        const amp = 1.5 + random() * 3
        ctx.globalAlpha = 0.4 + random() * 0.3
        ctx.lineWidth = 1 + random() * 0.8
        ctx.beginPath()
        ctx.moveTo(start, gy)
        ctx.bezierCurveTo(
          start + len * 0.3,
          gy + amp,
          start + len * 0.7,
          gy - amp,
          start + len,
          gy + amp * 0.4,
        )
        ctx.stroke()
      }
      ctx.globalAlpha = 0.8
      ctx.fillStyle = INK
      for (const nx of [x0 + 14, x1 - 14]) {
        for (const ny of [y0 + (y1 - y0) * 0.3, y0 + (y1 - y0) * 0.7]) {
          ctx.beginPath()
          ctx.arc(nx + (random() - 0.5) * 3, ny + (random() - 0.5) * 3, 2.4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
    }
  }
  const texture = toTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return texture
}

export function createWaveCrestTexture(width = 1024, height = 128, seed = 9): THREE.Texture {
  const [canvas, ctx] = makeCanvas(width, height)
  const random = mulberry32(seed * 29 + 3)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const crests = 9
  for (let c = 0; c < crests; c++) {
    const x0 = (c / crests) * width + random() * 30
    const len = 60 + random() * 80
    const baseY = height * (0.55 + random() * 0.3)
    const rise = height * (0.25 + random() * 0.2)
    const pts: Point[] = []
    for (let s = 0; s <= 16; s++) {
      const t = s / 16
      pts.push([x0 + len * t, baseY - Math.sin(t * Math.PI) * rise * (1 - t * 0.3)])
    }
    const curl = 5 + random() * 3
    for (let s = 1; s <= 8; s++) {
      const a = (s / 8) * Math.PI * 1.4
      const [ex, ey] = pts[pts.length - 1]
      pts.push([ex + Math.sin(a) * curl * 1.4, ey + (1 - Math.cos(a)) * curl])
    }
    ctx.globalAlpha = 0.55 + random() * 0.3
    const draw = (ox: number) =>
      pencil(
        ctx,
        pts.map(([x, y]) => [x + ox, y] as Point),
        random,
        { close: false, width: 2.6 + random(), jitter: 1, passes: 1, alpha: 0.95, color: FOAM },
      )
    draw(0)
    if (x0 + len + 20 > width) draw(-width)
    for (let f = 0; f < 3; f++) {
      const fx = x0 + len * (0.1 + random() * 0.5)
      const fy = baseY + 4 + random() * (height - baseY - 8)
      pencil(
        ctx,
        [
          [fx, fy],
          [fx + 14 + random() * 20, fy + (random() - 0.5) * 4],
        ],
        random,
        { close: false, width: 1.6, jitter: 0.6, passes: 1, alpha: 0.7, color: FOAM },
      )
    }
  }
  ctx.globalAlpha = 1
  const texture = toTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}

export function createBeamTexture(width = 256, color = '255,236,170'): THREE.Texture {
  const [canvas, ctx] = makeCanvas(width, 4)
  const gradient = ctx.createLinearGradient(0, 0, width, 0)
  gradient.addColorStop(0, `rgba(${color},0.55)`)
  gradient.addColorStop(0.5, `rgba(${color},0.22)`)
  gradient.addColorStop(1, `rgba(${color},0)`)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, 4)
  return toTexture(canvas)
}
