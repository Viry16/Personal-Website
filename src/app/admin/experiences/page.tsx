import Link from "next/link"
import { asc, desc } from "drizzle-orm"
import { Plus, Pencil } from "lucide-react"
import { getDb } from "@/lib/db"
import { withDbTimeout } from "@/lib/data"
import { experiences as experiencesTable, type ExperienceRow } from "@/lib/db/schema"
import { deleteExperience } from "@/app/actions/experiences"
import { DeleteButton } from "../DeleteButton"

export const dynamic = "force-dynamic"

export default async function AdminExperiencesPage() {
  const db = getDb()

  if (!db) {
    return (
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-8">
        <h1 className="font-display text-xl font-bold text-(--color-text-primary)">
          Database not configured
        </h1>
        <p className="mt-2 max-w-prose text-sm text-(--color-text-secondary)">
          Set <code className="font-mono">DATABASE_URL</code> in your environment
          and run <code className="font-mono">npm run db:push</code> then{" "}
          <code className="font-mono">npm run db:seed</code>.
        </p>
      </div>
    )
  }

  const rows = await withDbTimeout(
    db
      .select()
      .from(experiencesTable)
      .orderBy(asc(experiencesTable.sortOrder), desc(experiencesTable.createdAt)),
    null as ExperienceRow[] | null,
    "admin experiences list",
  )

  if (rows === null) {
    return (
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-8">
        <h1 className="font-display text-xl font-bold text-(--color-text-primary)">
          Database is slow to respond
        </h1>
        <p className="mt-2 max-w-prose text-sm text-(--color-text-secondary)">
          The experiences couldn&apos;t be loaded within the time budget. Refresh in a moment.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-(--color-text-primary)">
            Experiences
          </h1>
          <p className="mt-1 text-sm text-(--color-text-secondary)">
            {rows.length} {rows.length === 1 ? "experience" : "experiences"}
          </p>
        </div>
        <Link
          href="/admin/experiences/new"
          className="flex items-center gap-2 rounded-lg bg-(--color-text-primary) px-4 py-2.5 text-sm font-semibold text-(--color-bg) transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New experience
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--color-border) p-10 text-center">
          <p className="text-sm text-(--color-text-secondary)">
            No experiences yet. Create your first one, or run{" "}
            <code className="font-mono">npm run db:seed</code> to import the
            starter set.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-(--color-border) overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)">
          {rows.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <span className="truncate font-medium text-(--color-text-primary)">
                  {e.role}
                </span>
                <p className="mt-0.5 truncate text-xs text-(--color-text-muted)">
                  {e.company} · {e.date}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/experiences/${e.id}/edit`}
                  className="flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-sm font-medium text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>
                <form action={deleteExperience}>
                  <input type="hidden" name="id" value={e.id} />
                  <DeleteButton title={e.role} />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
