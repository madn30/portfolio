import * as THREE from 'three'
import { makeCanvas, pencil, type Point } from '@/shared/graphics/roomTextures'
import { mulberry32 } from '@/shared/graphics/sketch'

const INK = '#35322e'
const CREAM = '#fbfaf7'

function toTexture(canvas: HTMLCanvasElement): THREE.Texture {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

export interface MountainFaceOptions {
  profile: readonly (readonly [number, number])[]
  seed: number
  strength: number
  trees: number
  snowLine: number
}

export const FACE_BASE = -3

export function faceTop(profile: MountainFaceOptions['profile']): number {
  return Math.max(...profile.map(([, y]) => y)) + 0.5
}

function pine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  random: () => number,
  alpha: number,
): void {
  pencil(
    ctx,
    [
      [x, y],
      [x, y - size * 0.35],
    ],
    random,
    { close: false, width: 2, alpha, passes: 1 },
  )
  for (let tier = 0; tier < 3; tier++) {
    const w = size * (0.42 - tier * 0.1)
    const base = y - size * (0.25 + tier * 0.24)
    pencil(
      ctx,
      [
        [x - w, base],
        [x + w, base],
        [x, base - size * 0.36],
      ],
      random,
      { fill: '#dfe3d6', width: 1.6, alpha, jitter: 1, passes: 1 },
    )
  }
}

