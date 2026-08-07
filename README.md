# Yashwanth Reddy Medapati Portfolio

Interactive personal portfolio for **Yashwanth Reddy Medapati**, built to present full-stack engineering, machine learning projects, resume proof, and contact paths in one recruiter-friendly experience.

**Suggested GitHub description:**
Resume-grounded Next.js portfolio with an interactive Yash assistant, ML project proof panels, animated character system, demo media, and Playwright-tested recruiter workflows.

## Why This Exists

Most portfolio sites are static pages with a few cards. This one is built like a small product: content is structured, claims are centralized, interactions are tested, and every project card is designed to answer the questions a recruiter or hiring manager is likely to ask first.

The site focuses on roles in:

- Software Engineering
- Machine Learning Engineering
- Full-stack development
- Data analysis

## Highlights

- **Resume-grounded content:** projects, skills, education, experience, contact methods, and metadata are driven from typed data in [`src/data/resume.ts`](src/data/resume.ts).
- **Yash assistant:** a PowerShell-style chat guide that answers approved resume and personal questions, opens relevant sections, and stays available without blocking the page.
- **Project proof panels:** each project includes title, timeline, stack, proof bullets, metrics, repository links, and optional demo video links.
- **Animated character system:** 2D Yash sprite frames, a draggable guide, cursor-follow behavior, and a bottom finale scene with a larger 3D Yash avatar.
- **Recruiter-safe polish:** first-person copy, direct contact methods, resume preview, download path, opt-in sound, theme toggle, mobile navigation, and accessible controls.
- **Automated validation:** ESLint, production build, and Playwright coverage for navigation, contact links, resume PDF, project links, demo video media, and Yash chat behavior.

## Core Experience

Visitors can scan the site normally, or interact with Yash to ask questions such as:

- What projects should I look at first?
- What tech stack do you use?
- Do you need sponsorship?
- What roles are you applying for?
- Tell me about your background.
- How can I contact you?

The assistant uses curated local data instead of inventing answers. If a question is outside the approved information, it redirects the visitor toward the contact section.

## Tech Stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16, App Router, Turbopack |
| UI | React 19, TypeScript, Tailwind CSS v4 |
| Components | shadcn/ui, Base UI primitives |
| Animation | Framer Motion, custom sprite timing |
| Icons | Lucide |
| Testing | Playwright, ESLint, production build validation |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run lint       # run ESLint
npm run build      # create a production build
npm run start      # serve the production build locally
npm run test:e2e   # run Playwright tests
```

GitHub Actions runs lint, build, and Chromium Playwright checks on pushes and pull requests to `main`.

## Project Structure

```text
src/
  app/                  # Next.js layout, page, metadata images, global styles
  components/           # Page sections, animation systems, and reusable UI
    JrYash/              # Assistant state, chat panel, and 2D companion
    ui/                  # shadcn/ui and Base UI wrappers
  data/
    resume.ts            # Main portfolio content source
    personalQuestions.ts # Approved personal FAQ content
  lib/
    jrYashBrain.ts       # Deterministic answer and intent logic
    contactMethods.ts    # Contact links and copy values
public/
  avatar/                # 3D Yash, pupil, nav hover, and block assets
  demos/                 # Project demo videos
  profile/               # Profile photo
  yash/                  # Generated 2D Yash sprite frames
e2e/                     # Playwright tests for recruiter-critical flows
scripts/                 # Asset generation utilities
```

## Updating Portfolio Content

Edit [`src/data/resume.ts`](src/data/resume.ts) for:

- project names, timelines, bullets, metrics, stacks, and links
- skills and tool groups
- education and experience
- resume file path
- social and contact links

Edit [`src/data/personalQuestions.ts`](src/data/personalQuestions.ts) and [`src/lib/jrYashBrain.ts`](src/lib/jrYashBrain.ts) when adding new Yash answers. Keep answers factual, concise, and based only on approved information.

To add screenshots or demo media, place files under `public/` and reference them from the relevant project object.

## Sprite Assets

The 2D Yash frames are generated from `design/yash-sprite-sheet-source.png`:

```bash
node scripts/generate-yash-sprites.js
```

The generator keeps one shared transparent canvas per animation group, which prevents idle, run, jump, wave, and sleep frames from resizing mid-animation.

## Validation

Before publishing a visible update, run:

```bash
npm run lint
npm run build
npm run test:e2e
```

Recent coverage includes:

- desktop and mobile navigation
- mobile drawer behavior
- sound toggle state
- resume PDF availability
- project repository links
- project demo video availability
- contact link correctness
- Yash assistant open, close, prompt, response, and follow-mode behavior

## Deployment Notes

Set the production domain before launch so Open Graph and Twitter image metadata resolve correctly:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Then deploy through Vercel or any hosting provider that supports Next.js.

## Change History

The larger build and polish history is documented in [`CHANGELOG.md`](CHANGELOG.md).

## License

MIT. See [`LICENSE`](LICENSE).
