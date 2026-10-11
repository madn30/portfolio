import * as THREE from 'three'
import { mulberry32 } from './sketch'

/**
 * Procedural textures drawn on an offscreen canvas. Nothing is downloaded: the paper grain,
 * hatching, and door plaques are generated once and cached for the lifetime of the page.
 */
const cache = new Map<string, THREE.Texture>()

function makeCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')
  return [canvas, ctx]
}

/** Warm paper with fibres and a faint speckle. Tiles seamlessly enough for walls and floors. */
export function getPaperTexture(size = 512): THREE.Texture {
  const key = `paper-${size}`
  const cached = cache.get(key)
  if (cached) return cached

  const [canvas, ctx] = makeCanvas(size)
  const random = mulberry32(42)
  ctx.fillStyle = '#f4efe4'
  ctx.fillRect(0, 0, size, size)

  // Fine speckle
  const image = ctx.getImageData(0, 0, size, size)
  const data = image.data
  for (let i = 0; i < data.length; i += 4) {
    const n = (random() - 0.5) * 14
    data[i] += n
    data[i + 1] += n
    data[i + 2] += n * 0.9
  }
  ctx.putImageData(image, 0, 0)

  // Fibres
  ctx.strokeStyle = 'rgba(90, 75, 60, 0.07)'
  ctx.lineWidth = 1
  for (let i = 0; i < size * 0.6; i++) {
    const x = random() * size
    const y = random() * size
    const len = 6 + random() * 24
    const angle = random() * Math.PI
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len)
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  cache.set(key, texture)
  return texture
}

/** Diagonal pencil hatching used as an alpha map for soft contact shadows. */
export function getHatchTexture(size = 256): THREE.Texture {
  const key = `hatch-${size}`
  const cached = cache.get(key)
  if (cached) return cached

  const [canvas, ctx] = makeCanvas(size)
  const random = mulberry32(99)
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, size, size)
  ctx.strokeStyle = '#fff'
  ctx.lineCap = 'round'
  const gap = 9
  for (let d = -size; d < size * 2; d += gap) {
    ctx.lineWidth = 1 + random() * 1.2
    ctx.globalAlpha = 0.55 + random() * 0.45
    ctx.beginPath()
    ctx.moveTo(d + (random() - 0.5) * 3, 0)
    ctx.lineTo(d + size + (random() - 0.5) * 3, size)
    ctx.stroke()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  cache.set(key, texture)
  return texture
}

/** Radial fade used to fake ambient occlusion where walls meet the floor. */
export function getGradientTexture(size = 128): THREE.Texture {
  const key = `gradient-${size}`
  const cached = cache.get(key)
  if (cached) return cached
  const [canvas, ctx] = makeCanvas(size)
  const gradient = ctx.createLinearGradient(0, 0, 0, size)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping
  cache.set(key, texture)
  return texture
}

export interface LabelOptions {
  title: string
  subtitle?: string
  accent?: string
  width?: number
  height?: number
}

/** A small plaque: number in handwriting, title in the display serif. */
export function createLabelTexture({
  title,
  subtitle,
  accent = '#c0693b',
  width = 512,
  height = 192,
}: LabelOptions): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')

  ctx.fillStyle = '#faf6ee'
  ctx.fillRect(0, 0, width, height)

  // Wobbly border
  ctx.strokeStyle = '#2f2a26'
  ctx.lineWidth = 3
  ctx.lineJoin = 'round'
  const random = mulberry32(title.length * 13 + 5)
  const inset = 10
  ctx.beginPath()
  const corners: [number, number][] = [
    [inset, inset],
    [width - inset, inset],
    [width - inset, height - inset],
    [inset, height - inset],
  ]
  corners.forEach(([x, y], i) => {
    const jx = x + (random() - 0.5) * 6
    const jy = y + (random() - 0.5) * 6
    if (i === 0) ctx.moveTo(jx, jy)
    else ctx.lineTo(jx, jy)
  })
  ctx.closePath()
  ctx.stroke()

  ctx.fillStyle = accent
  ctx.font = `600 ${Math.round(height * 0.28)}px Caveat, "Segoe Print", cursive`
  ctx.textBaseline = 'middle'
  if (subtitle) ctx.fillText(subtitle, 34, height * 0.33)

  ctx.fillStyle = '#2f2a26'
  ctx.font = `500 ${Math.round(height * 0.34)}px Fraunces, Georgia, serif`
  ctx.fillText(title, 34, subtitle ? height * 0.68 : height * 0.5)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/** Three-step gradient map that gives MeshToonMaterial its flat, illustrated shading. */
export function getToonGradient(): THREE.Texture {
  const key = 'toon-gradient'
  const cached = cache.get(key)
  if (cached) return cached
  const data = new Uint8Array([
    120, 120, 120, 255, 185, 185, 185, 255, 235, 235, 235, 255, 255, 255, 255, 255,
  ])
  const texture = new THREE.DataTexture(data, 4, 1, THREE.RGBAFormat)
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.needsUpdate = true
  cache.set(key, texture)
  return texture
}

export function disposeTextureCache(): void {
  cache.forEach((texture) => texture.dispose())
  cache.clear()
}
