import { useEffect, useMemo } from 'react'
import type { RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { createHand, createHandMaterials, createHandParts } from './handRig'
import { createSkinTextures } from './skinTextures'
import { handPosition, PALM_Z, tearPose, tearSlope } from './tearProfile'
import type { TearOctave } from './tearProfile'
import type { TearDriver } from './PaperTearScene'

const SIDES = [-1, 1] as const
const FLAT_TILT = 0.5
const HOOK_TILT = 0.06
const FLAT_Z = -0.31
const WRIST_BACK = 0.3
const APPROACH_DEPTH = 0.75

interface HandsProps {
  tear: RefObject<TearDriver>
  profile: TearOctave[]
}

export function Hands({ tear, profile }: HandsProps) {
  const aspect = useThree((s) => s.size.width / s.size.height)
  const textures = useMemo(createSkinTextures, [])
  const materials = useMemo(() => createHandMaterials(textures), [textures])
  const parts = useMemo(createHandParts, [])
  const hands = useMemo(
    () => SIDES.map((side) => createHand(parts, materials, side > 0)),
    [parts, materials],
  )

  useEffect(() => () => parts.dispose(), [parts])
  useEffect(
    () => () => {
      materials.skin.dispose()
      materials.nail.dispose()
      textures.albedo.dispose()
      textures.normal.dispose()
    },
    [materials, textures],
  )

  useFrame(() => {
    const pose = tearPose(tear.current.t, aspect)
    parts.setCurl(pose.reach)
    hands.forEach((hand, i) => {
      const side = SIDES[i]
      const [x, y] = handPosition(profile, side, pose)
      const away = 1 - pose.approach
      const flat = 1 - pose.reach
      const sway = Math.sin(tear.current.t * 21 + i * 1.7) * 0.012 * flat * pose.approach
      hand.group.position.set(
        x + side * (0.32 * away + sway),
        y - 0.34 * away + sway * 0.6,
        FLAT_Z + (PALM_Z - FLAT_Z) * pose.reach - APPROACH_DEPTH * away,
      )
      hand.group.rotation.y = side * (WRIST_BACK * flat + 0.25 * away)
      hand.group.rotation.z =
        -side * (FLAT_TILT + (HOOK_TILT - FLAT_TILT) * pose.reach + 0.22 * away) -
        Math.atan(tearSlope(profile, y)) * pose.reach
      hand.setCurl(pose.reach)
    })
  })

  return (
    <>
      {hands.map((hand, i) => (
        <primitive key={SIDES[i]} object={hand.group} />
      ))}
    </>
  )
}
