# SPEC — Say It Back

**What we're building.** A voice-in / text-out active-recall step for Knowunity:
the student speaks a term's definition out loud, Knowie answers in text, a clean
pass echoes the student's own words back as proof and a miss requeues later in
the same session.

**This prototype is the Next.js app in this repo.** Not a Figma prototype, not a
slide deck. Every screen below is a real page at its own route under
`src/app/`, reached by the student **clicking** — never by typing a URL and
never by a demo-only jump. `npm run dev` serves it at
http://localhost:3000. **Storybook stays the component catalog**: every visual
element on a screen comes from a component in `src/components/`, with a story
in Storybook; screens compose those components and add layout, routing and
state, nothing else. If a screen needs something the catalog doesn't have, the
component gets built in `src/components/` with a story first, then used.

Read alongside `docs/design-brief.md` (fixed constraints), `docs/sprint-context.md`
(decisions), `docs/voice-ux.md` (state triage) and `docs/design-system.md`
(token rules).

**Precedence, decided 2026-09-20.** For anything about *what gets built*, this
file wins. It carries the decisions taken most recently, and the two companion
updates (`docs/design-system-update.md`, `docs/tokens-update.md`) were drafted
before some of them and still state four superseded positions — see the
precedence note at the top of the design-system update.

Two things this does **not** override:

- **`docs/design-brief.md` § "Hard constraints" is fixed** and outranks
  everything here, per `CLAUDE.md`.
- **`docs/design-system.md`'s own source-of-truth order** — live usage first,
  the components themselves second, the doc last — still governs *design*
  questions. This file wins on build decisions, not on what a component
  actually does; if SPEC describes a component differently from the component,
  SPEC is the bug.

---

## Conventions

