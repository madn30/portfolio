import { useEffect } from 'react'
import { closeProject } from '@/app/navigation'
import { routeToHash } from '@/app/router'
import { getProjectById, projects } from '@/data/projects'
import { ProjectCard } from './ProjectCard'
import { useHasRoom } from '@/shared/store/worldStore'
import { ProjectDetail } from './ProjectDetail'
import { SectionPanel } from './SectionPanel'

interface ProjectsSectionProps {
  projectId?: string
}

export function ProjectsSection({ projectId }: ProjectsSectionProps) {
  const selected = getProjectById(projectId)

  useEffect(() => {
    if (projectId && !selected) closeProject()
  }, [projectId, selected])

  const hasRoom = useHasRoom()
  const hint =
    'Scroll to slide the line along. Click a card to unpeg it and flip it over; click it again to hang it back up.'

  if (hasRoom) {
    return (
      <SectionPanel
        id="projects"
        title="Projects"
        bare
        hint={hint}
        onEscape={selected ? closeProject : undefined}
      >
        {null}
      </SectionPanel>
    )
  }

  return (
    <SectionPanel
      id="projects"
      eyebrow="things I built"
      title="Projects"
      intro="A few things I've made, from a boot-camp cinema system to the corridor you are standing in."
      hint={hint}
      onEscape={selected ? closeProject : undefined}
      wide
    >
      {selected ? (
        <ProjectDetail project={selected} />
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2" aria-label="Projects">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              href={routeToHash({ section: 'projects', projectId: project.id })}
            />
          ))}
        </ul>
      )}
    </SectionPanel>
  )
}
