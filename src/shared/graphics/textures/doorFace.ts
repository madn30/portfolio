import * as THREE from 'three'
import { mulberry32 } from '@/shared/graphics/sketch'
import { hatch, sketchRect } from './pencilCanvas'
import { cachedTexture } from './surfaces'

type DoorTheme = 'about' | 'projects' | 'skills' | 'experience' | 'contact'

interface DoorFaceOptions {
  painted?: boolean
  back?: boolean
}

export function createDoorFaceTexture(
  theme: DoorTheme,
  accent: string,
  seed = 1,
  options: DoorFaceOptions = {},
): THREE.Texture {
  const { painted = false, back = false } = options
  return cachedTexture(
    `door-face-${theme}-${accent}-${seed}-${painted ? 'painted' : 'sketch'}-${back ? 'back' : 'front'}`,
    () => drawDoorFace(theme, accent, seed, painted, back),
  )
}

function drawDoorFace(
  theme: DoorTheme,
  accent: string,
  seed: number,
  painted: boolean,
  back: boolean,
): THREE.Texture {
  const width = 512
  const height = 984
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')
  const random = mulberry32(seed * 37 + 5)
  const ink = '#262421'

  ctx.fillStyle = accent
  ctx.fillRect(0, 0, width, height)
  if (painted) {
    ctx.globalAlpha = 0.3
    ctx.fillStyle = '#fff3d0'
    ctx.fillRect(0, 0, width, height)
    ctx.globalAlpha = 1
  }
  ctx.strokeStyle = ink
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  sketchRect(ctx, random, 6, 6, width - 12, height - 12, 3.2)

  const panels: [number, number, number, number][] = [
    [78, 86, width - 156, 300],
    [78, 560, width - 156, 340],
  ]
  for (const [x, y, w, h] of panels) {
    ctx.globalAlpha = 0.14
    ctx.fillStyle = ink
    ctx.fillRect(x, y, w, h)
    ctx.globalAlpha = 1
    ctx.strokeStyle = ink
    sketchRect(ctx, random, x, y, w, h, 2.4)
    sketchRect(ctx, random, x + 18, y + 18, w - 36, h - 36, 1.6, 0.6)
    hatch(ctx, random, x, y, w, 18, 8, 0.18)
    hatch(ctx, random, x, y, 18, h, 8, 0.18)
  }

  for (const y of [120, height / 2 - 30, height - 180]) {
    ctx.fillStyle = '#c9a24a'
    ctx.fillRect(10, y, 22, 60)
    sketchRect(ctx, random, 10, y, 22, 60, 1.8)
    ctx.fillStyle = ink
    for (const dy of [12, 30, 48]) {
      ctx.beginPath()
      ctx.arc(21, y + dy, 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  if (back) {
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    return texture
  }

  const px = width - 82
  const py = height / 2 - 60
  sketchRect(ctx, random, px, py, 40, 120, 2)
  ctx.fillStyle = painted ? '#e0b95a' : '#c9a24a'
  ctx.globalAlpha = 0.9
  ctx.fillRect(px + 3, py + 3, 34, 114)
  ctx.globalAlpha = 1
  ctx.fillStyle = ink
  ctx.beginPath()
  ctx.arc(px + 20, py + 84, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(px + 17, py + 86, 6, 12)

  const cx = width / 2
  const cy = 236
  ctx.lineWidth = 2.2
  switch (theme) {
    case 'about': {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(-0.08)
      ctx.fillStyle = '#f6d75c'
      ctx.fillRect(-82, -82, 164, 164)
      ctx.globalAlpha = 0.5
      ctx.strokeRect(-82, -82, 164, 164)
      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.arc(0, 0, 46, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = ink
      ctx.beginPath()
      ctx.arc(-16, -10, 4, 0, Math.PI * 2)
      ctx.arc(16, -10, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(0, 4, 24, 0.2, Math.PI - 0.2)
      ctx.stroke()
      ctx.restore()
      break
    }
    case 'projects': {
      const sheets: [number, number, number][] = [
        [cx - 110, cy - 110, -0.1],
        [cx + 10, cy - 60, 0.12],
        [cx - 70, cy + 20, 0.05],
      ]
      for (const [sx, sy, rot] of sheets) {
        ctx.save()
        ctx.translate(sx + 60, sy + 60)
        ctx.rotate(rot)
        ctx.fillStyle = '#eef1f5'
        ctx.fillRect(-60, -60, 120, 120)
        ctx.globalAlpha = 0.7
        ctx.strokeRect(-60, -60, 120, 120)
        ctx.globalAlpha = 0.35
        ctx.lineWidth = 1
        for (let g = -40; g <= 40; g += 20) {
          ctx.beginPath()
          ctx.moveTo(-50, g)
          ctx.lineTo(50, g)
          ctx.moveTo(g, -50)
          ctx.lineTo(g, 50)
          ctx.stroke()
        }
        ctx.globalAlpha = 0.9
        ctx.lineWidth = 2
        ctx.strokeRect(-34, -30, 40, 28)
        ctx.strokeRect(0, -6, 36, 40)
        ctx.strokeRect(-38, 6, 28, 30)
        ctx.fillStyle = '#4f7fc9'
        ctx.globalAlpha = 0.85
        ctx.fillRect(-20, -70, 40, 14)
        ctx.fillRect(-20, 56, 40, 14)
        ctx.globalAlpha = 1
        ctx.restore()
      }
      break
    }
    case 'skills': {
      const badges: [number, number, string, string][] = [
        [cx - 70, cy - 60, '</>', '#4f7fc9'],
        [cx + 70, cy - 40, '{ }', '#6fa85a'],
        [cx - 10, cy + 70, '#', '#d2483c'],
      ]
      for (const [bx, by, glyph, colour] of badges) {
        ctx.fillStyle = colour
        ctx.beginPath()
        ctx.arc(bx, by, 46, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 0.7
        ctx.stroke()
        ctx.globalAlpha = 1
        ctx.fillStyle = '#fbfaf7'
        ctx.font = '600 34px Caveat, "Segoe Print", cursive'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(glyph, bx, by + 2)
      }
      break
    }
    case 'experience': {
      ctx.fillStyle = '#fbfaf7'
      ctx.fillRect(cx - 100, cy - 120, 200, 240)
      sketchRect(ctx, random, cx - 100, cy - 120, 200, 240, 2)
      ctx.beginPath()
      ctx.moveTo(cx - 60, cy - 90)
      ctx.lineTo(cx - 60, cy + 95)
      ctx.stroke()
      ctx.lineWidth = 2
      for (let i = 0; i < 4; i++) {
        const y = cy - 80 + i * 56
        ctx.fillStyle = i === 0 ? '#d2483c' : '#fbfaf7'
        ctx.beginPath()
        ctx.arc(cx - 60, y, 7, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        ctx.globalAlpha = 0.6
        ctx.beginPath()
        ctx.moveTo(cx - 40, y)
        ctx.lineTo(cx + 10 + random() * 60, y)
        ctx.stroke()
        ctx.globalAlpha = 1
      }
      ctx.fillStyle = '#d2483c'
      ctx.beginPath()
      ctx.arc(cx, cy - 128, 9, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'contact': {
      ctx.fillStyle = '#fbfaf7'
      ctx.fillRect(cx - 110, cy - 70, 220, 140)
      sketchRect(ctx, random, cx - 110, cy - 70, 220, 140, 2.4)
      ctx.beginPath()
      ctx.moveTo(cx - 110, cy - 70)
      ctx.lineTo(cx, cy + 20)
      ctx.lineTo(cx + 110, cy - 70)
      ctx.stroke()
      ctx.fillStyle = '#d2483c'
      ctx.beginPath()
      ctx.arc(cx, cy + 20, 7, 0, Math.PI * 2)
      ctx.fill()
      sketchRect(ctx, random, cx - 70, cy + 110, 140, 26, 2)
      hatch(ctx, random, cx - 66, cy + 114, 132, 18, 6, 0.3)
      break
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}
