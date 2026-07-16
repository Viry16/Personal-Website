import { asc, desc } from "drizzle-orm"
import { getDb } from "@/lib/db"
import { withDbTimeout } from "@/lib/data"
import { nowItems as nowItemsTable, type NowItemRow } from "@/lib/db/schema"
import { deleteNowItem } from "@/app/actions/now-items"
import { DeleteButton } from "../DeleteButton"
import { NowItemEditor } from "./NowItemEditor"

export const dynamic = "force-dynamic"

export default async function AdminNowPage() {
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
      .from(nowItemsTable)
      .orderBy(asc(nowItemsTable.sortOrder), desc(nowItemsTable.createdAt)),
    null as NowItemRow[] | null,
    "admin now items list",
  )

  if (rows === null) {
    return (
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-8">
        <h1 className="font-display text-xl font-bold text-(--color-text-primary)">
          Database is slow to respond
        </h1>
        <p className="mt-2 max-w-prose text-sm text-(--color-text-secondary)">
          Refresh in a moment.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-(--color-text-primary)">
          Now Feed
        </h1>
        <p className="mt-1 text-sm text-(--color-text-secondary)">
          &quot;What I&apos;m doing now&quot; items shown on the about page.
          Icon keys: <code className="font-mono text-xs">reading</code>,{" "}
          <code className="font-mono text-xs">building</code>,{" "}
          <code className="font-mono text-xs">listening</code>,{" "}
          <code className="font-mono text-xs">gaming</code>,{" "}
          <code className="font-mono text-xs">learning</code>.
        </p>
      </div>

      {/* Existing items */}
      {rows.length > 0 && (
        <ul className="mb-8 divide-y divide-(--color-border) overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)">
          {rows.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded border border-(--color-border) px-1.5 py-0.5 font-mono text-xs text-(--color-text-muted)">
                    {item.icon}
                  </span>
                  <span className="font-medium text-(--color-text-primary)">
                    {item.label}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm text-(--color-text-secondary)">
                  {item.value}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <NowItemEditor item={item} />
                <form action={deleteNowItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <DeleteButton title={item.label} />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add new item */}
      <div className="rounded-2xl border border-dashed border-(--color-border) p-6">
        <h2 className="mb-4 text-sm font-semibold text-(--color-text-primary)">
          Add new item
        </h2>
        <NowItemEditor />
      </div>
    </div>
  )
}
