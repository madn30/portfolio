import { useEffect, useRef, type ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type * as THREE from 'three'
import { useScene } from '@/features/world/scene/SceneContext'
import { SHEET, SHEET_PORTRAIT } from './layout'

export function Sheet({ open, children }: { open: boolean; children: ReactNode }) {
  const { reducedMotion } = useScene()
  const portrait = useThree((s) => s.viewport.aspect) < 1
  const group = useRef<THREE.Group>(null)
  const progress = useRef(open ? 1 : 0)
  const delay = useRef(0)
  useEffect(() => {
    if (open) delay.current = 0.22
  }, [open])

  useFrame((_, delta) => {
    if (!group.current) return
    const dt = Math.min(delta, 0.05)
    if (open && delay.current > 0) {
      delay.current -= dt
      return
    }
    const target = open ? 1 : 0
    const p = reducedMotion
      ? target
      : progress.current + (target - progress.current) * (1 - Math.exp(-dt * (open ? 5 : 8)))
    progress.current = Math.abs(p - target) < 0.002 ? target : p
    const ease = 1 - Math.pow(1 - progress.current, 2)
    group.current.visible = progress.current > 0.01
    group.current.rotation.x = -(1 - ease) * 1.25
    group.current.scale.setScalar(0.55 + 0.45 * ease)
  })

  return (
    <group ref={group} position={portrait ? SHEET_PORTRAIT : SHEET} rotation={[0.04, -0.1, 0.012]}>
      {children}
    </group>
  )
}
