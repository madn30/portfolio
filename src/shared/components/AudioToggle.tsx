import { Volume2, VolumeX } from 'lucide-react'
import { toggleMuted, unlockAudio, useAudio } from '@/app/audio'

export function AudioToggle() {
  const muted = useAudio((s) => s.muted)
  const onClick = () => {
    unlockAudio()
    toggleMuted()
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!muted}
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      className="inline-flex items-center gap-1 rounded-sm font-hand text-lg leading-none text-ink underline decoration-dashed decoration-terracotta/70 underline-offset-4 hover:decoration-terracotta"
    >
      {muted ? <VolumeX size={14} aria-hidden="true" /> : <Volume2 size={14} aria-hidden="true" />}
      sound {muted ? 'off' : 'on'}
    </button>
  )
}
