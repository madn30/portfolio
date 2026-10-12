import * as THREE from 'three'
import type { TearOctave } from './tearProfile'
import {
  SHADOW_FRAGMENT,
  SHADOW_VERTEX,
  TEAR_BEGIN_NORMAL,
  TEAR_BEGIN_VERTEX,
  TEAR_COMMON,
  TEAR_FRAGMENT_COMMON,
  TEAR_MAP_FRAGMENT,
  TEAR_SHADOW_PARS,
  TEAR_VERTEX,
  TEAR_WORLDPOS_VERTEX,
} from './tearShader'

export interface PaperUniforms {
  uSide: THREE.IUniform<number>
  uOffset: THREE.IUniform<number>
  uLength: THREE.IUniform<number>
  uPull: THREE.IUniform<number>
  uWedge: THREE.IUniform<number>
  uGrip: THREE.IUniform<number>
  uHold: THREE.IUniform<number>
  uTension: THREE.IUniform<number>
  uTear: THREE.IUniform<THREE.Matrix4>
  uHandPos: THREE.IUniform<THREE.Vector2>
  uBackShadowMap: THREE.IUniform<THREE.Texture | null>
  uFrontShadowMap: THREE.IUniform<THREE.Texture | null>
  uFrontShadowMatrix: THREE.IUniform<THREE.Matrix4>
  uContact: THREE.IUniform<number>
  uShade: THREE.IUniform<number>
  uBackShadowMatrix: THREE.IUniform<THREE.Matrix4>
  uBackShadowBias: THREE.IUniform<number>
}

export interface PaperTextures {
  albedo: THREE.Texture
  normal: THREE.Texture
}

export function tearMatrix(profile: TearOctave[]): THREE.Matrix4 {
  const matrix = new THREE.Matrix4()
  profile.forEach(([amplitude, frequency, phase], column) => {
    matrix.elements[column * 4] = amplitude
    matrix.elements[column * 4 + 1] = frequency
    matrix.elements[column * 4 + 2] = phase
    matrix.elements[column * 4 + 3] = 0
  })
  return matrix
}

export function createPaperUniforms(
  side: number,
  offset: number,
  tear: THREE.Matrix4,
): PaperUniforms {
  return {
    uSide: { value: side },
    uOffset: { value: offset },
    uLength: { value: 0 },
    uPull: { value: 0 },
    uWedge: { value: 0 },
    uGrip: { value: 0 },
    uHold: { value: 0 },
    uTension: { value: 0 },
    uTear: { value: tear },
    uHandPos: { value: new THREE.Vector2(side, 0) },
    uBackShadowMap: { value: null },
    uFrontShadowMap: { value: null },
    uFrontShadowMatrix: { value: new THREE.Matrix4() },
    uContact: { value: 0 },
    uShade: { value: 0 },
    uBackShadowMatrix: { value: new THREE.Matrix4() },
    uBackShadowBias: { value: -0.0005 },
  }
}

export function createPaperMaterial(
  textures: PaperTextures,
  uniforms: PaperUniforms,
): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    map: textures.albedo,
    normalMap: textures.normal,
    normalScale: new THREE.Vector2(0.5, 0.5),
    roughness: 0.96,
    metalness: 0,
    side: THREE.DoubleSide,
    transparent: true,
  })
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${TEAR_COMMON}\n${TEAR_VERTEX}`)
      .replace('#include <beginnormal_vertex>', TEAR_BEGIN_NORMAL)
      .replace('#include <begin_vertex>', TEAR_BEGIN_VERTEX)
      .replace('#include <worldpos_vertex>', TEAR_WORLDPOS_VERTEX)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${TEAR_COMMON}\n${TEAR_FRAGMENT_COMMON}`)
      .replace('#include <shadowmap_pars_fragment>', TEAR_SHADOW_PARS)
      .replace('#include <map_fragment>', TEAR_MAP_FRAGMENT)
  }
  material.customProgramCacheKey = () => 'paper-tear'
  return material
}

export function createShadowMaterial(tear: THREE.Matrix4): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uLength: { value: 0 },
      uPull: { value: 0 },
      uWedge: { value: 0 },
      uTear: { value: tear },
    },
    vertexShader: SHADOW_VERTEX,
    fragmentShader: SHADOW_FRAGMENT,
    transparent: true,
    depthWrite: false,
  })
}
