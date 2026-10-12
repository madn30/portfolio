import * as THREE from 'three'
import { Note } from '@/features/world/rooms/shared'
import { CodeParticles } from '@/features/world/studio/CodeParticles'
import { Tower } from '@/features/world/studio/Tower'

function StudioSky() {
  return (
    <mesh position={[0, 3, -11.05]}>
      <boxGeometry args={[34, 30, 22]} />
      <meshBasicMaterial color="#f6f5f1" side={THREE.BackSide} />
    </mesh>
  )
}

export function SkillsRoom() {
  return (
    <>
      <StudioSky />
      <CodeParticles />
      <Tower />

      <Note
        lines={['the studio', 'drag to spin · scroll to climb', 'click a screen']}
        position={[0, 5.6, -12]}
        width={3.6}
        fontSize={60}
        color="#4a443f"
      />
    </>
  )
}
