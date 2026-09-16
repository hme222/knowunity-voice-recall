# Agent instructions

Tool-agnostic rules for any coding agent in this repo. `CLAUDE.md` imports this file and adds the project's design rules, never list, and file map — read it next.

## Run

See `README.md` § "Run". `npm run dev` serves http://localhost:3000. `npm run lint` before handing off.

## Repo hygiene

- Generated and ignored: `.next/`, `node_modules/`, `tsconfig.tsbuildinfo`, `next-env.d.ts`, `.DS_Store`, `reference/*.mp4`. Never force-add any of them.
- The `nextjs-agent-rules` block at the end of `CLAUDE.md` is written by `next dev` on every start. Do not hand-edit or delete it; commit it as-is.
- Next.js 16 differs from training data. Read the matching guide in `node_modules/next/dist/docs/` before writing app code.
- Ask before committing. Never commit on the user's behalf without an explicit yes.

## Where the rules live

- Design constraints, decisions, tokens, components, voice states: `docs/`. Index in `CLAUDE.md` § "File map".
- Live-app evidence: `reference/screenshots/`, numbered in flow order.
