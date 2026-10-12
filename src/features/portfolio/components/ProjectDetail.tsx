import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ExternalLink as ExternalIcon, Github } from 'lucide-react'
import { closeProject } from '@/app/navigation'
import { accentHex } from '@/data/siteConfig'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { unlock } from '@/features/achievements'
import type { Project } from '@/shared/types'
import { ExternalLink } from '@/shared/components/ExternalLink'
import { isSafeExternalUrl } from '@/shared/utils/links'
import { TagList } from '@/shared/components/Tag'
import { gsap } from '@/shared/utils/gsap'

interface ProjectDetailProps {
  project: Project
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const reducedMotion = useReducedMotion()
  const accent = accentHex[project.accent]
  const hasDemo = isSafeExternalUrl(project.demoUrl)
  const hasRepo = isSafeExternalUrl(project.repoUrl)

  useEffect(() => unlock('critic'), [])

  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
    root.current?.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' })
    if (reducedMotion || !root.current) return
    const ctx = gsap.context(() => {
      gsap.from('[data-detail-reveal]', {
        y: 18,
        opacity: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      })
    }, root)
    return () => ctx.revert()
  }, [project.id, reducedMotion])

  return (
    <div ref={root} className="scroll-mt-28">
      <button
        type="button"
        onClick={closeProject}
        data-detail-reveal
        className="group mb-6 inline-flex items-center gap-2 font-sans text-sm font-medium text-charcoal transition-colors hover:text-ink"
      >
        <ArrowLeft
          size={15}
          aria-hidden="true"
          className="transition-transform group-hover:-translate-x-0.5"
        />
        <span>Back to the gallery</span>
      </button>

      <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:gap-10">
        <div data-detail-reveal className="sketch-border self-start overflow-hidden bg-cream p-2">
          <div className="aspect-[16/10] w-full overflow-hidden rounded">
            {imageFailed ? (
              <div className="flex h-full items-center justify-center" aria-hidden="true">
                <span className="font-hand text-4xl" style={{ color: accent }}>
                  {project.title}
                </span>
              </div>
            ) : (
              <img
                src={project.image}
                alt={project.imageAlt}
                width={400}
                height={260}
                onError={() => setImageFailed(true)}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </div>

        <div>
          <p data-detail-reveal className="font-hand text-2xl" style={{ color: accent }}>
            {project.year ?? 'project'}
            {project.isPlaceholder && <span className="text-charcoal"> · demo content</span>}
          </p>
          <h3
            ref={heading}
            id={`project-${project.id}-title`}
            tabIndex={-1}
            data-detail-reveal
            className="mt-1 text-4xl leading-tight text-ink focus:outline-none focus-visible:outline-none"
          >
            {project.title}
          </h3>
          <p data-detail-reveal className="mt-4 text-lg leading-relaxed text-ink">
            {project.description}
          </p>
          {project.details && (
            <p data-detail-reveal className="mt-3 leading-relaxed text-graphite">
              {project.details}
            </p>
          )}

          <div data-detail-reveal>
            <h4 className="mt-6 font-hand text-xl text-charcoal">Built with</h4>
            <TagList items={project.tags} label="Technologies used" className="mt-2" />
          </div>

          {(hasDemo || hasRepo) && (
            <div data-detail-reveal className="mt-7 flex flex-wrap gap-5">
              {hasDemo && project.demoUrl && (
                <ExternalLink href={project.demoUrl} icon={<ExternalIcon size={15} />}>
                  Live demo
                </ExternalLink>
              )}
              {hasRepo && project.repoUrl && (
                <ExternalLink href={project.repoUrl} icon={<Github size={15} />}>
                  Source on GitHub
                </ExternalLink>
              )}
            </div>
          )}
          {!hasDemo && !hasRepo && (
            <p data-detail-reveal className="mt-7 font-hand text-lg text-charcoal">
              No public links for this one yet — add{' '}
              <code className="font-sans text-sm">demoUrl</code> or{' '}
              <code className="font-sans text-sm">repoUrl</code> in{' '}
              <code className="font-sans text-sm">src/data/projects.ts</code>.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
