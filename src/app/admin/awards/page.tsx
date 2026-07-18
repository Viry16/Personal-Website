import Link from "next/link"
import { asc, desc } from "drizzle-orm"
import { Plus, Pencil, ExternalLink } from "lucide-react"
import { getDb } from "@/lib/db"
import { withDbTimeout } from "@/lib/data"
import { awards as awardsTable, type AwardRow } from "@/lib/db/schema"
import { deleteAward } from "@/app/actions/awards"
import { DeleteButton } from "../DeleteButton"

export const dynamic = "force-dynamic"

export default async function AdminAwardsPage() {
  const db = getDb()

  if (!db) {
    return (
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-8">
        <h1 className="font-display text-xl font-bold text-(--color-text-primary)">
          Database not configured
        </h1>
        <p className="mt-2 max-w-prose text-sm text-(--color-text-secondary)">
          Set <code className="font-mono">DATABASE_URL</code> in your environment
          and run <code className="font-mono">npm run db:push</code>.
        </p>
      </div>
    )
  }

  const rows = await withDbTimeout(
    db
      .select()
      .from(awardsTable)
      .orderBy(asc(awardsTable.sortOrder), desc(awardsTable.createdAt)),
    null as AwardRow[] | null,
    "admin awards list",
  )

  if (rows === null) {
    return (
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-8">
        <h1 className="font-display text-xl font-bold text-(--color-text-primary)">
          Database is slow to respond
        </h1>
        <p className="mt-2 max-w-prose text-sm text-(--color-text-secondary)">
          The awards couldn&apos;t be loaded within the time budget. Refresh in a moment.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-(--color-text-primary)">
            Awards & Certificates
          </h1>
          <p className="mt-1 text-sm text-(--color-text-secondary)">
            {rows.length} {rows.length === 1 ? "award" : "awards"}
          </p>
        </div>
        <Link
          href="/admin/awards/new"
          className="flex items-center gap-2 rounded-lg bg-(--color-text-primary) px-4 py-2.5 text-sm font-semibold text-(--color-bg) transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New award
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--color-border) p-10 text-center">
          <p className="text-sm text-(--color-text-secondary)">
            No awards yet. Create your first one to showcase your achievements.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-(--color-border) overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)">
          {rows.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-(--color-text-primary)">
                    {a.title}
                  </span>
                  {a.url && (
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-(--color-text-muted)" />
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-(--color-text-muted)">
                  {a.issuer} · {a.date}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/awards/${a.id}/edit`}
                  className="flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-sm font-medium text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>
                <form action={deleteAward}>
                  <input type="hidden" name="id" value={a.id} />
                  <DeleteButton title={a.title} />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
