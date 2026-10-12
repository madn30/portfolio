import * as THREE from 'three'

const NOISE = `
uniform float uProgress;
float revealRand(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}
float revealNoise(vec2 p) {
  vec2 ip = floor(p);
  vec2 u = fract(p);
  u = u * u * (3.0 - 2.0 * u);
  float res = mix(
    mix(revealRand(ip), revealRand(ip + vec2(1.0, 0.0)), u.x),
    mix(revealRand(ip + vec2(0.0, 1.0)), revealRand(ip + vec2(1.0, 1.0)), u.x),
    u.y
  );
  return res * res;
}
`

const DISCARD = `
if (uProgress > 0.001) {
  float rn = revealNoise(vMapUv * 15.0) * 0.15;
  float maskValue = (1.0 - vMapUv.y) + rn;
  if (maskValue < uProgress * 1.5) discard;
}
`

export class RevealMaterial extends THREE.MeshBasicMaterial {
  private progress = 0
  private uniform: THREE.IUniform<number> | null = null

  get uProgress(): number {
    return this.progress
  }

  set uProgress(value: number) {
    this.progress = value
    if (this.uniform) this.uniform.value = value
  }

  override customProgramCacheKey(): string {
    return 'reveal-basic'
  }

  override onBeforeCompile(shader: THREE.WebGLProgramParametersWithUniforms): void {
    this.uniform = { value: this.progress }
    shader.uniforms.uProgress = this.uniform
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>${NOISE}`)
      .replace('#include <alphatest_fragment>', `#include <alphatest_fragment>${DISCARD}`)
  }
}

export function createRevealMaterial(map: THREE.Texture): RevealMaterial {
  const material = new RevealMaterial({
    map,
    transparent: true,
    side: THREE.DoubleSide,
    alphaTest: 0.1,
    depthWrite: false,
    toneMapped: false,
  })
  return material
}

export function createPaintedMaterial(map: THREE.Texture): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    map,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    alphaTest: 0.1,
    depthWrite: false,
    toneMapped: false,
  })
}
