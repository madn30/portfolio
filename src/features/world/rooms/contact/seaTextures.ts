import * as THREE from 'three'
import { INK, makeCanvas, pencil, toTexture, type Point } from '@/shared/graphics/roomTextures'
import { mulberry32 } from '@/shared/graphics/sketch'

export function createSeaTexture(size = 1024, seed = 7): THREE.Texture {
  const [canvas, ctx] = makeCanvas(size, size)
  const random = mulberry32(seed * 23 + 11)
  ctx.fillStyle = '#f7f6f2'
  ctx.fillRect(0, 0, size, size)
  ctx.strokeStyle = INK
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const strokes = Math.round((size / 1024) ** 2 * 950)
  for (let i = 0; i < strokes; i++) {
    const length = 40 + random() * 150
    const base = (random() - 0.5) * 0.5
    const k = 0.05 + random() * 0.12
    const amp = 0.18 + random() * 0.35
    const phase = random() * Math.PI * 2
    const curl = random() < 0.22 ? (random() < 0.5 ? 1 : -1) * (0.22 + random() * 0.12) : 0
    const curlFrom = length * (0.55 + random() * 0.2)
    let x = random() * size
    let y = random() * size
    const pts: Point[] = [[x, y]]
    let heading = base
    let maxX = x
    let maxY = y
    for (let s = 3; s <= length; s += 3) {
      heading = base + Math.sin(s * k + phase) * amp
      if (curl && s > curlFrom) heading += curl * ((s - curlFrom) / 3)
      x += Math.cos(heading) * 3
      y += Math.sin(heading) * 3
      pts.push([x, y])
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
    ctx.lineWidth = 1.3 + random() * 1.4
    ctx.globalAlpha = 0.45 + random() * 0.4
    const offsets: Point[] = [[0, 0]]
    if (maxX > size) offsets.push([-size, 0])
    if (maxY > size) offsets.push([0, -size])
    if (maxX > size && maxY > size) offsets.push([-size, -size])
    for (const [ox, oy] of offsets) {
      ctx.beginPath()
      pts.forEach(([px, py], j) =>
        j === 0 ? ctx.moveTo(px + ox, py + oy) : ctx.lineTo(px + ox, py + oy),
      )
      ctx.stroke()
    }
  }
  ctx.globalAlpha = 1
  const texture = toTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return texture
}

export function createPaperBoatTexture(width = 512, height = 320, seed = 6): THREE.Texture {
  const [canvas, ctx] = makeCanvas(width, height)
  const random = mulberry32(seed * 29 + 1)
  const X = (f: number) => width * f
  const Y = (f: number) => height * f
  const hull: Point[] = [
    [X(0.05), Y(0.54)],
    [X(0.95), Y(0.54)],
    [X(0.74), Y(0.92)],
    [X(0.26), Y(0.92)],
  ]
  pencil(ctx, hull, random, { fill: '#fbfaf7', width: 2.6, jitter: 1.2 })
  ctx.fillStyle = 'rgba(205,201,194,0.6)'
  ctx.beginPath()
  ctx.moveTo(X(0.5), Y(0.54))
  ctx.lineTo(X(0.95), Y(0.54))
  ctx.lineTo(X(0.74), Y(0.92))
  ctx.lineTo(X(0.5), Y(0.92))
  ctx.closePath()
  ctx.fill()
  pencil(
    ctx,
    [
      [X(0.12), Y(0.6)],
      [X(0.88), Y(0.6)],
    ],
    random,
    { close: false, width: 1.6, alpha: 0.5 },
  )
  const sail: Point[] = [
    [X(0.5), Y(0.08)],
    [X(0.77), Y(0.54)],
    [X(0.23), Y(0.54)],
  ]
  pencil(ctx, sail, random, { fill: '#fbfaf7', width: 2.6, jitter: 1.2 })
  ctx.fillStyle = 'rgba(205,201,194,0.6)'
  ctx.beginPath()
  ctx.moveTo(X(0.5), Y(0.08))
  ctx.lineTo(X(0.77), Y(0.54))
  ctx.lineTo(X(0.5), Y(0.54))
  ctx.closePath()
  ctx.fill()
  pencil(
    ctx,
    [
      [X(0.5), Y(0.08)],
      [X(0.5), Y(0.54)],
    ],
    random,
    { close: false, width: 1.8, alpha: 0.7 },
  )
  pencil(
    ctx,
    [
      [X(0.05), Y(0.54)],
      [X(0.95), Y(0.54)],
    ],
    random,
    { close: false, width: 2.6 },
  )
  return toTexture(canvas)
}
