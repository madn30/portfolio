import { useState } from 'react'

let cachedResult: boolean | null = null

function detectWebGL(): boolean {
  if (cachedResult !== null) return cachedResult
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    cachedResult = gl !== null && 'getParameter' in gl && typeof gl.getParameter === 'function'
    const lose =
      gl !== null && 'getExtension' in gl ? gl.getExtension?.('WEBGL_lose_context') : null
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
