import { useEffect, useRef, type ReactNode } from 'react'
import type { ThreeEvent } from '@react-three/fiber'

interface InteractiveHotspotProps {
  onActivate?: () => void
  onHoverChange?: (hovered: boolean) => void
  /** Optional invisible box that enlarges the hit target (useful on touch screens). */
  hitArea?: [width: number, height: number, depth: number]
  hitAreaPosition?: [number, number, number]
  position?: [number, number, number]
  rotation?: [number, number, number]
  disabled?: boolean
  children: ReactNode
}

let hoverCount = 0

function setCursor(hovering: boolean): void {
  hoverCount = Math.max(0, hoverCount + (hovering ? 1 : -1))
  document.body.style.cursor = hoverCount > 0 ? 'pointer' : ''
}

/**
 * Wraps any part of the scene and makes it clickable via R3F's pointer events (raycasting).
 * Handles the pointer cursor and hover bookkeeping; the visual response is up to the child.
 */
export function InteractiveHotspot({
  onActivate,
  onHoverChange,
  hitArea,
  hitAreaPosition = [0, 0, 0],
  position,
  rotation,
  disabled = false,
  children,
}: InteractiveHotspotProps) {
  const hovered = useRef(false)
  // Latest callbacks live in refs so re-renders never reset the hover state.
  const callbacks = useRef({ onActivate, onHoverChange })
  callbacks.current = { onActivate, onHoverChange }

  const leave = () => {
    if (!hovered.current) return
    hovered.current = false
    setCursor(false)
    callbacks.current.onHoverChange?.(false)
  }

  // Restore the cursor if this hotspot unmounts while hovered.
  useEffect(() => leave, [])

  // Clear the hover when the hotspot becomes disabled under the pointer.
  useEffect(() => {
    if (disabled) leave()
  }, [disabled])

  const onPointerOver = (event: ThreeEvent<PointerEvent>) => {
    if (disabled) return
    event.stopPropagation()
    if (hovered.current) return
    hovered.current = true
    setCursor(true)
    callbacks.current.onHoverChange?.(true)
  }

  const onPointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    leave()
  }

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    if (disabled) return
    event.stopPropagation()
    // Touch devices have no hover; clear the pointer state so it doesn't linger.
    if ((event.nativeEvent as PointerEvent).pointerType === 'touch') leave()
    callbacks.current.onActivate?.()
  }

  return (
    <group
      position={position}
      rotation={rotation}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
    >
      {hitArea && (
        <mesh position={hitAreaPosition} visible={false}>
          <boxGeometry args={hitArea} />
          <meshBasicMaterial />
        </mesh>
      )}
      {children}
    </group>
  )
}
