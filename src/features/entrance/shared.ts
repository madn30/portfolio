import { useEffect, useState } from 'react'
import { mulberry32 } from '@/shared/utils/random'

export const INK = '#262421'
export const PAPER = '#fbfaf7'
export const CREAM = '#fbfaf7'
export const WOOD = '#a9713f'
export const WOOD_DARK = '#7a4e2b'
export const WOOD_LIGHT = '#c8955c'
export const WOOD_LIT = '#dcae76'
export const LEAF = '#5fa052'
export const LEAF_DARK = '#3f7f3f'
export const LEAF_LIGHT = '#8cc56a'
export const BRICK = '#b4553d'
export const BRICK_DARK = '#a34a34'
export const BRICK_LIGHT = '#c26349'
export const BRICK_SHADE = '#8c3d2a'
export const MORTAR = '#e2cdb8'
export const PAVEMENT = '#cfc6b8'
export const STONE = '#9aa3ab'
export const METAL = '#8d99a6'
export const METAL_DARK = '#4d5863'
export const BRASS = '#e0a63a'
export const GLOW = '#ffd34d'
export const GLASS = '#8fd0f5'
export const SKIN = '#f1c9a5'
export const HAIR = '#5a3d2b'
export const BLUE = '#4f7fc9'
export const RED = '#d2483c'
export const FUR = '#e8964a'
export const MOUSE = '#a8a29b'
export const PINK = '#f0a9a3'
export const BARK = '#7a4e2b'
export const STICKER_COLOURS = [
  '#ffd34d',
  '#8fd0f5',
  '#8cc56a',
  '#f59b86',
  '#f4b860',
  '#cdb0e6',
  '#7fd6c2',
  '#f7a8c4',
]

export const FRAME = { width: 1600, height: 900 }
export const OPENING = { x: 695, y: 425, width: 210, height: 336 }
export const LEAF_WIDTH = 104
export const SIGN_PIVOT = { x: 800, y: 174 }
/**
 * Tall screens show the whole street across, as on desktop. The frame then sits a little below
 * the middle, with the wall carrying on above it and the pavement below.
 */
export const WALL_ABOVE = 2400
export const STREET_BELOW = 1200

interface FacadeFrame {
  scale: number
  x: number
  y: number
}

export function measureFrame(): FacadeFrame {
  const portrait = window.innerWidth < window.innerHeight
  const scale = portrait
    ? window.innerWidth / FRAME.width
    : Math.max(window.innerWidth / FRAME.width, window.innerHeight / FRAME.height)
  const spare = window.innerHeight - FRAME.height * scale
  return {
    scale,
    x: (window.innerWidth - FRAME.width * scale) / 2,
    y: spare > 0 ? spare * 0.55 : spare,
  }
}

export function useFacadeFrame(): FacadeFrame {
  const [frame, setFrame] = useState(measureFrame)
  useEffect(() => {
    const onResize = () => setFrame(measureFrame())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return frame
}

export function canHover(): boolean {
  return window.matchMedia('(hover: hover)').matches
}

export function cloudPath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  lobes: number,
  seed: number,
): string {
  const random = mulberry32(seed)
  const points: [number, number][] = []
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2
    const wobble = 0.86 + random() * 0.28
    points.push([cx + Math.cos(a) * rx * wobble, cy + Math.sin(a) * ry * wobble])
  }
  let d = `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`
  for (let i = 0; i < lobes; i++) {
    const [x0, y0] = points[i]
    const [x1, y1] = points[(i + 1) % lobes]
    const mx = (x0 + x1) / 2
    const my = (y0 + y1) / 2
    const nx = mx - cx
    const ny = my - cy
    const len = Math.hypot(nx, ny) || 1
    const bulge = 0.18 + random() * 0.12
    const cxp = mx + (nx / len) * rx * bulge
    const cyp = my + (ny / len) * ry * bulge
    d += ` Q${cxp.toFixed(1)} ${cyp.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`
  }
  return `${d} Z`
}

export function wrapWords(text: string, maxChars: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (next.length > maxChars && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}
