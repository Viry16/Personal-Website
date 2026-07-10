# Backend & Admin

This site now has a small backend so you can update **projects** and **site
identity/links** from a password-protected admin panel instead of editing code
and redeploying.

- **Database:** PostgreSQL via [Drizzle ORM](https://orm.drizzle.team)
- **Mutations:** Next.js Server Actions (no separate API server)
- **Auth:** single admin password → signed JWT session cookie (via `jose`)
- **Public pages** read from the DB and fall back to the static seed data in
  `src/lib/projects.ts` / `src/lib/site.ts` when no database is configured, so
  the site always renders.

Everything lives inside this one Next.js project.

## What is dynamic

| Area | Public source | Edit at |
| --- | --- | --- |
| Projects (home + `/projects`) | `getProjects()` → DB | `/admin` |
| Project images (uploaded) | `/api/images/[id]` → DB | `/admin` (project form) |
| Site title & meta description | `getSiteSettings()` → DB | `/admin/settings` |
| Contact email + social links | `getSiteSettings()` → DB | `/admin/settings` |
| GitHub activity | live GitHub API (unchanged) | — |

### Image uploads

Project images can be **uploaded** from the admin form (not just referenced by
path/URL). Uploaded files are stored as binary in a dedicated `images` table and
served via `/api/images/[id]` with long, immutable cache headers, so the database
is read at most once per image before browsers and any CDN take over.

- Kept in a separate table so `projects` queries never carry binary data.
- Max upload size is 4 MB (`MAX_IMAGE_BYTES` in `src/lib/images.ts`; the matching
  Server Action `bodySizeLimit` is set to 5 MB in `next.config.ts`).
- Replacing or deleting a project deletes its old uploaded image automatically.
- You can still paste a local `/assets/...` path or an external `https://` URL
  instead of uploading — whichever is provided, an uploaded file wins.

> Because uploads live in Postgres, this works on read-only/ephemeral hosts like
> Vercel where writing to `/public` at runtime would not persist. For very large
> media libraries, switch the store to object storage (S3 / Vercel Blob) behind
> the same `/api/images` seam.

> Client components that still import the static `SITE` object directly
> (`BottomDock`, `HomePreview`, `DevelopmentFeed`, `CodeActivitySection`) keep
> using the defaults. To make them dynamic too, fetch `getSiteSettings()` in a
> parent Server Component and pass the values down as props — same pattern used
> for `ContactCTA`.

## One-time setup

### 1. Create a Postgres database

Any Postgres works. Easiest free options:

- **[Neon](https://neon.tech)** — create a project, copy the **pooled**
  connection string.
- **[Supabase](https://supabase.com)** — Project settings → Database → use the
  **Connection pooling** (Transaction) string.

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
DATABASE_URL=postgres://user:password@host/db?sslmode=require
SESSION_SECRET=          # openssl rand -base64 32
ADMIN_PASSWORD=          # the password you will log in with
```

### 3. Create the tables and seed data

```bash
npm run db:push     # create tables from src/lib/db/schema.ts
npm run db:seed     # import the current projects + site settings
```

Optional helpers:

```bash
npm run db:studio    # visual DB browser
npm run db:generate  # generate SQL migration files (for db:migrate workflow)
```

### 4. Run it

```bash
npm run dev
```

Visit `/login`, enter `ADMIN_PASSWORD`, and manage content at `/admin`.

## Migrations: push vs. generate/migrate

- **`db:push`** syncs the schema straight to the database — fastest for solo dev.
- **`db:generate` + `db:migrate`** writes versioned SQL under `drizzle/` and
  applies it — better once the site is live and you want a change history.

Pick one workflow. Start with `push`; switch to `generate`/`migrate` when you
want tracked migrations.

## Deployment (Vercel)

The app uses Server Components, Server Actions, ISR, and a proxy, so deploy to a
Node host — **Vercel** is the natural fit.

1. Push the repo to GitHub and import it in Vercel.
2. In **Project → Settings → Environment Variables**, add `DATABASE_URL`,
   `SESSION_SECRET`, `ADMIN_PASSWORD` (and optionally `GITHUB_TOKEN`).
   Use the **pooled** `DATABASE_URL` in production.
3. Run migrations against the production DB once — either locally with the
   production `DATABASE_URL` exported (`npm run db:push && npm run db:seed`), or
   via `db:migrate` in your pipeline.
4. Deploy. After content edits, the affected pages revalidate automatically
   (`revalidatePath` in the Server Actions).

> A static export (`output: 'export'`) will **not** work — it disables Server
> Actions, ISR, and the proxy. Use a Node/serverless host.

## Security notes

- Auth is a single shared password suitable for a personal site. The proxy
  (`src/proxy.ts`) does an optimistic cookie check; every admin page and Server
  Action independently calls `verifySession()` (the real check).
- To upgrade to real accounts / OAuth later, swap the auth layer for
  [NextAuth.js](https://authjs.dev) or [Better Auth](https://better-auth.com) —
  the `verifySession()` seam is where they plug in.

## File map

```
src/
  proxy.ts                     # gates /admin (Next 16 "middleware")
  lib/
    db/
      schema.ts                # Drizzle tables: projects, site_settings
      index.ts                 # lazy Postgres client (null when no DATABASE_URL)
      seed.ts                  # npm run db:seed
    data.ts                    # getProjects / getFeaturedProjects / getSiteSettings
    auth/
      crypto.ts                # JWT sign/verify (proxy-safe)
      session.ts               # cookie session + verifySession()
  app/
    login/page.tsx             # password login
    admin/                     # dashboard, project new/edit, settings
    actions/                   # auth.ts, projects.ts, settings.ts (Server Actions)
drizzle.config.ts              # drizzle-kit config
```
