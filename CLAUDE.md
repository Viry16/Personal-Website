@AGENTS.md

# Project: Excel Viryan Portfolio

Personal portfolio site for Excel Viryan — an AI/ML engineer, full-stack
developer, and IoT builder at President University. A "console"-themed
single-developer showcase with a terminal aesthetic, live GitHub activity, and
project galleries.

## Critical: Next.js version

This project runs **Next.js 16.2.10 with Turbopack**. It has breaking changes
vs. older versions and vs. model training data. **Always read the bundled docs
under `node_modules/next/dist/docs/` before writing framework code.** See
`AGENTS.md` (imported above).

## Tech stack

- **Framework:** Next.js 16 (App Router, React 19, Turbopack, TypeScript)
- **Styling:** Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`)
- **Theming:** `next-themes` (class strategy, light/dark/system)
- **Icons:** `lucide-react` — note brand icons (GitHub, LinkedIn, Instagram)
  were removed from this version; use `src/components/ui/SocialIcons.tsx`
- **Utilities:** `clsx` + `tailwind-merge` via the `cn()` helper

## Commands

```bash
npm run dev      # local dev server (Turbopack)
npm run build    # production build — run before considering work done
npm run start    # serve the production build
npm run lint     # ESLint; CI-equivalent: npx eslint src --max-warnings=0
```

Always run `npx eslint src --max-warnings=0` and `npm run build` after changes.
The build enforces `react/no-unescaped-entities` and
`react-hooks/set-state-in-effect` as errors.

## Architecture

```
src/
  app/
    layout.tsx          # root layout, fonts, ThemeProvider, metadata (from SITE)
    page.tsx            # home — `export const revalidate = 3600` for ISR
    icon.png            # app/favicon, copied from public/assets/image/logo.png
    globals.css         # Tailwind import + CSS theme variables + keyframes
    about/page.tsx      # about + interactive terminal + "now" feed
    projects/page.tsx   # client component: filterable project gallery
  components/
    BottomDock.tsx      # floating nav dock (client) with logo + theme toggle
    ThemeProvider.tsx   # next-themes wrapper
    ThemeToggle.tsx     # light/dark switch (uses useSyncExternalStore for mount)
    sections/           # page sections (Hero-style home preview, work, etc.)
    ui/                 # reusable: ProjectCard, PageHeader, SocialIcons
  lib/
    site.ts             # single source of truth for name, links, email, resume
    projects.ts         # PROJECTS data + types; FEATURED_PROJECTS derived
    github.ts           # server-side GitHub contributions + recent commits
    utils.ts            # cn() and timeAgo()
```

## Conventions

- **Colors:** Never hardcode `zinc-*`/`white`/`black` for themed surfaces. Use
  the CSS variables via Tailwind arbitrary values: `bg-(--color-bg)`,
  `text-(--color-text-primary)`, `border-(--color-border)`, etc. These are
  defined in `globals.css` under `:root` (light) and `.dark`. Fixed-dark UI
  (e.g. the terminal body) may use literal `zinc-*` intentionally.
- **Do NOT** re-declare color variables inside `@theme` as
  `--color-x: var(--color-x)` — that self-reference cycle breaks theming.
- **Content lives in `src/lib`**, not inline in components. Add projects to
  `projects.ts`; change identity/links in `site.ts`.
- **Server vs. client:** Data-fetching sections (e.g. `CodeActivitySection`)
  are async Server Components. Only mark `"use client"` when a component needs
  state, effects, or browser APIs.

## GitHub activity integration

`src/lib/github.ts` powers the contribution graph and dev feed on the home page.

- With `GITHUB_TOKEN` set (see `.env.example`), it uses the official GraphQL
  contributions API. Without a token, it falls back to the public
  `github-contributions-api` proxy — no auth required.
- Recent commits come from the user's public push events.
- The username is `SITE.githubUsername`. It must match the real GitHub account
  or the graph will be empty.
- Data is cached with `next: { revalidate: 3600 }` and the home page sets
  `export const revalidate = 3600`.

## Gotchas

- Resume/CV lives at `public/assets/cv/` — the filename has a space, so it is
  URL-encoded in `site.ts` (`%20`).
- The dock logo sits on a fixed dark chip because the logo mark is light and
  would disappear on a light background.
