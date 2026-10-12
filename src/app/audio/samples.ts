import { getContext, sfxBus } from './engine'

const samples = new Map<string, Promise<AudioBuffer | null>>()

export function loadSample(url: string): Promise<AudioBuffer | null> {
  const cached = samples.get(url)
  if (cached) return cached
  const ctx = getContext()
  if (!ctx) return Promise.resolve(null)
  const pending = fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
      return response.arrayBuffer()
    })
    .then((data) => ctx.decodeAudioData(data))
    .catch(() => {
      // Nothing can act on a missing effect; forget it so the next play retries the fetch.
      samples.delete(url)
      return null
    })
  samples.set(url, pending)
  return pending
}

export function playSample(ctx: AudioContext, buffer: AudioBuffer, at: number, level: number): void {
  if (!sfxBus) return
  const source = ctx.createBufferSource()
  source.buffer = buffer
  const gain = ctx.createGain()
  gain.gain.value = level
  source.connect(gain).connect(sfxBus)
  source.start(at)
}
