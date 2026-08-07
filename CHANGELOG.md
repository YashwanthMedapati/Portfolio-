# Portfolio Update Log

This log tracks the major improvements made after the last external update, so the portfolio has a clear history instead of a pile of mystery edits.

## Current Polish Round

- Added an explicit sound toggle in the navigation, with the visitor's preference saved locally.
- Kept portfolio sound effects off by default so the site stays recruiter-friendly until the visitor opts in.
- Improved mobile spacing in the hero, sections, project cards, demo buttons, and Yash chat panel safe-area positioning.
- Added test coverage for the sound toggle state.

## Portfolio Content and Trust

- Rewrote visible copy into first-person voice so the site sounds like Yash speaking, not a third-party profile.
- Added the circular profile photo beside the About Me section.
- Tightened project claims to stay accurate and resume-grounded.
- Added NutriDent AI demo video support and the first project demo button.
- Added Instagram and phone contact methods, while keeping hover-to-reveal/click-to-copy contact behavior.
- Added README, MIT license, GitHub Actions validation, and clearer project documentation.

## Yash Assistant

- Renamed Jr Yash to Yash across the interface.
- Reworked the chat window into a compact PowerShell-style terminal.
- Expanded Yash's answers using resume facts plus approved personal details, including background, languages, work authorization, hobbies, and target roles.
- Added command-style behavior such as `follow me`.
- Added a draggable 2D Yash companion that can be moved by the visitor.

## Character, Motion, and Easter Eggs

- Regenerated the 2D Yash sprite frames so animation groups use stable shared canvases.
- Cropped and cleaned broken frames, including the idle, run, jump, sleep, and thinking states.
- Added the Mario-style transition in the bottom scene where small Yash runs, jumps, hits the question block, and becomes the larger 3D Yash.
- Replaced the question block asset with the supplied yellow block.
- Added the bottom finale scene with star field, visitor counter, contact shortcuts, and cursor-following 3D Yash eyes/body.
- Added hover magnification for nav items, buttons, and selected text moments.
- Added cursor polish and easter egg effects for special chat commands.

## Verification

- Lint, production build, and Playwright E2E checks have been used throughout the updates.
- Playwright now checks project code links, demo video reachability, navigation, resume PDF availability, contact links, Yash chat behavior, and the new sound toggle.
