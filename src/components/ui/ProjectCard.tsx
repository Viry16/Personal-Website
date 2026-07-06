import Image from "next/image"
import { Globe, ArrowUpRight } from "lucide-react"
import type { Project, ProjectStatus } from "@/lib/projects"
import { GitHubIcon } from "@/components/ui/SocialIcons"
import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<ProjectStatus, string> = {
  Live: "text-(--color-signal) bg-(--color-signal)/10",
  "In Progress": "text-(--color-highlight) bg-(--color-highlight)/10",
  Archived: "text-(--color-text-muted) bg-(--color-border)",
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono font-medium uppercase tracking-wide backdrop-blur-md",
        STATUS_STYLES[status]
      )}
    >
      {status === "Live" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {status}
    </span>
  )
}

type ProjectCardProps = Partial<Project> &
  Pick<Project, "title" | "description" | "tags" | "image"> & {
    showHighlights?: boolean
  }

export function ProjectCard({
  title,
  subtitle,
  description,
  highlights,
  tags,
  image,
  website,
  source,
  period,
  role,
  status,
  showHighlights = true,
}: ProjectCardProps) {
  const primaryLink = website ?? source

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) transition-all duration-300 hover:-translate-y-1 hover:border-(--color-text-muted) hover:shadow-xl hover:shadow-black/5">
      <div className="relative aspect-video w-full overflow-hidden bg-(--color-border)">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient scrim so overlaid chips stay legible on any image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 opacity-70" />

        {status && (
          <div className="absolute left-3 top-3">
            <StatusBadge status={status} />
          </div>
        )}

        {primaryLink && (
          <a
            href={primaryLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${title}`}
            className="absolute right-3 top-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-white/90 text-black opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110"
          >
            <ArrowUpRight className="h-4 w-4" />
          </a>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <h3 className="text-base font-semibold text-(--color-text-primary)">
            {title}
          </h3>
          {period && (
            <span className="shrink-0 font-mono text-xs text-(--color-text-muted)">
              {period}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="mb-2 text-sm text-(--color-text-secondary)">{subtitle}</p>
        )}

        {role && (
          <p className="mb-3 font-mono text-[11px] uppercase tracking-wider text-(--color-text-muted)">
            {role}
          </p>
        )}

        <p className="mb-4 text-sm leading-relaxed text-(--color-text-secondary)">
          {description}
        </p>

        {showHighlights && highlights && highlights.length > 0 && (
          <ul className="mb-6 space-y-1.5">
            {highlights.map((item, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm leading-relaxed text-(--color-text-secondary)"
              >
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-(--color-signal)" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mb-6 mt-auto flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-(--color-border) px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-(--color-text-secondary)"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm font-medium text-(--color-text-secondary)">
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition-colors hover:text-(--color-text-primary)"
            >
              <Globe className="h-4 w-4" />
              Website
            </a>
          )}
          {source && (
            <a
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition-colors hover:text-(--color-text-primary)"
            >
              <GitHubIcon className="h-4 w-4" />
              Source
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
