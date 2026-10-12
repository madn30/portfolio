const TEAR_FUNCTIONS = /* glsl */ `
float tearX(float y) {
  float x = 0.0;
  for (int i = 0; i < 4; i++) {
    x += uTear[i].x * sin(uTear[i].y * y + uTear[i].z);
  }
  return x;
}

float openAt(float y) {
  return (1.0 - smoothstep(max(uLength - 0.22, uLength * 0.3), uLength + 0.03, abs(y))) * smoothstep(0.0, 0.06, uLength);
}
`

export const TEAR_COMMON = /* glsl */ `
uniform float uSide;
uniform float uOffset;
uniform float uLength;
uniform float uPull;
uniform float uWedge;
uniform float uGrip;
uniform float uHold;
uniform float uTension;
uniform mat4 uTear;
uniform vec2 uHandPos;
uniform mat4 uBackShadowMatrix;
uniform mat4 uFrontShadowMatrix;
varying vec2 vPaper;
varying vec4 vBackShadowCoord;
varying vec4 vFrontShadowCoord;
${TEAR_FUNCTIONS}
`

export const TEAR_VERTEX = /* glsl */ `
float heightAt(vec2 p) {
  float px = p.x + uOffset;
  float py = p.y;
  float d = max(0.0, (px - tearX(py)) * uSide);
  float open = openAt(py);
  float g = distance(vec2(px, py), uHandPos);
  vec2 rel = vec2(px, py) - uHandPos;
  float band = 1.0 - smoothstep(0.17, 0.4, abs(rel.y));
  float hold = uHold * band;
  float z = open * exp(-d * 4.0) * (0.08 + 0.3 * uWedge) * (0.75 + 0.25 * sin(py * 9.0 + uSide));
  z *= smoothstep(0.04, 0.5, uLength);
  z *= 1.0 - 0.93 * hold;
  z += uGrip * 0.04 * exp(-g * g * 30.0);
  float away = length(rel);
  float fan = atan(rel.y, abs(rel.x) + 0.12);
  float ridges = sin(fan * 26.0) + 0.5 * sin(fan * 57.0 + 1.0);
  z += uTension * 0.0011 * ridges * exp(-away * 2.4) * smoothstep(0.05, 0.22, away);
  z += uTension * 0.012 * exp(-d * 9.0) * open * sin(py * 23.0 + 2.0 * uSide) * (1.0 - hold);
  z += 0.02 * sin(px * 1.6 + 0.5) + 0.012 * sin(py * 2.1 - 0.3);
  return z;
}

vec3 displace(vec3 p) {
  float px = p.x + uOffset;
  float py = p.y;
  float d = max(0.0, (px - tearX(py)) * uSide);
  float open = openAt(py);
  float edge = exp(-d * 6.0);
  vec3 q = p;
  q.x += uSide * (uPull + uWedge * open * edge);
  q.y += uSide * uWedge * open * edge * 0.08;
  q.z += heightAt(p.xy);
  return q;
}
`

export const TEAR_BEGIN_NORMAL = /* glsl */ `
vec3 tearDisplaced = displace(position);
float tearH = heightAt(position.xy);
float tearHx = heightAt(position.xy + vec2(0.01, 0.0));
float tearHy = heightAt(position.xy + vec2(0.0, 0.01));
vec3 objectNormal = normalize(vec3(-(tearHx - tearH) / 0.01, -(tearHy - tearH) / 0.01, 1.0));
vPaper = vec2(position.x + uOffset, position.y);
`

export const TEAR_BEGIN_VERTEX = /* glsl */ `
vec3 transformed = tearDisplaced;
`

export const TEAR_WORLDPOS_VERTEX = /* glsl */ `
#include <worldpos_vertex>
vBackShadowCoord = uBackShadowMatrix * modelMatrix * vec4(transformed, 1.0);
vFrontShadowCoord = uFrontShadowMatrix * modelMatrix * vec4(transformed, 1.0);
`

export const TEAR_FRAGMENT_COMMON = /* glsl */ `
uniform sampler2D uBackShadowMap;
uniform sampler2D uFrontShadowMap;
uniform float uBackShadowBias;
uniform float uContact;
uniform float uShade;

float tearHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float tearNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = tearHash(i);
  float b = tearHash(i + vec2(1.0, 0.0));
  float c = tearHash(i + vec2(0.0, 1.0));
  float d = tearHash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
`

