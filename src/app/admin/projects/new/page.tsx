import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createProject } from "@/app/actions/projects"
import { ProjectForm } from "../../ProjectForm"

export const dynamic = "force-dynamic"

export default function NewProjectPage() {
  return (
    <div>
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-2 text-sm text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>
      <h1 className="mb-8 font-display text-2xl font-bold text-(--color-text-primary)">
        New project
      </h1>
      <ProjectForm action={createProject} submitLabel="Create project" />
    </div>
  )
}
