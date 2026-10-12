import { audible, noiseSource, sfxBus } from './engine'
import type { SoundName } from './state'

function envelope(
  ctx: AudioContext,
  start: number,
  peak: number,
  attack: number,
  hold: number,
  release: number,
): GainNode {
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.linearRampToValueAtTime(peak, start + attack)
  gain.gain.setValueAtTime(peak, start + attack + hold)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + attack + hold + release)
  if (sfxBus) gain.connect(sfxBus)
  return gain
}

function thud(ctx: AudioContext, at: number, level: number): void {
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(82, at)
  osc.frequency.exponentialRampToValueAtTime(46, at + 0.22)
  osc.connect(envelope(ctx, at, level, 0.006, 0.02, 0.28))
  osc.start(at)
  osc.stop(at + 0.36)
}

function creak(ctx: AudioContext, at: number): void {
  const osc = ctx.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(130 + Math.random() * 40, at)
  osc.frequency.linearRampToValueAtTime(210, at + 0.38)
  const judder = ctx.createOscillator()
  judder.frequency.value = 24 + Math.random() * 8
  const judderDepth = ctx.createGain()
  judderDepth.gain.value = 16
  judder.connect(judderDepth).connect(osc.frequency)
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 900
  filter.Q.value = 2.2
  osc.connect(filter).connect(envelope(ctx, at, 0.035, 0.05, 0.12, 0.3))
  osc.start(at)
  judder.start(at)
  osc.stop(at + 0.5)
  judder.stop(at + 0.5)
}

function swing(ctx: AudioContext, at: number): void {
  const source = noiseSource(ctx)
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.Q.value = 0.9
  filter.frequency.setValueAtTime(320, at)
  filter.frequency.exponentialRampToValueAtTime(1800, at + 0.22)
  filter.frequency.exponentialRampToValueAtTime(380, at + 0.55)
  source.connect(filter).connect(envelope(ctx, at, 0.09, 0.18, 0.05, 0.35))
  source.start(at)
  source.stop(at + 0.65)
  thud(ctx, at + 0.3, 0.22)
}

function tear(ctx: AudioContext, at: number): void {
  const source = noiseSource(ctx)
  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 1400
  const gain = envelope(ctx, at, 0.07, 0.05, 0.1, 0.32)
  const crackle = ctx.createOscillator()
  crackle.type = 'square'
  crackle.frequency.value = 36 + Math.random() * 10
  const crackleDepth = ctx.createGain()
  crackleDepth.gain.value = 0.045
  crackle.connect(crackleDepth).connect(gain.gain)
  source.connect(filter).connect(gain)
  source.start(at)
  crackle.start(at)
  source.stop(at + 0.5)
  crackle.stop(at + 0.5)
}

const lastPlayed: Partial<Record<SoundName, number>> = {}

export function play(name: SoundName): void {
  const ctx = audible()
  if (!ctx) return
  const now = performance.now()
  if (now - (lastPlayed[name] ?? -Infinity) < 160) return
  lastPlayed[name] = now
  const at = ctx.currentTime + 0.005
  switch (name) {
    case 'creak':
      creak(ctx, at)
      break
    case 'open':
      swing(ctx, at)
      break
    case 'close':
      thud(ctx, at, 0.18)
      break
    case 'step':
      thud(ctx, at, 0.035 + Math.random() * 0.02)
      break
    case 'tear':
      tear(ctx, at)
      break
  }
}
