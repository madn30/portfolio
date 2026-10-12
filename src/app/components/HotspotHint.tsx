import { useEffect, useRef } from 'react'
import { useWorld } from '@/shared/store/worldStore'

export function HotspotHint() {
  const hint = useWorld((s) => s.hotspotHint)
  const element = useRef<HTMLDivElement>(null)
  const pointer = useRef({ x: -100, y: -100 })

  useEffect(() => {
    const place = () => {
      if (!element.current) return
      const { x, y } = pointer.current
      element.current.style.transform = `translate(${x + 18}px, ${y + 20}px)`
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      pointer.current = { x: event.clientX, y: event.clientY }
      place()
    }
    place()
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [hint])

  if (!hint) return null

  return (
    <div
      ref={element}
      aria-hidden="true"
      className="torn-wrap pointer-events-none fixed left-0 top-0 z-[35] will-change-transform"
    >
      <span className="torn block px-3.5 py-1.5 font-hand text-lg leading-tight text-ink">
        {hint}
      </span>
    </div>
  )
}
