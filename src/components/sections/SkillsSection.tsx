import { accentHex } from '@/data/siteConfig'
import { skillCategories } from '@/data/skills'
import { ToolboxDoodle } from '@/components/ui/Doodles'
import { SectionPanel } from './SectionPanel'

export function SkillsSection() {
  return (
    <SectionPanel
      id="skills"
      eyebrow="tools I reach for"
      title="Skills"
      intro="Grouped by where they fit, not ranked by made-up percentages. These are the tools I actually use."
      wide
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {skillCategories.map((category, index) => {
          const accent = accentHex[category.accent]
          return (
            <section
              key={category.id}
              data-reveal
              aria-labelledby={`skills-${category.id}`}
              className="sketch-border relative bg-cream/85 p-6 shadow-sketch"
            >
              <span
                className="absolute -top-3 left-5 bg-cream px-2 font-hand text-xl"
                style={{ color: accent }}
              >
                0{index + 1}
              </span>
              <h3 id={`skills-${category.id}`} className="text-2xl text-ink">
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
  )
}
