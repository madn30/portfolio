import type * as THREE from 'three'
import { makeCanvas, pencil, toTexture, type Point } from '@/shared/graphics/roomTextures'
import { mulberry32 } from '@/shared/graphics/sketch'

const CREAM = '#fbfaf7'

export type PaperField = 'name' | 'email' | 'message'
export type PaperTarget = PaperField | 'send' | 'close'

interface PaperBox {
  x: number
  y: number
  w: number
  h: number
}

export const PAPER_LAYOUT: Record<PaperTarget, PaperBox> = {
  name: { x: 0.12, y: 0.11, w: 0.76, h: 0.075 },
  email: { x: 0.12, y: 0.225, w: 0.76, h: 0.075 },
  message: { x: 0.12, y: 0.345, w: 0.76, h: 0.42 },
  send: { x: 0.33, y: 0.815, w: 0.34, h: 0.08 },
  close: { x: 0.83, y: 0.035, w: 0.075, h: 0.06 },
}

const PLACEHOLDER: Record<PaperField, string> = {
  name: 'your name…',
  email: 'your email…',
  message: 'your message…',
}

interface PaperDrawState {
  values: Record<PaperField, string>
  active: PaperField | null
  hovered: PaperTarget | null
  cursor: boolean
  button: string
  note: string
  error: string | null
  closable: boolean
}

const HAND = (px: number) => `600 ${px}px Caveat, "Segoe Print", cursive`
const SANS = (px: number) => `600 ${px}px "Instrument Sans", "Helvetica Neue", Arial, sans-serif`

function roundedRect(x: number, y: number, w: number, h: number, r: number): Point[] {
  const pts: Point[] = []
  const corners: [number, number, number][] = [
    [x + w - r, y + r, -Math.PI / 2],
    [x + w - r, y + h - r, 0],
    [x + r, y + h - r, Math.PI / 2],
    [x + r, y + r, Math.PI],
  ]
  for (const [cx, cy, start] of corners) {
    for (let i = 0; i <= 4; i++) {
      const a = start + (i / 4) * (Math.PI / 2)
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r])
    }
  }
  return pts
}

function wrapByWidth(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const lines: string[] = []
  for (const paragraph of text.split('\n')) {
    let current = ''
    for (const word of paragraph.split(' ')) {
      const next = current ? `${current} ${word}` : word
      if (ctx.measureText(next).width > max && current) {
        lines.push(current)
        current = word
      } else {
        current = next
      }
    }
    lines.push(current)
  }
  return lines
}

