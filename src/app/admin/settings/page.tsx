import { getDb } from "@/lib/db"
import { getSiteSettings } from "@/lib/data"
import { SettingsForm } from "../SettingsForm"

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings()
  const dbReady = Boolean(getDb())

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-bold text-(--color-text-primary)">
        Site settings
      </h1>
      <p className="mb-8 max-w-prose text-sm text-(--color-text-secondary)">
        Identity and links used across the site (metadata, contact section, and
        the GitHub activity feed).
      </p>

      {!dbReady && (
        <p className="mb-6 rounded-lg border border-(--color-highlight)/30 bg-(--color-highlight)/10 px-3 py-2 text-sm text-(--color-highlight)">
          Database not configured — showing static defaults. Saving is disabled
          until DATABASE_URL is set.
        </p>
      )}

      <SettingsForm settings={settings} />
    </div>
  )
}