export function createMountainFaceTexture({
  profile,
  seed,
  strength,
  trees,
  snowLine,
}: MountainFaceOptions): THREE.Texture {
  const width = 2048
  const height = 768
  const [canvas, ctx] = makeCanvas(width, height)
  const random = mulberry32(seed * 91 + 17)
  const top = faceTop(profile)
  const X = (x: number) => ((x + 16) / 32) * width
  const Y = (y: number) => height - ((y - FACE_BASE) / (top - FACE_BASE)) * height
  const heightAt = (x: number): number => {
    for (let i = 0; i < profile.length - 1; i++) {
      const [x0, y0] = profile[i]
      const [x1, y1] = profile[i + 1]
      if (x >= x0 && x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0)
    }
    return FACE_BASE
  }

  for (let i = 1; i < profile.length - 1; i++) {
    const [px, py] = profile[i]
    if (py <= profile[i - 1][1] || py <= profile[i + 1][1]) continue
    const spur: Point[] = [[X(px), Y(py)]]
    const lean = 0.25 + random() * 0.35
    const steps = 9
    for (let k = 1; k <= steps; k++) {
      const t = k / steps
      spur.push([
        X(px + t * lean * (py - FACE_BASE) * 0.5 + (k % 2 ? 0.18 : -0.12)),
        Y(py - t * (py - FACE_BASE) * 0.82),
      ])
    }
    const [nx, ny] = profile[i + 1]
    ctx.save()
    ctx.globalAlpha = 0.11 * strength
    ctx.fillStyle = INK
    ctx.beginPath()
    spur.forEach(([x, y], k) => (k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
    ctx.lineTo(X(nx), Y(FACE_BASE))
    ctx.lineTo(X(nx), Y(ny))
    ctx.closePath()
    ctx.fill()
    ctx.restore()
    pencil(ctx, spur, random, { close: false, width: 2.4, alpha: 0.6 * strength, jitter: 1.6 })
    for (let k = 1; k < spur.length - 1; k++) {
      const [sx, sy] = spur[k]
      const len = 30 + random() * 60
      pencil(
        ctx,
        [
          [sx + 6, sy],
          [sx + 6 + len, sy + len * 0.75],
        ],
        random,
        { close: false, width: 1.3, alpha: 0.32 * strength, passes: 1 },
      )
      pencil(
        ctx,
        [
          [sx - 4, sy + 6],
          [sx - 4 - len * 0.5, sy + len * 0.55],
        ],
        random,
        { close: false, width: 1.1, alpha: 0.16 * strength, passes: 1 },
      )
    }
    if (py >= snowLine) {
      const reach = Math.min(1.5, (py - snowLine) * 0.6 + 0.7)
      const [lx, ly] = profile[i - 1]
      const left = Math.max(0.15, Math.min(1, reach / Math.max(0.1, py - ly)))
      const right = Math.max(0.15, Math.min(1, reach / Math.max(0.1, py - ny)))
      const a: Point = [X(px + (lx - px) * left), Y(py + (ly - py) * left)]
      const b: Point = [X(px + (nx - px) * right), Y(py + (ny - py) * right)]
      const cap: Point[] = [a, [X(px), Y(py)], b]
      const teeth = 6
      for (let k = 1; k < teeth; k++) {
        const t = k / teeth
        cap.push([
          b[0] + (a[0] - b[0]) * t,
          b[1] + (a[1] - b[1]) * t + (k % 2 ? 26 : -8) + random() * 12,
        ])
      }
      pencil(ctx, cap, random, { fill: CREAM, width: 2, alpha: 0.7 * strength, jitter: 1.4 })
    }
  }

  for (let i = 0; i < 46; i++) {
    const x = -15 + random() * 30
    const h = heightAt(x)
    const y = FACE_BASE + 0.5 + random() * Math.max(0.2, h - FACE_BASE - 1.2)
    const len = 0.25 + random() * 0.5
    pencil(
      ctx,
      [
        [X(x), Y(y)],
        [X(x + len), Y(y - len * 0.2)],
        [X(x + len * 1.6), Y(y + len * 0.05)],
      ],
      random,
      { close: false, width: 1.2, alpha: 0.22 * strength, passes: 1 },
    )
  }

  for (let i = 0; i < trees; i++) {
    const x = -15 + random() * 30
    const h = Math.min(heightAt(x) - 0.9, snowLine - 1.4)
    if (h < FACE_BASE + 0.8) continue
    const y = FACE_BASE + 0.6 + random() * (h - FACE_BASE - 0.6)
    pine(ctx, X(x), Y(y), 34 + random() * 26, random, 0.75 * strength)
  }
  return toTexture(canvas)
}

export function createTentTexture(accent: string, seed = 1): THREE.Texture {
  const [canvas, ctx] = makeCanvas(256, 192)
  const random = mulberry32(seed * 13 + 5)
  pencil(
    ctx,
    [
      [128, 26],
      [236, 168],
      [20, 168],
    ],
    random,
    { fill: CREAM, width: 3 },
  )
  pencil(
    ctx,
    [
      [128, 26],
      [236, 168],
      [176, 168],
    ],
    random,
    { fill: '#e2ded5', width: 2 },
  )
  pencil(
    ctx,
    [
      [128, 60],
      [154, 168],
      [102, 168],
    ],
    random,
    { fill: '#4a443f', width: 2 },
  )
  pencil(
    ctx,
    [
      [78, 96],
      [178, 96],
    ],
    random,
    { close: false, width: 5, color: accent, alpha: 0.85, passes: 1 },
  )
  for (const [x0, x1] of [
    [128, 6],
    [128, 250],
  ]) {
    pencil(
      ctx,
      [
        [x0, 28],
        [x1, 176],
      ],
      random,
      { close: false, width: 1.4, alpha: 0.5, passes: 1 },
    )
  }
  return toTexture(canvas)
}

export function createMistTexture(): THREE.Texture {
  const [canvas, ctx] = makeCanvas(512, 128)
  const fade = ctx.createLinearGradient(0, 0, 0, 128)
  fade.addColorStop(0, 'rgba(243,241,236,0)')
  fade.addColorStop(0.55, 'rgba(243,241,236,0.9)')
  fade.addColorStop(1, 'rgba(243,241,236,1)')
  ctx.fillStyle = fade
  ctx.fillRect(0, 0, 512, 128)
  ctx.globalCompositeOperation = 'destination-out'
  const random = mulberry32(31)
  for (let i = 0; i < 26; i++) {
    const x = random() * 512
    const r = 18 + random() * 40
    const hole = ctx.createRadialGradient(x, 18, 0, x, 18, r)
    hole.addColorStop(0, 'rgba(0,0,0,0.5)')
    hole.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = hole
    ctx.fillRect(x - r, 0, r * 2, 64)
  }
  const texture = toTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  return texture
}
