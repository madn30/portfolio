import { mulberry32 } from '@/shared/utils/random'

export const DUCK_ORIGIN = { x: 1244, y: 640 }
export const DUCK_BODY =
  'M-34 -30 C-30 -27 -26 -24 -22 -22 C-12 -27 4 -26 14 -22 C24 -20 30 -14 28 -6 C26 2 10 3 0 3 C-12 3 -24 1 -28 -6 C-31 -12 -30 -22 -34 -30 Z'
export const DUCK_HEAD = { cx: 14, cy: -32, r: 13 }
export const DUCK_BEAK = 'M25 -36 C32 -37.5 38 -35.5 41 -31.5 C38 -29 32 -27.5 26 -27 Z'
export const DUCK_BILL = 'M27 -29.5 Q34 -30.5 40 -31.5 M32.5 -34 q1.5 0.6 2.8 0.1'
export const DUCK_WING = 'M-14 -13 C-4 -19 12 -16 14 -9 C10 -3 -4 -5 -14 -13 Z'
export const DUCK_SHEEN = 'M-27 -13 l5 -6 M-23 -9 l6 -7 M-19 -5 l5 -6 M8 -41 q4 -3 8 -2'
export const DUCK_EYE = { cx: 17.5, cy: -36, r: 2.4 }

export const BUBBLE_ORIGIN = { x: 1246, y: 584 }
const BUBBLE = { x: 0, y: -76, width: 186, height: 70, radius: 12 }
export const BUBBLE_TEXT = { x: BUBBLE.x + BUBBLE.width / 2, y: BUBBLE.y + 28, lineHeight: 21 }

function bubbleAnchors(): [number, number][] {
  const { x, y, width, height, radius } = BUBBLE
  const points: [number, number][] = []
  const corner = (cx: number, cy: number, from: number) => {
    for (let i = 0; i <= 3; i++) {
      const a = from + (i / 3) * (Math.PI / 2)
      points.push([cx + Math.cos(a) * radius, cy + Math.sin(a) * radius])
    }
  }
  corner(x + width - radius, y + radius, -Math.PI / 2)
  corner(x + width - radius, y + height - radius, 0)
  points.push([x + 34, y + height], [x + 10, y + height + 16], [x + 18, y + height])
  corner(x + radius, y + height - radius, Math.PI / 2)
  corner(x + radius, y + radius, Math.PI)
  return points
}

function sketchedBubble(seed: number, jitter: number): string {
  const random = mulberry32(seed)
  const anchors = bubbleAnchors()
  const parts: string[] = []
  for (let i = 0; i < anchors.length; i++) {
    const [x0, y0] = anchors[i]
    const [x1, y1] = anchors[(i + 1) % anchors.length]
    const steps = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 9))
    for (let s = 0; s < steps; s++) {
      const t = s / steps
      const px = x0 + (x1 - x0) * t + (random() - 0.5) * jitter * 2
      const py = y0 + (y1 - y0) * t + (random() - 0.5) * jitter * 2
      parts.push(`${parts.length === 0 ? 'M' : 'L'}${px.toFixed(1)} ${py.toFixed(1)}`)
    }
  }
  return `${parts.join(' ')} Z`
}

export const BUBBLE_OUTLINE = sketchedBubble(17, 1.1)
export const BUBBLE_SECOND_PASS = sketchedBubble(29, 1.7)
