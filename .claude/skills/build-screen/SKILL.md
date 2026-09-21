---
name: build-screen
description: "Build or edit any screen in the Say It Back prototype. Applies whenever a screen is being created, changed, finished or reviewed in this repo — triggers on 'Build [screen name]', 'build the intro screen', 'edit 01 Idle', 'finish the recording screen', 'wire up the picker', or any request naming a screen or route from SPEC.md. Covers routing, composition from Storybook, Figma matching, token usage and state coverage. Do NOT use for building a component on its own, editing tokens.json, or writing docs."
metadata:
  project: Say It Back — Knowunity voice active recall
  version: 1.0.0
---

# Build a screen

A screen is **a page in the Next.js app, at its own route, that the student
reaches by clicking from the screen before it.** Nothing else counts.

Storybook is the catalog for **components only**. A screen that exists as a
Storybook story is not a built screen. A screen with a button that leads
nowhere is not a finished screen.

---

## Before you write anything

### 1. Read `SPEC.md` for this screen

Find the screen's row in § "Screen list, in build order". It gives you the
route, every state the screen has, the components it uses, what the student
can do, and where each action leads. Read § "Conventions" too — it carries the
rules below in full, and § "Open" tells you what is deliberately undecided so
you don't invent an answer to a question someone is still holding.

`SPEC.md` wins on anything about what gets built. Two exceptions:
`docs/design-brief.md` § "Hard constraints" is fixed and outranks it, and
`docs/design-system.md`'s source-of-truth order still governs what a component
actually does. If SPEC describes a component differently from the component,
SPEC is the bug.

`docs/design-system-update.md` carries a precedence note listing four claims
that are superseded. Read it before trusting that file.

### 2. Find out whether this screen has a Figma frame

**Some do and some don't, and it changes what you do.** Use the
`figma-console` MCP against the file `Z2ZiwnjTZ2ceNMAsicw3jn`, section
**"Complete flow — every screen, full fidelity"** (`15672:19410`) on the page
`13499:4675`. Screens are 390×844 instances of the `scaffold` component set.
**Complete Flow is canonical — Main flow v1 is archive, don't read from it.**

Before trusting a frame, check `docs/sprint-context.md` § "Process notes".
Specifically:

- A frame's **name and annotation can describe content that isn't on it.**
  That has happened five times. Read the actual children.
- **Check `visible` on a frame's children** before concluding a screen is
  empty. One screen was declared undesigned when its content was just hidden.
- **Recording overlays are loose siblings, not children.** Pulse rings, the
  hold-to-pause caption and the re-record pill sit beside the screen in the
  section, not inside it. Query the section, not just the frame.
- **Most components in Figma were never built in code.** A frame using
  `trainingLog` or `swipeChip` is showing you a hand-built lookalike frame or
  a component with no React counterpart. Check before assuming it exists.

### 3. Query the Storybook MCP for every component you will use

`npm run storybook` must be running. Call `docs-list` once, then `docs-show`
for each component. **Never assume a prop exists.** If a prop isn't in the
docs or shown in a story, it doesn't exist — stop and ask.

This matters more here than usual: the Figma library and the code library have
drifted. `Chips` in Figma has `Unclear`, `Success` and `Partial` colours; in
code it has `Primary`, `pro`, `Coral`. A screen written from the Figma frame
will not compile.

---

## Building

### 4. Compose from what's in Storybook

Storybook is the only place to look for something to reuse. Most of the Figma
library — `recallResult/Captured`, `sessionHeader`, `drillListItem`,
`strengthMeter`, `bottomSheet`, `trainingLog`, `dueSignalCard`, `swipeChip`,
`swipeDots`, `pickerTopicRow`, `pickerDrillRow` — was never built in code.
Don't import from Figma; there's nothing there to import.

### 5. When something you need isn't in Storybook

Build it **inside the screen**, from tokens, and add one line to
`component-gaps.md` at the repo root: what it was, and which screen it was
for. **Don't stop to ask.**

**If that same thing is already on the list from another screen, build it
properly** as a component in `src/components/<Name>/` with a `.module.css` and
a `.stories.tsx`, and note on both lines that it was promoted. Two consumers
is the bar for a real component; one is a screen-local detail.

### 6. Every value from the generated tokens

