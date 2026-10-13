import { audible, noiseSource, sfxBus } from './engine'
import { loadSample, playSample } from './samples'
import type { SoundName } from './state'

const DOOR_URL = `${import.meta.env.BASE_URL}sounds/door-open.mp3`
// Section doors only: the recording plays when the visitor walks in.
const DOOR_OPEN_LEVEL = 0.35

export function preloadSamples(): void {
  void loadSample(DOOR_URL)
}

function playDoor(level: number): void {
  void loadSample(DOOR_URL).then((buffer) => {
    const ctx = audible()
    if (buffer && ctx) playSample(ctx, buffer, ctx.currentTime + 0.005, level)
  })
}

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

function panned(ctx: AudioContext, node: AudioNode, pan: number): void {
  if (!sfxBus) return
  const panner = ctx.createStereoPanner()
  panner.pan.value = pan
  node.connect(panner).connect(sfxBus)
}

function shaped(
  ctx: AudioContext,
  start: number,
  peak: number,
  attack: number,
  release: number,
): GainNode {
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.linearRampToValueAtTime(peak, start + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + attack + release)
  return gain
}

let lastStep = -Infinity

export function playStep(foot: -1 | 1, soft: boolean): void {
  const ctx = audible()
  if (!ctx) return
  const now = performance.now()
  if (now - lastStep < 160) return
  lastStep = now
  const at = ctx.currentTime + 0.005
  const pan = foot * 0.22
  const pitch = (foot > 0 ? 86 : 78) * (0.94 + Math.random() * 0.12)
  const level = (soft ? 0.022 : 0.035) + Math.random() * 0.02

  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(pitch, at)
  osc.frequency.exponentialRampToValueAtTime(pitch * 0.56, at + 0.22)
  const body = shaped(ctx, at, level, 0.006, soft ? 0.2 : 0.3)
  osc.connect(body)
  panned(ctx, body, pan)
  osc.start(at)
  osc.stop(at + 0.36)

  const source = noiseSource(ctx)
  const filter = ctx.createBiquadFilter()
  filter.type = soft ? 'lowpass' : 'bandpass'
  filter.frequency.value = soft ? 420 : 1500 + Math.random() * 500
  filter.Q.value = soft ? 0.5 : 1.4
  const tap = shaped(ctx, at, soft ? 0.016 : 0.011, 0.004, soft ? 0.14 : 0.05)
  source.connect(filter).connect(tap)
  panned(ctx, tap, pan)
  source.start(at)
  source.stop(at + 0.2)
}

export function playBreath(inhale: boolean, effort: number): void {
  const ctx = audible()
  if (!ctx) return
  const at = ctx.currentTime + 0.005
  const length = inhale ? 0.7 : 0.9
  const source = noiseSource(ctx)
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 0.8
  filter.frequency.setValueAtTime(inhale ? 900 : 1300, at)
  filter.frequency.linearRampToValueAtTime(inhale ? 1500 : 650, at + length)
  const gain = shaped(ctx, at, 0.012 * effort, length * 0.4, length * 0.6)
  if (sfxBus) gain.connect(sfxBus)
  source.connect(filter).connect(gain)
  source.start(at)
  source.stop(at + length + 0.05)
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
    case 'open':
      swing(ctx, at)
      break
    case 'doorOpen':
      playDoor(DOOR_OPEN_LEVEL)
      break
    case 'close':
      thud(ctx, at, 0.18)
      break
    case 'tear':
      tear(ctx, at)
      break
  }
}
