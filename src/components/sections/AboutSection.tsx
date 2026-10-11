import { about } from '@/data/about'
import { siteConfig } from '@/data/siteConfig'
import { DeskDoodle } from '@/components/ui/Doodles'
import { Tag } from '@/components/ui/Tag'
import { SectionPanel } from './SectionPanel'

export function AboutSection() {
  return (
    <SectionPanel
      id="about"
      eyebrow="who I am"
      title={`A developer who likes the quiet parts of building things.`}
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_200px] lg:gap-14">
        <div className="space-y-10">
          <div data-reveal>
            <h3 className="font-hand text-2xl text-terracotta">Summary</h3>
            <p className="mt-2 text-lg leading-relaxed text-ink">{about.summary}</p>
          </div>

          <div data-reveal>
            <h3 className="font-hand text-2xl text-terracotta">Experience</h3>
            <p className="mt-2 leading-relaxed text-graphite">{about.experience}</p>
          </div>

          <div data-reveal>
            <h3 className="font-hand text-2xl text-terracotta">Technical interests</h3>
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Technical interests">
              {about.interests.map((interest) => (
                <li key={interest}>
                  <Tag>{interest}</Tag>
                </li>
              ))}
            </ul>
          </div>

          <div data-reveal>
            <h3 className="font-hand text-2xl text-terracotta">Engineering philosophy</h3>
            <ol className="mt-3 space-y-3">
              {about.philosophy.map((item, i) => (
                <li key={item.title} className="flex gap-4">
                  <span className="font-hand text-xl leading-7 text-pencil">0{i + 1}</span>
                  <div>
                    <p className="font-display text-lg text-ink">{item.title}</p>
                    <p className="text-graphite">{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div data-reveal className="sketch-border bg-cream/80 px-5 py-4">
            <h3 className="font-hand text-2xl text-terracotta">Current focus</h3>
            <p className="mt-1 text-ink">{about.currentFocus}</p>
          </div>
        </div>

        <aside data-reveal className="text-ink lg:pt-2" aria-hidden="true">
          <DeskDoodle className="w-44 lg:w-full" />
          <p className="mt-2 font-hand text-lg text-charcoal">
            the desk, most days · {siteConfig.location}
          </p>
        </aside>
      </div>
    </SectionPanel>
  )
}
