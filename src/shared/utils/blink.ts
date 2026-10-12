export interface Blink {
  start: number
  close: number
  hold: number
  open: number
}

const DOUBLE_CHANCE = 0.18

function quickBlink(start: number): Blink {
  return {
    start,
    close: 0.06 + Math.random() * 0.02,
    hold: 0.02 + Math.random() * 0.03,
    open: 0.14 + Math.random() * 0.06,
  }
}

function slowBlink(start: number): Blink {
  return {
    start,
    close: 0.3 + Math.random() * 0.15,
    hold: 0.35 + Math.random() * 0.4,
    open: 0.5 + Math.random() * 0.3,
  }
}

export function blinkNow(time: number): Blink {
  return quickBlink(time)
}

export function blinkEnd(blink: Blink): number {
  return blink.start + blink.close + blink.hold + blink.open
}

export function scheduleBlink(after: number, slowChance = 0): Blink {
  const roll = Math.random()
  if (roll < DOUBLE_CHANCE) return quickBlink(after + 0.08 + Math.random() * 0.1)
  const start = after + 2 + Math.random() * 5
  return roll < DOUBLE_CHANCE + slowChance ? slowBlink(start) : quickBlink(start)
}

export function lidClosed(blink: Blink, time: number): number {
  const since = time - blink.start
  if (since <= 0) return 0
  if (since < blink.close) {
    const u = since / blink.close
    return u * u * (3 - 2 * u)
  }
  if (since < blink.close + blink.hold) return 1
  const u = (since - blink.close - blink.hold) / blink.open
  return u >= 1 ? 0 : (1 - u) ** 3
}

export type BlinkCue = 'hold' | 'now' | 'slow'

const CUE_REST = 0.8

export function createBlinker(): (time: number, cue?: BlinkCue) => number {
  let blink: Blink | null = null
  let endedAt = -Infinity
  return (time, cue) => {
    if (blink && time >= blinkEnd(blink)) {
      endedAt = time
      blink = null
    }
    const waiting = !blink || time < blink.start
    if (waiting && cue === 'hold') {
      blink = null
      return 0
    }
    if (waiting && cue && time - endedAt > CUE_REST) {
      blink = cue === 'slow' ? slowBlink(time) : quickBlink(time)
    }
    blink ??= scheduleBlink(Math.max(time, endedAt))
    return lidClosed(blink, time)
  }
}
