# Say It Back — Knowunity

Voice-based active recall for Knowunity. After revising a section, a student explains the key ideas out loud; Knowie replies in text. This repo is the interactive prototype for that feature (mobile iOS, 390px, dark mode, recall mocked).

## Run

```bash
npm install
npm run dev      # http://localhost:3000
```

Next.js 16 · React 19 · Tailwind 4 · TypeScript.

## Where things live

| Path | What |
|---|---|
| `src/app/` | The Next.js app (prototype code) |
| `docs/` | Design brief, sprint context, voice UX reference, design-system rules, `tokens.json` |
| `reference/screenshots/` | Numbered captures of the live Knowunity app, in flow order |
| `reference/*.mp4` | Screen recording of the beta flow (git-ignored) |
| `public/knowie/` | Knowie mascot expression SVGs |
| `public/images/` | Prototype imagery |
| `.claude/skills/` | Claude Code skills: `ux-designer`, `ui-designer`, `ux-motion`, `interactive-prototype` |

Start with `docs/design-brief.md`, then `docs/sprint-context.md` for what's already been decided.
