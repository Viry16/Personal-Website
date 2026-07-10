/** Shape of the editable site identity/links (DB-backed via `getSiteSettings`). */
export type SiteSettings = {
  name: string
  title: string
  description: string
  email: string
  githubUsername: string
  github: string
  linkedin: string
  instagram: string
  resume: string
  logo: string
}

/**
 * Static defaults. Used to seed the database and as the fallback the data layer
 * returns when `DATABASE_URL` is not configured or a query fails.
 */
export const SITE = {
  name: "Excel Viryan",
  title: "Excel Viryan | Console",
  description:
    "AI/ML engineer, full-stack developer, and IoT builder at President University.",
  email: "viryanexcel@gmail.com",
  githubUsername: "Viry16",
  github: "https://github.com/Viry16",
  linkedin: "https://linkedin.com/in/excelviryan",
  instagram: "https://instagram.com/excelviryan12",
  resume: "/assets/cv/CV_Excel%20Viryan.pdf",
  logo: "/assets/image/logo/logo.svg",
} as const
