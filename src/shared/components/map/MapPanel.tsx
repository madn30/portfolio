import type { Route } from '@/app/router'
import { setWorld, useWorld } from '@/shared/store/worldStore'
import type { DoorSectionId } from '@/shared/types'
import { DropPanel } from '@/shared/components/panels/DropPanel'
import { CorridorMap } from './CorridorMap'

interface MapPanelProps {
  open: boolean
  route: Route
  current: DoorSectionId | null
  pinProgress: number
  onClose: () => void
  onSelect: (id: DoorSectionId) => void
  onSelectLoop: () => void
}

export function MapPanel({
  open,
  route,
  current,
  pinProgress,
  onClose,
  onSelect,
  onSelectLoop,
}: MapPanelProps) {
  const hovered = useWorld((s) => s.hoveredDoor)
  return (
    <DropPanel
      id="corridor-map"
      open={open}
      title="Map"
      label="Map of the corridor"
      align="centre"
      className="max-w-md"
      onClose={onClose}
    >
      <CorridorMap
        page={route.section === 'home' ? null : route.section}
        current={current}
        hovered={hovered}
        pinProgress={pinProgress}
        onHover={(id) => setWorld({ hoveredDoor: id })}
        onSelect={onSelect}
        onSelectLoop={onSelectLoop}
      />
    </DropPanel>
  )
}
