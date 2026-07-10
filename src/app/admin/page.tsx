import Link from "next/link"
import { asc, desc } from "drizzle-orm"
import { Plus, Pencil, Star } from "lucide-react"
import { getDb } from "@/lib/db"
import { projects as projectsTable } from "@/lib/db/schema"
import { deleteProject } from "@/app/actions/projects"
import { DeleteButton } from "./DeleteButton"

export const dynamic = "force-dynamic"

export default async function AdminProjectsPage() {
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
          <code className="font-mono">npm run db:seed</code>. Until then the
          public site renders from the static seed data and this panel is
          read-only. See <code className="font-mono">BACKEND.md</code> for setup.
        </p>
      </div>
    )
  }

  const rows = await db
    .select()
    .from(projectsTable)
    .orderBy(asc(projectsTable.sortOrder), desc(projectsTable.createdAt))

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-(--color-text-primary)">
            Projects
          </h1>
          <p className="mt-1 text-sm text-(--color-text-secondary)">
            {rows.length} {rows.length === 1 ? "project" : "projects"}
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-2 rounded-lg bg-(--color-text-primary) px-4 py-2.5 text-sm font-semibold text-(--color-bg) transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New project
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--color-border) p-10 text-center">
          <p className="text-sm text-(--color-text-secondary)">
            No projects yet. Create your first one, or run{" "}
            <code className="font-mono">npm run db:seed</code> to import the
            starter set.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-(--color-border) overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)">
          {rows.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-(--color-text-primary)">
                    {p.title}
                  </span>
                  {p.featured && (
                    <Star className="h-3.5 w-3.5 shrink-0 fill-(--color-highlight) text-(--color-highlight)" />
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-(--color-text-muted)">
                  {p.type} · {p.status}
                  {p.period ? ` · ${p.period}` : ""}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/projects/${p.id}/edit`}
                  className="flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-sm font-medium text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>
                <form action={deleteProject}>
                  <input type="hidden" name="id" value={p.id} />
                  <DeleteButton title={p.title} />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
