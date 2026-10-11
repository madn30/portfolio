import { useState } from 'react'

let cachedResult: boolean | null = null

/** Probes for a usable WebGL context once per page load. */
export function detectWebGL(): boolean {
  if (cachedResult !== null) return cachedResult
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    cachedResult = Boolean(gl && typeof (gl as WebGLRenderingContext).getParameter === 'function')
    // Release the probe context immediately.
    const lose = (gl as WebGLRenderingContext | null)?.getExtension?.('WEBGL_lose_context')
    lose?.loseContext()
  } catch {
    cachedResult = false
  }
  return cachedResult
}

export function useWebGLSupport(): boolean {
  const [supported] = useState<boolean>(() => detectWebGL())
  return supported
}
