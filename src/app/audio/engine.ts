import { state } from './state'

export let context: AudioContext | null = null
export let master: GainNode | null = null
export let sfxBus: GainNode | null = null
export let musicBus: GainNode | null = null
let noise: AudioBuffer | null = null

function supported(): boolean {
  return typeof window !== 'undefined' && 'AudioContext' in window
}

export function getContext(): AudioContext | null {
  if (context) return context
  if (!supported()) return null
  context = new AudioContext()
  master = context.createGain()
  master.gain.value = state.muted ? 0 : 1
  master.connect(context.destination)
  sfxBus = context.createGain()
  sfxBus.gain.value = state.sfx
  sfxBus.connect(master)
  musicBus = context.createGain()
  musicBus.gain.value = state.music
  musicBus.connect(master)
  return context
}

function getNoise(ctx: AudioContext): AudioBuffer {
  if (noise) return noise
  const length = ctx.sampleRate * 2
  noise = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  return noise
}

export function noiseSource(ctx: AudioContext): AudioBufferSourceNode {
  const source = ctx.createBufferSource()
  source.buffer = getNoise(ctx)
  source.loop = true
  return source
}

export function ease(param: AudioParam, target: number): void {
  if (!context) return
  param.cancelScheduledValues(context.currentTime)
  param.setTargetAtTime(target, context.currentTime, 0.08)
}

export function audible(): AudioContext | null {
  if (state.muted || !state.unlocked || !context || !master) return null
  return context
}
