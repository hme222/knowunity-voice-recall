# Say It Back — Knowunity

Voice-based active recall for Knowunity. After revising a section, a student explains the key ideas out loud; Knowie replies in text. This repo is the interactive prototype for that feature (mobile iOS, 390px, dark mode, recall mocked).

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run tokens   # rebuild build/css/tokens.css from tokens/tokens.json
npm run storybook                    # http://localhost:6006, dark, 390px canvas
npx vitest --project storybook run   # run every story as a test in headless Chromium
npm run chromatic                    # publish Storybook to Chromatic; needs CHROMATIC_PROJECT_TOKEN in .env (git-ignored)
```

Next.js 16 · React 19 · Tailwind 4 · TypeScript. Design tokens via Style Dictionary. Components via Storybook 10.

## Where things live

| Path | What |
|---|---|
| `src/app/` | The Next.js app (prototype code) |
| `docs/` | Design brief, sprint context, voice UX reference, design-system rules |
| `tokens/` | Design tokens (DTCG JSON). `tokens.json` is the source; edit here, then `npm run tokens` |
| `build/css/tokens.css` | Generated CSS variables. Tracked in git, never edited by hand |
| `style-dictionary.config.mjs` | How tokens become CSS |
| `.storybook/` | Storybook config: loads `globals.css` + tokens, Greed font, dark only, 390 default viewport |
| `src/components/` | One folder per Figma component: `<Name>.tsx`, `<Name>.module.css` (tokens only), `<Name>.stories.tsx` (Figma description in the docs). `icons/` holds glyphs exported from Figma |
| `src/stories/foundations/` | Foundations stories: Colors, Typography, Spacing, Radius, read from `tokens/tokens.json` + the generated CSS |
| `reference/screenshots/` | Numbered captures of the live Knowunity app, in flow order |
| `reference/*.mp4` | Screen recording of the beta flow (git-ignored) |
| `public/knowie/` | Knowie mascot expression SVGs |
| `public/images/` | Prototype imagery |
| `.claude/skills/` | Claude Code skills: `ux-designer`, `ui-designer`, `ux-motion`, `interactive-prototype` |

Start with `docs/design-brief.md`, then `docs/sprint-context.md` for what's already been decided.