CSS custom properties from `build/css/tokens.css`, which is generated — never
edit it. If a value is missing, edit `tokens/tokens.json` and run
`npm run tokens`. No raw hex, no raw px, no raw duration.

Tailwind utilities are for structure only: `flex`, `h-full`, `items-center`.
Anything carrying a colour, size, spacing or duration goes through a CSS
Module reading a token.

`SPEC.md` § Conventions has the **named exception list** — currently `flex: 1`
on `middleContent` and the raw 6% white on a raised surface inside a sheet.
Those two are sanctioned. Adding a third is a decision someone makes on
purpose, not something that happens because a token was inconvenient.

Check your work: `grep -rn "#[0-9a-fA-F]\{3,8\}" src/app src/components --include=*.css`

### 7. Mobile only — 390px, dark mode

The frame lives in `src/app/layout.tsx`. Dark is the only mode; there is no
light variant and honouring a light preference is a bug. The UI font is Greed
VF, loaded via `next/font/local` as `--font-greed` — never an installed system
font.

Screens sit inside `ScreenShell`, which mirrors the Figma `scaffold`'s regions.
Fill its slots; don't write a layout value.

### 8. Build every state listed for the screen, including the failure ones

If `SPEC.md` lists three states, build three. The failure states are the point
— `docs/voice-ux.md` Principle 1 is that idle, recording, processing and result
must be unmistakable at every moment, and a student who can't tell what's
happening freezes. An unbuilt error state is the most common way this
prototype has fallen short.

### 9. Every action goes where `SPEC.md` says it goes

Wire every tap. A button that leads nowhere means the screen isn't finished.
Navigation is `Link` from `next/link` for plain navigation, `useRouter()` from
`next/navigation` where a tap has to do something first.

---

## Project mechanics you will need

- **Screens are Client Components.** Every screen file starts with
  `'use client'`. Params are read with React's `use()`, never `await` — a
  client component can't be `async`:

  ```tsx
  'use client'
  import { use } from 'react'

  export default function Page({ params }: { params: Promise<{ term: string }> }) {
    const { term } = use(params)
  }
  ```

  Library components stay unmarked. This is one rule for all screens; mixing
  `use(params)` and `await params` fails at runtime in one file while its
  neighbour works.

- **This is Next.js 16 and it differs from training data.** Read
  `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
  before adding a route. Typed routes are on, so a new route doesn't typecheck
  until `next dev` regenerates `.next/types` — build with the dev server up.

- **The term index rides in the route** — `/session/idle/[term]`. Requeue is
  outside the numbering, at `/session/lock-in`.

- **Session state lives in `sessionStorage`**, written as each term resolves so
  Recap can report the real run. Read it in `useEffect` or behind a
  `typeof window` guard — touching it during render breaks hydration.

- **Fixtures live in `src/lib/session.ts`.** Terms, canned transcripts, hints,
  answers, XP, the scripted couldn't-hear index. No screen hardcodes its own.

- **Mascot poses** follow the table in `docs/design-system.md` § "Mascot poses
  — the mapping". Don't re-decide per screen.

- **Icons are Lucide**, matching Figma's `micGlyph_lucide` / `refreshGlyph_lucide`.
  The ten hand-inlined SVGs in `src/components/icons/index.tsx` stay as they
  are. Lucide sizes itself; the house convention is `width/height: 100%` sized
  by the parent, so wrap it.

---

## When you're done

Run `npm run lint`, and `test-run` via the Storybook MCP for any story you
added or changed — never a package.json test script. Include every preview URL
`stories-preview` returns.

Then verify the screen is reachable **by clicking**, from the screen before it,
without typing a URL.

Then report, depending on what you had:

**If the screen had a Figma frame:** list **every** difference between what you
built and the frame. Spacing, copy, colour, component substitutions, anything
you couldn't match and why. Don't summarise it as "matches closely" — the
differences are the useful part, and silent divergence is how this file's
design and build have drifted before.

**If it didn't:** you'll have read `docs/design-brief.md` and
`docs/voice-ux.md` for how the state should behave. Tell the user **what you
had to decide that wasn't written down anywhere** — every judgement call you
made in the absence of a spec, so it can be ratified or overturned rather than
silently becoming the design.

In both cases, list anything you added to `component-gaps.md`.
