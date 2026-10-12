import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { siteConfig } from '@/data/siteConfig'
import { unlock } from '@/features/achievements'
import { isSafeExternalUrl } from '@/shared/utils/links'
import { mulberry32 } from '@/shared/graphics/sketch'
import { Bay } from './Bay'
import { PIER_LENGTH, type Vec3 } from './constants'
import { focusMessageField } from './messageStore'
import { MessagePaper } from './MessagePaper'
import { Pier } from './Pier'
import { Sea } from './Sea'
import { Signpost } from './Signpost'
import { createBarrelTexture } from './signTextures'
import { useSignpostGeometries } from './signpostGeometry'

interface SignpostEntry {
  id: string
  label: string
  hint: string
  action: () => void
}

function placements(
  count: number,
  narrow: boolean,
): { position: Vec3; turn: number; tilt: number }[] {
  const random = mulberry32(91)
  const mid = (count - 1) / 2
  const spread = (1.3 + 1.05 * Math.max(0, count - 1)) * (narrow ? 0.72 : 1)
  return Array.from({ length: count }, (_, i) => {
    const d = Math.abs(i - mid)
    const x = count === 1 ? 0 : -spread + (i * 2 * spread) / (count - 1)
    const z = -(PIER_LENGTH + 3.4) - (d % 2 >= 0.5 ? 2.4 : d * 0.4)
    return {
      position: [x, 0, z] as Vec3,
      tilt: (random() - 0.5) * 0.08,
      turn: (random() - 0.5) * 0.3,
    }
  })
}

export function ContactRoom() {
  const narrow = useThree((s) => s.size.width < 1000)
  const geometries = useSignpostGeometries()
  const barrelTexture = useMemo(() => createBarrelTexture(), [])
  useEffect(() => () => barrelTexture.dispose(), [barrelTexture])

  const signposts = useMemo<SignpostEntry[]>(() => {
    const links = siteConfig.social
      .filter((link) => isSafeExternalUrl(link.url))
      .map((link) => ({
        id: link.id,
        label: link.label,
        hint: `${link.label} ↗`,
        action: () => {
          unlock('sociable')
          window.open(link.url, '_blank', 'noopener,noreferrer')
        },
      }))
    const message = {
      id: 'message',
      label: 'Message',
      hint: 'Leave a note',
      action: () => focusMessageField('name'),
    }
    const mid = Math.ceil(links.length / 2)
    return [...links.slice(0, mid), message, ...links.slice(mid)]
  }, [])
  const places = useMemo(() => placements(signposts.length, narrow), [signposts, narrow])

  return (
    <>
      <Sea />
      <Pier />
      {signposts.map((sign, i) => (
        <Signpost
          key={sign.id}
          index={i}
          label={sign.label}
          hint={sign.hint}
          geometries={geometries}
          barrelTexture={barrelTexture}
          onActivate={sign.action}
          {...places[i]}
        />
      ))}
      <MessagePaper />
      <Bay />
    </>
  )
}
