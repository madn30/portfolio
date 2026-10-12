import { useEffect, useRef, useState } from 'react'
import { Award, Menu, Volume2, VolumeX } from 'lucide-react'
import { useAudio } from '@/app/audio'
import { goHome, openSection, walkThroughLoopDoor } from '@/app/navigation'
import type { Route } from '@/app/router'
import { doors, siteConfig } from '@/data/siteConfig'
import { useLockBodyScroll } from '@/shared/hooks/useLockBodyScroll'
import { ACHIEVEMENTS, AchievementsPanel, useAchievements } from '@/features/achievements'
import { setWorld, useWorld, worldRefs } from '@/shared/store/worldStore'
import type { DoorSectionId } from '@/shared/types'
import { AudioPanel } from '@/shared/components/audio/AudioPanel'
import { ChipButton } from '@/shared/components/ChipButton'
import { useInspectHidden } from '@/shared/hooks/useInspectHidden'
import { MapPanel } from '@/shared/components/map/MapPanel'

interface NavigationProps {
  route: Route
}

type Sheet = 'map' | 'audio' | 'trophies' | null

export function Navigation({ route }: NavigationProps) {
  const [sheetKind, setSheetKind] = useState<Sheet>(null)
  const [pinProgress, setPinProgress] = useState(0)
  const station = useWorld((s) => s.station)
  const lap = useWorld((s) => s.lap)
  const muted = useAudio((s) => s.muted)
  const unlocked = useAchievements((s) => s.unlocked)
  const inspectHidden = useInspectHidden()
  const mapOpener = useRef<HTMLButtonElement>(null)
  const audioOpener = useRef<HTMLButtonElement>(null)
  const trophiesOpener = useRef<HTMLButtonElement>(null)

  useLockBodyScroll(sheetKind !== null)

  const current: DoorSectionId | null =
    route.section !== 'home' ? route.section : station >= 0 ? doors[station].id : null

  useEffect(() => {
    setSheetKind(null)
    setWorld({ hoveredDoor: null })
  }, [route.section, inspectHidden])

  const openerFor = (kind: Exclude<Sheet, null>) =>
    kind === 'map' ? mapOpener : kind === 'audio' ? audioOpener : trophiesOpener

  useEffect(() => {
    if (sheetKind === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      setSheetKind(null)
      setWorld({ hoveredDoor: null })
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [sheetKind])

  const close = () => {
    if (sheetKind) openerFor(sheetKind).current?.focus()
    setSheetKind(null)
    setWorld({ hoveredDoor: null })
  }
  const toggle = (kind: Exclude<Sheet, null>) => {
    if (kind === 'map') setPinProgress(worldRefs.scroll)
    setSheetKind((v) => (v === kind ? null : kind))
  }
  const select = (id: DoorSectionId) => {
    setSheetKind(null)
    openSection(id)
  }
  const selectLoop = () => {
    setSheetKind(null)
    if (route.section !== 'home') goHome()
    walkThroughLoopDoor()
  }

  const controlsHidden = sheetKind !== null || inspectHidden

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <button
          type="button"
          onClick={goHome}
          className={`chrome pointer-events-auto group flex items-center gap-2.5 rounded-md py-1 pr-2 text-left ${
            inspectHidden ? 'chrome-hidden' : ''
          }`}
          aria-label={`${siteConfig.name} – return to the entrance`}
        >
          <span className="font-display text-[17px] text-ink">{siteConfig.name}</span>
        </button>

        <div
          className={`chrome pointer-events-auto flex items-center gap-3 ${
            controlsHidden ? 'chrome-hidden' : ''
          }`}
        >
          {lap > 0 && (
            <span
              className="font-hand text-xl text-charcoal"
              aria-label={`Lap ${lap} of the corridor`}
              title="Laps around the corridor"
            >
              #{lap}
            </span>
          )}
          <ChipButton
            ref={audioOpener}
            expanded={sheetKind === 'audio'}
            controls="corridor-audio"
            label={muted ? 'Audio settings, sound off' : 'Audio settings, sound on'}
            title="Audio settings"
            onClick={() => toggle('audio')}
          >
            {muted ? (
              <VolumeX size={17} strokeWidth={1.8} aria-hidden="true" />
            ) : (
              <Volume2 size={17} strokeWidth={1.8} aria-hidden="true" />
            )}
          </ChipButton>
          <ChipButton
            ref={mapOpener}
            expanded={sheetKind === 'map'}
            controls="corridor-map"
            label="Map of the corridor"
            title="Map"
            onClick={() => toggle('map')}
          >
            <Menu size={17} strokeWidth={1.8} aria-hidden="true" />
          </ChipButton>
          <ChipButton
            ref={trophiesOpener}
            expanded={sheetKind === 'trophies'}
            controls="corridor-trophies"
            label={`Achievements, ${unlocked.length} of ${ACHIEVEMENTS.length} unlocked`}
            title="Achievements"
            tilt="left"
            onClick={() => toggle('trophies')}
          >
            <Award size={17} strokeWidth={1.8} aria-hidden="true" />
          </ChipButton>
        </div>
      </div>

      {sheetKind !== null && (
        <div
          className="pointer-events-auto fixed inset-0 z-[35]"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) close()
          }}
        />
      )}

      <MapPanel
        open={sheetKind === 'map'}
        route={route}
        current={current}
        pinProgress={pinProgress}
        onClose={close}
        onSelect={select}
        onSelectLoop={selectLoop}
      />
      <AudioPanel open={sheetKind === 'audio'} onClose={close} />
      <AchievementsPanel open={sheetKind === 'trophies'} onClose={close} />
    </header>
  )
}
