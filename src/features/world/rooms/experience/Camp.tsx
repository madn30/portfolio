import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { accentHex } from '@/data/siteConfig'
import type { AccentColor } from '@/shared/types'
import type { Vec3 } from '@/features/world/rooms/flight'
import { useToonMaterials } from '@/features/world/rooms/helpers'
import { SkyCard } from '@/features/world/rooms/sky'
import { Campsite, Pennant } from './terrain'

interface CampProps {
  position: Vec3
  accent: AccentColor
  summit?: boolean
  index: number
  eyebrow: string
  title: string
  selected: boolean
  hovered: boolean
  onHover: (hovered: boolean) => void
  onSelect: () => void
}

export function Camp({
  position,
  accent,
  summit = false,
  index,
  eyebrow,
  title,
  selected,
  hovered,
  onHover,
  onSelect,
}: CampProps) {
  const materials = useToonMaterials({ pole: '#7d7973' })
  const pole = useMemo(() => new THREE.BoxGeometry(0.05, summit ? 2.0 : 1.3, 0.05), [summit])
  useEffect(() => () => pole.dispose(), [pole])

  const poleHeight = summit ? 2.0 : 1.3
  return (
    <group position={position}>
      <mesh position={[-0.55, poleHeight / 2, 0.1]} geometry={pole} material={materials.pole} />
      <group position={[-0.53, poleHeight - (summit ? 0.26 : 0.18), 0.1]}>
        <Pennant
          width={summit ? 0.8 : 0.52}
          height={summit ? 0.44 : 0.3}
          color={accentHex[accent]}
          phase={index * 1.7}
        />
      </group>
      <group position={[-1.75, 0, 0.05]}>
        <Campsite accent={accentHex[accent]} seed={index + 1} lit={selected} />
      </group>
      <SkyCard
        still
        position={[0.75, summit ? 1.75 : 2.05, 0.3]}
        rotation={[0, 0, (index % 2 ? -1 : 1) * 0.025]}
        width={2.0}
        height={0.98}
        eyebrow={eyebrow}
        title={title}
        accent={accent}
        titleSize={118}
        seed={400 + index}
        label={selected ? title : `Open: ${title}`}
        hovered={hovered || selected}
        onHover={onHover}
        onActivate={onSelect}
      />
    </group>
  )
}
