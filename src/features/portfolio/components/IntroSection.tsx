import { useEffect, useRef } from 'react'
import { ArrowDown, SkipForward } from 'lucide-react'
import { openSection, walkToDoor } from '@/app/navigation'
import { siteConfig } from '@/data/siteConfig'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { useWorld } from '@/shared/store/worldStore'
import { gsap } from '@/shared/utils/gsap'
import { Button } from '@/shared/components/Button'

interface IntroSectionProps {
  hidden?: boolean
}

export function IntroSection({ hidden = false }: IntroSectionProps) {
  const root = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const introDone = useWorld((s) => s.introDone)
  const lap = useWorld((s) => s.lap)

  useEffect(() => {
    if (reducedMotion || !root.current) return
    const ctx = gsap.context(() => {
      gsap.from('[data-intro]', {
        y: 26,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: 'power3.out',
      })
    }, root)
    return () => ctx.revert()
  }, [reducedMotion])

  const interactive = !hidden && !introDone
  const concealed = hidden || lap > 0

  return (
    <section
      ref={root}
      aria-labelledby="intro-title"
      aria-hidden={concealed}
      className={`fixed bottom-[env(safe-area-inset-bottom)] right-[env(safe-area-inset-right)] z-10 flex justify-end px-4 pb-5 sm:pb-7 ${
        interactive ? '' : 'pointer-events-none'
      } ${concealed ? 'invisible' : ''}`}
    >
      <h1 id="intro-title" className="sr-only">
        {siteConfig.name}
      </h1>
      <p className="sr-only">
        {siteConfig.title}. {siteConfig.headline}
      </p>
      <div
        data-intro-fade
        className={`torn-wrap transition-[opacity,transform] duration-500 ease-out-soft ${
          introDone ? '-translate-y-3 opacity-0' : ''
        }`}
      >
        <div data-intro className="torn flex items-center gap-x-4 px-4 py-2.5">
          <p className="hidden max-w-[16rem] text-sm text-charcoal md:block">
            {siteConfig.tagline}
          </p>
          <div className="flex items-center gap-2">
            <Button size="sm" icon={<ArrowDown size={14} />} onClick={() => walkToDoor('about')}>
              Walk in
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<SkipForward size={14} />}
              onClick={() => openSection('about', { immediate: true })}
            >
              Skip intro
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
