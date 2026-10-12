import { useEffect, useState } from 'react'
import { mulberry32 } from '@/shared/graphics/sketch'

export const INK = '#262421'
export const PAPER = '#f3f1ec'
export const CREAM = '#fbfaf7'
export const WOOD = '#e6e1d6'
export const WOOD_DARK = '#d6d1c6'
export const LEAF = '#d4d9c9'

export const FRAME = { width: 1600, height: 900 }
export const OPENING = { x: 695, y: 425, width: 210, height: 336 }
export const LEAF_WIDTH = 104
export const SIGN_PIVOT = { x: 800, y: 174 }

interface FacadeFrame {
  scale: number
  x: number
  y: number
}

export function measureFrame(): FacadeFrame {
  const scale = Math.max(window.innerWidth / FRAME.width, window.innerHeight / FRAME.height)
  return {
    scale,
    x: (window.innerWidth - FRAME.width * scale) / 2,
    y: window.innerHeight - FRAME.height * scale,
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
