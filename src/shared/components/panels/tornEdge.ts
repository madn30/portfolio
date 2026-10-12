const POINTS: readonly [number, number][] = [
  [0, 7],
  [4, 0],
  [10, 5],
  [17, 1],
  [24, 6],
  [32, 1],
  [40, 5],
  [48, 0],
  [56, 6],
  [64, 1],
  [72, 5],
  [80, 0],
  [88, 6],
  [95, 1],
  [100, 6],
  [100, 93],
  [96, 100],
  [90, 95],
  [83, 100],
  [75, 94],
  [67, 100],
  [59, 95],
  [51, 100],
  [43, 94],
  [35, 100],
  [27, 95],
  [19, 100],
  [11, 94],
  [5, 100],
  [0, 94],
]

const BASE_AMPLITUDE = 7

function round(value: number): number {
  return Math.round(value * 100) / 100
}

function tornPoints(amplitude: number): [number, number][] {
  return POINTS.map(([x, y]) => [
    x,
    round(
      y < 50 ? (y / BASE_AMPLITUDE) * amplitude : 100 - ((100 - y) / BASE_AMPLITUDE) * amplitude,
    ),
  ])
}

export function tornClipPath(amplitude: number): string {
  return `polygon(${tornPoints(amplitude)
    .map(([x, y]) => `${x}% ${y}%`)
    .join(', ')})`
}

export function tornPathD(amplitude: number): string {
  return `${tornPoints(amplitude)
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`)
    .join(' ')} Z`
}
