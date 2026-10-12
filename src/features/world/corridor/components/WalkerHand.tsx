import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getDoor } from '@/shared/corridor/corridor'
import { createHand, createHandParts, HAND_SCALE } from '@/features/world/tear/handRig'
import { doorPush, handleGrip, pushPose } from '@/features/world/navigation/doorPush'
import { useToonMaterials } from '@/features/world/rooms/helpers'

const SIZE = 0.37 / HAND_SCALE
const LOWERED = new THREE.Vector3(0.36, -0.6, -0.45)
const SHOULDER = new THREE.Vector3(0.26, -0.5, 0.05)
const PALM = new THREE.Vector3(0, -0.8, -0.6)
const GRIP = new THREE.Vector3(-0.06, 0, 0.035)
const ARM_LENGTH = 1.5
const OPEN_CURL = 0.1
const GRIP_CURL = 0.8
const OUTLINE = 0.011
const FOREARM = new THREE.Vector3(1.5, 1.05, 1.05)
const COLORS = { skin: '#f1c9a5', nail: '#f8e1d6' }

function createOutlineMaterial(): THREE.MeshBasicMaterial {
  const material = new THREE.MeshBasicMaterial({ color: '#262421', side: THREE.BackSide })
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `vec3 transformed = position + normalize(normal) * ${OUTLINE.toFixed(4)};`,
    )
  }
  return material
}

export function WalkerHand() {
  const arm = useRef<THREE.Group>(null)
  const materials = useToonMaterials(COLORS)
  const outline = useMemo(createOutlineMaterial, [])
  const parts = useMemo(createHandParts, [])
  const hand = useMemo(() => {
    const created = createHand(parts, materials, true)
    const solids: THREE.Mesh[] = []
    created.group.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material === materials.skin) solids.push(child)
    })
    for (const solid of solids) {
      if (solid.geometry === parts.forearm) {
        solid.rotation.set(0, 0, 0.1)
        solid.scale.copy(FOREARM)
      }
      const edge = new THREE.Mesh(solid.geometry, outline)
      edge.position.copy(solid.position)
      edge.rotation.copy(solid.rotation)
      edge.scale.copy(solid.scale)
      solid.parent?.add(edge)
    }
    created.group.traverse((child) => {
      child.castShadow = false
      child.receiveShadow = false
    })
    return created
  }, [parts, materials, outline])
  const scratch = useMemo(
    () => ({
      grip: new THREE.Vector3(),
      at: new THREE.Vector3(),
      along: new THREE.Vector3(),
      thumb: new THREE.Vector3(),
      palm: new THREE.Vector3(),
      basis: new THREE.Matrix4(),
    }),
    [],
  )
  const curled = useRef(-1)

  useEffect(() => () => parts.dispose(), [parts])
  useEffect(() => () => outline.dispose(), [outline])

  useFrame(({ camera }) => {
    if (!arm.current) return
    const pose = doorPush.door ? pushPose(doorPush.time) : null
    arm.current.visible = pose !== null && pose.reach * pose.hold > 0.001
    if (!pose || !doorPush.door || !arm.current.visible) return
    const { grip, at, along, thumb, palm, basis } = scratch

    handleGrip(getDoor(doorPush.door), grip)
    along.copy(SHOULDER).applyQuaternion(camera.quaternion).add(camera.position)
    const within = THREE.MathUtils.smoothstep(ARM_LENGTH + 0.8 - along.distanceTo(grip), 0, 0.8)
    const reach = pose.reach * pose.hold * within
    at.copy(LOWERED).applyQuaternion(camera.quaternion).add(camera.position).lerp(grip, reach)
    along.sub(at).normalize()
    palm.copy(PALM).applyQuaternion(camera.quaternion)
    palm.addScaledVector(along, -palm.dot(along)).normalize()
    thumb.crossVectors(palm, along)
    arm.current.quaternion.setFromRotationMatrix(basis.makeBasis(along, thumb, palm))
    arm.current.position.copy(GRIP).applyQuaternion(arm.current.quaternion).negate().add(at)

    const curl = OPEN_CURL + (GRIP_CURL - OPEN_CURL) * pose.grip * pose.hold
    if (Math.abs(curl - curled.current) > 0.004) {
      curled.current = curl
      parts.setCurl(curl)
      hand.setCurl(curl)
    }
  })

  return (
    <group ref={arm} visible={false} scale={SIZE}>
      <primitive object={hand.group} />
    </group>
  )
}
