import { useState } from 'react'
import { ExternalLink as ExternalIcon, Github } from 'lucide-react'
import { closeProject } from '@/app/navigation'
import { accentHex } from '@/data/siteConfig'
import type { Project } from '@/types'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { isSafeExternalUrl } from '@/utils/links'
import { Modal } from '@/components/ui/Modal'
import { Tag } from '@/components/ui/Tag'

interface ProjectDetailProps {
  project: Project
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const accent = accentHex[project.accent]
  const hasDemo = isSafeExternalUrl(project.demoUrl)
  const hasRepo = isSafeExternalUrl(project.repoUrl)

  return (
    <Modal open onClose={closeProject} labelledBy={`project-${project.id}-title`}>
      <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:gap-10">
        <div className="sketch-border self-start overflow-hidden bg-paper p-2">
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
          <p className="font-hand text-2xl" style={{ color: accent }}>
            {project.year ?? 'project'}
            {project.isPlaceholder && <span className="text-charcoal"> · demo content</span>}
          </p>
          <h2 id={`project-${project.id}-title`} className="mt-1 text-4xl leading-tight text-ink">
            {project.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink">{project.description}</p>
          {project.details && (
            <p className="mt-3 leading-relaxed text-graphite">{project.details}</p>
          )}

          <h3 className="mt-6 font-hand text-xl text-charcoal">Built with</h3>
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Technologies used">
            {project.tags.map((tag) => (
              <li key={tag}>
                <Tag>{tag}</Tag>
              </li>
            ))}
          </ul>

          {(hasDemo || hasRepo) && (
            <div className="mt-7 flex flex-wrap gap-5">
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
            <p className="mt-7 font-hand text-lg text-charcoal">
              No public links for this one yet — add{' '}
              <code className="font-sans text-sm">demoUrl</code> or{' '}
              <code className="font-sans text-sm">repoUrl</code> in{' '}
              <code className="font-sans text-sm">src/data/projects.ts</code>.
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}
