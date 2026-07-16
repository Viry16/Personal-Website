"use server"

import { asc, sql as dsql } from "drizzle-orm"
import { z } from "zod"
import { getDb } from "@/lib/db"
import { leaderboard } from "@/lib/db/schema"
import { withDbTimeout } from "@/lib/data"

/**
 * Scores for the terminal easter-egg game (see `Terminal.tsx`). These actions
 * are intentionally PUBLIC (no `verifySession()`): any visitor who beats the
 * game may post a name. Abuse surface is bounded by strict zod limits below;
 * scores are cosmetic, so worst case is a silly name on the board.
 */

export type ScoreEntry = {
  id: number
  name: string
  attempts: number
  timeMs: number
}

export type SubmitScoreResult =
  | { ok: true; rank: number; id: number; top: ScoreEntry[] }
  | { ok: false; error: string }

const ScoreSchema = z.object({
  // Visible to other visitors — keep it short and printable.
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(20, "Max 20 characters")
    .regex(/^[\p{L}\p{N} _.\-]+$/u, "Letters, numbers, spaces, _ . - only"),
  attempts: z.number().int().min(1).max(8),
  // Sanity window: a real game takes at least a second, and a session left
  // open overnight shouldn't post a 12-hour "time".
  timeMs: z
    .number()
    .int()
    .min(1_000)
    .max(60 * 60 * 1_000),
})

const TOP_N = 10

function topQuery(db: NonNullable<ReturnType<typeof getDb>>) {
  return db
    .select({
      id: leaderboard.id,
      name: leaderboard.name,
      attempts: leaderboard.attempts,
      timeMs: leaderboard.timeMs,
    })
    .from(leaderboard)
    .orderBy(
      asc(leaderboard.attempts),
      asc(leaderboard.timeMs),
      asc(leaderboard.createdAt),
    )
    .limit(TOP_N)
}

/** Top scores, best first. Empty array when the DB is missing or slow. */
export async function getLeaderboard(): Promise<ScoreEntry[]> {
  const db = getDb()
  if (!db) return []
  return withDbTimeout(topQuery(db), [], "getLeaderboard")
}

export async function submitScore(input: {
  name: string
  attempts: number
  timeMs: number
}): Promise<SubmitScoreResult> {
  const db = getDb()
  if (!db) return { ok: false, error: "leaderboard offline (no database)" }

  const parsed = ScoreSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { ok: false, error: first?.message ?? "Invalid score." }
  }
  const d = parsed.data

  const inserted = await withDbTimeout(
    db
      .insert(leaderboard)
      .values({ name: d.name, attempts: d.attempts, timeMs: d.timeMs })
      .returning({ id: leaderboard.id }),
    null,
    "submitScore insert",
  )
  if (!inserted?.[0]) {
    return { ok: false, error: "leaderboard unreachable — score not saved" }
  }

  // Rank = players with a strictly better score + 1 (ties share a rank).
  const better = await withDbTimeout(
    db
      .select({ n: dsql<number>`count(*)::int` })
      .from(leaderboard)
      .where(
        dsql`(${leaderboard.attempts}, ${leaderboard.timeMs}) < (${d.attempts}, ${d.timeMs})`,
      ),
    null,
    "submitScore rank",
  )

  const top = await withDbTimeout(topQuery(db), [], "submitScore top")
  return { ok: true, rank: (better?.[0]?.n ?? 0) + 1, id: inserted[0].id, top }
}
