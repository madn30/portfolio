import { useEffect, useRef, type ReactNode } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { setWorld, worldStore } from '@/shared/store/worldStore'

interface InteractiveHotspotProps {
  onActivate?: () => void
  onHoverChange?: (hovered: boolean) => void
  label?: string
  hitArea?: [width: number, height: number, depth: number]
  hitAreaPosition?: [number, number, number]
  disabled?: boolean
  children: ReactNode
}

let hoverCount = 0

function setCursor(hovering: boolean): void {
  hoverCount = Math.max(0, hoverCount + (hovering ? 1 : -1))
  document.body.style.cursor = hoverCount > 0 ? 'pointer' : ''
}

function hideHint(label: string | null): void {
  if (label && worldStore.getState().hotspotHint === label) setWorld({ hotspotHint: null })
}

export function InteractiveHotspot({
  onActivate,
  onHoverChange,
  label,
  hitArea,
  hitAreaPosition = [0, 0, 0],
  disabled = false,
  children,
}: InteractiveHotspotProps) {
  const hovered = useRef(false)
  const leaving = useRef(false)
  const shownLabel = useRef<string | null>(null)
  const callbacks = useRef({ onActivate, onHoverChange })
  callbacks.current = { onActivate, onHoverChange }

  const showHint = (next: string | undefined) => {
    hideHint(shownLabel.current)
    shownLabel.current = next ?? null
    if (next) setWorld({ hotspotHint: next })
  }

  const leave = () => {
    leaving.current = false
    if (!hovered.current) return
    hovered.current = false
    setCursor(false)
    hideHint(shownLabel.current)
    shownLabel.current = null
    callbacks.current.onHoverChange?.(false)
  }

  useEffect(() => {
    if (hovered.current && shownLabel.current !== (label ?? null)) showHint(label)
  })

  useEffect(() => leave, [])

  useEffect(() => {
    if (disabled) leave()
  }, [disabled])

  const onPointerOver = (event: ThreeEvent<PointerEvent>) => {
    if (disabled) return
    event.stopPropagation()
    leaving.current = false
    if (hovered.current) return
    hovered.current = true
    setCursor(true)
    if (event.nativeEvent.pointerType !== 'touch') showHint(label)
    callbacks.current.onHoverChange?.(true)
  }

  // Fiber re-keys hover by hit index, so one pointer move across the leaf, frame and hit
  // box fires out then over on this group. Leave only if no over follows in the same event.
  const onPointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    if (leaving.current) return
    leaving.current = true
    queueMicrotask(() => {
      if (leaving.current) leave()
    })
  }

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    if (disabled) return
    event.stopPropagation()
    if ((event.nativeEvent as PointerEvent).pointerType === 'touch') leave()
    callbacks.current.onActivate?.()
  }

  return (
    <group onPointerOver={onPointerOver} onPointerOut={onPointerOut} onClick={onClick}>
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
