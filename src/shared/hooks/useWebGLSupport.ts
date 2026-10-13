import { useState } from 'react'

export type WebGLSupport = 'hardware' | 'software' | 'none'

const SOFTWARE_RENDERER =
  /swiftshader|llvmpipe|softpipe|software (rasterizer|renderer|adapter)|mesa offscreen|microsoft basic render|apple software renderer/i

let cachedResult: WebGLSupport | null = null

function rendererName(gl: WebGL2RenderingContext): string {
  const debug = gl.getExtension('WEBGL_debug_renderer_info')
  const renderer = debug
    ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)
    : gl.getParameter(gl.RENDERER)
  return typeof renderer === 'string' ? renderer : ''
}

function detectWebGL(): WebGLSupport {
  if (cachedResult !== null) return cachedResult
  try {
    const gl = document.createElement('canvas').getContext('webgl2')
    if (gl === null) {
      cachedResult = 'none'
    } else {
      cachedResult = SOFTWARE_RENDERER.test(rendererName(gl)) ? 'software' : 'hardware'
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  } catch {
    cachedResult = 'none'
  }
  return cachedResult
}

export function useWebGLSupport(): WebGLSupport {
  const [supported] = useState<WebGLSupport>(() => detectWebGL())
  return supported
}
