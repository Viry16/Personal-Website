export interface ContributionDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export interface Contributions {
  total: number
  days: ContributionDay[]
}

export interface CommitItem {
  sha: string
  repo: string
  branch: string
  message: string
  date: string
}

const REVALIDATE_SECONDS = 3600

/**
 * Fetches the last year of GitHub contributions. Uses the official GraphQL
 * API when GITHUB_TOKEN is set; otherwise falls back to the public
 * github-contributions-api proxy which needs no auth.
 */
export async function getContributions(
  username: string
): Promise<Contributions | null> {
  try {
    if (process.env.GITHUB_TOKEN) {
      return await fetchContributionsGraphQL(username)
    }
    return await fetchContributionsPublic(username)
  } catch {
    return null
  }
}

async function fetchContributionsGraphQL(
  username: string
): Promise<Contributions> {
  const query = `
    query ($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }`

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { login: username } }),
  })
  if (!res.ok) throw new Error(`GitHub GraphQL responded ${res.status}`)

  const json = await res.json()
  const calendar =
    json.data?.user?.contributionsCollection?.contributionCalendar
  if (!calendar) throw new Error("No contribution calendar in response")

  const LEVELS: Record<string, ContributionDay["level"]> = {
    NONE: 0,
    FIRST_QUARTILE: 1,
    SECOND_QUARTILE: 2,
    THIRD_QUARTILE: 3,
    FOURTH_QUARTILE: 4,
  }

  type GraphQLDay = {
    date: string
    contributionCount: number
    contributionLevel: string
  }

  const days: ContributionDay[] = calendar.weeks.flatMap(
    (week: { contributionDays: GraphQLDay[] }) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: LEVELS[day.contributionLevel] ?? 0,
      }))
  )

  return { total: calendar.totalContributions, days }
}

async function fetchContributionsPublic(
  username: string
): Promise<Contributions> {
  const res = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
    { next: { revalidate: REVALIDATE_SECONDS } }
  )
  if (!res.ok) throw new Error(`Contributions API responded ${res.status}`)

  const json = await res.json()
  const days: ContributionDay[] = (json.contributions ?? []).map(
    (day: { date: string; count: number; level: number }) => ({
      date: day.date,
      count: day.count,
      level: Math.min(Math.max(day.level, 0), 4) as ContributionDay["level"],
    })
  )
  if (days.length === 0) throw new Error("Empty contributions response")

  const total =
    json.total?.lastYear ??
    days.reduce((sum: number, day: ContributionDay) => sum + day.count, 0)

  return { total, days }
}

/**
 * Latest commits from the user's push events.
 *
 * With a token that belongs to `username`, we try the authenticated `/events`
 * endpoint first, which includes private-repo activity. Some tokens lack the
 * scope for it (GitHub answers 403/404), so we fall back to `/events/public` —
 * still sending the token to keep the higher rate limit (5,000 vs 60 req/hour).
 * Every network/parse failure is contained so a bad response never breaks the
 * whole feed; the caller just gets an empty list.
 */
export async function getRecentCommits(
  username: string,
  limit = 3
): Promise<CommitItem[]> {
  const token = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  // Try the private-inclusive endpoint first when authenticated, then degrade
  // gracefully to the public one. De-duplicated so we never fetch twice.
  const endpoints = token ? ["events", "events/public"] : ["events/public"]

  for (const endpoint of endpoints) {
    const commits = await fetchPushCommits(username, endpoint, headers, limit)
    if (commits.length > 0) return commits
  }

  // The events API can be empty even when the user is active — merges, branch
  // pushes, and force-pushes carry no `commits`, and it only covers ~90 days.
  // Fall back to the latest commits from the user's recently pushed repos.
  return fetchRepoCommits(username, headers, Boolean(token), limit)
}

/**
 * Fallback source: the user's most recently pushed repositories, then the
 * latest commits they authored in each. With a token we can read the
 * authenticated user's private and collaborator repos too.
 */
async function fetchRepoCommits(
  username: string,
  headers: Record<string, string>,
  hasToken: boolean,
  limit: number
): Promise<CommitItem[]> {
  try {
    const reposUrl = hasToken
      ? "https://api.github.com/user/repos?sort=pushed&per_page=10&affiliation=owner,collaborator,organization_member"
      : `https://api.github.com/users/${username}/repos?sort=pushed&per_page=10`

    const res = await fetch(reposUrl, {
      headers,
      next: { revalidate: REVALIDATE_SECONDS },
    })
    if (!res.ok) return []

    type Repo = { name: string; full_name: string; default_branch?: string }
    const repos: Repo[] = await res.json()
    if (!Array.isArray(repos)) return []

    type ApiCommit = {
      sha: string
      commit?: {
        message?: string
        author?: { date?: string }
        committer?: { date?: string }
      }
    }

    const collected: CommitItem[] = []

    for (const repo of repos) {
      if (collected.length >= limit) break

      const commitsRes = await fetch(
        `https://api.github.com/repos/${repo.full_name}/commits?per_page=3&author=${username}`,
        { headers, next: { revalidate: REVALIDATE_SECONDS } }
      )
      if (!commitsRes.ok) continue

      const repoCommits: ApiCommit[] = await commitsRes.json()
      if (!Array.isArray(repoCommits)) continue

      for (const rc of repoCommits) {
        collected.push({
          sha: rc.sha.slice(0, 7),
          repo: repo.name,
          branch: repo.default_branch ?? "main",
          message: (rc.commit?.message ?? "").split("\n")[0],
          date:
            rc.commit?.author?.date ??
            rc.commit?.committer?.date ??
            new Date().toISOString(),
        })
      }
    }

    // Most recent first across all repos
    collected.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return collected.slice(0, limit)
  } catch {
    return []
  }
}

async function fetchPushCommits(
  username: string,
  endpoint: string,
  headers: Record<string, string>,
  limit: number
): Promise<CommitItem[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/${endpoint}?per_page=30`,
      { headers, next: { revalidate: REVALIDATE_SECONDS } }
    )
    if (!res.ok) return []

    type PushEvent = {
      type: string
      created_at: string
      repo?: { name?: string }
      payload?: {
        ref?: string
        commits?: { sha: string; message: string }[]
      }
    }

    const events: PushEvent[] = await res.json()
    if (!Array.isArray(events)) return []

    const commits: CommitItem[] = []

    for (const event of events) {
      if (event.type !== "PushEvent") continue
      const repo = event.repo?.name?.split("/")[1] ?? "unknown"
      // payload.ref looks like "refs/heads/main" — strip the prefix
      const branch = event.payload?.ref?.replace("refs/heads/", "") ?? "main"
      // Commits within a push are ordered oldest-first
      const pushed = [...(event.payload?.commits ?? [])].reverse()
      for (const commit of pushed) {
        commits.push({
          sha: commit.sha.slice(0, 7),
          repo,
          branch,
          message: commit.message.split("\n")[0],
          date: event.created_at,
        })
        if (commits.length >= limit) return commits
      }
    }
    return commits
  } catch {
    return []
  }
}