export function drawMessagePaper(
  ctx: CanvasRenderingContext2D,
  state: PaperDrawState,
  seed = 11,
): void {
  const { width, height } = ctx.canvas
  const random = mulberry32(seed * 43 + 7)
  const X = (f: number) => width * f
  const Y = (f: number) => height * f
  ctx.clearRect(0, 0, width, height)

  const outline: Point[] = [
    [X(0.03), Y(0.025)],
    [X(0.5), Y(0.02)],
    [X(0.975), Y(0.03)],
    [X(0.98), Y(0.5)],
    [X(0.97), Y(0.975)],
    [X(0.5), Y(0.98)],
    [X(0.035), Y(0.97)],
  ]
  for (let i = 1; i < 16; i++) {
    outline.push([X(0.02 + random() * 0.02), Y(0.97 - (i / 16) * 0.945)])
  }
  pencil(ctx, outline, random, { fill: CREAM, width: 3, jitter: 1.4 })

  for (const field of ['name', 'email', 'message'] as const) {
    const box = PAPER_LAYOUT[field]
    const hot = state.hovered === field || state.active === field
    const rect: Point[] = [
      [X(box.x), Y(box.y)],
      [X(box.x + box.w), Y(box.y)],
      [X(box.x + box.w), Y(box.y + box.h)],
      [X(box.x), Y(box.y + box.h)],
    ]
    pencil(ctx, rect, random, {
      fill: hot ? '#f6f4ee' : undefined,
      width: hot ? 3 : 2.2,
      jitter: 1.3,
      alpha: hot ? 1 : 0.8,
    })
  }
  const message = PAPER_LAYOUT.message
  const ruled = 9
  const spacing = Y(message.h) / (ruled + 1)
  for (let i = 1; i <= ruled; i++) {
    const y = Y(message.y) + spacing * i
    pencil(
      ctx,
      [
        [X(message.x + 0.03), y],
        [X(message.x + message.w - 0.03), y],
      ],
      random,
      { close: false, width: 1.2, jitter: 0.8, passes: 1, alpha: 0.35 },
    )
  }

  const send = PAPER_LAYOUT.send
  const sendHot = state.hovered === 'send'
  pencil(ctx, roundedRect(X(send.x), Y(send.y), X(send.w), Y(send.h), Y(send.h) / 2), random, {
    fill: sendHot ? '#e7e3db' : '#f1efe9',
    width: sendHot ? 3.2 : 2.6,
    jitter: 1.4,
  })

  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  const fontSize = Math.round(height * 0.046)
  for (const field of ['name', 'email'] as const) {
    const box = PAPER_LAYOUT[field]
    const value = state.values[field]
    const text = value || (state.active === field ? '' : PLACEHOLDER[field])
    ctx.font = HAND(fontSize)
    ctx.fillStyle = value ? '#2f2a26' : '#a39e96'
    const caret = state.active === field && state.cursor ? '|' : ''
    ctx.fillText(text + caret, X(box.x + 0.025), Y(box.y + box.h / 2) + 2)
  }

  ctx.font = HAND(Math.round(height * 0.042))
  const value = state.values.message
  const caret = state.active === 'message' && state.cursor ? '|' : ''
  const lines = value
    ? wrapByWidth(ctx, value + caret, X(message.w - 0.06))
    : [state.active === 'message' ? caret : PLACEHOLDER.message]
  const shown = lines.slice(Math.max(0, lines.length - ruled))
  ctx.fillStyle = value ? '#2f2a26' : '#a39e96'
  shown.forEach((line, i) => {
    ctx.fillText(line, X(message.x + 0.03), Y(message.y) + spacing * (i + 1) - spacing * 0.3)
  })

  ctx.textAlign = 'center'
  ctx.font = SANS(Math.round(height * 0.03))
  ctx.fillStyle = '#2f2c29'
  ctx.fillText(state.button.toUpperCase(), X(send.x + send.w / 2), Y(send.y + send.h / 2) + 1)

  const note = state.error ?? state.note
  if (note) {
    ctx.font = HAND(Math.round(height * 0.036))
    ctx.fillStyle = state.error ? '#c0693b' : '#5b5752'
    const noteLines = wrapByWidth(ctx, note, X(0.84))
    const first = noteLines.length > 1 ? 0.922 : 0.94
    noteLines.forEach((line, i) => ctx.fillText(line, X(0.5), Y(first + i * 0.034)))
  }

  if (state.closable) {
    const close = PAPER_LAYOUT.close
    const hot = state.hovered === 'close'
    const pad = 0.018
    const strokes: [Point, Point][] = [
      [
        [X(close.x + pad), Y(close.y + pad)],
        [X(close.x + close.w - pad), Y(close.y + close.h - pad)],
      ],
      [
        [X(close.x + close.w - pad), Y(close.y + pad)],
        [X(close.x + pad), Y(close.y + close.h - pad)],
      ],
    ]
    for (const stroke of strokes) {
      pencil(ctx, stroke, random, {
        close: false,
        width: hot ? 3.4 : 2.6,
        jitter: 0.9,
        alpha: hot ? 1 : 0.75,
      })
    }
  }
}

export function createMessagePaperTexture(
  width = 512,
  height = 640,
): { texture: THREE.Texture; ctx: CanvasRenderingContext2D } {
  const [canvas, ctx] = makeCanvas(width, height)
  const texture = toTexture(canvas)
  texture.anisotropy = 4
  return { texture, ctx }
}
