"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProjectCard } from "../ui/ProjectCard"
import { ProjectModal } from "../ui/ProjectModal"
import { Reveal } from "../ui/Reveal"
import { type Project } from "@/lib/projects"

export function FeaturedProjectsGallery({ projects }: { projects: Project[] }) {
  const [selected, setSelected] = useState<Project | null>(null)

  return (
    <section className="py-16 md:py-24 border-t border-(--color-border)">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-8 md:mb-12">
          <h2 className="flex items-center gap-3 font-display text-2xl font-bold text-(--color-text-primary)">
            Featured Projects
          </h2>
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors group">
            View all projects
            <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
          </Link>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-12">
        {projects.map((project, i) => (
          <ProjectCard
            key={project.id ?? project.title}
            {...project}
            index={i}
            onClick={() => setSelected(project)}
          />
        ))}
      </div>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
