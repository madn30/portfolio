import { closeSection } from '@/app/navigation'
import { about } from '@/data/about'
import { siteConfig } from '@/data/siteConfig'
import { flyToMilestone, useAbout } from '@/features/world/rooms/about/aboutState'
import { MILESTONES } from '@/features/world/rooms/about/stream'
import { DeskDoodle } from '@/shared/components/Doodles'
import { Tag } from '@/shared/components/Tag'
import { useHasRoom } from '@/shared/store/worldStore'
import { SectionPanel } from './SectionPanel'

function FlightMap() {
  const station = useAbout((s) => s.station)
  return (
    <nav
      aria-label="Flight stations"
      className="pointer-events-auto fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-2.5 sm:flex"
    >
      {MILESTONES.map((spot) => {
        const current = spot.id === station
        return (
          <button
            key={spot.id}
            type="button"
            onClick={() => flyToMilestone(spot.id)}
            aria-current={current ? 'step' : undefined}
            className="group flex items-center gap-2"
          >
            <span
              className={`font-hand text-lg leading-none text-charcoal transition-opacity ${
                current
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
              }`}
            >
              {spot.title}
            </span>
            <span
              aria-hidden="true"
              className={`block h-2.5 w-2.5 rounded-full border border-ink transition-colors ${
                current ? 'bg-terracotta' : 'bg-cream'
              }`}
            />
          </button>
        )
      })}
    </nav>
  )
}

export function AboutSection() {
  const hasRoom = useHasRoom()

  if (hasRoom) {
    return (
      <>
        <SectionPanel
          id="about"
          title="About"
          bare
          hint="Scroll to fly. Click a card to fly closer, pop a balloon, or click open sky to throw a paper plane."
          onEscape={closeSection}
        >
          {null}
        </SectionPanel>
        <FlightMap />
      </>
    )
  }

  return (
    <SectionPanel
      id="about"
      eyebrow="who I am"
      title="A developer who likes the quiet parts of building things."
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_200px] lg:gap-14">
        <div className="space-y-10">
          <div data-reveal>
            <h3 className="font-hand text-2xl text-terracotta">Summary</h3>
            <p className="mt-2 text-lg leading-relaxed text-ink">{about.summary}</p>
            <p className="mt-3 font-display italic text-graphite">{about.quote.join(' ')}</p>
          </div>

          <div data-reveal>
            <h3 className="font-hand text-2xl text-terracotta">Experience</h3>
            <p className="mt-2 leading-relaxed text-graphite">{about.experience}</p>
          </div>

          <div data-reveal>
            <h3 className="font-hand text-2xl text-terracotta">Journey</h3>
            <ol className="mt-3 space-y-2">
              {about.journey.map((stop) => (
                <li key={stop.id} className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-display text-ink">{stop.title}</span>
                  <span className="font-hand text-lg text-charcoal">{stop.period}</span>
                  <span className="basis-full text-graphite">{stop.text}</span>
                </li>
              ))}
            </ol>
          </div>

          <div data-reveal>
            <h3 className="font-hand text-2xl text-terracotta">Technical interests</h3>
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Technical interests">
              {about.interests.map((interest) => (
                <li key={interest}>
                  <Tag>{interest}</Tag>
                </li>
              ))}
              {about.techBalloons.map((balloon) => (
                <li key={balloon.label}>
                  <Tag>{balloon.label}</Tag>
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
