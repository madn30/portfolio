import { memo } from 'react'
import type * as THREE from 'three'
import { InteractiveHotspot } from '@/features/world/corridor/components/InteractiveHotspot'
import { useScene } from '@/features/world/scene/SceneContext'
import { SketchEdges } from '@/features/world/corridor/components/SketchEdges'
import { HoverLift } from '@/features/world/rooms/ambient'
import type { StudioItem } from './content'
import { DEVICE_SIZE, SCREEN_SIZE, type DeviceGeometries } from './devices'
import type { TowerSlot } from './layout'

interface ShellMaterials {
  shell: THREE.Material
  shellDark: THREE.Material
  stand: THREE.Material
}

interface ShellProps {
  item: StudioItem
  geometries: DeviceGeometries
  materials: ShellMaterials
  screen: THREE.Material
  accent: THREE.Material
  glow: THREE.Material | null
  lit: boolean
  detailed: boolean
}

function Shell({
  item,
  geometries: g,
  materials,
  screen,
  accent,
  glow,
  lit,
  detailed,
}: ShellProps) {
  const { materials: scene } = useScene()
  const tone = lit ? 'accent' : 'ink'
  const passes = lit ? 3 : undefined
  const [sw, sh] = SCREEN_SIZE[item.device]
  const front = DEVICE_SIZE[item.device].depth / 2
  return (
    <>
      {item.device === 'monitor' && (
        <>
          <mesh geometry={g.monitorBody} material={materials.shell} />
          <SketchEdges
            geometry={g.monitorBody}
            seed={item.seed}
            jitter={0.01}
            subdivisions={5}
            tone={tone}
            passes={passes}
          />
          <mesh position={[0, 0, front + 0.001]} geometry={g.monitorScreen} material={screen} />
          <mesh position={[0, -0.61, 0]} geometry={g.monitorNeck} material={materials.stand} />
          <mesh position={[0, -0.74, 0]} geometry={g.monitorFoot} material={materials.stand} />
          <SketchEdges
            geometry={g.monitorFoot}
            position={[0, -0.74, 0]}
            seed={item.seed + 1}
            jitter={0.006}
            subdivisions={3}
            passes={1}
          />
          {detailed && <lineSegments geometry={g.monitorCable} material={scene.lineSoft} />}
        </>
      )}
      {item.device === 'tv' && (
        <>
          <mesh geometry={g.tvBody} material={materials.shell} />
          <SketchEdges
            geometry={g.tvBody}
            seed={item.seed}
            jitter={0.012}
            subdivisions={5}
            tone={tone}
            passes={passes}
          />
          <mesh position={[0, 0, -0.5]} geometry={g.tvHump} material={materials.shellDark} />
          <SketchEdges
            geometry={g.tvHump}
            position={[0, 0, -0.5]}
            seed={item.seed + 2}
            jitter={0.01}
            subdivisions={4}
            passes={1}
          />
          <mesh position={[-0.08, 0.04, front + 0.001]} geometry={g.tvScreen} material={screen} />
          <mesh
            position={[0.64, -0.3, front]}
            rotation={[Math.PI / 2, 0, 0]}
            geometry={g.tvKnob}
            material={accent}
          />
          <mesh
            position={[0.64, -0.46, front]}
            rotation={[Math.PI / 2, 0, 0]}
            geometry={g.tvKnob}
            material={materials.stand}
          />
          {[-0.55, 0.55].map((x) => (
            <mesh
              key={x}
              position={[x, -0.635, 0]}
              geometry={g.tvFoot}
              material={materials.stand}
            />
          ))}
          {detailed && <lineSegments geometry={g.tvAntenna} material={scene.line} />}
        </>
      )}
      {item.device === 'phone' && (
        <>
          <mesh geometry={g.phoneBody} material={materials.shell} />
          <SketchEdges
            geometry={g.phoneBody}
            seed={item.seed}
            jitter={0.006}
            subdivisions={4}
            tone={tone}
            passes={passes}
          />
          <mesh position={[0, -0.02, front + 0.001]} geometry={g.phoneScreen} material={screen} />
          <mesh position={[0.315, 0.2, 0]} geometry={g.phoneButton} material={materials.stand} />
          <mesh
            position={[0, 0.535, front]}
            rotation={[0, 0, Math.PI / 2]}
            geometry={g.phoneButton}
            material={materials.stand}
          />
        </>
      )}
      {glow && (
        <mesh
          position={[0, 0, front + 0.03]}
          scale={[sw * 1.5, sh * 1.6, 1]}
          geometry={g.glow}
          material={glow}
        />
      )}
    </>
  )
}

interface MonitorProps extends Omit<ShellProps, 'lit'> {
  index: number
  slot: TowerSlot
  hovered: boolean
  focused: boolean
  onActivate: (index: number) => void
  onHover: (index: number, hovered: boolean) => void
  register: (index: number, group: THREE.Group | null) => void
}

export const Monitor = memo(function Monitor({
  index,
  slot,
  hovered,
  focused,
  onActivate,
  onHover,
  register,
  ...shell
}: MonitorProps) {
  const { touch } = useScene()
  const { item } = shell
  const size = DEVICE_SIZE[item.device]
  return (
    <group
      ref={(el) => register(index, el)}
      position={[slot.x, slot.baseY, slot.z]}
      rotation={[0, slot.rot, 0]}
    >
      <InteractiveHotspot
        label={focused ? undefined : (item.skill ?? `${item.category.title} · all tools`)}
        onActivate={() => onActivate(index)}
        onHoverChange={(on) => onHover(index, on)}
        hitArea={[size.width + 0.2, size.height + 0.3, touch ? 0.9 : size.depth + 0.3]}
      >
        <HoverLift hovered={hovered && !focused} lift={0.04} scale={1.05}>
          <Shell {...shell} lit={hovered || focused} />
        </HoverLift>
      </InteractiveHotspot>
    </group>
  )
})
