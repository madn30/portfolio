import * as THREE from 'three'

export interface PaintUniforms {
  progress: { value: number }
  roomInverse: { value: THREE.Matrix4 }
  time: { value: number }
}

export function createPaintUniforms(): PaintUniforms {
  return {
    progress: { value: 1 },
    roomInverse: { value: new THREE.Matrix4() },
    time: { value: 0 },
  }
}

const NOISE_GLSL = `
float paintHash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}
float paintNoise(vec2 x) {
  vec2 i = floor(x);
  vec2 f = fract(x);
  float a = paintHash(i);
  float b = paintHash(i + vec2(1.0, 0.0));
  float c = paintHash(i + vec2(0.0, 1.0));
  float d = paintHash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
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

const PAINT_VERTEX = `
uniform mat4 uRoomInverse;
varying vec3 vRoomPos;
`

const PAINT_FRAGMENT_HEAD = `
uniform float uPaintProgress;
varying vec3 vRoomPos;
${NOISE_GLSL}
`

const PAINT_FRAGMENT = `
#include <dithering_fragment>
vec3 revealDir = normalize(vec3(0.1, 0.0, -1.0));
float targetDist = mix(-3.0, 30.0, uPaintProgress);
float distFromPlane = targetDist - dot(vRoomPos, revealDir);
float n = paintNoise(vRoomPos.xy * 2.0) * 2.0;
float n2 = paintNoise(vRoomPos.xy * 8.0) * 0.5;
float boundary = distFromPlane + n + n2;
if (boundary < 0.0) discard;
if (uPaintProgress < 0.999 && boundary < 2.0) {
  float glow = smoothstep(2.0, 0.0, boundary);
  gl_FragColor.rgb += vec3(glow * 0.4, glow * 0.5, glow * 0.7);
}
`

export function injectPaintReveal(
  shader: THREE.WebGLProgramParametersWithUniforms,
  paint: PaintUniforms,
): void {
  shader.uniforms.uPaintProgress = paint.progress
  shader.uniforms.uRoomInverse = paint.roomInverse
  shader.vertexShader = PAINT_VERTEX + shader.vertexShader
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    '#include <begin_vertex>\nvRoomPos = (uRoomInverse * modelMatrix * vec4(transformed, 1.0)).xyz;',
  )
  shader.fragmentShader = PAINT_FRAGMENT_HEAD + shader.fragmentShader
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <dithering_fragment>',
    PAINT_FRAGMENT,
  )
}

export class PaintedBasicMaterial extends THREE.MeshBasicMaterial {
  private readonly paint: PaintUniforms

  constructor(paint: PaintUniforms, params?: THREE.MeshBasicMaterialParameters) {
    super(params)
    this.paint = paint
  }

  override customProgramCacheKey(): string {
    return 'gallery-painted-basic'
  }

  override onBeforeCompile(shader: THREE.WebGLProgramParametersWithUniforms): void {
    injectPaintReveal(shader, this.paint)
  }
}
