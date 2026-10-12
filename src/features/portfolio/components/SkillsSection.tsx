import { useEffect } from 'react'
import { closeSection } from '@/app/navigation'
import { findStudioItem } from '@/features/world/studio/content'
import { setStudioOpen, useStudio } from '@/features/world/studio/store'
import { accentHex } from '@/data/siteConfig'
import { skillCategories } from '@/data/skills'
import { ToolboxDoodle } from '@/shared/components/Doodles'
import { useHasRoom } from '@/shared/store/worldStore'
import { SectionPanel } from './SectionPanel'
import { MonitorOverlay } from './MonitorOverlay'

export function SkillsSection() {
  const openId = useStudio((s) => s.open)
  const openItem = openId ? (findStudioItem(openId) ?? null) : null

  useEffect(() => () => setStudioOpen(null), [])
  const hasRoom = useHasRoom()
  const hint = 'Drag to spin the tower of screens, scroll to climb it, click a screen to read it.'
  const onEscape = () => (openId ? setStudioOpen(null) : closeSection())

  if (hasRoom) {
    return (
      <>
        <SectionPanel id="skills" title="Skills" bare hint={hint} onEscape={onEscape}>
          {null}
        </SectionPanel>
        <MonitorOverlay item={openItem} onClose={() => setStudioOpen(null)} />
      </>
    )
  }

  return (
    <>
      <SectionPanel
        id="skills"
        eyebrow="tools I reach for"
        title="Skills"
        intro="Grouped by where they fit, not ranked by made-up percentages. These are the tools I actually use."
        hint={hint}
        onEscape={onEscape}
        wide
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {skillCategories.map((category, index) => {
            const accent = accentHex[category.accent]
            return (
              <section
                key={category.id}
                id={`skills-${category.id}`}
                data-reveal
                aria-labelledby={`skills-${category.id}-title`}
                className="sketch-border relative scroll-mt-24 bg-cream/85 p-6 shadow-sketch"
              >
                <span
                  className="absolute -top-3 left-5 bg-cream px-2 font-hand text-xl"
                  style={{ color: accent }}
                >
                  0{index + 1}
                </span>
                <h3 id={`skills-${category.id}-title`} className="text-2xl text-ink">
                  {category.title}
                </h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-graphite">{category.blurb}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-full border px-3 py-1 font-sans text-sm text-ink"
                      style={{ borderColor: accent, backgroundColor: `${accent}1a` }}
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}

          <div
            data-reveal
            className="flex items-end justify-center text-ink md:col-span-2 xl:col-span-1"
            aria-hidden="true"
          >
            <div className="text-center">
              <ToolboxDoodle className="mx-auto w-48" />
              <p className="font-hand text-lg text-charcoal">the toolbox, always growing</p>
            </div>
          </div>
        </div>
      </SectionPanel>
      <MonitorOverlay item={openItem} onClose={() => setStudioOpen(null)} />
    </>
  )
}
