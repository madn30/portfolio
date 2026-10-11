import { useEffect } from 'react'
import { closeProject } from '@/app/navigation'
import { routeToHash } from '@/app/router'
import { getProjectById, projects } from '@/data/projects'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { ProjectDetail } from './ProjectDetail'
import { SectionPanel } from './SectionPanel'

interface ProjectsSectionProps {
  projectId?: string
}

export function ProjectsSection({ projectId }: ProjectsSectionProps) {
  const selected = getProjectById(projectId)

  // An unknown project id in the URL falls back to the gallery instead of a broken view.
  useEffect(() => {
    if (projectId && !selected) closeProject()
  }, [projectId, selected])

  return (
    <SectionPanel
      id="projects"
      eyebrow="things I built"
      title="Projects"
      intro="A few things I've made. The entries below are placeholders waiting for your real work — edit src/data/projects.ts to replace them."
      wide
    >
      <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-label="Projects">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            href={routeToHash({ section: 'projects', projectId: project.id })}
          />
        ))}
      </ul>

      {selected && <ProjectDetail project={selected} />}
    </SectionPanel>
  )
}
