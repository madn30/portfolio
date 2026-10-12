import { pencil, type Point } from '@/shared/graphics/roomTextures'
import { CREAM, FOLIAGE, WOOD, oval } from '@/features/world/rooms/about/aboutTextures'
import type { IslandOptions } from './islandTexture'

export function drawLandmark(
  ctx: CanvasRenderingContext2D,
  kind: IslandOptions['landmark'],
  x: number,
  base: number,
  random: () => number,
  accent: string,
  painted: boolean,
): void {
  const fill = accent
  const leaves = painted ? '#5fa052' : FOLIAGE
  if (kind === 'flag') {
    pencil(
      ctx,
      [
        [x, base],
        [x, base - 110],
      ],
      random,
      { close: false, width: 3 },
    )
    pencil(
      ctx,
      [
        [x, base - 110],
        [x + 62, base - 92],
        [x, base - 72],
      ],
      random,
      { fill, width: 2.4 },
    )
    return
  }
  if (kind === 'tree') {
    pencil(
      ctx,
      [
        [x - 6, base],
        [x + 6, base],
        [x + 4, base - 46],
        [x - 4, base - 46],
      ],
      random,
      {
        fill: WOOD,
        width: 2.4,
      },
    )
    pencil(ctx, oval(x, base - 82, 42, 38, random, 24), random, { fill: leaves, width: 2.6 })
    return
  }
  const w = kind === 'school' ? 120 : 76
  const h = kind === 'school' ? 64 : 52
  pencil(
    ctx,
    [
      [x - w / 2, base],
      [x + w / 2, base],
      [x + w / 2, base - h],
      [x - w / 2, base - h],
    ],
    random,
    {
      fill: CREAM,
      width: 2.6,
    },
  )
  pencil(
    ctx,
    [
      [x - w / 2 - 8, base - h],
      [x + w / 2 + 8, base - h],
      [x, base - h - (kind === 'school' ? 34 : 44)],
    ],
    random,
    { fill, width: 2.6 },
  )
  pencil(
    ctx,
    [
      [x - 10, base],
      [x + 10, base],
      [x + 10, base - 26],
      [x - 10, base - 26],
    ],
    random,
    {
      fill: WOOD,
      width: 2,
    },
  )
  if (kind === 'school') {
    for (const wx of [x - 40, x + 40]) {
      pencil(
        ctx,
        [
          [wx - 9, base - 34],
          [wx + 9, base - 34],
          [wx + 9, base - 50],
          [wx - 9, base - 50],
        ],
        random,
        {
          fill: '#8fd0f5',
          width: 1.8,
        },
      )
    }
  }
}

export function strata(
  ctx: CanvasRenderingContext2D,
  rock: Point[],
  random: () => number,
  cx: number,
  rx: number,
  top: number,
  depth: number,
): void {
  ctx.save()
  ctx.beginPath()
  rock.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
  ctx.closePath()
  ctx.clip()
  const shade = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0)
  shade.addColorStop(0, 'rgba(38,36,33,0)')
  shade.addColorStop(0.55, 'rgba(38,36,33,0.06)')
  shade.addColorStop(1, 'rgba(38,36,33,0.3)')
  ctx.fillStyle = shade
  ctx.fillRect(cx - rx, top, rx * 2, depth)
  for (let band = 1; band <= 5; band++) {
    const y = top + (band / 6) * depth * 0.8
    const line: Point[] = []
    for (let k = 0; k <= 10; k++) {
      line.push([cx - rx + (k / 10) * rx * 2, y + (random() - 0.5) * 16 + Math.sin(k * 1.3) * 6])
    }
    pencil(ctx, line, random, { close: false, width: 1.5, alpha: 0.4, passes: 1 })
  }
  for (let k = 0; k < 16; k++) {
    const x = cx - rx + random() * rx * 2
    const y = top + 20 + random() * depth * 0.6
    const len = 14 + random() * 30
    pencil(
      ctx,
      [
        [x, y],
        [x + (random() - 0.5) * 8, y + len],
      ],
      random,
      { close: false, width: 1.3, alpha: 0.45, passes: 1 },
    )
  }
  ctx.restore()
}

export function tuft(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  random: () => number,
): void {
  for (let b = -1; b <= 1; b++) {
    pencil(
      ctx,
      [
        [x + b * 3, y],
        [x + b * 8 + (random() - 0.5) * 4, y - 12 - random() * 9],
      ],
      random,
      { close: false, width: 1.6, passes: 1, alpha: 0.75 },
    )
  }
}
