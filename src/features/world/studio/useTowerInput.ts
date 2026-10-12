import { useEffect, type RefObject } from 'react'
import { useThree } from '@react-three/fiber'
import { isUnlocked, unlock } from '@/features/achievements'
import { beginDrag, endDrag, moveDrag, nudgeFall, type TowerState } from './physics'

function reward(): void {
  if (!isUnlocked('director')) unlock('director')
}

export function useTowerInput(
  state: RefObject<TowerState>,
  enabled: boolean,
  reducedMotion: boolean,
): void {
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    if (!enabled) return
    const canvas = gl.domElement
    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      beginDrag(state.current, event.clientX, event.clientY, event.timeStamp)
    }
    const onMove = (event: PointerEvent) => {
      if (moveDrag(state.current, event.clientX, event.clientY, event.timeStamp)) {
        canvas.style.cursor = 'grabbing'
        reward()
      }
    }
    const onUp = () => {
      if (!state.current.dragging) return
      endDrag(state.current)
      canvas.style.cursor = ''
      if (reducedMotion) state.current.velocity = 0
    }
    const onWheel = (event: WheelEvent) => {
      nudgeFall(state.current, event.deltaY)
      reward()
    }
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('wheel', onWheel)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      onUp()
    }
  }, [enabled, gl, reducedMotion, state])
}
