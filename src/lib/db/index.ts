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
 * Decides TLS mode from the connection string. Hosted Postgres (Supabase, Neon,
 * etc.) requires TLS; a local dev instance usually has none. Honors an explicit
 * `?sslmode=` and otherwise turns SSL on for any non-localhost host.
 */
function sslMode(url: string): "require" | false {
  try {
    const u = new URL(url)
    const sslmode = u.searchParams.get("sslmode")
    if (sslmode === "disable") return false
    if (sslmode) return "require"
    const local = ["localhost", "127.0.0.1", "::1"].includes(u.hostname)
    return local ? false : "require"
  } catch {
    return false
  }
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
    // (Supabase pgBouncer/Supavisor, Neon pooled endpoints). `ssl` is derived
    // from the URL so Supabase (TLS-required) and localhost both work.
    const client =
      globalForDb.__pgClient ??
      postgres(url, {
        prepare: false,
        ssl: sslMode(url),
        // A small pool so the handful of concurrent page queries don't
        // serialize behind one another — important during a cold/paused-DB
        // spike, when each query can run right up to its timeout budget.
        max: 3,
        // Don't hang forever waiting to open a socket to a cold/paused DB.
        connect_timeout: 10, // seconds
        // NOTE: intentionally NO `idle_timeout` — the first query on a fresh
        // pooler connection is slow (cold backend), while subsequent ones are
        // ~90ms. Closing idle connections would make every request pay that
        // cold cost again. Keeping them warm is what stops the timeout thrash.
        // Best-effort server-side cap. Supabase's transaction pooler applies
        // this inconsistently, so the data layer ALSO enforces a hard JS-side
        // timeout; this just lets abandoned queries die sooner when honored.
        connection: { statement_timeout: 8000 }, // milliseconds
      })
    globalForDb.__pgClient = client
    globalForDb.__db = drizzle(client, { schema })
  }
  return globalForDb.__db
}

// -- Pool self-healing --------------------------------------------------------
//
// The data layer abandons queries that exceed its time budget, but postgres-js
// can't cancel them on the wire — an abandoned query keeps occupying its pool
// slot until the server answers. Supabase's transaction pooler sometimes
// black-holes statements while its backend is cold, so those slots can wedge
// FOREVER: every later query queues behind them and times out too, and only a
// process restart used to recover. Instead, after several consecutive
// timeouts we assume the pool is wedged, discard the whole client, and let the
// next getDb() build a fresh one.

let consecutiveTimeouts = 0
const WEDGED_AFTER = 3

/** Data layer calls this after every query: `timedOut` = hit the JS budget. */
export function reportDbQueryOutcome(timedOut: boolean): void {
  if (!timedOut) {
    consecutiveTimeouts = 0
    return
  }
  consecutiveTimeouts++
  if (consecutiveTimeouts >= WEDGED_AFTER && globalForDb.__pgClient) {
    const stale = globalForDb.__pgClient
    globalForDb.__pgClient = undefined
    globalForDb.__db = undefined
    consecutiveTimeouts = 0
    console.warn(
      `[db] ${WEDGED_AFTER} consecutive query timeouts — assuming a wedged pool, rebuilding the client`,
    )
    // Give in-flight queries a moment, then force-close. Errors are expected
    // (that's why we're here) and irrelevant — the pool is already replaced.
    void stale.end({ timeout: 1 }).catch(() => {})
  }
}

export { schema }
