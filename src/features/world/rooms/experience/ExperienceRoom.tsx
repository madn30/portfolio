import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWorld } from '@/shared/store/worldStore'
import { useScene } from '@/features/world/scene/SceneContext'
import { Birds, Sun } from '@/features/world/rooms/ambient'
import { Camp } from './Camp'
import { CAMP_ACCENTS, CAMP_POINTS, LIFT, RIDGES, RIDGE_Z, TRAIL } from './layout'
import { Mountain } from './Mountain'
import { Sheet } from './Sheet'
import { chapters, selectChapter, useChapter } from './store'
import { Hiker, Mist } from './terrain'
import type { Vec3 } from '@/features/world/rooms/flight'
import { SkyCard, SkyCloud, SkyPaper } from '@/features/world/rooms/sky'

export function ExperienceRoom() {
  const { materials: scene, reducedMotion } = useScene()
  const active = useWorld((s) => s.activeDoor) === 'experience'
  const selected = useChapter()
  const setSelected = selectChapter
  const [hovered, setHovered] = useState<number | null>(null)

  const trail = useMemo(() => {
    const points = TRAIL.map(([x, y]) => new THREE.Vector3(x, y, RIDGE_Z + 0.04))
    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.3)
    const campT = CAMP_POINTS.map((index) => {
      const point = points[index]
      let best = 0
      let bestDistance = Infinity
      curve.getSpacedPoints(400).forEach((p, i) => {
        const d = p.distanceTo(point)
        if (d < bestDistance) {
          bestDistance = d
          best = i / 400
        }
      })
      return best
    })
    const samples = curve.getSpacedPoints(160)
    const positions: number[] = []
    for (let i = 0; i < samples.length - 1; i += 2) {
      const a = samples[i]
      const b = samples[i + 1]
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z)
    }
    const dashes = new THREE.BufferGeometry()
    dashes.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    const walked = dashes.clone()
    walked.setDrawRange(0, 0)
    return { curve, campT, dashes, walked }
  }, [])
  useEffect(
    () => () => {
      trail.dashes.dispose()
      trail.walked.dispose()
    },
    [trail],
  )

  const walkedMaterial = useMemo(() => new THREE.LineBasicMaterial({ color: '#d2483c' }), [])
  useEffect(() => () => walkedMaterial.dispose(), [walkedMaterial])

  const camps = useMemo(
    () =>
      chapters.map((entry, i) => {
        const [x, y] = TRAIL[CAMP_POINTS[i] ?? TRAIL.length - 1]
        return { entry, position: [x, y, RIDGE_Z + 0.05] as Vec3, accent: CAMP_ACCENTS[i % 3] }
      }),
    [],
  )

  const drawn = useRef(trail.campT[selected] ?? 1)
  const vertexCount = trail.walked.getAttribute('position').count
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const target = trail.campT[selected] ?? 1
    drawn.current = reducedMotion
      ? target
      : drawn.current + (target - drawn.current) * (1 - Math.exp(-dt * 2.2))
    trail.walked.setDrawRange(0, Math.floor((drawn.current * vertexCount) / 2) * 2)
  })

  return (
    <group>
      <SkyPaper active={active} />
      <Sun position={[-9.5, 9.6, -23.5]} scale={2.6} />
      <Birds centre={[-3, 7.2, -17]} spread={2.4} seed={21} />

      <group position={[0, LIFT, 0]}>
        {RIDGES.map((ridge) => (
          <Mountain key={ridge.seed} ridge={ridge} />
        ))}

        <Mist position={[0, -2.2, -13.4]} width={40} height={4.4} speed={0.014} />
        <Mist position={[0, -0.6, -15.6]} width={36} height={5} speed={0.012} />
        <Mist position={[0, 0.6, -20.6]} width={40} height={7} speed={-0.008} />
        <SkyCloud position={[-9.5, 3.4, -16.5]} scale={2.6} seed={61} drift={0.02} />
        <SkyCloud position={[9.8, 4.6, -16.8]} scale={2.2} seed={62} drift={0.02} />
        <SkyCloud position={[-2, 6.9, -22]} scale={3.0} seed={63} drift={0.02} />

        <lineSegments geometry={trail.dashes} material={scene.lineSoft} />
        <lineSegments geometry={trail.walked} material={walkedMaterial} />
        <Hiker curve={trail.curve} t={trail.campT[selected] ?? 1} />

        {camps.map(({ entry, position, accent }, i) => (
          <Camp
            key={entry.id}
            position={position}
            accent={accent}
            summit={i === camps.length - 1}
            index={i}
            eyebrow={`${entry.start} — ${entry.end}`}
            title={entry.company}
            selected={selected === i}
            hovered={hovered === i}
            onHover={(h) => setHovered((current) => (h ? i : current === i ? null : current))}
            onSelect={() => setSelected(i)}
          />
        ))}
      </group>

      {camps.map(({ entry, accent }, i) => (
        <Sheet key={entry.id} open={selected === i}>
          <SkyCard
            position={[0, 0, 0]}
            width={4.5}
            height={2.3}
            eyebrow={`${entry.start} — ${entry.end}  ·  ${i + 1} of ${camps.length}`}
            title={entry.company}
            subtitle={entry.role}
            body={entry.description}
            footer={entry.technologies.join(' · ')}
            accent={accent}
            titleSize={74}
            bodySize={36}
            seed={420 + i}
            label="Next chapter"
            hovered={false}
            onHover={() => undefined}
            onActivate={() => setSelected(i + 1)}
            disabled={selected !== i}
          />
        </Sheet>
      ))}
    </group>
  )
}