- **Routing.** Next.js 16 App Router. One folder per route under `src/app/`,
  each with a `page.tsx` default-exporting a component. Navigation uses
  `Link` from `next/link` for taps that are plain navigation, and
  `useRouter()` from `next/navigation` inside a `'use client'` component
  where a tap has to do something first. Read
  `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
  before adding routes — this Next.js differs from training data.
  **Typed routes are on.** `tsconfig.json` includes `.next/types` and
  `.next/dev/types`, and `src/app/layout.tsx` already uses the generated
  `LayoutProps<"/">`. A new route does not typecheck until `next dev` or
  `next build` regenerates those types — build with the dev server running.
- **The term index rides in the route.** Every per-term screen is a dynamic
  segment: `/session/idle/[term]`, `/session/recording/[term]`, and so on.
  Turns are addressable and survive a refresh. Verdicts and XP accumulated so
  far are derived from the fixture module, not held in memory.
- **Screens are Client Components; the library stays unmarked.** Every screen
  file starts with `'use client'`, and params are read with React's `use()`:

  ```tsx
  'use client'
  import { use } from 'react'

  export default function Page({ params }: { params: Promise<{ term: string }> }) {
    const { term } = use(params)
    // ...
  }
  ```

  **Why.** Pages are Server Components by default and a Server Component can't
  attach event handlers — `AppBar`'s `onLeft`, `MicButton`'s tap, every
  `Button`'s `onClick`. Marking the *library* `'use client'` does not fix this:
  functions aren't serializable across the server→client boundary, so a server
  page still can't pass a handler to a client `AppBar`. The boundary has to sit
  at or above the screen.

  The alternative — a server `page.tsx` that `await`s params and renders a
  client child — buys server rendering, which is worth nothing here: no data
  fetching, no SEO, every value a fixture in `src/lib/session.ts`. It costs two
  files per screen across ~40 screens.

  **No component in `src/components/` carries `'use client'`, and none should.**
  An unmarked component is context-neutral: it compiles into whichever graph
  imports it. `TextBlock`, `StatChip` and `HintCard` have no handlers and could
  render on the server one day; marking them forecloses that for no gain once
  the boundary already sits above them.

  **This is a single rule, not a per-screen choice.** The two approaches need
  different params code (`use(params)` vs `await params`). Mixing them doesn't
  fail loudly — one screen throws at runtime while the file next to it works,
  and whoever copies the wrong neighbour inherits the bug.
- **Styling.** Tailwind utilities for structure only — `flex`, `h-full`,
  `items-center`. Anything carrying a colour, size, spacing or duration goes
  through a CSS Module reading a token custom property. This keeps the
  no-hardcoded-values rule checkable by grep.
- **No literal design value, ever — with a named exception list.** The rule
  stays absolute; the exceptions are written down rather than left to
  judgement, because "that one's structural" is how the rule erodes. Adding to
  this list is a decision someone makes on purpose, not a thing that happens.

  | Exception | Where | Why, and what would retire it |
  | --- | --- | --- |
  | `flex: 1` on `middleContent` | `ScreenShell.module.css` | A flex ratio is not a design value and no token can express it. Nothing retires this. |
  | ~~Raw 6% white on a raised surface~~ | ~~`BottomSheet` content rows~~ | **RETIRED 2026-09-20.** `background.raised` now exists in `tokens.json` and `PickerRow` consumes it via its `raised` prop. The literal is gone; only `flex: 1` remains live. |
- **The 390px frame lives in `src/app/layout.tsx`**, so every route including
  home and picker inherits it. It is a property of the prototype, not of the
  session.
- **`ScreenShell` mirrors the Figma `scaffold` slots exactly.** Every screen in
  Complete Flow is an instance of the `scaffold` component set
  (variant `size=iPhone 13`), not a hand-laid-out frame. `scaffold` itself is
  an **external team-library component** — see `docs/design-system.md` §
  "The scaffold" — so its structure is verified from instances, not from the
  library file.

  | Region | Height | Token | Padding / gap | Holds |
  | --- | --- | --- | --- | --- |
  | `Panel Header` | 48 | `component.scaffold.panelHeader.height` | — | status bar |
  | `topNavigation` | 56 | `component.scaffold.topNavigation.height` | gap `space.100` | `AppBar` + session fraction |
  | `middleContent` | flexes | — | pad `space.200`/`screenMargin`, gap `space.200` | the screen's content |
  | `bottomContent` | 120 | `component.scaffold.bottomContent.height` | pad `screenMargin`, gap `space.100` | the action zone |
  | `bottomSheetOnly` | 34 | `component.scaffold.bottomSheetOnly.height` | gap `space.100` | sheets, on their own branch screens only |

  **The four chrome regions are fixed; `middleContent` takes the remainder.**
  At an 844-tall viewport the middle computes to exactly 620, matching Figma.
  At any other height the middle absorbs the difference, so the shell fills
  the window rather than letterboxing — a browser window is rarely 844 tall,
  and a prototype that scrolls its own chrome is less faithful than one that
  flexes.

  The `component.scaffold.*` namespace is earned by `ScreenShell`, not by the
  Figma component: the heights route through one component and nothing else,
  the same shape as `component.micButton.*`. It is explicitly **not** claimed
  on the basis of Figma bindings, which are external and will never route
  here — see `docs/design-system.md` § "Naming conventions".

  `ScreenShell` does not build the `AppBar`; screens compose their own into
  `topNavigation`, so home and picker (which have no app bar) use the same
  shell unchanged.

  The scaffold's `showBottomSheetBackground` toggle is deliberately **not**
  reproduced as a convenience prop. A sheet lives on its own branch screen —
  making it easy to bake into a default-state screen is the exact mistake
  `docs/sprint-context.md` § "Process notes" records three times.
- **Mascot poses** follow the table in `docs/design-system.md` §
  "Mascot poses — the mapping". Read it; don't re-decide per screen.
- **There is no `SessionHeader` component.** Screens compose their own
  `AppBar` plus fraction into `topNavigation`. Figma's `sessionHeader` bakes
  the fraction in to prevent an empty header, but 07 Recap legitimately has no
  fraction — a component that forces one would change that screen's design to
  suit the component.
- **Requeue lives outside the term numbering.** `[term]` means 1–4, the
  original set. A requeued term is `/session/lock-in`, its own screen with its
  own copy and its own progress value (75%), matching the built frame. It is
  not `/session/idle/5`.
- **Recap is derived, never canned.** 07 Recap computes its buckets, per-term
  XP, total and score from what the reviewer actually did. The frame's
  pre-baked 1 unaided / 1 hinted / 1 revealed / 1 worth-revisiting, +22, 75%
  is *sample* content, not fixed output. A summary whose job is to avoid
  flattery cannot show a number the reviewer can see is wrong.

  **This needs session state that survives route changes.** Verdicts are
  written to `sessionStorage` as each term resolves and read back by Recap.
  A React context in `src/app/session/layout.tsx` would survive `Link`
  navigation but not a refresh, which would contradict the addressable-routes
  decision above; `sessionStorage` survives both and keeps the route as the
  only thing carrying the term index.
- **Dark mode is the only mode.** `src/app/globals.css` points `--background`
  and `--foreground` at `background.page` and `text.primary`, and the
  `prefers-color-scheme` block is removed. Honouring a light preference is a
  bug here, not a feature.
- **Icons are Lucide**, matching the `micGlyph_lucide` / `refreshGlyph_lucide`
  components in Figma, so code glyphs and design glyphs are the same shapes.
  The ten hand-inlined SVGs already in `src/components/icons/index.tsx` stay as
  they are; anything new — starting with the X that replaces the back arrow —
  comes from Lucide.
- **Frame.** 390px wide, dark mode, iOS only. `src/app/layout.tsx` already
  loads Greed VF from `src/app/fonts/GreedCollectionVF-TRIAL.ttf` via
  `next/font/local` as `--font-greed`, and imports `build/css/tokens.css`.
- **Tokens.** Every value comes from `tokens/tokens.json` by token path,
  consumed as a CSS custom property from the generated `build/css/tokens.css`.
  Never edit the generated file; edit the JSON and run `npm run tokens`.
- **Session length.** The prototype runs the **4-term** case. The rule is 3–5
  (see `docs/sprint-context.md` § Screens); the screens illustrate one concrete
  walkthrough.
- **`MicButton`'s accessible label becomes "Listening, tap to pause".** The
  shipped default at `src/components/MicButton/MicButton.tsx:12` still reads
  "Listening, tap to stop", which the tap-to-pause decision made wrong. The
  visible status label stays `LISTENING`, so the accessible name and the
  on-screen text agree. This is a library change, made when screen 3 is built.

---

## Screen list, in build order

Easiest first: phase 1 needs no new components, phase 2 needs components that
exist in Figma but not in code, phases 3–5 add the unbuilt states.

### Phase 0 — The doors. Where Say It Back is met for the first time.

Added 2026-09-21. These were missing from the original list, which is why the
prototype used to open one screen after its own beginning, on a home that
cannot show the feature yet, behind a demo button.

Say It Back does not exist on home until a door has shown it — there is no chip
(`docs/sprint-context.md` § "Where it lives"). **A door is therefore the first
screen, not home.** The rule they all carry: it is the showing that unlocks, not
the completing, so both of a door's actions lead to `/home/unlock`.

| # | Route | Screen | Figma | States | Components | Student can | Leads to |
|---|---|---|---|---|---|---|---|
| 0a | `/door/quiz` | Quiz complete | `15672:24061` | one | `AppBar variant="leftIconButtonOnly"` (back arrow) wrapping `ProgressIndicator progress="25"`; `MascotSlot size="2XL"`; `TextBlock`; `Button CTA="Prove it" variant="Primary" showLeftIcon` + `Button CTA="Not now" variant="Tertiary"` in an action row | Prove one term; decline | Prove it → `/session/idle/1?door=quiz`. Not now → `/home/unlock` |
| 0b | `/door/quiz/result` | Prove It Again — term result | `15672:19827` | one | `MascotSlot size="2XL"`; `RecallResult state="Pass"`; `Button CTA="Continue" variant="Primary"` (centred, not full width) | Continue | → `/home/unlock` |
| 0c | `/door/exam-plan` | Exam plan | `15672:23959` | one (placeholder) | `ChatBubble`; `MicButton state="Idle"`; `Button CTA="Type instead" variant="Secondary"` + `Button CTA="Skip" variant="Tertiary"` | Answer aloud; type; skip | Mic → `/session/idle/1?door=exam-plan`. Type → `/text/turn`. Skip → `/home/unlock` |
| 0d | `/door/chat` | Chat, content-aware | `15672:24166` | one (placeholder) | `ChatBubble showTitle`; `MascotSlot size="2XL"`; XP line; `Button` ×3 | Say it back; type; skip | Say it back → `/session/idle/1?door=chat`. Skip → `/home/unlock` |
| 0e | `/` | Home, baseline | none — this state is in no frame | one | `HomeShell`; `Button variant="Tertiary"` ×3, one per door | Reach a door | → the three door routes |

A run that arrives through a door carries `?door=<id>` from `/session/idle`
through recording and captured to processing. On a Pass, the quiz door lands on
its own result (`src/app/door/doors.ts`); a Miss or a mishear falls through to
the session's own verdict screens, because the help they offer is the same help
and a door run that goes wrong should not be a dead end.

### Phase 1 — Core loop. Uses only components already in Storybook.

| # | Route | Screen | States | Components | Student can | Leads to |
|---|---|---|---|---|---|---|
| 1 | `/session/intro` | 00 Intro | one | `AppBar variant="leftIconButtonOnly"` wrapping `ProgressIndicator progress="25" thickness="16"`; `ChatBubble showTitle`; `MascotSlot size="2XL"`; `Button CTA="Let's go" variant="Primary" size="M"` | Start the session; exit | Start → `/session/idle`. Exit → `/session/exit` |
| 2 | `/session/idle/[term]` | 01 Idle / Commit | one | `AppBar` + `ProgressIndicator progress="25"`; `ChatBubble showTitle` (term prompt); `MicButton state="Idle"`; `MascotSlot size="2XL"`; `Button variant="Secondary"` (type instead); `Button variant="Tertiary"` (skip) | Tap the mic to record; switch to typing; skip; exit | Mic → `/session/recording/[term]`. Type → `/text/turn`. Skip → next term or `/session/recap`. Exit → `/session/exit` |
| 3 | `/session/recording/[term]` | 02 Recording | recording | `AppBar` + `ProgressIndicator`; `MicButton state="Listening"`; **`RecordingStatus`** (to build: the `LISTENING` label and the elapsed timer, both on the frame); `Button variant="Primary" CTA="Done speaking"` | Tap the mic to stop | Stop → `/session/captured/[term]` |
| 4 | `/session/pass` | 04 Pass | one | `RecallResult state="Pass"` with `title` + `transcript`; `MascotSlot size="2XL"`; `Button variant="Primary" CTA="Next"` | Continue; open the transcript | Next → next term or `/session/recap`. Transcript → `/session/transcript/passed` |
| 5 | `/session/miss` | 05 Miss + Hint | one | `RecallResult state="Miss"`; `HintCard`; `Chips size="S" color="Partial" active`; `Button variant="Primary" CTA="Try again"`; `Button variant="Secondary" CTA="Reveal answer"`; `Button variant="Tertiary" CTA="Skip"` | Retry; reveal; skip; open transcript | Try again → `/session/idle`. Reveal → `/session/reveal`. Skip → next term. Transcript → `/session/transcript/revealed` |
| 6 | `/session/reveal` | 05a Reveal answer | one | `ChatBubble` (the answer, no verdict badge); `MicButton state="Idle"`; `MascotSlot size="2XL"` | Repeat it unaided; move on | Repeat → `/session/recording` then `/session/repeat`. Next → next term |
| 7 | `/session/processing` | 03 Processing + confidence | waiting-for-tap; escalated (judge slow) | `AppBar` + `ProgressIndicator`; `MascotSlot size="2XL"` animating; `Button variant="Secondary"` ×2 as the sure / not-sure pair | Answer "how sure are you?" | Tap → `/session/pass`, `/session/miss` or `/session/unclear` per the mock |
| 8 | `/session/lock-in` | 06 Lock It In | one | `AppBar` + `ProgressIndicator progress="100"` (NOT the frame's 75 — see the note in the page file: at 75 the bar ran 100 → 75 → 100 and moved backwards); `SessionFraction label="Revisit N of M"`; `Chips size="S" color="Primary" active`; `MascotSlot`; `Button variant="Primary"`; `Button variant="Tertiary"` | Answer the requeued term cold; skip | Mic → `/session/recording`. Second miss → `/session/lock-in/second` |
| 9 | `/session/lock-in/second` | 06b Lock It In, 2nd pass | one | `RecallResult state="Pass"`; `ProgressIndicator progress="100"`; `Button variant="Primary"` | Continue | → `/session/recap` |
| 10 | `/session/recap` | 07 Recap | solid session; rough session (CTA order flips) | `StatChip stat="XP"`, `stat="Score"`, `stat="Time"`; `ButtonIcon variant="Overlay" size="S"` ×4 (per-row transcript); `Button variant="Primary"`; `Button variant="Secondary"` | Open any term's transcript; try again; continue; accept the drill offer | Row → `/session/transcript/[bucket]`. Try again → `/session/idle` (same terms, shuffled). Continue → `/home/unlocked`. Drill → `/drill/intro` |
| 11 | `/session/exit` | 01b Exit confirmation | one | `OptionRow state="Default"` ×8; `Button variant="Primary" CTA="Keep learning"`; `Button variant="Secondary" CTA="Leave anyway"` | Pick a reason; stay; leave | Keep → back to the previous screen. Leave → `/home/unlocked` |

### Phase 2 — Branches. Needs components that exist in Figma but not in code.

| # | Route | Screen | States | Components | Student can | Leads to |
|---|---|---|---|---|---|---|
| 12 | `/session/unclear` | 04a Couldn't hear | one | `RecallResult state="CouldntHear"` with `onRetry`; `Chips size="S" color="Unclear" active` ⚠️; `MicButton state="Idle"`; `Button variant="Secondary"`, `variant="Tertiary"` | Re-record immediately; skip | Retry → `/session/recording`. Skip → next term |
| 13 | `/session/captured` | 02a Captured | one | **`RecallResultCaptured`** (to build); `Chips color="Unclear"` ⚠️; `Button variant="Primary" CTA="Send"`; `Button variant="Secondary" CTA="Re-record"` | Send; re-record | Send → `/session/processing`. Re-record → `/session/recording` |
| 14 | `/session/transcript/[bucket]` | Transcript sheet | passed; revealed; skipped | **`BottomSheet`** (to build, 3 content states); `OptionRow` rows | Read; dismiss | Dismiss → back |
| 15 | `/session/repeat` | Say-it-back result | one | `RecallResult state="Pass"`; `Snackbar variant="Success" chipText="+1 XP"`; `Button variant="Primary"` | Continue | → next term |
| 16 | `/session/blank` | Blank term | one | `ChatBubble`; `MicButton state="Idle"`; `Button variant="Tertiary"` | Attempt anyway; reveal | Attempt → `/session/recording`. Reveal → `/session/reveal` |
| 17 | `/session/recap/practice` | 07a Practice what I missed | one | `OptionRow` ×2; `ChatBubble`; `Button variant="Tertiary"` ×2 | Choose how to practise | → `/session/idle` or `/drill/intro` |

### Phase 3 — Permission, text and interruption. All new.

| # | Route | Screen | States | Components | Student can | Leads to |
|---|---|---|---|---|---|---|
| 18 | `/permission/primer` | Mic primer | one | `TextBlock variant="XL"`; `MascotSlot`; `Button variant="Primary" CTA="Turn on the mic"`; `Button variant="Tertiary" CTA="Not now"` | Request the mic; decline | Request → `/permission/prompt`. Not now → `/text/turn` |
| 19 | `/permission/prompt` | Primer + iOS sheet | one | Primer beneath a drawn iOS permission sheet (**new, screen-local**) | Allow; don't allow | Allow → `/session/idle`. Don't allow → `/permission/denied` |
| 20 | `/permission/denied` | Denied — session choice | one | `TextBlock`; `Button variant="Primary" CTA="Type this session"`; `Button variant="Secondary" CTA="How to turn the mic on"` | Choose text for the session; read how to re-enable | Type → `/text/turn`. How-to → stays, expands |
| 21 | `/text/turn` | Text fallback turn | empty; filled | `ChatBubble`; **text input** (to build); `Button variant="Primary" CTA="Send"` | Type an answer; send; switch back to voice | Send → `/text/checking`. Voice → `/session/idle` |
| 22 | `/text/checking` | Text checking beat | one | `MascotSlot` animating | Wait | → `/session/pass` / `/session/miss` |
| 23 | `/session/offline` | Network held take | one | `Snackbar variant="Error"`; `MascotSlot` | Wait; retry | Reconnect → `/session/processing` |
| 24 | `/session/resume` | Session resume | one | `TextBlock`; `StatChip stat="XP"`; `Button variant="Primary" CTA="Pick up where you left off"` | Resume; start fresh | Resume → `/session/idle` |

### Phase 4 — Home and picker. Needs the five home components.

| # | Route | Screen | States | Components | Student can | Leads to |
|---|---|---|---|---|---|---|
| 25 | `/` | Home — pre-unlock | one | Home shell, **no Say It Back chip** | Nothing Say-It-Back related | — |
| 26 | `/home/unlock` | Unlock reveal | one | Home shell dimmed; **`SwipeChip`** spotlighted; `MascotSlot size="3XL" expression="excited"` | Acknowledge | → `/home/unlocked` |
| 27 | `/home/unlocked` | Home — chip | one | Home shell + **`SwipeChip`** in the composer | Open the picker | → `/picker` |
| 28 | `/home/due` | Home — due-signal | swipe 1 / 2 / 3, in-page | **`DueSignalCard`**, **`SwipeChip`**, **`SwipeDots active="1\|2\|3"`** | Swipe; tap a due quiz; use the chip | Card → `/session/intro` for that lesson. Chip → `/picker` |
| 29 | `/picker` | Picker | seeded first run; populated | **`PickerTopicRow`**, **`PickerDrillRow`**, **`DrillListItem`** | Choose a topic; choose a definition to drill | Topic → `/session/intro`. Definition → `/drill/intro` |

### Phase 5 — Definition Drill Down. Needs the drill components.

| # | Route | Screen | Components | Leads to |
|---|---|---|---|---|
| 30–31 | `/drill/intro`, `/drill/intro?returning=1` | DD 00 / 00b | `ChatBubble`; `MicButton state="Idle"`; `Chips`; `Button` | → `/drill/pass/1` |
| 32 | `/drill/pass/[n]` | DD 01 / 04 / 05 / 06 | **`StrengthMeter fill={0–100}`**; `ChatBubble`; `MicButton state="Idle"` | → `/drill/recording` |
| 33–35 | `/drill/recording`, `/drill/captured`, `/drill/processing` | DD 02 / 02a / 03 | `MicButton state="Listening"`; **`RecallResultCaptured`**; `MascotSlot` | → next rung or `/drill/miss` |
| 36–38 | `/drill/miss`, `/drill/miss/letter`, `/drill/miss/echo` | DD 07 / 07b / 07c | `RecallResult state="Miss"`; `HintCard`; `Chips color="Partial"` | Stumble 1 → 2 → 3, then always completable |
| 39–40 | `/drill/complete`, `/drill/complete/round` | DD 08 / 08a | **`TrainingLog`**; **`BottomSheet`** | → `/picker` |

⚠️ **The `Chips` colour drift.** Figma's `chips` set has `Unclear`, `Success` and
`Partial`; the code component has `Primary`, `pro` and `Coral`. `Coral` is bound to
`feedback.unclear.bold`, i.e. it *is* Figma's `Unclear` under the older name, so screens
needing `Unclear` use `Coral` and match. **Screens needing `Partial` also use `Coral`** —
05 Miss and the drill stumbles — which is a real substitution, not an equivalence:
`docs/design-system.md` warns against assuming Coral outside the CouldntHear tag.
Recorded here so it is a decision rather than drift. Resolving it means either renaming
Figma's `Unclear` back to `Coral` or adding `Partial` and `Success` to the code
component.

---

## Explicitly out of scope

From `docs/sprint-context.md` § "Not building this sprint", unchanged:

- Knowie speaking. Voice out of any kind.
- Auto-endpointing. Push-to-talk with an explicit stop, always.
- A hint that accepts a reply or branches into conversation.
- A second hint. The ladder is miss → hint → retry → reveal.
- Mid-answer language switching.
- Mic-busy handling (on a call, hardware in use).
- XP inside Definition Drill Down.

And for the prototype specifically:

- Real speech-to-text and real judging. See "How the mock behaves".
- Any device width other than 390. The `scaffold` component's larger
  `L - 17 Pro Max` size is out of scope.
- Light mode.
- Real persistence. Session state lives in memory for the length of a run.
- Real notifications, and the notification-permission flow the journey map
  sketches for the exit sheet.
- ~~**Pause/resume during recording.**~~ **Superseded — see Open 12.** This entry
  predates the tap-to-pause decision and contradicted it inside the same file. The
  built interaction is: **tap the mic to pause or resume**, `Done speaking` ends the
  take. What stays out of scope is a *visible* paused state: `MicButton` gains no
  Paused variant and its appearance does not change, which is the accepted risk
  recorded in Open 12.
- **Cancel-the-take during recording.** `/session/captured/[term]` already
  offers Re-record, so discarding a take is one tap through a screen that
  exists. Recording has one action.
- Main flow v1 in Figma. It is archive; Complete Flow is canonical.

---

## How the mocked recall behaves

There is no speech recognition and no judging model. The prototype is designing
the states, not building the engine.

1. **Recording duration selects the verdict.** Tapping the mic stops the take;
   the `Done speaking` button sends it. Stop under ~2s → `CouldntHear`.
   A short take → `Miss`. A sustained take → `Pass`. This is a mock trigger for
   reaching states, not a claim about how the real feature scores.
2. **One term is scripted to `CouldntHear` on its first attempt**, so 04a
   appears in every walkthrough without anyone hunting for it.
3. **Transcripts are canned per term** — hand-written prose that reads like a
   plausible student answer. In the real product a model transcribes and judges;
   here the words are fixture data.
4. **The confidence tap advances the turn.** `/session/processing` waits
   indefinitely for it, with Knowie animating so the screen never reads as stuck.
   The verdict is already decided by step 1 before the tap is taken.
5. **A miss requeues once.** The term returns cold at `/session/lock-in`. A
   second miss ends at `/session/lock-in/second` and the drill is offered on
   Recap — never entered mid-session.
6. **Fixture data lives in one place**, `src/lib/session.ts`: the term list,
   canned transcripts, hints, answers, XP values and the scripted
   couldn't-hear index. No screen hardcodes its own copy. The four terms come
   from the built 07 Recap frame — **Formal charge, Cell membrane,
   Cytoskeleton, Cell transport** — and their sample copy from 00, 01 and 02a:

   - 00 Intro title "Say It Back", CTA "Let's go"
   - 01 Idle title "Explain: Formal charge", body "Say what formal charge
     means, in your own words. However you'd explain it to a friend."
   - 02a Captured "Here's what I heard. Send it, or say it again." with
     `Re-record` / `Looks right`

7. **Verdicts accumulate in `sessionStorage`** as each term resolves, so Recap
   can report the actual run. Cleared when a session starts from 00 Intro.

---

## Verification

Someone checking this is done runs all of these and all of them pass.

**Build and catalog**

```
npm run lint          # eslint clean
npm run tokens        # regenerates build/css/tokens.css with no diff
npm run dev           # serves http://localhost:3000
npm run storybook     # serves the catalog at :6006
```

Plus `test-run` via the Storybook MCP for story tests — never a package.json
test script.

**End to end, by clicking only**

Open http://localhost:3000 and reach `/session/recap` **without typing a URL
and without using browser back**. The path is: home → unlock reveal → home with
chip → picker → intro → idle → recording → captured → processing → a verdict →
through the remaining terms → lock-in → recap.

**Per-screen checks**

1. Every route in the table above is reachable by clicking from at least one
   other screen. No orphans — an orphaned route means an action that leads
   nowhere.
2. Every screen renders correctly at exactly 390px in dark mode.
3. Every element on screen is a component from `src/components/`. Nothing is
   hand-rolled inline that duplicates a catalog component.
4. Every catalog component used has a story, and that story appears in
   `docs-list`.
5. Idle, recording, processing and result are unmistakably distinct on every
   screen that has them — `docs/voice-ux.md` Principle 1.
6. No hardcoded colour, size, spacing or duration values:
   `grep -rn "#[0-9a-fA-F]\{3,8\}" src/components src/app --include=*.css`
   returns nothing but comments.
7. Greed renders. The font is `--font-greed` from `next/font/local`, never an
   installed system font.

**State coverage**

Every **Must** row in `docs/voice-ux.md` § "States to design" and § "Added
2026-09-20" is reachable by clicking: idle, recording, processing, pass, miss,
couldn't-hear, captured, cancel/re-record, text fallback, permission primer,
permission denied, skip, commit, confidence tap, blank term, session resume.

**Never trap the student**

From every screen, there is a visible way out that doesn't require the mic.
Check each route individually; this is the brief's hard constraint and the one
most easily lost per-screen.

---

## Open

Not decided. Listed rather than guessed. Items resolved on 2026-09-20 are kept
with their answer so the reasoning isn't re-derived.

1. ~~**Mascot expression mapping.**~~ **RESOLVED** — see
   `docs/design-system.md` § "Mascot poses — the mapping".
2. ~~**Whether Reveal should cost less than an unaided pass.**~~
   **RESOLVED — Revealed earns 0.** Being told the answer retrieves nothing,
   so it pays nothing; the optional say-it-back repeat afterwards carries the
   reward instead, because saying it unaided under a cue is a real retrieval
   act. This is a deliberate departure from the real screenshots, which award
   +5 for a reveal — recorded as such, like the Hinted +7.
3. **Unaided's +10 is still an informed guess.** **Decided: keep the numbers
   and document them as designed rather than derived.** Concrete values are
   what the real app shows and what makes Recap read as a real system; the
   evidence status is recorded here and in `docs/sprint-context.md` rather
   than hidden.
4. ~~**Completion bonus size.**~~ **RESOLVED — +5.** Roughly a fifth of a
   4-term session's take: enough to notice, not enough to pull attention off
   the recall itself.
5. ~~**Whether the drill routes show a progress ring.**~~ **RESOLVED — yes,
   four rungs as built.** Note what this means: **the prototype ships the
   fixed-ladder fallback, and the variable-length coverage model lives in the
   doc only.** That is deliberate, not drift. See item 6.
6. **The coverage judge** (sprint-context open 7), **per-word stumble
   tracking** (8) and **drill eligibility data** (9) — unconfirmed with
   engineering. **Decided: design the fallback alongside the main design.**
   The fallback is the four-rung ladder the screens already show, so what's
   outstanding is its copy, not its layout. Engineering's answer then selects
   a design instead of triggering a redesign.
7. ~~**`background.raised`.**~~ **RESOLVED for this sprint — keep the raw 6%
   white patch and document it.** An `optionRow` inside a `bottomSheet` would
   otherwise resolve to the sheet's own fill and vanish. This is a known
   literal in a system whose rule is that every value comes from a token by
   path; it is the one sanctioned exception, and it should not be copied to
   the next nested surface without adding the token properly.
8. **Swipe timing** is a guess. 300ms, matched to common iOS carousel timing,
   not verified against a reference or a prototype.
9. **Worst-case session length is unbounded** against the 70% completion
   target. The decision was to let it run and let requeue absorb it — taken
   deliberately, with nothing capping it. If completion is the number that
   matters most, this is the first thing to revisit.
10. ~~**What a chat-unlocked student's picker shows on a second visit.**~~
    **RESOLVED — the seeded material persists, with a note explaining how it
    got there.** The note is what stops a single stale row reading as a broken
    picker; without it, the contents depend on how the student arrived and
    nothing on screen explains why.
11. ~~**`strengthMeter`'s fill ramp.**~~ **RESOLVED — same four-step
    mechanism, your palette, running brighter as it fills:**
    `accent.green.subtle` → `accent.green.bold` → `text.success`, track on
    `background.stacking`. The original ramp darkened toward near-black, so a
    full meter was the least visible state; your palette's greens can't
    darken legibly anyway. All values token-bound — the literals were the
    third instance of invisible binding drift in this file.
12. ~~**Pause/resume ratification.**~~ **REOPENED then RESOLVED AGAIN
    2026-09-21 — tap to pause, with a real `MicButton` state.** A "Tap to pause" caption sits under the mic; `MicButton` gains no
    Paused state and its appearance doesn't change. The Figma explorations and
    annotation stay as they are. **The accepted risk did not survive being rendered.** It read: "nothing on
    screen changes when paused, so the tap has no visible confirmation." That
    is exactly what the identical-states hard gate exists to catch, and it
    failed it: clicking the mic changed only the `aria-label` while the fill
    stayed, `aria-pressed` stayed true, and the pulse ring kept animating —
    motion saying capturing while text said stopped. `MicButton` now has a
    fifth state with its own fill, glyph token, no pulse, and no
    `aria-pressed`. The decision was taken before anyone rendered it; that is
    the lesson, not the pause behaviour.
