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
    /** Position in a list, used to stagger the scroll-reveal */
    index?: number
    /** Called when the card body is clicked (opens the detail modal) */
    onClick?: () => void
  }

export function ProjectCard({
  title,
  subtitle,
  shortDescription,
  description,
  tags,
  image,
  imageFit,
  website,
  source,
  status,
  onClick,
  index = 0,
}: ProjectCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      whileHover={{ y: -6 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.08,
        // hover lift uses its own snappy spring, independent of the reveal
        y: { type: "spring", stiffness: 300, damping: 22 },
      }}
      className="group flex flex-col cursor-pointer"
      onClick={onClick}
    >
      {/* Big image — the focal point of the minimal layout */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className={cn(
            "transition-transform duration-700 ease-out group-hover:scale-[1.05]",
            imageFit === "contain" ? "object-contain bg-black/5" : "object-cover"
          )}
        />

        {status && (
          <div className="absolute left-3 top-3">
            <StatusBadge status={status} />
          </div>
        )}

        {/* Quick-link arrow (opens external link without triggering modal) */}
        {(website || source) && (
          <a
            href={website ?? source}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${title}`}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-3 top-3 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-white/90 text-black opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110"
          >
            <ArrowUpRight className="h-4 w-4" />
          </a>
        )}
      </div>

      {/* Compact text block */}
      <div className="pt-5">
        <h3 className="font-display text-lg font-semibold tracking-tight text-(--color-text-primary)">
          {title}
        </h3>

        {subtitle && (
          <p className="mt-0.5 text-sm text-(--color-text-secondary)">
            {subtitle}
          </p>
        )}

        <p className="mt-3 text-sm leading-relaxed text-(--color-text-secondary) line-clamp-3">
          {shortDescription}
        </p>

        {/* Minimal tags — plain mono words */}
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
                onClick={(e) => e.stopPropagation()}
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
                onClick={(e) => e.stopPropagation()}
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
