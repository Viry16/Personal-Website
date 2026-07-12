import { loadEnvConfig } from "@next/env"
import { defineConfig } from "drizzle-kit"

// Load .env.local / .env the same way Next.js does, so `npm run db:*` picks up
// DATABASE_URL without any extra dotenv dependency.
loadEnvConfig(process.cwd())

// Ensure hosted connections (Supabase, etc.) use TLS. Leaves localhost alone.
function withSsl(url: string): string {
  try {
    const u = new URL(url)
    const local = ["localhost", "127.0.0.1", "::1"].includes(u.hostname)
    if (!local && !u.searchParams.has("sslmode")) {
      u.searchParams.set("sslmode", "require")
    }
    return u.toString()
  } catch {
    return url
  }
}

// Prefer DIRECT_URL for migrations when set (Supabase recommends the direct /
// session connection for DDL), falling back to the app's DATABASE_URL.
const migrationUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || ""

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: withSsl(migrationUrl),
  },
})
