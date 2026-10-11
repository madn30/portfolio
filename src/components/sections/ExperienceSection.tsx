import { experience } from '@/data/experience'
import { Tag } from '@/components/ui/Tag'
import { SectionPanel } from './SectionPanel'

export function ExperienceSection() {
  return (
    <SectionPanel
      id="experience"
      eyebrow="where I have worked"
      title="Experience"
      intro="A short timeline. Every entry here is a labelled placeholder — fill in src/data/experience.ts with your real roles."
    >
      <ol className="relative ml-3 border-l border-dashed border-ink/40 pl-8 sm:ml-6 sm:pl-10">
        {experience.map((entry, index) => (
          <li key={entry.id} data-reveal className="relative pb-12 last:pb-0">
            <span
              aria-hidden="true"
              className="absolute -left-[2.56rem] top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-ink bg-cream sm:-left-[3.06rem]"
            >
              <span className="h-2 w-2 rounded-full bg-terracotta" />
            </span>
            <p className="font-hand text-xl text-terracotta">
              {entry.start} — {entry.end}
              {entry.isPlaceholder && <span className="text-charcoal"> · placeholder</span>}
            </p>
            <h3 className="mt-1 text-2xl text-ink">{entry.role}</h3>
            <p className="font-display text-lg italic text-graphite">{entry.company}</p>
            <p className="mt-3 max-w-xl leading-relaxed text-graphite">{entry.description}</p>
            <ul
              className="mt-4 flex flex-wrap gap-1.5"
              aria-label={`Technologies at ${entry.company}`}
            >
              {entry.technologies.map((tech) => (
                <li key={tech}>
                  <Tag>{tech}</Tag>
                </li>
              ))}
            </ul>
            {index === experience.length - 1 && (
              <p className="mt-6 font-hand text-lg text-pencil" aria-hidden="true">
                …and before that, a lot of curiosity.
              </p>
            )}
          </li>
        ))}
      </ol>
    </SectionPanel>
  )
}
