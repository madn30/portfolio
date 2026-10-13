import { onLoaderDone, onLoaderFinished } from '@/features/loader'
import { setAmbience, wantedAmbience } from './ambience'
import { ease, getContext, master, musicBus, sfxBus } from './engine'
import { preloadMusic } from './music'
import { preloadSamples } from './sfx'
import { LEVELS_KEY, STORAGE_KEY, clamp, emit, state, store, type Levels } from './state'

let masterLevel = 1

function applyMaster(): void {
  if (!master) return
  ease(master.gain, state.muted ? 0 : masterLevel)
}

export function unlockAudio(): void {
  const ctx = getContext()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  if (!state.unlocked) {
    emit({ ...state, unlocked: true })
    preloadSamples()
    if (wantedAmbience) setAmbience(wantedAmbience)
  }
}

function whenIdle(task: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(task, { timeout: 1000 })
    return () => window.cancelIdleCallback(id)
  }
  const id = window.setTimeout(task, 300)
  return () => window.clearTimeout(id)
}

export function installAudioUnlock(): () => void {
  const onGesture = () => unlockAudio()
  const onVisibility = () => {
    masterLevel = document.hidden ? 0 : 1
    applyMaster()
  }
  window.addEventListener('pointerdown', onGesture, { passive: true })
  window.addEventListener('keydown', onGesture)
  document.addEventListener('visibilitychange', onVisibility)
  // `new AudioContext()` blocks the main thread while it opens the output device (hundreds of
  // ms on Bluetooth). Built once the loader's tear is over, it waits suspended for the first
  // gesture instead of landing inside that gesture's click. The music buffers while the sheet
  // tears so the front door can start it without a pause.
  let cancelWarmUp = () => {}
  const stopPreload = onLoaderDone(preloadMusic)
  const stopWaiting = onLoaderFinished(() => {
    cancelWarmUp = whenIdle(() => {
      getContext()
    })
  })
  return () => {
    stopPreload()
    stopWaiting()
    cancelWarmUp()
    window.removeEventListener('pointerdown', onGesture)
    window.removeEventListener('keydown', onGesture)
    document.removeEventListener('visibilitychange', onVisibility)
  }
}

function setMuted(muted: boolean): void {
  if (muted === state.muted) return
  emit({ ...state, muted })
  store(STORAGE_KEY, muted ? 'muted' : 'on')
  applyMaster()
}

export function toggleMuted(): void {
  setMuted(!state.muted)
}

function setLevels(levels: Partial<Levels>): void {
  const music = clamp(levels.music ?? state.music)
  const sfx = clamp(levels.sfx ?? state.sfx)
  emit({ ...state, music, sfx })
  store(LEVELS_KEY, JSON.stringify({ music, sfx }))
  if (musicBus) ease(musicBus.gain, music)
  if (sfxBus) ease(sfxBus.gain, sfx)
  if (state.muted && (levels.music ?? 0) + (levels.sfx ?? 0) > 0) setMuted(false)
}

export function setMusicLevel(level: number): void {
  setLevels({ music: level })
}

export function setSfxLevel(level: number): void {
  setLevels({ sfx: level })
}
