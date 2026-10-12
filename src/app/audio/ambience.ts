import { context, musicBus, noiseSource } from './engine'
import { state, type AmbienceId } from './state'

interface Bed {
  id: AmbienceId
  gain: GainNode
  nodes: AudioScheduledSourceNode[]
}

let currentBed: Bed | null = null
export let wantedAmbience: AmbienceId | null = null

function sway(
  ctx: AudioContext,
  param: AudioParam,
  hertz: number,
  depth: number,
  nodes: AudioScheduledSourceNode[],
): void {
  const lfo = ctx.createOscillator()
  lfo.frequency.value = hertz
  const amount = ctx.createGain()
  amount.gain.value = depth
  lfo.connect(amount).connect(param)
  lfo.start()
  nodes.push(lfo)
}

function breath(
  ctx: AudioContext,
  into: GainNode,
  type: BiquadFilterType,
  frequency: number,
  q: number,
  level: number,
  nodes: AudioScheduledSourceNode[],
): BiquadFilterNode {
  const source = noiseSource(ctx)
  const filter = ctx.createBiquadFilter()
  filter.type = type
  filter.frequency.value = frequency
  filter.Q.value = q
  const gain = ctx.createGain()
  gain.gain.value = level
  source.connect(filter).connect(gain).connect(into)
  source.start()
  nodes.push(source)
  return filter
}

function buildBed(ctx: AudioContext, id: AmbienceId, into: GainNode): AudioScheduledSourceNode[] {
  const nodes: AudioScheduledSourceNode[] = []
  switch (id) {
    case 'corridor': {
      const air = breath(ctx, into, 'lowpass', 210, 0.7, 0.045, nodes)
      sway(ctx, air.frequency, 0.06, 70, nodes)
      break
    }
    case 'about':
    case 'experience': {
      const wind = breath(ctx, into, 'bandpass', id === 'about' ? 520 : 380, 0.8, 0.07, nodes)
      sway(ctx, wind.frequency, id === 'about' ? 0.11 : 0.08, 280, nodes)
      breath(ctx, into, 'lowpass', 160, 0.7, 0.03, nodes)
      break
    }
    case 'contact': {
      const swell = ctx.createGain()
      swell.gain.value = 0.06
      swell.connect(into)
      sway(ctx, swell.gain, 0.085, 0.04, nodes)
      breath(ctx, swell, 'lowpass', 620, 0.6, 1, nodes)
      breath(ctx, into, 'lowpass', 150, 0.7, 0.035, nodes)
      break
    }
    case 'projects': {
      breath(ctx, into, 'lowpass', 300, 0.7, 0.05, nodes)
      const hum = breath(ctx, into, 'bandpass', 1100, 1.2, 0.012, nodes)
      sway(ctx, hum.frequency, 0.05, 350, nodes)
      break
    }
    case 'skills': {
      for (const [frequency, level] of [
        [60, 0.02],
        [120, 0.007],
      ] as const) {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = frequency
        const gain = ctx.createGain()
        gain.gain.value = level
        osc.connect(gain).connect(into)
        osc.start()
        nodes.push(osc)
      }
      breath(ctx, into, 'lowpass', 2800, 0.5, 0.006, nodes)
      break
    }
  }
  return nodes
}

export function setAmbience(id: AmbienceId | null): void {
  wantedAmbience = id
  if (!state.unlocked || !context || !musicBus) return
  if (currentBed?.id === id) return
  const ctx = context
  const now = ctx.currentTime
  if (currentBed) {
    const old = currentBed
    old.gain.gain.cancelScheduledValues(now)
    old.gain.gain.setValueAtTime(old.gain.gain.value, now)
    old.gain.gain.linearRampToValueAtTime(0.0001, now + 1.2)
    old.nodes.forEach((node) => node.stop(now + 1.3))
    currentBed = null
  }
  if (!id) return
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.linearRampToValueAtTime(1, now + 1.8)
  gain.connect(musicBus)
  currentBed = { id, gain, nodes: buildBed(ctx, id, gain) }
}
