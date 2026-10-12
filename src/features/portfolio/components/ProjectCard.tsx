import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { accentHex } from '@/data/siteConfig'
import type { Project } from '@/shared/types'
import { TagList } from '@/shared/components/Tag'

interface ProjectCardProps {
  project: Project
  href: string
}

export function ProjectCard({ project, href }: ProjectCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const accent = accentHex[project.accent]

  return (
    <li data-reveal className="group">
      <a
        href={href}
        className="sketch-border flex h-full flex-col bg-cream/90 p-3 shadow-sketch transition-transform duration-300 ease-out-soft hover:-translate-y-1 hover:shadow-[6px_8px_0_0_rgba(47,42,38,0.14)] focus-visible:-translate-y-1"
        aria-label={`${project.title}: open project details`}
      >
        <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] border border-ink/20 bg-paper">
          {imageFailed ? (
            <div className="flex h-full items-center justify-center" aria-hidden="true">
              <span className="font-hand text-3xl" style={{ color: accent }}>
                {project.title}
              </span>
            </div>
          ) : (
            <img
              src={project.image}
              alt={project.imageAlt}
              loading="lazy"
              decoding="async"
              width={400}
              height={260}
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.03] motion-reduce:transition-none"
            />
          )}
          {project.isPlaceholder && (
            <span className="absolute left-2 top-2 rounded-full bg-cream/90 px-2 py-0.5 font-hand text-sm text-charcoal">
              demo content
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col px-1.5 pb-1 pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-2xl text-ink">{project.title}</h3>
            {project.year && <span className="font-hand text-lg text-pencil">{project.year}</span>}
          </div>
          <p className="mt-2 flex-1 text-[15px] leading-relaxed text-graphite">
            {project.description}
          </p>
          <TagList items={project.tags.slice(0, 4)} label="Technologies" className="mt-4" />
          <span className="mt-4 inline-flex items-center gap-1 font-sans text-sm font-medium text-ink">
            View details
            <ArrowUpRight
              size={14}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </div>
      </a>
    </li>
  )
}
