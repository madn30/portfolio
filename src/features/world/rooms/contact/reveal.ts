import * as THREE from 'three'

interface RevealUniforms {
  uReveal: { value: number }
  uRevealRange: { value: THREE.Vector2 }
  uRevealTint: { value: THREE.Color }
}

const NOISE = `
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

const WASH = `
#include <color_fragment>
if (uReveal > 0.001) {
  float rn = revealNoise(vec2(vRevealPos.x + vRevealPos.z, vRevealPos.y) * 6.0) * 0.18;
  float mask = (vRevealPos.y - uRevealRange.x) / (uRevealRange.y - uRevealRange.x) + rn;
  if (mask < uReveal * 1.2) diffuseColor.rgb *= uRevealTint;
}
`

export function createRevealUniforms(tint: string, span: number): RevealUniforms {
  return {
    uReveal: { value: 0 },
    uRevealRange: { value: new THREE.Vector2(0, span) },
    uRevealTint: { value: new THREE.Color('#ffffff').lerp(new THREE.Color(tint), 0.38) },
  }
}

export function applyReveal<M extends THREE.Material>(material: M, uniforms: RevealUniforms): M {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRevealPos;')
      .replace(
        '#include <worldpos_vertex>',
        '#include <worldpos_vertex>\nvRevealPos = (modelMatrix * vec4(position, 1.0)).xyz;',
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>\nuniform float uReveal;\nuniform vec2 uRevealRange;\nuniform vec3 uRevealTint;\nvarying vec3 vRevealPos;\n${NOISE}`,
      )
      .replace('#include <color_fragment>', WASH)
  }
  material.customProgramCacheKey = () => 'contact-reveal'
  return material
}
