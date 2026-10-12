import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { projects } from '@/data/projects'
import { accentHex } from '@/data/siteConfig'
import { useWorld } from '@/shared/store/worldStore'
import { createGalleryCardFaces } from '@/features/world/gallery/galleryTextures'
import { gsap } from '@/shared/utils/gsap'
import { useScene } from '@/features/world/scene/SceneContext'
import { Motes, Sun } from '@/features/world/rooms/ambient'
import { FlyingBird } from '@/features/world/gallery/FlyingBird'
import { GalleryCard, type GalleryCardHandle } from '@/features/world/gallery/GalleryCard'
import { GalleryClouds } from '@/features/world/gallery/GalleryClouds'
import { GalleryScenery } from '@/features/world/gallery/GalleryScenery'
import { createPaintUniforms, PaintedBasicMaterial } from '@/features/world/gallery/paintReveal'
import { PaperMaterial } from '@/features/world/gallery/paperMaterial'
import { createClothespinTexture } from '@/features/world/gallery/sceneryTextures'
import { useClothesline } from '@/features/world/gallery/useClothesline'
import { CARD, createLineCurve, SLOTS, slotProject } from '@/features/world/gallery/galleryLayout'
import { SkyBox } from '@/features/world/rooms/shared'

export function ProjectsRoom() {
  const { quality, reducedMotion } = useScene()
  const active = useWorld((s) => s.activeDoor === 'projects')
  const inside = useWorld((s) => s.activeDoor === 'projects' || s.enteringDoor === 'projects')
  const focused = useWorld((s) => s.focusedProject)
  const root = useRef<THREE.Group>(null)
  const handles = useRef(new Map<number, GalleryCardHandle>())
  const queue = useRef(Promise.resolve())
  const selected = useRef<number | null>(null)
  const latestFocus = useRef(focused)
  latestFocus.current = focused
  const [lifted, setLifted] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const paint = useMemo(createPaintUniforms, [])
  const clothesline = useClothesline(active && lifted === null && !busy)
  const curve = useMemo(createLineCurve, [])

  const faces = useMemo(
    () => projects.map((project) => createGalleryCardFaces(project, accentHex[project.accent])),
    [],
  )
  const cards = useMemo(
    () =>
      Array.from({ length: SLOTS }, (_, slot) => {
        const project = slotProject(slot)
        const face = faces[slot % projects.length]
        return {
          slot,
          project,
          link: face.link,
          material: new PaperMaterial(
            { front: face.sketch, painted: face.painted, back: face.back },
            paint,
          ),
        }
      }),
    [faces, paint],
  )
  const pegs = useMemo(
    () =>
      projects.map((project) => {
        const texture = createClothespinTexture(accentHex[project.accent])
        return {
          texture,
          material: new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1,
            side: THREE.DoubleSide,
            toneMapped: false,
          }),
        }
      }),
    [],
  )
  const geometries = useMemo(() => {
    const detail = quality === 'low' ? 6 : 12
    return {
      paper: new THREE.PlaneGeometry(CARD.w, CARD.h, detail, Math.round(detail * 1.3)),
      peg: new THREE.PlaneGeometry(0.18, 0.27),
      rope: new THREE.TubeGeometry(curve, 96, 0.012, 6, false),
    }
  }, [curve, quality])
  const ropeMaterial = useMemo(() => new PaintedBasicMaterial(paint, { color: '#8a6f45' }), [paint])

  useEffect(
    () => () => {
      cards.forEach((c) => c.material.dispose())
      faces.forEach((f) => {
        f.sketch.dispose()
        f.painted.dispose()
        f.back.dispose()
      })
      pegs.forEach((p) => {
        p.texture.dispose()
        p.material.dispose()
      })
      Object.values(geometries).forEach((g) => g.dispose())
      ropeMaterial.dispose()
    },
    [cards, faces, pegs, geometries, ropeMaterial],
  )

  useEffect(() => {
    gsap.killTweensOf(paint.progress)
    if (!inside || reducedMotion) {
      paint.progress.value = 1
      return
    }
    paint.progress.value = 0
    gsap.to(paint.progress, { value: 1, duration: 2.5, delay: 0.2, ease: 'power2.inOut' })
    return () => gsap.killTweensOf(paint.progress)
  }, [inside, reducedMotion, paint])

  useEffect(() => {
    const step = async () => {
      const wanted = latestFocus.current
      const current = selected.current
      if (current === null ? !wanted : slotProject(current).id === wanted) return
      setBusy(true)
      if (current !== null) {
        await handles.current.get(current)?.close()
        selected.current = null
        setLifted(null)
      }
      const slot = wanted ? clothesline.nearestSlot(wanted) : null
      if (slot !== null) {
        await clothesline.scrollToSlot(slot, reducedMotion)
        selected.current = slot
        setLifted(slot)
        await handles.current.get(slot)?.open()
      }
      setBusy(false)
    }
    queue.current = queue.current.then(step, step)
  }, [focused, clothesline, reducedMotion])

  useFrame((state, delta) => {
    clothesline.advance(Math.min(delta, 0.05))
    paint.time.value = state.clock.elapsedTime
    if (root.current) paint.roomInverse.value.copy(root.current.matrixWorld).invert()
  })

  return (
    <group ref={root}>
      <SkyBox width={26} height={14} depth={26} />
      <Sun position={[5, 7.5, -20]} scale={2.6} />
      <Motes centre={[0, 2.6, -5]} area={[8, 4, 6]} count={40} seed={12} />
      <GalleryScenery paint={paint} />
      <GalleryClouds />
      <FlyingBird />
      <mesh geometry={geometries.rope} material={ropeMaterial} />
      {cards.map((card) => (
        <GalleryCard
          key={card.slot}
          ref={(handle) => {
            if (handle) handles.current.set(card.slot, handle)
            else handles.current.delete(card.slot)
          }}
          slot={card.slot}
          project={card.project}
          material={card.material}
          geometry={geometries.paper}
          pegGeometry={geometries.peg}
          pegMaterial={pegs[card.slot % projects.length].material}
          curve={curve}
          line={clothesline.line}
          lifted={lifted === card.slot}
          busy={busy}
          link={card.link}
        />
      ))}
    </group>
  )
}
