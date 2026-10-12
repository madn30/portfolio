import * as THREE from 'three'
import { CARD } from './galleryLayout'
import { injectPaintReveal, type PaintUniforms } from './paintReveal'

interface PaperFaces {
  front: THREE.Texture
  painted: THREE.Texture
  back: THREE.Texture
}

const VERTEX_HEAD = `
uniform float uBend;
uniform float uTime;
uniform float uWindStrength;
`

const VERTEX_BEND = `
#include <begin_vertex>
float paperY = transformed.y / ${(CARD.h / 2).toFixed(3)};
transformed.z += pow(paperY, 2.0) * uBend;
float totalWind = 0.02 + uWindStrength;
transformed.z += sin(uTime * 2.0 + paperY * 2.0) * totalWind * (1.0 + abs(uBend * 3.0));
`

const FRAGMENT_HEAD = `
uniform sampler2D mapBack;
uniform sampler2D mapPainted;
uniform float uProgress;
`

const FRAGMENT_MAP = `
vec4 texColor = texture2D(map, vMapUv);
if (gl_FrontFacing && uProgress > 0.001) {
  vec4 paintedColor = texture2D(mapPainted, vMapUv);
  float rn = revealNoise(vMapUv * 15.0) * 0.15;
  float maskValue = (1.0 - vMapUv.y) + rn;
  if (maskValue < uProgress * 1.5) texColor = paintedColor;
}
vec4 backColor = texture2D(mapBack, vec2(vMapUv.x, 1.0 - vMapUv.y));
diffuseColor *= gl_FrontFacing ? texColor : backColor;
`

export class PaperMaterial extends THREE.MeshBasicMaterial {
  readonly bend = { value: 0 }
  readonly wind = { value: 0 }
  readonly reveal = { value: 0 }
  private readonly painted: { value: THREE.Texture }
  private readonly back: { value: THREE.Texture }
  private readonly paint: PaintUniforms

  constructor(faces: PaperFaces, paint: PaintUniforms) {
    super({ map: faces.front, side: THREE.DoubleSide, toneMapped: false })
    this.painted = { value: faces.painted }
    this.back = { value: faces.back }
    this.paint = paint
  }

  override customProgramCacheKey(): string {
    return 'gallery-paper'
  }

  override onBeforeCompile(shader: THREE.WebGLProgramParametersWithUniforms): void {
    injectPaintReveal(shader, this.paint)
    shader.uniforms.uBend = this.bend
    shader.uniforms.uWindStrength = this.wind
    shader.uniforms.uProgress = this.reveal
    shader.uniforms.uTime = this.paint.time
    shader.uniforms.mapBack = this.back
    shader.uniforms.mapPainted = this.painted
    shader.vertexShader = VERTEX_HEAD + shader.vertexShader
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', VERTEX_BEND)
    shader.fragmentShader = FRAGMENT_HEAD + shader.fragmentShader
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', FRAGMENT_MAP)
  }
}
