import { useEffect, useImperativeHandle, useMemo, useRef, type Ref } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { play } from '@/app/audio'
import { closeProject, openProject } from '@/app/navigation'
import type { Project } from '@/shared/types'
import type { CardLink } from '@/features/world/gallery/galleryTextures'
import { gsap } from '@/shared/utils/gsap'
import { mulberry32 } from '@/shared/graphics/sketch'
import { InteractiveHotspot } from '@/features/world/corridor/components/InteractiveHotspot'
import { useScene } from '@/features/world/scene/SceneContext'
import { SketchEdges } from '@/features/world/corridor/components/SketchEdges'
import { CARD, displayX, INSPECT, pointOnLine } from './galleryLayout'
import type { PaperMaterial } from './paperMaterial'
import type { ClotheslineState } from './useClothesline'

export interface GalleryCardHandle {
  open: () => Promise<void>
  close: () => Promise<void>
}

interface GalleryCardProps {
  ref?: Ref<GalleryCardHandle>
  slot: number
  project: Project
  material: PaperMaterial
  geometry: THREE.PlaneGeometry
  pegGeometry: THREE.PlaneGeometry
  pegMaterial: THREE.Material
  curve: THREE.CatmullRomCurve3
  line: { current: ClotheslineState }
  lifted: boolean
  busy: boolean
  link: CardLink | null
}

const BASE_Y = -CARD.drop
const REACH = 0.55

function settle(
  sheet: THREE.Group,
  group: THREE.Group,
  material: PaperMaterial,
  open: boolean,
): void {
  const x = INSPECT[0] - group.position.x
  const y = INSPECT[1] - group.position.y
  const z = INSPECT[2] - group.position.z
  group.rotation.set(0, 0, 0)
  group.scale.setScalar(1)
  sheet.position.set(open ? x : 0, open ? y : BASE_Y, open ? z : 0)
  sheet.rotation.set(open ? Math.PI : 0, 0, 0)
  sheet.scale.setScalar(open ? 1.1 : 1)
  material.bend.value = 0
}

