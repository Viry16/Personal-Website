# Excel Viryan — Portfolio

A "console"-themed personal portfolio for **Excel Viryan** — an AI/ML engineer,
full-stack developer, and IoT builder at President University. Built with a
terminal aesthetic, an interactive canvas background, live GitHub activity, and
a filterable project gallery.

🔗 **Live:** _add your deployment URL here_

---

## ✨ Features

- **Interactive dot-field background** — a cursor-reactive `<canvas>` that bulges
  and glows around the pointer, fixed behind every page. Theme-aware green
  palette with scattered "special" accent dots.
- **Live GitHub activity** — a real contribution heatmap (with per-day hover
  tooltips and streak stats) plus a development feed of recent commits. Falls
  back gracefully from the events API to a repository scan.
- **Interactive terminal** — a working mini-shell on the About page
  (`help`, `ls`, `cat`, `echo`, …) with a hidden easter-egg command.
- **Filterable project gallery** — minimal, image-forward cards with scroll
  reveals, filterable by Software / Hardware.
- **Light / dark / system theming** via `next-themes`, with a theme-aware
  cursor glow.
- **Motion** — consistent scroll-reveal animations powered by Framer Motion.
- **Fully responsive** — mobile, tablet, and desktop.

## 🧱 Tech Stack

| Area | Choice |
|------|--------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack, React 19, TypeScript) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) (CSS-first, no config file) |
| Animation | [Motion](https://motion.dev) (Framer Motion) |
| Theming | [next-themes](https://github.com/pacocoursey/next-themes) |
| Icons | [lucide-react](https://lucide.dev) (brand icons are custom SVG in `SocialIcons.tsx`) |
| Utilities | `clsx` + `tailwind-merge` via a `cn()` helper |
| Fonts | Space Grotesk (titles), Inter (body), JetBrains Mono (code) — via `next/font` |

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Scripts

```bash
npm run dev      # start the dev server (Turbopack)
npm run build    # production build
npm run start    # serve the production build
npm run lint     # ESLint (CI: npx eslint src --max-warnings=0)
```

## 🗂️ Project Structure

```
src/
  app/
    layout.tsx          # root layout: fonts, ThemeProvider, global DotField
    page.tsx            # home (ISR, revalidate 3600)
    about/              # about + interactive terminal + dev feed
    projects/           # filterable project gallery
    globals.css         # Tailwind import + CSS theme variables
  components/
    SiteDotField.tsx    # theme-aware wrapper for the canvas background
    BottomDock.tsx      # floating navigation dock
    sections/           # page sections (hero, work, activity, projects…)
    ui/                 # DotField, ProjectCard, Reveal, SocialIcons…
  lib/
    site.ts             # name, links, email, resume (single source of truth)
    projects.ts         # project data + types
    github.ts           # server-side GitHub contributions + commits
    utils.ts            # cn() and timeAgo()
```

Content lives in `src/lib` — edit `site.ts` for identity/links and
`projects.ts` to add projects.

---

Built by Excel Viryan.
