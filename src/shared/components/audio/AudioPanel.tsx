import { setMusicLevel, setSfxLevel, unlockAudio, useAudio } from '@/app/audio'
import { AudioToggle } from '@/shared/components/AudioToggle'
import { DropPanel } from '@/shared/components/panels/DropPanel'
import { PaperSlider } from '@/shared/components/ui/PaperSlider'

interface AudioPanelProps {
  open: boolean
  onClose: () => void
}

export function AudioPanel({ open, onClose }: AudioPanelProps) {
  const music = useAudio((s) => s.music)
  const sfx = useAudio((s) => s.sfx)
  const change = (set: (level: number) => void) => (level: number) => {
    unlockAudio()
    set(level)
  }
  return (
    <DropPanel
      id="corridor-audio"
      open={open}
      title="Audio settings"
      label="Audio settings"
      align="end"
      className="max-w-[15rem]"
      onClose={onClose}
    >
      <div className="mt-3 flex flex-col gap-4">
        <PaperSlider
          id="audio-music"
          label="Music"
          value={music}
          onChange={change(setMusicLevel)}
        />
        <PaperSlider id="audio-sfx" label="SFX" value={sfx} onChange={change(setSfxLevel)} />
        <p className="border-t-2 border-dashed border-ink/25 pt-3 text-center">
          <AudioToggle />
        </p>
      </div>
    </DropPanel>
  )
}
