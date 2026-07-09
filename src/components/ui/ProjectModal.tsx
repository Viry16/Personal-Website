"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Globe, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Project, ProjectStatus } from "@/lib/projects";
import { GitHubIcon } from "@/components/ui/SocialIcons";

/* ------------------------------------------------------------------ */
/*  Status pill (reused style from ProjectCard)                        */
/* ------------------------------------------------------------------ */
const STATUS_COLORS: Record<ProjectStatus, string> = {
  Live: "text-(--color-signal) border-(--color-signal)/30 bg-(--color-signal)/10",
  "In Progress":
    "text-(--color-highlight) border-(--color-highlight)/30 bg-(--color-highlight)/10",
  Archived:
    "text-(--color-text-muted) border-(--color-text-muted)/30 bg-(--color-text-muted)/10",
};

function Badge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-mono font-medium uppercase tracking-wide backdrop-blur-md ${className ?? ""}`}
    >
      {label}
    </span>
  );
}

function StatusDot({ status }: { status: ProjectStatus }) {
  return (
    <span className="relative flex h-1.5 w-1.5">
      {status === "Live" && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
      )}
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Modal                                                              */
/* ------------------------------------------------------------------ */
interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  /* Lock body scroll & close on Escape */
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!project) return;
    document.body.classList.add("modal-open");
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", handleKey);
    };
  }, [project, handleKey]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="project-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-12 md:py-20"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="pointer-events-none fixed inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Panel */}
          <motion.div
            key="project-modal-panel"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-2xl rounded-3xl border border-(--color-border) bg-(--color-surface) shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/70 backdrop-blur-md transition-colors hover:bg-black/70 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Hero image */}
            <div className="relative aspect-video w-full overflow-hidden rounded-t-3xl">
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="(min-width: 768px) 640px, 100vw"
                className="object-cover"
                priority
              />
            </div>

            {/* Content body */}
            <div className="p-6 md:p-8">
              {/* Badge row */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {project.status && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-mono font-medium uppercase tracking-wide backdrop-blur-md ${STATUS_COLORS[project.status]}`}
                  >
                    <StatusDot status={project.status} />
                    {project.status}
                  </span>
                )}
                <Badge
                  label={project.type}
                  className="border-(--color-border) text-(--color-text-muted)"
                />
              </div>

              {/* Title & subtitle */}
              <h2 className="font-display text-2xl font-bold tracking-tight text-(--color-text-primary)">
                {project.title}
              </h2>
              {project.subtitle && (
                <p className="mt-1 text-sm text-(--color-text-secondary)">
                  {project.subtitle}
                </p>
              )}

              {/* Period · Role */}
              {(project.period || project.role) && (
                <p className="mt-3 font-mono text-xs uppercase tracking-wider text-(--color-text-muted)">
                  {[project.period, project.role].filter(Boolean).join(" · ")}
                </p>
              )}

              {/* Description */}
              <p className="mt-4 text-sm leading-relaxed text-(--color-text-secondary)">
                {project.description}
              </p>

              {/* Highlights */}
              {project.highlights && project.highlights.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">
                    Highlights
                  </h3>
                  <ul className="space-y-2">
                    {project.highlights.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-2.5 text-sm leading-relaxed text-(--color-text-secondary)"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-signal)" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tech stack */}
              {project.tags && project.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">
                    Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-(--color-border) bg-(--color-bg) px-3 py-1 font-mono text-[11px] text-(--color-text-secondary)"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action links */}
              {(project.website || project.source) && (
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {project.website && (
                    <a
                      href={project.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-(--color-text-primary) px-5 py-2.5 text-sm font-medium text-(--color-bg) transition-opacity hover:opacity-80"
                    >
                      <Globe className="h-4 w-4" />
                      Live Preview
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                  )}
                  {project.source && (
                    <a
                      href={project.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-(--color-border) px-5 py-2.5 text-sm font-medium text-(--color-text-secondary) transition-colors hover:border-(--color-text-muted) hover:text-(--color-text-primary)"
                    >
                      <GitHubIcon className="h-4 w-4" />
                      Source Code
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
