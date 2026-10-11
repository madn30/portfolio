import { useEffect, useRef } from 'react'
import { ArrowDown, ArrowRight, SkipForward } from 'lucide-react'
import { openSection, walkToDoor } from '@/app/navigation'
import { siteConfig } from '@/data/siteConfig'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useWorld } from '@/store/worldStore'
import { gsap, ScrollTrigger } from '@/utils/gsap'
import { Button } from '@/components/ui/Button'

interface IntroSectionProps {
  /** 'world' floats over the 3D entrance and fades out on scroll; 'static' is in normal flow. */
  layout: 'world' | 'static'
  hidden?: boolean
}

/**
 * The entrance: name, title, headline, and an invitation to explore. Lives in the DOM so the
 * main professional information is always available to search engines and screen readers.
 */
export function IntroSection({ layout, hidden = false }: IntroSectionProps) {
  const root = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const introDone = useWorld((s) => s.introDone)
  const isWorld = layout === 'world'

  // Reveal on mount
  useEffect(() => {
    if (reducedMotion || !root.current) return
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-intro]', { y: 26, opacity: 0, duration: 0.8, stagger: 0.12, delay: 0.2 })
        .from('[data-intro-rule]', { scaleX: 0, transformOrigin: 'left', duration: 0.7 }, '-=0.6')
    }, root)
    return () => ctx.revert()
  }, [reducedMotion])

  // Fade out as the visitor walks into the corridor
  useEffect(() => {
    if (!isWorld || !root.current) return
    const ctx = gsap.context(() => {
      gsap.to('[data-intro-fade]', {
        opacity: 0,
        y: reducedMotion ? 0 : -30,
        ease: 'none',
        scrollTrigger: {
          start: 0,
          end: () => window.innerHeight * 0.9,
          scrub: reducedMotion ? false : 0.4,
        },
      })
      // The decorative rule slides a touch slower than the text for a little depth.
      gsap.to('[data-intro-rule]', {
        y: reducedMotion ? 0 : 24,
        ease: 'none',
        scrollTrigger: { start: 0, end: () => window.innerHeight * 1.2, scrub: true },
      })
    }, root)
    return () => {
      ctx.revert()
      ScrollTrigger.refresh()
    }
  }, [isWorld, reducedMotion])

  const interactive = !hidden && (!isWorld || !introDone)

  return (
    <section
      ref={root}
      aria-labelledby="intro-title"
      aria-hidden={hidden}
      className={
        isWorld
          ? `fixed inset-x-0 top-0 z-10 flex min-h-[100svh] flex-col justify-end px-5 pb-24 pt-24 sm:px-10 sm:pb-16 lg:justify-center lg:px-16 ${
              interactive ? '' : 'pointer-events-none'
            } ${hidden ? 'invisible' : ''}`
          : 'relative px-5 pb-10 pt-28 sm:px-10 lg:px-16'
      }
    >
      <div
        data-intro-fade
        className={`relative max-w-2xl ${
          isWorld
            ? "before:absolute before:-inset-x-10 before:-inset-y-8 before:-z-10 before:rounded-[50%] before:bg-[radial-gradient(closest-side,rgba(244,239,228,0.92),rgba(244,239,228,0))] before:content-['']"
            : ''
        }`}
      >
        <p data-intro className="font-hand text-2xl text-terracotta sm:text-3xl">
          hello, I'm
        </p>
        <h1
          id="intro-title"
          data-intro
          className="mt-1 text-5xl leading-[0.98] text-ink sm:text-6xl lg:text-7xl"
        >
          {siteConfig.name}
        </h1>
        <div data-intro-rule className="my-5 h-px w-28 bg-ink/60" />
        <p data-intro className="font-display text-xl italic text-graphite sm:text-2xl">
          {siteConfig.title}
        </p>
        <p data-intro className="mt-4 max-w-md text-lg leading-relaxed text-ink sm:text-xl">
          {siteConfig.headline}
        </p>
        <p data-intro className="mt-2 max-w-md text-[15px] text-charcoal">
          {siteConfig.tagline}
        </p>

        <div data-intro className="mt-8 flex flex-wrap items-center gap-3">
          {isWorld ? (
            <Button icon={<ArrowDown size={16} />} onClick={() => walkToDoor('about')}>
              Walk in
            </Button>
          ) : (
            <Button
              icon={<ArrowRight size={16} />}
              onClick={() => openSection('about', { immediate: true })}
            >
              Start with About
            </Button>
          )}
          <Button
            variant="ghost"
            icon={<SkipForward size={15} />}
            onClick={() => openSection('about', { immediate: true })}
          >
            Skip intro
          </Button>
        </div>
      </div>

      {isWorld && (
        <div
          data-intro
          data-intro-fade
          className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-charcoal sm:flex"
          aria-hidden="true"
        >
          <span className="font-hand text-lg">scroll to walk</span>
          <ArrowDown size={16} className="motion-safe:animate-bounce" />
        </div>
      )}
    </section>
  )
}
