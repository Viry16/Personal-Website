import type { ContributionDay, Contributions } from "@/lib/github"
import { cn } from "@/lib/utils"

const LEVEL_CLASSES = [
  "bg-(--color-border)/60",
  "bg-(--color-signal)/25",
  "bg-(--color-signal)/50",
  "bg-(--color-signal)/75",
  "bg-(--color-signal)",
]

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

// On small screens only the most recent weeks are shown, so the cells stay
// readable; the full year renders from md upward. No horizontal scrolling.
const MOBILE_WEEKS = 26

function monthOf(day: ContributionDay): number {
  return Number(day.date.slice(5, 7)) - 1
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

function tooltipText(day: ContributionDay): string {
  const label =
    day.count === 0
      ? "No contributions"
      : `${day.count} contribution${day.count === 1 ? "" : "s"}`
  return `${label} on ${formatDate(day.date)}`
}

function computeStats(days: ContributionDay[]) {
  let longestStreak = 0
  let currentStreak = 0
  let run = 0
  let busiest: ContributionDay | null = null

  for (const day of days) {
    if (day.count > 0) {
      run += 1
      longestStreak = Math.max(longestStreak, run)
      if (!busiest || day.count > busiest.count) busiest = day
    } else {
      run = 0
    }
  }
  // Streak still alive if the most recent day(s) have contributions
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) currentStreak += 1
    else break
  }

  return { longestStreak, currentStreak, busiest }
}

export function ContributionGraph({ data }: { data: Contributions }) {
  const { days } = data
  if (days.length === 0) return null

  // Pad the first week so each column starts on Sunday, like GitHub's graph
  const firstWeekday = new Date(`${days[0].date}T00:00:00Z`).getUTCDay()
  const cells: (ContributionDay | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...days,
  ]
  const weeks: (ContributionDay | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  const monthLabels = weeks.map((week, i) => {
    const firstDay = week.find((day): day is ContributionDay => day !== null)
    if (!firstDay) return null
    const month = monthOf(firstDay)
    if (i === 0) return MONTHS[month]
    const prevDay = weeks[i - 1].find(
      (day): day is ContributionDay => day !== null
    )
    return prevDay && monthOf(prevDay) !== month ? MONTHS[month] : null
  })

  const mobileCutoff = weeks.length - MOBILE_WEEKS
  const hiddenOnMobile = (weekIndex: number) =>
    weekIndex < mobileCutoff && "max-md:hidden"

  const { longestStreak, currentStreak, busiest } = computeStats(days)

  return (
    <div className="w-full">
      {/* Month labels — same fluid columns as the grid below */}
      <div className="mb-2 flex gap-[3px] font-mono text-[10px] text-(--color-text-muted)">
        {monthLabels.map((label, i) => (
          <div
            key={i}
            className={cn("relative h-4 min-w-0 flex-1", hiddenOnMobile(i))}
          >
            {label && (
              <span className="absolute left-0 whitespace-nowrap">{label}</span>
            )}
          </div>
        ))}
      </div>

      {/* Heatmap grid — fluid, always fits the container width */}
      <div className="flex gap-[3px]">
        {weeks.map((week, weekIndex) => (
          <div
            key={weekIndex}
            className={cn(
              "flex min-w-0 flex-1 flex-col gap-[3px]",
              hiddenOnMobile(weekIndex)
            )}
          >
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const day = week[dayIndex]
              if (!day) {
                return <div key={dayIndex} className="aspect-square w-full" />
              }
              return (
                <div key={dayIndex} className="group/day relative aspect-square w-full">
                  <div
                    className={`h-full w-full rounded-[2px] ${LEVEL_CLASSES[day.level]} ring-(--color-text-primary)/40 transition-shadow group-hover/day:ring-1`}
                  />
                  {/* GitHub-style hover tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 scale-95 whitespace-nowrap rounded-md border border-(--color-border) bg-(--color-bg) px-2 py-1 text-[11px] font-medium text-(--color-text-primary) opacity-0 shadow-lg transition-all duration-150 group-hover/day:scale-100 group-hover/day:opacity-100">
                    {tooltipText(day)}
                    <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-4 border-transparent [border-top-color:var(--color-border)]" />
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Stats + legend */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] text-(--color-text-muted)">
        <div className="flex flex-wrap gap-4">
          <span>
            Current streak{" "}
            <strong className="font-semibold text-(--color-text-secondary)">
              {currentStreak}d
            </strong>
          </span>
          <span>
            Longest streak{" "}
            <strong className="font-semibold text-(--color-text-secondary)">
              {longestStreak}d
            </strong>
          </span>
          {busiest && (
            <span>
              Busiest day{" "}
              <strong className="font-semibold text-(--color-text-secondary)">
                {busiest.count}
              </strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span className="mr-1">Less</span>
          {LEVEL_CLASSES.map((levelClass) => (
            <div key={levelClass} className={`h-3 w-3 rounded-[2px] ${levelClass}`} />
          ))}
          <span className="ml-1">More</span>
        </div>
      </div>
    </div>
  )
}
