import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useScene } from '@/features/world/scene/SceneContext'
import { HORIZON, SKY } from './flight'

export function useToonMaterials<K extends string>(
  colors: Record<K, string>,
): Record<K, THREE.MeshToonMaterial> {
  const { materials } = useScene()
  const key = JSON.stringify(colors)
  const result = useMemo(() => {
    const out = {} as Record<K, THREE.MeshToonMaterial>
    for (const name of Object.keys(colors) as K[]) {
      out[name] = new THREE.MeshToonMaterial({
        color: colors[name],
        gradientMap: materials.wall.gradientMap,
      })
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, materials])
  useEffect(
    () => () => Object.values<THREE.MeshToonMaterial>(result).forEach((m) => m.dispose()),
    [result],
  )
  return result
}

export function useSkyMaterial(): THREE.MeshBasicMaterial {
  const material = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false })
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uSkyTop = { value: new THREE.Color(SKY) }
      shader.uniforms.uSkyLow = { value: new THREE.Color(HORIZON) }
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vSkyDir;')
        .replace(
          '#include <project_vertex>',
          '#include <project_vertex>\nvSkyDir = (modelMatrix * vec4(transformed, 1.0)).xyz - cameraPosition;',
        )
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          '#include <common>\nvarying vec3 vSkyDir;\nuniform vec3 uSkyTop;\nuniform vec3 uSkyLow;',
        )
        .replace(
          '#include <color_fragment>',
          'diffuseColor.rgb = mix(uSkyLow, uSkyTop, smoothstep(-0.02, 0.34, normalize(vSkyDir).y));',
        )
    }
    m.customProgramCacheKey = () => 'sky-gradient'
    return m
  }, [])
  useEffect(() => () => material.dispose(), [material])
  return material
}

export function usePaperPlaneGeometry(): THREE.BufferGeometry {
  const geometry = useMemo(() => {
    const nose: [number, number, number] = [0, 0, -1]
    const tailL: [number, number, number] = [-0.72, 0.08, 0.62]
    const tailR: [number, number, number] = [0.72, 0.08, 0.62]
    const spine: [number, number, number] = [0, 0, 0.55]
    const keel: [number, number, number] = [0, -0.26, 0.5]
    const tris = [
      [nose, tailL, spine],
      [nose, spine, tailR],
      [nose, keel, spine],
    ]
    const positions = new Float32Array(tris.flat(2))
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.computeVertexNormals()
    return g
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  return geometry
}
