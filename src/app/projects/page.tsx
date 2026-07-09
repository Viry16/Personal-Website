"use client"

import { useMemo, useState } from "react"
import { BottomDock } from "@/components/BottomDock"
import { ProjectCard } from "@/components/ui/ProjectCard"
import { ProjectModal } from "@/components/ui/ProjectModal"
import { PageHeader } from "@/components/ui/PageHeader"
import { PROJECTS, type Project, type ProjectType } from "@/lib/projects"
import { cn } from "@/lib/utils"

type Filter = ProjectType | "All"

const FILTERS: Filter[] = ["All", "Software", "Hardware"]

const TAB_COPY: Record<Filter, { heading: string; blurb: string }> = {
  All: {
    heading: "Everything I've built",
    blurb: "A mix of software, AI, and hardware work — from diffusion models to greenhouse controllers.",
  },
  Software: {
    heading: "Software & AI",
    blurb: "Full-stack web applications and machine learning models.",
  },
  Hardware: {
    heading: "Hardware & Edge Compute",
    blurb: "IoT systems, robotics, and embedded hardware.",
  },
}

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<Filter>("All")
  const [selected, setSelected] = useState<Project | null>(null)

  const filteredProjects = useMemo(
    () =>
      activeTab === "All"
        ? PROJECTS
        : PROJECTS.filter((p) => p.type === activeTab),
    [activeTab]
  )

  const countFor = (filter: Filter) =>
    filter === "All"
      ? PROJECTS.length
      : PROJECTS.filter((p) => p.type === filter).length

  return (
    <main className="min-h-screen selection:bg-(--color-text-primary) selection:text-(--color-surface)">
      <div className="mx-auto max-w-5xl px-6 md:px-12 pt-16 md:pt-24 pb-32">
        <PageHeader
          eyebrow="Portfolio"
          title="Projects & Contributions"
          description="Things I've designed, engineered, and shipped across the stack."
          titleFont="font-display"
        />

        {/* Filter pills with live counts */}
        <div className="mb-10 flex flex-wrap gap-2 border-b border-(--color-border) pb-6">
          {FILTERS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 md:px-5 py-2 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "border-(--color-text-primary) bg-(--color-text-primary) text-(--color-bg)"
                  : "border-(--color-border) bg-transparent text-(--color-text-secondary) hover:border-(--color-text-muted) hover:text-(--color-text-primary)"
              )}
            >
              {tab}
              <span
                className={cn(
                  "font-mono text-xs",
                  activeTab === tab
                    ? "text-(--color-bg)/70"
                    : "text-(--color-text-muted)"
                )}
              >
                {countFor(tab)}
              </span>
            </button>
          ))}
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium text-(--color-text-primary)">
            {TAB_COPY[activeTab].heading}
          </h3>
          <p className="mt-1 text-sm text-(--color-text-secondary)">
            {TAB_COPY[activeTab].blurb}
          </p>
        </div>

        {/* key on activeTab remounts the grid so cards re-run their reveal
            (with stagger) each time the filter changes */}
        <div
          key={activeTab}
          className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2"
        >
          {filteredProjects.map((project, i) => (
            <ProjectCard
              key={project.title}
              {...project}
              index={i}
              onClick={() => setSelected(project)}
            />
          ))}
        </div>
      </div>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
      <BottomDock />
    </main>
  )
}
