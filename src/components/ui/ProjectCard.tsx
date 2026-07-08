"use client";

import Image from "next/image"
import { Globe, ArrowUpRight } from "lucide-react"
import { motion } from "motion/react"
import type { Project, ProjectStatus } from "@/lib/projects"
import { GitHubIcon } from "@/components/ui/SocialIcons"
import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<ProjectStatus, string> = {
  Live: "text-(--color-signal)",
  "In Progress": "text-(--color-highlight)",
  Archived: "text-(--color-text-muted)",
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-mono font-medium uppercase tracking-wide backdrop-blur-md",
        STATUS_STYLES[status]
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {status === "Live" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
        )}
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      {status}
    </span>
  )
}

type ProjectCardProps = Partial<Project> &
  Pick<Project, "title" | "description" | "tags" | "image"> & {
    showHighlights?: boolean
    /** Position in a list, used to stagger the scroll-reveal */
    index?: number
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
  index = 0,
}: ProjectCardProps) {
  const primaryLink = website ?? source

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.08,
      }}
      className="group flex flex-col"
    >
      {/* Big image — the focal point of the minimal layout */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />

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

      {/* Quiet, generously-spaced text block */}
      <div className="pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg font-semibold tracking-tight text-(--color-text-primary)">
            {title}
          </h3>
          {period && (
            <span className="shrink-0 font-mono text-xs text-(--color-text-muted)">
              {period}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="mt-0.5 text-sm text-(--color-text-secondary)">
            {subtitle}
          </p>
        )}

        {role && (
          <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-(--color-text-muted)">
            {role}
          </p>
        )}

        <p className="mt-3 text-sm leading-relaxed text-(--color-text-secondary)">
          {description}
        </p>

        {showHighlights && highlights && highlights.length > 0 && (
          <ul className="mt-4 space-y-1.5">
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

        {/* Minimal tags — plain mono words, no boxes */}
        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-(--color-text-muted)">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        {(website || source) && (
          <div className="mt-5 flex items-center gap-4 text-sm font-medium text-(--color-text-secondary)">
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
        )}
      </div>
    </motion.article>
  )
}
