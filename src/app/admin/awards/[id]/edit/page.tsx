import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getAwardById } from "@/lib/data"
import { updateAward } from "@/app/actions/awards"
import { AwardForm } from "../../../AwardForm"

export const dynamic = "force-dynamic"

export default async function EditAwardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const awardId = Number(id)
  if (!Number.isFinite(awardId)) notFound()

  const award = await getAwardById(awardId)
  if (!award) notFound()

  const action = updateAward.bind(null, awardId)

  return (
    <div>
      <Link
        href="/admin/awards"
        className="mb-6 inline-flex items-center gap-2 text-sm text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to awards
      </Link>
      <h1 className="mb-8 font-display text-2xl font-bold text-(--color-text-primary)">
        Edit award
      </h1>
      <AwardForm
        action={action}
        award={award}
        submitLabel="Save changes"
      />
    </div>
  )
}
