import { experience } from '@/data/experience'
import { chapters, selectChapter, useChapter } from '@/features/world/rooms/experience/store'
import { TagList } from '@/shared/components/Tag'
import { useHasRoom } from '@/shared/store/worldStore'
import { SectionPanel } from './SectionPanel'

function ChapterRail() {
  const selected = useChapter()
  return (
    <nav
      aria-label="Chapters"
      className="pointer-events-auto fixed left-1/2 top-[calc(4.25rem+env(safe-area-inset-top))] z-30 -translate-x-1/2 sm:top-[calc(1.25rem+env(safe-area-inset-top))]"
    >
      <p className="caption mb-2 text-center text-charcoal">Experience</p>
      <ol className="flex items-start">
        {chapters.map((entry, i) => {
          const current = i === selected
          return (
            <li key={entry.id} className="flex items-start">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={`mt-[7px] h-px w-10 sm:w-20 ${i <= selected ? 'bg-terracotta' : 'bg-ink/25'}`}
                />
              )}
              <button
                type="button"
                onClick={() => selectChapter(i)}
                aria-current={current ? 'step' : undefined}
                className="group flex w-24 flex-col items-center gap-1.5 sm:w-32"
              >
                <span
                  className={`h-[15px] w-[15px] rounded-full border-[1.5px] transition-transform group-hover:scale-125 ${
                    current
                      ? 'border-terracotta bg-terracotta'
                      : i < selected
                        ? 'border-terracotta bg-cream'
                        : 'border-ink/50 bg-cream'
                  }`}
                />
                <span
                  className={`font-hand text-base leading-none ${current ? 'text-terracotta' : 'text-charcoal'}`}
                >
                  {entry.start.split(' ').pop()}
                </span>
                <span
                  className={`hidden text-center font-display text-[13px] leading-tight sm:block ${
                    current ? 'text-ink' : 'text-charcoal/80'
                  }`}
                >
                  {entry.company.split(' by ')[0]}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function ExperienceSection() {
  const hasRoom = useHasRoom()

  if (hasRoom) {
    return (
      <>
        <SectionPanel
          id="experience"
          title="Experience"
          bare
          hint="Pick a chapter above, or a camp on the mountain."
        >
          {null}
        </SectionPanel>
        <ChapterRail />
      </>
    )
  }

  return (
    <SectionPanel
      id="experience"
      eyebrow="where I have worked"
      title="Experience"
      intro="A short timeline: three front-end roles, from a React marketplace to Angular at scale."
    >
      <ol className="relative ml-3 border-l border-dashed border-ink/40 pl-8 sm:ml-6 sm:pl-10">
        {experience.map((entry, index) => (
          <li
            key={entry.id}
            id={`exp-${entry.id}`}
            data-reveal
            className="relative scroll-mt-24 pb-12 last:pb-0"
          >
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
            <TagList
              items={entry.technologies}
              label={`Technologies at ${entry.company}`}
              className="mt-4"
            />
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
