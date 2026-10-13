import { context, musicBus } from './engine'

const MUSIC_URL = `${import.meta.env.BASE_URL}sounds/chill-chill-music.mp3`
// Sits under the ambient beds and the effects; the music slider scales it from here.
const MUSIC_LEVEL = 0.45
const FADE_IN_SECONDS = 0.6

let element: HTMLAudioElement | null = null
let level: GainNode | null = null
let playing = false

function getElement(): HTMLAudioElement {
  if (!element) {
    element = new Audio(MUSIC_URL)
    element.loop = true
    element.preload = 'auto'
  }
  return element
}

// Starts buffering the track while the tear plays so it can begin the moment it is allowed.
export function preloadMusic(): void {
  getElement().load()
}

// Started by the front door click only. A looping media element streams the track instead of
// decoding the whole file into memory; routed through the music bus it still follows the
// slider and the mute toggle.
export function startMusic(): void {
  if (playing || !context || !musicBus) return
  const ctx = context
  const audio = getElement()
  if (!level) {
    level = ctx.createGain()
    ctx.createMediaElementSource(audio).connect(level).connect(musicBus)
  }
  const gain = level.gain
  playing = true
  audio
    .play()
    .then(() => {
      const now = ctx.currentTime
      gain.setValueAtTime(0.0001, now)
      gain.linearRampToValueAtTime(MUSIC_LEVEL, now + FADE_IN_SECONDS)
    })
    .catch(() => {
      playing = false
    })
}
