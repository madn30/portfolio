import { useEffect, useRef, useState } from 'react'
import { DoorOpen, Home, Menu, X } from 'lucide-react'
import { goHome, openSection } from '@/app/navigation'
import type { Route } from '@/app/router'
import { doors, siteConfig } from '@/data/siteConfig'
import { setWorld, useWorld } from '@/store/worldStore'
import type { DoorSectionId } from '@/types'

interface NavigationProps {
  route: Route
}

/**
 * The conventional, always-available navigation: a logo that returns to the entrance and
 * one link per door. Mirrors the 3D hover state so the two feel like one system.
 */
export function Navigation({ route }: NavigationProps) {
  const [open, setOpen] = useState(false)
  const station = useWorld((s) => s.station)
  const hovered = useWorld((s) => s.hoveredDoor)
  const drawer = useRef<HTMLDivElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)

  const current: DoorSectionId | null =
    route.section !== 'home' ? route.section : station >= 0 ? doors[station].id : null

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggle.current?.focus()
      }
    }
    const onClick = (event: MouseEvent) => {
      if (
        !drawer.current?.contains(event.target as Node) &&
        !toggle.current?.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onClick)
    }
  }, [open])

  const select = (id: DoorSectionId) => {
    setOpen(false)
    openSection(id)
  }

  const items = doors.map((door) => {
    const isCurrent = current === door.id
    const isHovered = hovered === door.id
    return (
      <li key={door.id}>
        <button
          type="button"
          onClick={() => select(door.id)}
          onPointerEnter={() => setWorld({ hoveredDoor: door.id })}
          onPointerLeave={() => setWorld({ hoveredDoor: null })}
          onFocus={() => setWorld({ hoveredDoor: door.id })}
          onBlur={() => setWorld({ hoveredDoor: null })}
          aria-current={route.section === door.id ? 'page' : undefined}
          className={`group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left font-sans text-[15px] transition-colors lg:w-auto lg:py-1.5 ${
            isCurrent ? 'text-ink' : 'text-charcoal hover:text-ink'
          }`}
        >
          <span className="font-hand text-lg leading-none text-terracotta">{door.number}</span>
          <span
            className={`${isCurrent ? 'sketch-underline' : ''} ${isHovered ? 'translate-x-0.5' : ''} transition-transform`}
          >
            {door.label}
          </span>
          <span
            aria-hidden="true"
            className={`ml-auto h-1.5 w-1.5 rounded-full bg-terracotta transition-opacity lg:ml-0 ${
              isCurrent ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </button>
      </li>
    )
  })

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <button
          type="button"
          onClick={goHome}
          className="pointer-events-auto group flex items-center gap-2.5 rounded-md py-1 pr-2 text-left"
          aria-label={`${siteConfig.name} – return to the entrance`}
        >
          <span className="sketch-border flex h-9 w-9 items-center justify-center bg-cream text-ink transition-transform group-hover:-rotate-3">
            <Home size={17} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span className="hidden font-display text-[17px] text-ink sm:inline">
            {siteConfig.name}
          </span>
        </button>

        <nav aria-label="Sections" className="pointer-events-auto">
          <ul className="hidden items-center gap-1 rounded-full border border-ink/15 bg-cream/85 px-2 py-1 shadow-sketch lg:flex">
            {items}
          </ul>

          <button
            ref={toggle}
            type="button"
            className="sketch-border flex items-center gap-2 bg-cream px-3 py-2 text-sm font-medium text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="door-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
            <span>Doors</span>
          </button>

          <div
            id="door-menu"
            ref={drawer}
            hidden={!open}
            className="absolute right-4 top-16 w-60 rounded-lg border border-ink/20 bg-cream p-2 shadow-sketch lg:hidden"
          >
            <p className="flex items-center gap-2 px-2.5 pb-1.5 pt-1 font-hand text-lg text-charcoal">
              <DoorOpen size={16} aria-hidden="true" /> pick a door
            </p>
            <ul>{items}</ul>
          </div>
        </nav>
      </div>
    </header>
  )
}
