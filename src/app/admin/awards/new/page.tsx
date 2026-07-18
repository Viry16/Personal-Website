import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createAward } from "@/app/actions/awards"
import { AwardForm } from "../../AwardForm"

export const dynamic = "force-dynamic"

export default function NewAwardPage() {
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
        New award
      </h1>
      <AwardForm action={createAward} submitLabel="Create award" />
    </div>
  )
}
