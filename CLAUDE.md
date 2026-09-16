@AGENTS.md

# Say It Back

Voice-in / text-out active-recall prototype for Knowunity. Next.js 16, React 19, Tailwind 4, TypeScript.

**Concept:** a conversational, not quiz-graded, recall check — a clean pass echoes the student's own transcript back as proof, a miss requeues later in the same session.

## Hard rules

- `docs/design-brief.md` § "Hard constraints" is fixed. Design inside it, never around it.
- `docs/sprint-context.md` is the record of what's decided, what's open, and what's not being built. Check it before proposing any flow, screen, or XP change, and its § "Process notes" before trusting any Figma frame.
- Every visual, spacing, type, and motion value comes from `tokens/tokens.json` by token path. `docs/design-system.md` has the rules and the source-of-truth order; follow it, including its § "Never do this" in full.
- `build/css/tokens.css` is generated. Never edit it; edit `tokens/tokens.json` and run `npm run tokens`.
- `typography.primitive.fontFamily.*` (Greed, no substitute) and `responsive.primitive.deviceWidth.mobile` (390) were resolved 2026-09-16; each token's `$description` records the decision. Frame the prototype at 390.
- The UI font is Greed VF (`src/app/fonts/GreedCollectionVF-TRIAL.ttf`), loaded via `next/font/local` in the root layout as `--font-greed`. Never treat it as an installed system font.
- Voice states follow `docs/voice-ux.md`. Idle / recording / processing / result must be unmistakable on every screen.
- Knowie expressions come from `public/knowie/`. Pick one; do not draw or generate new ones.
- Claims about the live app are grounded in `reference/screenshots/`. Cite the file number.
- Skills route: `ux-designer` for flows, `ui-designer` for styling, `ux-motion` for animation, `interactive-prototype` for building screens. `ux-copywriter` is referenced by the skills but not installed — write copy against `docs/voice-ux.md` and `docs/design-system.md` § "Naming conventions".

## Never

- Never build anything listed under `docs/sprint-context.md` § "Not building this sprint".
- Never touch `AGENTS.md`.

## Storybook

When working on UI, use the storybook tools to read the component library before answering or writing anything. Never assume a component prop exists. Query the documentation, and use only props that are documented or shown in a story. If a prop isn't there, stop and ask me.

The `storybook` MCP server is registered in `.mcp.json` and needs Storybook running (`npm run storybook`) to answer.

## File map

| File | Read when |
|---|---|
| `docs/design-brief.md` | Starting any design work. Problem, constraints, success metrics, open questions. |
| `docs/sprint-context.md` | Before proposing a flow, screen, or XP change. Decided, open, out of scope, known Figma bugs. |
| `docs/voice-ux.md` | Designing any idle / recording / processing / result / permission / fallback state. |
| `docs/design-system.md` | Choosing a component, naming a token, or unsure whether to build something new. |
| `tokens/tokens.json` | You need an actual color, size, spacing, type, or motion value. Read the `$description` too. |
| `reference/screenshots/01–31` | How the live beta's recall loop, hints, reveal, session end, and exit sheet actually look. |
| `reference/screenshots/32–64` | Onboarding, study plan, revision reader, home composer, tools, profile. `52` is the mic-denied sheet. |
| `reference/say-it-back-flow-screen-recording.mp4` | Motion and timing of the live beta flow. |
| `public/knowie/*.svg` | Picking a Knowie expression: dazed, determined, excited, laughing. |
| `src/app/layout.tsx`, `page.tsx`, `globals.css` | Editing the prototype shell. Still Next.js defaults; tokens are not wired in yet. |
| `.claude/skills/*/SKILL.md` | Auto-loaded by trigger. Open `references/` inside a skill only when its SKILL.md points you there. |
| `README.md` | Onboarding a human. Run commands and folder map. |
| `package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `.gitignore` | Changing build, lint, TS, or ignore config. Otherwise leave alone. |

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
