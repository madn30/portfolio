import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { accentHex } from '@/data/siteConfig'
import type { AccentColor } from '@/shared/types'
import { getGlowTexture } from '@/shared/graphics/textures/surfaces'

type AccentMaterials = Record<AccentColor, THREE.MeshBasicMaterial>

function build(make: (hex: string) => THREE.MeshBasicMaterial): AccentMaterials {
  const out = {} as AccentMaterials
  for (const name of Object.keys(accentHex) as AccentColor[]) out[name] = make(accentHex[name])
  return out
}

export function useAccentMaterials(): AccentMaterials {
  const accents = useMemo(
    () => build((color) => new THREE.MeshBasicMaterial({ color, toneMapped: false })),
    [],
  )
  useEffect(() => () => Object.values(accents).forEach((m) => m.dispose()), [accents])
  return accents
}

export function useGlowMaterials(enabled: boolean): AccentMaterials | null {
  const glows = useMemo(
    () =>
      enabled
        ? build(
            (color) =>
              new THREE.MeshBasicMaterial({
                map: getGlowTexture(),
                color,
                transparent: true,
                opacity: 0.16,
                depthWrite: false,
                toneMapped: false,
              }),
          )
        : null,
    [enabled],
  )
  useEffect(
    () => () => {
      if (glows) Object.values(glows).forEach((m) => m.dispose())
    },
    [glows],
  )
  return glows
}
