import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createExperience } from "@/app/actions/experiences"
import { ExperienceForm } from "../../ExperienceForm"

export const dynamic = "force-dynamic"

export default function NewExperiencePage() {
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
        New experience
      </h1>
      <ExperienceForm action={createExperience} submitLabel="Create experience" />
    </div>
  )
}
