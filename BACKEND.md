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

The site **logo** (dock) and **resume/CV** (home hero) are now dynamic too —
their Server Component parents fetch `getSiteSettings()` and pass the values into
`BottomDock` / `HomePreview` as props.

> A few client components still import the static `SITE` object directly
> (`DevelopmentFeed`, `CodeActivitySection`) for defaults that rarely change. To
> make them dynamic, fetch `getSiteSettings()` in a parent Server Component and
> pass the values down as props — same pattern used for `ContactCTA`,
> `BottomDock`, and `HomePreview`.

## One-time setup

Any Postgres works — the app talks standard Postgres through Drizzle, so the
provider is a swap of `DATABASE_URL` with no code changes. **Supabase** is the
recommended host (free tier, works on Vercel, nothing to run locally).

### 1. Create a Supabase project

1. Sign up at [supabase.com](https://supabase.com) → **New project**.
2. Set a **database password** (save it) and pick a region close to you.
3. Wait for it to finish provisioning (~2 min).

### 2. Copy the connection string

In the project, click **Connect** (top bar) → **Connection pooling** →
**Transaction** mode. Copy the URI. It looks like:

```
postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
```

Replace `<password>` with your database password (URL-encode special
characters: `@`→`%40`, `#`→`%23`, `!`→`%21`, `$`→`%24`, `%`→`%25`).

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
SESSION_SECRET=          # a long random string (see below)
ADMIN_PASSWORD=          # the password you will log in with
```

SSL is enabled automatically for any non-localhost host — no `?sslmode=` needed.
No `openssl`? Generate `SESSION_SECRET` in Supabase's SQL editor with
`select encode(gen_random_bytes(32), 'base64');`.

### 4. Create the tables and seed data

```bash
npm run db:push     # create tables from src/lib/db/schema.ts
npm run db:seed     # import the current projects + site settings
```

> If `db:push` ever errors on the pooled URL, set `DIRECT_URL` in `.env.local`
> to Supabase's **Direct connection** string (port 5432) and re-run — migrations
> will use it automatically. You can browse the data in Supabase's **Table
> editor**, or with `npm run db:studio`.

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
   Use the **pooled** (Transaction, port 6543) Supabase URL.
3. Because Supabase is hosted, the same database you used locally is reachable
   from Vercel — if you already ran `db:push` + `db:seed` against it, the tables
   and content (including anything you uploaded) are already there. Nothing else
   to run.
4. Deploy. After content edits, the affected pages revalidate automatically
   (`revalidatePath` in the Server Actions).

> **Tip:** using one Supabase project for both local dev and production is the
> simplest setup. If you'd rather isolate them, create a second Supabase project
> and use its URL as the Vercel `DATABASE_URL`, then run `db:push`/`db:seed`
> against it once.

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
