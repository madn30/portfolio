import { setAmbience, wantedAmbience } from './ambience'
import { ease, getContext, master, musicBus, sfxBus } from './engine'
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
    if (wantedAmbience) setAmbience(wantedAmbience)
  }
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
  return () => {
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
