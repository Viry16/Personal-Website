import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getExperienceById } from "@/lib/data"
import { updateExperience } from "@/app/actions/experiences"
import { ExperienceForm } from "../../../ExperienceForm"

export const dynamic = "force-dynamic"

export default async function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const experienceId = Number(id)
  if (!Number.isFinite(experienceId)) notFound()

  const experience = await getExperienceById(experienceId)
  if (!experience) notFound()

  const action = updateExperience.bind(null, experienceId)

  return (
    <div>
      <Link
        href="/admin/experiences"
        className="mb-6 inline-flex items-center gap-2 text-sm text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to experiences
      </Link>
      <h1 className="mb-8 font-display text-2xl font-bold text-(--color-text-primary)">
        Edit experience
      </h1>
      <ExperienceForm
        action={action}
        experience={experience}
        submitLabel="Save changes"
      />
    </div>
  )
}
