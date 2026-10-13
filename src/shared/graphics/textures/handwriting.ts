import * as THREE from 'three'
import { mulberry32 } from '@/shared/graphics/sketch'
import { makeCanvas } from '@/shared/graphics/roomTextures'

interface HandwritingOptions {
  lines: string[]
  color?: string
  fontSize?: number
  width?: number
  height?: number
  font?: 'hand' | 'code'
}

export function createHandwritingTexture({
  lines,
  color = '#2f2a26',
  fontSize = 56,
  width = 512,
  height = 256,
  font = 'hand',
}: HandwritingOptions): THREE.Texture {
  const [canvas, ctx] = makeCanvas(width, height)

  const random = mulberry32(lines.join('').length * 7 + 3)
  ctx.fillStyle = color
  ctx.textAlign = font === 'code' ? 'left' : 'center'
  ctx.textBaseline = 'middle'
  const face = 'Caveat, "Segoe Print", cursive'
  ctx.font = `600 ${fontSize}px ${face}`
  const room = font === 'code' ? width * 0.82 : width * 0.94
  const widest = Math.max(1, ...lines.map((line) => ctx.measureText(line).width))
  const tallest = lines.length * fontSize * 1.08
  const fitted = fontSize * Math.min(1, room / widest, (height * 0.96) / tallest)
  ctx.font = `600 ${fitted}px ${face}`

  const lineHeight = fitted * 1.08
  const top = height / 2 - ((lines.length - 1) * lineHeight) / 2
  const left = font === 'code' ? width * 0.12 : width / 2
  lines.forEach((line, i) => {
    ctx.save()
    ctx.translate(left, top + i * lineHeight)
    ctx.rotate((random() - 0.5) * 0.03)
    ctx.fillText(line, 0, 0)
    ctx.restore()
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

export function createCloudTexture(seed = 1, width = 256, height = 160): THREE.Texture {
  const [canvas, ctx] = makeCanvas(width, height)

  const random = mulberry32(seed * 101 + 7)
  const cx = width / 2
  const cy = height * 0.58
  const rx = width * 0.42
  const ry = height * 0.3
  const lobes = 9
  const points: [number, number][] = []
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2
    const wobble = 0.82 + random() * 0.3
    points.push([cx + Math.cos(a) * rx * wobble, cy + Math.sin(a) * ry * wobble])
  }
  ctx.beginPath()
  ctx.moveTo(points[0][0], points[0][1])
  for (let i = 0; i < lobes; i++) {
    const [x0, y0] = points[i]
    const [x1, y1] = points[(i + 1) % lobes]
    const mx = (x0 + x1) / 2
    const my = (y0 + y1) / 2
    const nx = mx - cx
    const ny = my - cy
    const len = Math.hypot(nx, ny) || 1
    const bulge = 0.22 + random() * 0.14
    ctx.quadraticCurveTo(mx + (nx / len) * rx * bulge, my + (ny / len) * ry * bulge, x1, y1)
  }
  ctx.closePath()
  ctx.fillStyle = '#fbfaf7'
  ctx.fill()
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#262421'
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.globalAlpha = 0.35
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx - rx * 0.5, cy + ry * 0.55)
  ctx.quadraticCurveTo(cx, cy + ry * 0.85, cx + rx * 0.45, cy + ry * 0.5)
  ctx.stroke()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}
