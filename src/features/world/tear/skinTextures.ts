import * as THREE from 'three'
import { mulberry32 } from '@/shared/graphics/sketch'
import { makeCanvas } from '@/shared/graphics/roomTextures'
import { normalFromHeight } from './paperTextures'

const SKIN_SIZE = 512
const NORMAL_SIZE = 256
const TONES = ['#e3ab90', '#efc3aa', '#dba288', '#f3cfb8', '#e8b59b']

export interface SkinTextures {
  albedo: THREE.Texture
  normal: THREE.Texture
}

function blobs(
  ctx: CanvasRenderingContext2D,
  size: number,
  count: number,
  random: () => number,
  colour: () => string,
  alpha: number,
  radius: [number, number],
): void {
  for (let i = 0; i < count; i++) {
    const x = random() * size
    const y = random() * size
    const r = radius[0] + random() * (radius[1] - radius[0])
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r)
    gradient.addColorStop(0, colour())
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.globalAlpha = alpha * (0.5 + random() * 0.5)
    ctx.fillStyle = gradient
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }
  ctx.globalAlpha = 1
}

function pores(
  ctx: CanvasRenderingContext2D,
  size: number,
  count: number,
  random: () => number,
  colour: string,
): void {
  ctx.fillStyle = colour
  for (let i = 0; i < count; i++) {
    ctx.beginPath()
    ctx.arc(random() * size, random() * size, 0.5 + random() * 0.9, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function createSkinTextures(): SkinTextures {
  const random = mulberry32(311)
  const [albedoCanvas, albedo] = makeCanvas(SKIN_SIZE, SKIN_SIZE)
  albedo.fillStyle = '#ecbda3'
  albedo.fillRect(0, 0, SKIN_SIZE, SKIN_SIZE)
  blobs(
    albedo,
    SKIN_SIZE,
    2600,
    random,
    () => TONES[Math.floor(random() * TONES.length)],
    0.05,
    [6, 34],
  )
  blobs(albedo, SKIN_SIZE, 300, random, () => '#dc9a84', 0.04, [20, 60])
  pores(albedo, SKIN_SIZE, 2200, random, 'rgba(170, 115, 98, 0.1)')
  const albedoTexture = new THREE.CanvasTexture(albedoCanvas)
  albedoTexture.colorSpace = THREE.SRGBColorSpace
  albedoTexture.wrapS = albedoTexture.wrapT = THREE.RepeatWrapping

  const [normalCanvas, normal] = makeCanvas(NORMAL_SIZE, NORMAL_SIZE)
  normal.fillStyle = '#808080'
  normal.fillRect(0, 0, NORMAL_SIZE, NORMAL_SIZE)
  blobs(normal, NORMAL_SIZE, 500, random, () => '#9a9a9a', 0.5, [3, 12])
  pores(normal, NORMAL_SIZE, 1800, random, 'rgba(40, 40, 40, 0.6)')
  normalFromHeight(normal, NORMAL_SIZE, 1.4)
  const normalTexture = new THREE.CanvasTexture(normalCanvas)
  normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping

  return { albedo: albedoTexture, normal: normalTexture }
}
