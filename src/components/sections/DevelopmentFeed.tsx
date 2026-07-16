import { GitBranch } from "lucide-react"
import { getRecentCommits } from "@/lib/github"
import { timeAgo } from "@/lib/utils"

interface DevelopmentFeedProps {
  githubUsername: string
  githubUrl: string
}

export async function DevelopmentFeed({
  githubUsername,
  githubUrl,
}: DevelopmentFeedProps) {
  const commits = await getRecentCommits(githubUsername, 5)

  return (
    <div>
      <h3 className="mb-2 font-display text-sm font-medium text-(--color-text-primary)">
        Development Feed
      </h3>
      <p className="mb-6 max-w-xl text-sm leading-relaxed text-(--color-text-secondary)">
        When the graph goes quiet, I haven&apos;t stopped — if I&apos;m not
        writing code, I&apos;m designing, building hardware, or sketching the next
        idea.
      </p>

      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6">
        {commits.length > 0 ? (
          <div className="space-y-6 font-mono [mask-image:linear-gradient(to_bottom,black_60%,transparent)] pb-3">
            {commits.map((commit, i) => (
              <div key={`${commit.sha}-${i}`} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2 text-(--color-text-muted)">
                    <span className={i === 0 ? "bg-gradient-to-r from-(--color-signal) to-(--color-highlight) bg-clip-text text-transparent font-bold" : "text-(--color-signal)"}>{commit.sha}</span>
                    <span>in</span>
                    <span className="text-(--color-text-secondary)">
                      {commit.repo}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-(--color-border) px-2 py-0.5 text-(--color-text-secondary)">
                      <GitBranch className="h-3 w-3" />
                      {commit.branch}
                    </span>
                  </div>
                  <span className={i === 0 ? "font-medium text-(--color-text-primary)" : "text-(--color-text-muted)"}>
                    {timeAgo(commit.date)}
                  </span>
                </div>
                <div className={`ml-2 border-l-2 py-1 pl-4 text-sm ${i === 0 ? "border-(--color-signal) text-(--color-text-primary) font-medium" : "border-(--color-border) text-(--color-text-primary)"}`}>
                  {commit.message}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-(--color-text-secondary)">
            No recent public commits to show — plenty happening off the graph,
            though. Catch the latest on{" "}
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-(--color-text-primary)"
            >
              GitHub
            </a>
            .
          </p>
        )}
      </div>
    </div>
  )
}
