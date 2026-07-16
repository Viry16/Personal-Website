import { asc, desc } from "drizzle-orm"
import { BookOpen, Headphones, Code2, Gamepad2, Lightbulb } from "lucide-react"
import { getDb } from "@/lib/db"
import { withDbTimeout } from "@/lib/data"
import { nowItems as nowItemsTable, type NowItemRow } from "@/lib/db/schema"
import { deleteNowItem } from "@/app/actions/now-items"
import { DeleteButton } from "../DeleteButton"
import { NowItemEditor } from "./NowItemEditor"

export const dynamic = "force-dynamic"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  reading: BookOpen,
  building: Code2,
  listening: Headphones,
  gaming: Gamepad2,
  learning: Lightbulb,
}

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
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["reading", "building", "listening", "gaming", "learning"].map((key) => {
            const Icon = ICON_MAP[key] ?? Code2
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 rounded-full border border-(--color-border) px-2.5 py-1 text-xs font-mono text-(--color-text-muted)"
              >
                <Icon className="h-3 w-3" />
                {key}
              </span>
            )
          })}
        </div>
      </div>

      {/* Existing items */}
      {rows.length > 0 && (
        <div className="mb-8 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">
            {rows.length} {rows.length === 1 ? "item" : "items"}
          </h2>
          <ul className="space-y-3">
            {rows.map((item) => {
              const Icon = ICON_MAP[item.icon.toLowerCase()] ?? Code2
              return (
                <li
                  key={item.id}
                  className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Item info */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-(--color-border) bg-(--color-bg)">
                        <Icon className="h-4 w-4 text-(--color-text-muted)" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-(--color-text-primary)">
                            {item.label}
                          </span>
                          <span className="rounded border border-(--color-border) px-1.5 py-0.5 font-mono text-[10px] text-(--color-text-muted)">
                            {item.icon}
                          </span>
                          <span className="text-xs text-(--color-text-muted)">
                            #{item.sortOrder}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-(--color-text-secondary)">
                          {item.value}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2">
                      <NowItemEditor item={item} />
                      <form action={deleteNowItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <DeleteButton title={item.label} />
                      </form>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Add new item */}
      <div className="rounded-xl border border-dashed border-(--color-border) p-6">
        <h2 className="mb-4 text-sm font-semibold text-(--color-text-primary)">
          Add new item
        </h2>
        <NowItemEditor />
      </div>
    </div>
  )
}
