import { useEffect, useState } from 'react'
import type { DeviceKind, QualityTier } from '@/shared/types'

export interface DeviceProfile {
  kind: DeviceKind
  quality: QualityTier
  touch: boolean
  phone: boolean
  weakCpu: boolean
}

interface NavigatorExtras extends Navigator {
  deviceMemory?: number
  connection?: { saveData?: boolean }
}

function detect(): DeviceProfile {
  const width = window.innerWidth
  const kind: DeviceKind = width < 640 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop'
  const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches
  // Touch-first counts too: a phone on "desktop site" reports a ~980px viewport.
  const phone = touch || Math.min(window.innerWidth, window.innerHeight) < 640

  const nav = navigator as NavigatorExtras
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 8
  const saveData = nav.connection?.saveData === true
  const weakCpu = cores <= 2 || memory <= 2

  let quality: QualityTier = 'high'
  if (kind === 'mobile' || saveData || weakCpu) quality = 'low'
  else if (kind === 'tablet' || cores <= 4 || memory <= 4) quality = 'medium'

  return { kind, quality, touch, phone, weakCpu }
}

export function useDeviceProfile(): DeviceProfile {
  const [profile, setProfile] = useState<DeviceProfile>(() => detect())

  useEffect(() => {
    let timer = 0
    const onResize = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        const next = detect()
        setProfile((prev) =>
          prev.kind === next.kind &&
          prev.quality === next.quality &&
          prev.touch === next.touch &&
          prev.phone === next.phone &&
          prev.weakCpu === next.weakCpu
            ? prev
            : next,
        )
      }, 200)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return profile
}
