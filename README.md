# Portfolio

Personal portfolio site for **Yashwanth Reddy Medapati**, showcasing full-stack and machine learning projects for Software Engineer, Machine Learning Engineer, SDE, and Data Analyst roles.

The centerpiece is **Yash**, a rule-based portfolio guide that answers visitor questions about Yash's resume, projects, and personal FAQ, then jumps visitors to the right section when helpful. It only draws from curated data in this repo.

## Features

- **Resume-driven content** - projects, skills, education, and experience are sourced from [`src/data/resume.ts`](src/data/resume.ts).
- **Personal FAQ** - chatbot-safe personal details live in [`src/data/personalQuestions.ts`](src/data/personalQuestions.ts) and [`src/lib/jrYashBrain.ts`](src/lib/jrYashBrain.ts).
- **Yash assistant** - keyboard-accessible PowerShell-style chat panel with curated Q&A, quick actions, easter eggs, and a draggable 2D sprite guide.
- **Sprite animation pipeline** - regenerated Yash frames use shared transparent canvases per animation so idle/run/jump/sleep states stay stable.
- **Interactive finale** - bottom scene includes the small Yash brick transition, 3D Yash avatar with cursor-following pupils/body, visitor counter, and contact shortcuts.
- **Project proof panels** - each project card shows metrics, stack, repo links, and optional screenshot/demo slots.
- **Section navigation** - sticky scroll-spy navigation, mobile drawer, smooth section jumps, and hover micro-interactions.
- **Resume snapshot + PDF preview** - recruiter-friendly highlights before the embedded resume viewer.
- **Contact shortcuts** - copy-email action plus an email-draft form that never sends silently.
- **SEO/social metadata** - Open Graph and Twitter metadata with `NEXT_PUBLIC_SITE_URL` support.

## Tech Stack

- **Framework:** Next.js 16, App Router, Turbopack
- **Language:** TypeScript, React 19
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui and Base UI primitives
- **Animation:** Framer Motion
- **Icons:** Lucide
- **Testing:** Playwright E2E, ESLint, production build validation

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Scripts

```bash
npm run lint       # run ESLint
npm run build      # production build
npm run start      # serve the production build locally
npm run test:e2e   # run Playwright tests
```

## Project Structure

```text
src/
  app/                  # Next.js layout, page, metadata images, global styles
  components/           # Page sections and reusable UI
    JrYash/              # Assistant state, panel, character sprite animation
    ui/                  # shadcn/ui primitives
  data/resume.ts         # Single source of truth for portfolio content
  lib/jrYashBrain.ts     # Yash's curated intent/answer map
public/
  avatar/                # 3D avatar, pupil, nav hover, and question-block assets
  yash/                  # Generated 2D Yash sprite frames
  Yashwanth_Reddy_Medapati_Resume.pdf
e2e/                     # Playwright coverage for nav, links, resume, assistant
```

## Updating Content

Edit [`src/data/resume.ts`](src/data/resume.ts) for projects, links, skills, education, and experience. The visible site and Yash answers both read from this data, which keeps public claims consistent.

Edit [`src/lib/jrYashBrain.ts`](src/lib/jrYashBrain.ts) when adding a new bot answer. Keep answers factual and avoid inventing metrics.

To add real project screenshots, set a project's `image` field to a path under `public/`. To add a live demo, set `demoUrl`.

## Sprite Assets

The 2D Yash frames are generated from `design/yash-sprite-sheet-source.png`:

```bash
node scripts/generate-yash-sprites.js
```

The generator preserves one canvas size per animation group, which prevents frame jitter.

## Deployment

Set the deployed domain before launch so social previews resolve correctly:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Then deploy normally to Vercel or any host that supports Next.js.

## License

MIT. See [`LICENSE`](LICENSE).
