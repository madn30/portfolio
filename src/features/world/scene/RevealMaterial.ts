import * as THREE from 'three'

const NOISE = `#include <common>
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
}`

const DISCARD = `#include <alphatest_fragment>
if (uProgress > 0.001) {
  float rn = revealNoise(vMapUv * 15.0) * 0.15;
  float maskValue = vMapUv.y + rn;
  if (maskValue < uProgress * 1.5) discard;
}`

export class RevealMaterial extends THREE.MeshBasicMaterial {
  private readonly progressUniform = { value: 0 }

  get progress(): number {
    return this.progressUniform.value
  }

  set progress(value: number) {
    this.progressUniform.value = value
  }

  override customProgramCacheKey(): string {
    return 'reveal-material'
  }

  override onBeforeCompile(shader: THREE.WebGLProgramParametersWithUniforms): void {
    shader.uniforms.uProgress = this.progressUniform
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', NOISE)
      .replace('#include <alphatest_fragment>', DISCARD)
  }
}
