import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getProjectById } from "@/lib/data"
import { updateProject } from "@/app/actions/projects"
import { ProjectForm } from "../../../ProjectForm"

export const dynamic = "force-dynamic"

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const projectId = Number(id)
  if (!Number.isFinite(projectId)) notFound()

  const project = await getProjectById(projectId)
  if (!project) notFound()

  // Bind the id so the form's action keeps the (prevState, formData) shape.
  const action = updateProject.bind(null, projectId)

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
        Edit project
      </h1>
      <ProjectForm
        action={action}
        project={project}
        submitLabel="Save changes"
      />
    </div>
  )
}
