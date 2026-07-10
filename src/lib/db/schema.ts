import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  timestamp,
  customType,
} from "drizzle-orm/pg-core"

/**
 * Postgres `bytea` (raw binary). Drizzle has no built-in bytea type; postgres-js
 * accepts a Buffer on write and returns a Uint8Array on read.
 */
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea"
  },
})

/**
 * Projects shown on the home page and /projects gallery.
 * Mirrors the `Project` shape in `src/lib/projects.ts` (the static seed data),
 * plus DB-only columns: `id`, `sortOrder`, and timestamps.
 */
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description").notNull(),
  // Postgres text[] columns. Always provided by the app, so no DB default.
  highlights: text("highlights").array().notNull(),
  tags: text("tags").array().notNull(),
  image: text("image").notNull(),
  type: text("type").notNull(), // "Software" | "Hardware"
  period: text("period").notNull(),
  role: text("role").notNull(),
  status: text("status").notNull(), // "Live" | "In Progress" | "Archived"
  website: text("website"),
  source: text("source"),
  featured: boolean("featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

/**
 * Single-row table (id is always 1) holding editable site identity/links.
 * Mirrors the `SITE` object in `src/lib/site.ts`.
 */
export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  name: text("name").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  email: text("email").notNull(),
  githubUsername: text("github_username").notNull(),
  github: text("github").notNull(),
  linkedin: text("linkedin").notNull(),
  instagram: text("instagram").notNull(),
  resume: text("resume").notNull(),
  logo: text("logo").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

/**
 * Uploaded images, stored as raw bytes in their own table so `projects` queries
 * stay small. Served (with long cache headers) via the `/api/images/[id]` route,
 * which is what the `projects.image` column points at for uploaded images.
 */
export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  data: bytea("data").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type ProjectRow = typeof projects.$inferSelect
export type NewProjectRow = typeof projects.$inferInsert
export type SiteSettingsRow = typeof siteSettings.$inferSelect
export type ImageRow = typeof images.$inferSelect