export const TEAR_SHADOW_PARS = /* glsl */ `
#include <shadowmap_pars_fragment>
float throughPaper() {
  #ifdef USE_SHADOWMAP
  vec3 coord = vBackShadowCoord.xyz / vBackShadowCoord.w;
  if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0 || coord.z > 1.0) return 0.0;
  float turn = tearHash(gl_FragCoord.xy) * 6.2832;
  mat2 spin = mat2(cos(turn), -sin(turn), sin(turn), cos(turn));
  float blockers = 0.0;
  float depth = 0.0;
  for (int x = 0; x < 4; x++) {
    for (int y = 0; y < 4; y++) {
      vec2 offset = spin * ((vec2(float(x), float(y)) - 1.5) * 0.0075);
      float d = unpackRGBAToDepth(texture2D(uBackShadowMap, coord.xy + offset));
      if (d < coord.z - 0.0006) {
        blockers += 1.0;
        depth += d;
      }
    }
  }
  if (blockers < 0.5) return 0.0;
  float gap = max(0.0, coord.z - depth / blockers) * 9.5;
  float spread = clamp(0.0005 + gap * 0.011, 0.0005, 0.0075);
  float lit = 0.0;
  for (int x = 0; x < 5; x++) {
    for (int y = 0; y < 5; y++) {
      vec2 offset = spin * ((vec2(float(x), float(y)) - 2.0) * spread * 0.5);
      lit += texture2DCompare(uBackShadowMap, coord.xy + offset, coord.z - 0.0006);
    }
  }
  return (1.0 - lit / 25.0) * exp(-gap * 1.9);
  #else
  return 0.0;
  #endif
}

float occlusion(sampler2D map, vec4 base, float spread) {
  #ifdef USE_SHADOWMAP
  vec3 coord = base.xyz / base.w;
  coord.z += uBackShadowBias;
  if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0 || coord.z > 1.0) return 0.0;
  float lit = 0.0;
  for (int x = 0; x < 4; x++) {
    for (int y = 0; y < 4; y++) {
      vec2 offset = (vec2(float(x), float(y)) - 1.5) * spread;
      lit += texture2DCompare(map, coord.xy + offset, coord.z);
    }
  }
  return 1.0 - lit / 16.0;
  #else
  return 0.0;
  #endif
}
`

export const TEAR_MAP_FRAGMENT = /* glsl */ `
#include <map_fragment>
{
  float py = vPaper.y;
  float jag = (tearNoise(vec2(py * 70.0, 0.37)) - 0.5) * 0.022
    + (tearNoise(vec2(py * 260.0, 2.1)) - 0.5) * 0.006;
  float d = (vPaper.x - tearX(py) - jag) * uSide;
  float open = openAt(py);
  if (open > 0.001 && d < 0.0) discard;
  float fray = tearNoise(vec2(py * 420.0, 7.0));
  float fringe = smoothstep(0.0, 0.016, d - 0.01 * fray);
  diffuseColor.a *= mix(1.0, fringe, open);
  float bevel = (uSide < 0.0 ? 0.03 : 0.012) * (0.35 + tearNoise(vec2(py * 16.0, 3.0 + uSide)))
    + 0.006 * tearNoise(vec2(py * 90.0, 5.0));
  float inBevel = open * (1.0 - smoothstep(bevel - 0.003, bevel + 0.003, d));
  float fibre = tearNoise(vec2(vPaper.x * 240.0, py * 60.0)) * 0.6 + 0.4 * fray;
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.92, 0.915, 0.9) + 0.08 * fibre, inBevel);
  float stepLine = exp(-pow((d - bevel) / 0.0035, 2.0));
  diffuseColor.rgb *= 1.0 - 0.16 * open * stepLine;
  diffuseColor.rgb *= 1.0 - 0.1 * open * exp(-d * 14.0);
  diffuseColor.rgb *= 1.0 - 0.5 * uShade * throughPaper();
  diffuseColor.rgb *= 1.0 - 0.42 * uContact * occlusion(uFrontShadowMap, vFrontShadowCoord, 0.0035);
  if (!gl_FrontFacing) diffuseColor.rgb *= 0.9;
}
`

export const SHADOW_VERTEX = /* glsl */ `
varying vec2 vPaper;
void main() {
  vPaper = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const SHADOW_FRAGMENT = /* glsl */ `
uniform float uLength;
uniform float uPull;
uniform float uWedge;
uniform mat4 uTear;
varying vec2 vPaper;
${TEAR_FUNCTIONS}

void main() {
  float px = vPaper.x;
  float py = vPaper.y;
  float open = openAt(py);
  float tx = tearX(py);
  float spread = uPull + uWedge * open;
  float edgeL = tx - spread;
  float edgeR = tx + spread;
  float gap = step(edgeL, px) * step(px, edgeR);
  float a = 0.6 * (1.0 - smoothstep(0.0, 0.3, px - edgeL))
    + 0.25 * (1.0 - smoothstep(0.0, 0.12, edgeR - px));
  gl_FragColor = vec4(0.05, 0.04, 0.04, a * gap * open);
}
`
