import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { play } from '@/app/audio'
import { openSection } from '@/app/navigation'
import { accentHex } from '@/data/siteConfig'
import { useWorld } from '@/shared/store/worldStore'
import {
  createSkillScreenTexture,
  createTvScreenTexture,
} from '@/features/world/studio/studioTextures'
import { useScene } from '@/features/world/scene/SceneContext'
import { useToonMaterials } from '@/features/world/rooms/helpers'
import { pickTowerItems, TOWER, towerSlots } from './layout'
import { createDeviceGeometries, disposeDeviceGeometries } from './devices'
import { useAccentMaterials, useGlowMaterials } from './materials'
import { Monitor } from './Monitor'
import {
  createTowerState,
  DRAG_THRESHOLD,
  focusSlot,
  releaseFocus,
  resetTower,
  stepTower,
} from './physics'
import { setStudioOpen, studioRefs, useStudio } from './store'
import { useTowerInput } from './useTowerInput'

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

export function Tower() {
  const { quality, reducedMotion } = useScene()
  const camera = useThree((s) => s.camera)
  const active = useWorld((s) => s.activeDoor) === 'skills'
  const open = useStudio((s) => s.open)
  const detailed = quality !== 'low'
  const items = useMemo(() => pickTowerItems(quality), [quality])
  const { slots, totalHeight } = useMemo(() => towerSlots(items.length), [items.length])
  const geometries = useMemo(() => createDeviceGeometries(), [])
  const materials = useToonMaterials({ shell: '#e6e3dc', shellDark: '#d8d4cb', stand: '#7d7973' })
  const accents = useAccentMaterials()
  const glows = useGlowMaterials(detailed)
  const screens = useMemo(
    () =>
      items.map((item) => {
        const accent = accentHex[item.category.accent]
        const texture =
          item.skill === null
            ? createTvScreenTexture({
                index: item.categoryIndex + 1,
                title: item.category.title,
                blurb: item.category.blurb,
                skills: item.category.skills,
                accent,
              })
            : createSkillScreenTexture({
                skill: item.skill,
                category: item.category.title,
                index: item.categoryIndex + 1,
                accent,
                portrait: item.device === 'phone',
                seed: item.seed,
              })
        return {
          texture,
          material: new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }),
        }
      }),
    [items],
  )
  useEffect(
    () => () => {
      disposeDeviceGeometries(geometries)
      screens.forEach((s) => {
        s.texture.dispose()
        s.material.dispose()
      })
    },
    [geometries, screens],
  )

  const state = useRef(createTowerState(items.length))
  const groups = useRef<(THREE.Group | null)[]>([])
  const tower = useRef<THREE.Group>(null)
  const scratch = useMemo(() => ({ point: new THREE.Vector3(), inverse: new THREE.Matrix4() }), [])
  const [hovered, setHovered] = useState<number | null>(null)
  const [focused, setFocused] = useState<number | null>(null)

  useEffect(() => {
    state.current = createTowerState(items.length)
  }, [items.length])

  useTowerInput(state, active && open === null, reducedMotion)

  useEffect(() => {
    if (active) return
    resetTower(state.current)
    setFocused(null)
    setStudioOpen(null)
  }, [active])

  useEffect(() => {
    if (open !== null || state.current.phase !== 'open') return
    releaseFocus(state.current)
    play('close')
  }, [open])

  const pick = useCallback(
    (index: number) => {
      const s = state.current
      if (s.travel > DRAG_THRESHOLD || s.phase !== 'idle') return
      if (!active) {
        openSection('skills')
        return
      }
      focusSlot(s, index, slots[index])
      setFocused(index)
    },
    [active, slots],
  )
  const onHover = useCallback((index: number, on: boolean) => {
    setHovered((prev) => (on ? index : prev === index ? null : prev))
  }, [])
  const register = useCallback((index: number, group: THREE.Group | null) => {
    groups.current[index] = group
  }, [])

  useFrame((_, delta) => {
    const s = state.current
    const dt = Math.min(delta, 0.05)
    const event = stepTower(s, dt, slots, totalHeight, TOWER.bottom, reducedMotion)
    if (event === 'opened' && s.focus !== null) {
      setStudioOpen(items[s.focus].id)
      play('open')
    }
    if (event === 'settled') setFocused(null)
    studioRefs.rotation = s.rotation
    studioRefs.fall = s.phase === 'idle' ? s.fall : 0
    const group = tower.current
    if (!group) return
    group.rotation.y = s.rotation
    group.updateMatrix()
    const k = s.focus !== null && s.approach > 0 ? smoothstep(s.approach) : 0
    const { point, inverse } = scratch
    if (k > 0) point.set(...TOWER.podium).applyMatrix4(inverse.copy(group.matrix).invert())
    slots.forEach((slot, i) => {
      const monitor = groups.current[i]
      if (!monitor) return
      const y = slot.baseY + s.offsets[i]
      if (i === s.focus && k > 0) {
        monitor.position.set(
          THREE.MathUtils.lerp(slot.x, point.x, k),
          THREE.MathUtils.lerp(y, point.y, k),
          THREE.MathUtils.lerp(slot.z, point.z, k),
        )
        monitor.getWorldPosition(point).project(camera)
        studioRefs.hole.x = (point.x + 1) * 50
        studioRefs.hole.y = (1 - point.y) * 50
      } else {
        monitor.position.set(slot.x, y, slot.z)
      }
    })
  })

  return (
    <group ref={tower} position={[...TOWER.position]}>
      {items.map((item, i) => (
        <Monitor
          key={item.id}
          index={i}
          item={item}
          slot={slots[i]}
          geometries={geometries}
          materials={materials}
          screen={screens[i].material}
          accent={accents[item.category.accent]}
          glow={glows ? glows[item.category.accent] : null}
          hovered={hovered === i}
          focused={focused === i}
          detailed={detailed}
          onActivate={pick}
          onHover={onHover}
          register={register}
        />
      ))}
    </group>
  )
}
