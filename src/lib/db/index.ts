import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

export type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>

// Reuse the socket + client across hot-reloads (dev) and warm serverless
// invocations (prod) to avoid exhausting database connections.
const globalForDb = globalThis as unknown as {
  __pgClient?: ReturnType<typeof postgres>
  __db?: DrizzleDb
}

/**
 * Returns a Drizzle client, or `null` when `DATABASE_URL` is not configured.
 *
 * The env var is read lazily (inside this function, not at module load) so that
 * `next build`, the seed script, and drizzle-kit can all import this module and
 * load their `.env` files first. Callers must handle the `null` case — the data
 * layer falls back to the static seed data, so the site works without a DB.
 */
export function getDb(): DrizzleDb | null {
  const url = process.env.DATABASE_URL
  if (!url) return null

  if (!globalForDb.__db) {
    // `prepare: false` keeps things compatible with transaction-mode poolers
    // (Supabase pgBouncer, Neon pooled endpoints). `max: 1` is friendly to
    // serverless where each instance holds its own connection.
    const client =
      globalForDb.__pgClient ?? postgres(url, { prepare: false, max: 1 })
    globalForDb.__pgClient = client
    globalForDb.__db = drizzle(client, { schema })
  }
  return globalForDb.__db
}

export { schema }
