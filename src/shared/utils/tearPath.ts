import { mulberry32 } from '@/shared/utils/random'

export interface TearShape {
  path: string
  leftClip: string
  rightClip: string
}

export function createTearShape(seed: number, segments = 12, spread = 6): TearShape {
  const random = mulberry32(seed)
  const points: [number, number][] = [[50, 0]]
  for (let i = 1; i < segments; i++) {
    points.push([50 + (random() - 0.5) * spread, (i / segments) * 100])
  }
  points.push([50, 100])
  const path = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(' ')
  const edge = points.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`)
  return {
    path,
    leftClip: `polygon(0% 0%, ${edge.join(', ')}, 0% 100%)`,
    rightClip: `polygon(100% 0%, 100% 100%, ${[...edge].reverse().join(', ')})`,
  }
}
