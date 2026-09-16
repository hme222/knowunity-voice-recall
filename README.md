# Say It Back — Knowunity

Voice-based active recall for Knowunity. After revising a section, a student explains the key ideas out loud; Knowie replies in text. This repo is the interactive prototype for that feature (mobile iOS, 390px, dark mode, recall mocked).

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run tokens   # rebuild build/css/tokens.css from tokens/tokens.json
```

Next.js 16 · React 19 · Tailwind 4 · TypeScript. Design tokens via Style Dictionary.

## Where things live

| Path | What |
|---|---|
| `src/app/` | The Next.js app (prototype code) |
| `docs/` | Design brief, sprint context, voice UX reference, design-system rules |
| `tokens/` | Design tokens (DTCG JSON). `tokens.json` is the source; edit here, then `npm run tokens` |
| `build/css/tokens.css` | Generated CSS variables. Tracked in git, never edited by hand |
| `style-dictionary.config.mjs` | How tokens become CSS |
| `reference/screenshots/` | Numbered captures of the live Knowunity app, in flow order |
| `reference/*.mp4` | Screen recording of the beta flow (git-ignored) |
| `public/knowie/` | Knowie mascot expression SVGs |
| `public/images/` | Prototype imagery |
| `.claude/skills/` | Claude Code skills: `ux-designer`, `ui-designer`, `ux-motion`, `interactive-prototype` |

Start with `docs/design-brief.md`, then `docs/sprint-context.md` for what's already been decided.
