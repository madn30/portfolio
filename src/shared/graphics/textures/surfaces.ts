import * as THREE from 'three'
import { mulberry32 } from '@/shared/graphics/sketch'

const cache = new Map<string, THREE.Texture>()

function makeCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')
  return [canvas, ctx]
}

export function getPaperTexture(size = 512): THREE.Texture {
  const key = `paper-${size}`
  const cached = cache.get(key)
  if (cached) return cached

  const [canvas, ctx] = makeCanvas(size)
  const random = mulberry32(42)
  ctx.fillStyle = '#fbfaf7'
  ctx.fillRect(0, 0, size, size)

  const image = ctx.getImageData(0, 0, size, size)
  const data = image.data
  for (let i = 0; i < data.length; i += 4) {
    const n = (random() - 0.5) * 10
    data[i] += n
    data[i + 1] += n
    data[i + 2] += n
  }
  ctx.putImageData(image, 0, 0)

  ctx.strokeStyle = 'rgba(60, 56, 50, 0.06)'
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

export function getWallTexture(railFrom = 0.233, railTo = 0.25): THREE.Texture {
  const width = 128
  const height = 1024
  const key = `wall-${railFrom}-${railTo}`
  const cached = cache.get(key)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')
  const random = mulberry32(58)
  const railTop = height * (1 - railTo)
  const railBottom = height * (1 - railFrom)
  ctx.fillStyle = '#f2e3c6'
  ctx.fillRect(0, 0, width, railTop)
  ctx.fillStyle = '#f7f3ea'
  ctx.fillRect(0, railTop, width, railBottom - railTop)
  ctx.fillStyle = '#7fb0b0'
  ctx.fillRect(0, railBottom, width, height - railBottom)

  const image = ctx.getImageData(0, 0, width, height)
  const data = image.data
  for (let i = 0; i < data.length; i += 4) {
    const n = (random() - 0.5) * 9
    data[i] += n
    data[i + 1] += n
    data[i + 2] += n
  }
  ctx.putImageData(image, 0, 0)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  cache.set(key, texture)
  return texture
}

export function getWoodGrainTexture(size = 512): THREE.Texture {
  const key = `wood-${size}`
  const cached = cache.get(key)
  if (cached) return cached

  const [canvas, ctx] = makeCanvas(size)
  const random = mulberry32(77)
  ctx.fillStyle = '#c8955c'
  ctx.fillRect(0, 0, size, size)
  const planks = 4
  const plankWidth = size / planks
  const plankTones = ['#c8955c', '#bd8850', '#d09f66', '#c28e55']
  ctx.lineCap = 'round'
  for (let p = 0; p < planks; p++) {
    const x0 = p * plankWidth
    ctx.fillStyle = plankTones[p % plankTones.length]
    ctx.fillRect(x0, 0, plankWidth, size)
    const strokes = 6 + Math.floor(random() * 4)
    for (let i = 0; i < strokes; i++) {
      const x = x0 + 10 + random() * (plankWidth - 20)
      const amp = 2 + random() * 5
      const wobble = 0.004 + random() * 0.01
      const phase = random() * Math.PI * 2
      ctx.strokeStyle = `rgba(122, 78, 43, ${0.25 + random() * 0.35})`
      ctx.lineWidth = 0.7 + random() * 0.9
      ctx.beginPath()
      const yStart = random() * size * 0.4
      const yEnd = size - random() * size * 0.3
      for (let y = yStart; y <= yEnd; y += 6) {
        const px = x + Math.sin(y * wobble + phase) * amp
        if (y === yStart) ctx.moveTo(px, y)
        else ctx.lineTo(px, y)
      }
      ctx.stroke()
    }
    if (random() > 0.55) {
      const kx = x0 + plankWidth * (0.3 + random() * 0.4)
      const ky = random() * size
      ctx.strokeStyle = 'rgba(100, 62, 32, 0.6)'
      ctx.lineWidth = 1.2
      for (let r = 4; r < 16; r += 4) {
        ctx.beginPath()
        ctx.ellipse(kx, ky, r, r * 1.8, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
    ctx.strokeStyle = 'rgba(58, 38, 22, 0.8)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x0 + (random() - 0.5) * 2, 0)
    ctx.lineTo(x0 + (random() - 0.5) * 2, size)
    ctx.stroke()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  cache.set(key, texture)
  return texture
}

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

export function getToonGradient(): THREE.Texture {
  const key = 'toon-gradient'
  const cached = cache.get(key)
  if (cached) return cached
  const data = new Uint8Array([
    182, 182, 182, 255, 214, 214, 214, 255, 240, 240, 240, 255, 255, 255, 255, 255,
  ])
  const texture = new THREE.DataTexture(data, 4, 1, THREE.RGBAFormat)
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.needsUpdate = true
  cache.set(key, texture)
  return texture
}

export function cachedTexture(key: string, create: () => THREE.Texture): THREE.Texture {
  const cached = cache.get(key)
  if (cached) return cached
  const texture = create()
  cache.set(key, texture)
  return texture
}

export function disposeTextureCache(): void {
  cache.forEach((texture) => texture.dispose())
  cache.clear()
}

export function getGlowTexture(size = 256): THREE.Texture {
  const key = `glow-${size}`
  const cached = cache.get(key)
  if (cached) return cached
  const [canvas, ctx] = makeCanvas(size)
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255, 243, 208, 0.9)')
  gradient.addColorStop(0.45, 'rgba(255, 221, 120, 0.35)')
  gradient.addColorStop(1, 'rgba(255, 211, 77, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  cache.set(key, texture)
  return texture
}