function openUrl(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function GalleryCard({
  ref,
  slot,
  project,
  material,
  geometry,
  pegGeometry,
  pegMaterial,
  curve,
  line,
  lifted,
  busy,
  link,
}: GalleryCardProps) {
  const { reducedMotion, touch } = useScene()
  const card = useRef<THREE.Group>(null)
  const paper = useRef<THREE.Group>(null)
  const outline = useRef<THREE.Group>(null)
  const parked = useRef(true)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const sway = useMemo(() => {
    const random = mulberry32(slot * 17 + 5)
    return { speed: 0.3 + random() * 0.2, offset: random() * 100 }
  }, [slot])
  const point = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    if (touch) material.reveal.value = 1
  }, [touch, material])

  useEffect(
    () => () => {
      timeline.current?.kill()
      gsap.killTweensOf(material.reveal)
      gsap.killTweensOf(material.wind)
    },
    [material],
  )

  useImperativeHandle(
    ref,
    () => ({
      open: () =>
        new Promise((resolve) => {
          const sheet = paper.current
          const group = card.current
          if (!sheet || !group) return resolve()
          parked.current = false
          timeline.current?.kill()
          if (reducedMotion) {
            settle(sheet, group, material, true)
            material.reveal.value = 1
            return resolve()
          }
          play('tear')
          const x = INSPECT[0] - group.position.x
          const y = INSPECT[1] - group.position.y
          const z = INSPECT[2] - group.position.z
          gsap.to(material.reveal, { value: 1, duration: 0.3, overwrite: 'auto' })
          const tl = gsap.timeline({ onComplete: resolve })
          tl.to(group.rotation, { x: 0, y: 0, z: 0, duration: 0.3 }, 0)
          tl.to(group.scale, { x: 1, y: 1, z: 1, duration: 0.3 }, 0)
          tl.to(sheet.position, { y: BASE_Y - 0.25, duration: 0.15 }, 0)
          tl.to(sheet.rotation, { x: 0.5, z: -0.05, duration: 0.15 }, 0)
          tl.to(material.bend, { value: 0.8, duration: 0.15 }, 0)
          tl.to(sheet.position, {
            y: BASE_Y + 0.8,
            x: x * 0.2,
            z: z * 0.2,
            duration: 0.4,
            ease: 'power1.out',
          })
          tl.to(
            sheet.rotation,
            { x: Math.PI * 0.8, z: 0.05, y: -0.02, duration: 0.4, ease: 'power1.inOut' },
            '<',
          )
          tl.to(material.bend, { value: -0.3, duration: 0.4, ease: 'power1.inOut' }, '<')
          tl.to(sheet.position, { x, y, z, duration: 0.4, ease: 'power3.out' })
          tl.to(sheet.rotation, { x: Math.PI, y: 0, z: 0, duration: 0.4, ease: 'power3.out' }, '<')
          tl.to(material.bend, { value: 0, duration: 0.5 }, '<')
          tl.to(sheet.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.3, ease: 'sine.out' }, '-=0.4')
          timeline.current = tl
        }),
      close: () =>
        new Promise((resolve) => {
          const sheet = paper.current
          const group = card.current
          if (!sheet || !group) return resolve()
          timeline.current?.kill()
          const done = () => {
            parked.current = true
            gsap.to(material.reveal, { value: touch ? 1 : 0, duration: 0.5, overwrite: 'auto' })
            resolve()
          }
          if (reducedMotion) {
            settle(sheet, group, material, false)
            return done()
          }
          play('tear')
          const tl = gsap.timeline({ onComplete: done })
          tl.to(sheet.position, {
            y: BASE_Y + 0.33,
            x: 0,
            z: REACH,
            duration: 0.35,
            ease: 'power2.in',
          })
          tl.to(sheet.rotation, { x: 0.5, y: 0, z: -0.05, duration: 0.35, ease: 'power2.in' }, '<')
          tl.to(material.bend, { value: 0.6, duration: 0.3, ease: 'power2.in' }, '<')
          tl.to(sheet.scale, { x: 1, y: 1, z: 1, duration: 0.3, ease: 'sine.inOut' }, '<')
          tl.to(sheet.position, { y: BASE_Y, x: 0, z: 0, duration: 0.25, ease: 'power3.out' })
          tl.to(sheet.rotation, { x: 0, y: 0, z: 0, duration: 0.25, ease: 'power3.out' }, '<')
          tl.to(material.bend, { value: 0, duration: 0.3 }, '<')
          timeline.current = tl
        }),
    }),
    [material, reducedMotion, touch],
  )

  useFrame((state) => {
    const group = card.current
    if (outline.current) outline.current.visible = parked.current
    if (!group || !parked.current) return
    const x = displayX(slot, line.current.scroll)
    pointOnLine(curve, x, point)
    group.position.copy(point)
    const t = state.clock.elapsedTime
    group.rotation.z = reducedMotion ? 0 : Math.sin(t * sway.speed + sway.offset) * 0.05
    group.scale.setScalar(THREE.MathUtils.clamp(1 - Math.abs(x) / 30, 0.7, 1))
  })

  const hover = (hovered: boolean) => {
    if (touch || lifted) return
    gsap.to(material.reveal, {
      value: hovered ? 1 : 0,
      duration: hovered ? 0.8 : 0.5,
      overwrite: 'auto',
    })
    gsap.to(material.wind, { value: hovered ? 0.03 : 0, duration: 0.6, overwrite: 'auto' })
  }

  return (
    <group ref={card}>
      <mesh position={[0, -0.09, 0.012]} geometry={pegGeometry} material={pegMaterial} />
      <group ref={paper} position={[0, BASE_Y, 0]}>
        <InteractiveHotspot
          label={lifted ? 'Hang it back up' : `Open ${project.title}`}
          onActivate={() => (lifted ? closeProject() : openProject(project.id))}
          onHoverChange={hover}
          hitArea={[CARD.w + 0.15, CARD.h + 0.15, touch ? 0.6 : 0.08]}
          disabled={busy}
        >
          <mesh geometry={geometry} material={material} />
          <group ref={outline}>
            <SketchEdges
              geometry={geometry}
              seed={75 + slot}
              jitter={0.01}
              subdivisions={6}
              passes={1}
            />
          </group>
        </InteractiveHotspot>
        {link && (
          <InteractiveHotspot
            label={link.label}
            onActivate={() => openUrl(link.url)}
            hitArea={[CARD.w * 0.56, CARD.h * 0.12, 0.06]}
            hitAreaPosition={[0, CARD.h * 0.34, -0.09]}
            disabled={!lifted || busy}
          >
            <group />
          </InteractiveHotspot>
        )}
      </group>
    </group>
  )
}
