import { getContributions } from "@/lib/github"
import { SITE } from "@/lib/site"
import { ContributionGraph } from "./ContributionGraph"

export async function CodeActivitySection() {
  const contributions = await getContributions(SITE.githubUsername)

  return (
    <section className="py-16 md:py-24 border-t border-(--color-border)">
      <div className="max-w-5xl">
        {/* Contribution graph */}
        <div>
          <div className="flex items-end justify-between mb-6">
            <h2 className="flex items-center gap-3 font-display text-2xl font-bold text-(--color-text-primary)">
              Code Activity
            </h2>
            {contributions && (
              <div className="text-sm text-(--color-text-secondary)">
                <strong className="font-medium text-(--color-text-primary)">
                  {contributions.total.toLocaleString()}
                </strong>{" "}
                contributions in the last year
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6">
            {contributions ? (
              <ContributionGraph data={contributions} />
            ) : (
              <p className="text-sm text-(--color-text-secondary)">
                Contribution data is unavailable right now — see my activity
                directly on{" "}
                <a
                  href={SITE.github}
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
      </div>
    </section>
  )
}
