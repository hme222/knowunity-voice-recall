# Scorecard 01 — Say It Back

Graded against `eval/rubric.md` by four critics, each in its own context, each
given only the screens, the rubric and its own dimensions. No critic received
another critic's output or any score from the author.

Run on 2026-09-21 against `main` at `8150943`, rendered at 390x844 in dark mode.

---

## Result

**Weighted total: 6.1 / 10**

**Three of four hard gates FAILED, so this does not pass.** The rubric is
explicit: a failed gate is a failed submission regardless of the dimension
scores, and gates are not tradeable against a high score elsewhere.

| Dimension | Score | Weight | Weighted |
| --- | --- | --- | --- |
| System fidelity | 7 | High (3) | 21 |
| Coherence | 5 | High (3) | 15 |
| Craft | 7 | High (3) | 21 |
| UX judgment | 7 | High (3) | 21 |
| Accessibility | 4 | Medium (2) | 8 |
| Structure | 5 | Low (1) | 5 |
| | | **15** | **91** |

91 / 15 = **6.07**.

Reach scored 6 and is excluded, per its own definition. It is reported at the
end.

**Every score was verified by rendering or measuring**, so rule 2's cap at 7
did not bind on any dimension. Nothing here was graded from reading code.

---

## Hard gates

| Gate | Result | Measurement |
| --- | --- | --- |
| Contrast 4.5:1 for body text | **FAIL** | `/permission/prompt`, both dialog actions. `Allow` and `Don't Allow`, 18px/600 in `#9178E6` on a composited `#28292B`, measured **4.18:1**. 18px semibold is not WCAG large text, so 4.5 applies. The background is three translucent layers, not a swatch, which is why the token sheet hides it. |
| Touch targets 44pt | **FAIL** | `Skip` renders **29.8 x 48** on `/session/idle/[term]`, 30 x 48 on `/session/reveal` and `/session/lock-in`. `Button.module.css` binds `min-height: 48px` and nothing for width. Interactive `Chips` are **32px tall**: "Didn't catch that" 358x32, "Try again" 92x32. |
| No raw hex in component source | **PASS** | `npm run check:tokens` clean, and confirmed independently by grep. Not a trivially-passing script. |
| No two states that should differ rendering identically | **FAIL** | `/session/recording/[term]`, Listening vs Paused. After clicking the mic: `data-state` unchanged at `Listening`, fill unchanged at `rgb(145,120,230)`, `aria-pressed="true"` in both, **and the pulse ring keeps animating while paused**. Motion says capturing, text says stopped. |

**On the fourth gate specifically.** `docs/gaps-and-cuts.md` records this as an
accepted risk: "the caption carries pause; the mic doesn't change." That
recorded acceptance is exactly the assertion the gate exists to catch. The
decision was taken before anyone rendered the paused state and saw the ring
still turning. It should be re-taken now that it has been.

---

## Findings by dimension

### System fidelity — 7

1. **Three eyebrow labels smuggle 8% tracking through a token that means 1%.**
   `RecordingStatus.module.css:13`, `picker.module.css:22`,
   `recap.module.css:31` all use `* 0.08em` where the other 30 letter-spacing
   declarations use `* 0.01em`. Measured: 12px text at `0.96px` tracking, eight
   times the token it names. Change `tracking.loose` to 2 and these become 16%.
   **Fix:** add `tracking.wide: 8` plus an `eyebrow` style, regenerate, rebind.
2. **A colour primitive read directly from a screen.**
   `recording.module.css:47` uses `--color-primitive-alpha-light-18`. Its two
   sibling rings bind to semantic tokens. Forbidden by `design-system.md`
   § "Never do this", invisible to `check:tokens` because it is a `var()`.
   **Fix:** add `border.subtle` semantic token, rebind.
3. **`showBottomSheetBackground` bypassed on the two screens it exists for.**
   `transcript/[bucket]/page.tsx:45` and `drill/complete/round/page.tsx:29`
   both render `data-sheet="false"` with no scrim. Worse,
   `drill/complete/round/page.tsx:13` states the prop does not exist. It does.
   **Fix:** pass the prop on both routes, delete the false comment.
4. **Four unbound durations in TSX.** 1400 and 1200 are the same designed
   "checking" beat written as two numbers. Not on the exception list.
5. **`check:tokens` is weaker evidence than SPEC treats it as.** It greps hex
   only, so it cannot see findings 1, 2 or 4. The gate passes and drift exists.
6. **241 direct `size.primitive.*` reads**, because no `size.semantic` layer
   exists. Held softly: a system gap, not sloppiness, but unrecorded.

### Coherence — 5

1. **The action zone moves up to 272px across one turn.** Measured `.bottom`
   top edge: 422 on 01 Idle, 694 on 05 Miss, against a spec'd fixed 120.
   `ScreenShell.module.css:23` and `:42` use `min-height` while the file's own
   header comment claims the regions are fixed.
2. **01b Exit drops a scaffold region entirely.** Five regions everywhere else,
   four here, and both its buttons sit below the fold at y=800 and y=856 on the
   screen whose only job is those two buttons.
3. **One action, two names and two widths.** `Skip` at seven call sites,
   `Skip · no XP` at one, unrecorded. Measured widths 30 on Idle, 358 on Miss.
4. **05 Miss inverts SPEC.** `Reveal answer` is Primary above `Try again`,
   where SPEC says the reverse. Unrecorded, so it reads as inconsistency rather
   than decision.
5. **XP appears five ways across five screens** — bare text, amber chip, green
   snackbar pill, blue StatChip — in three different scaffold regions.
6. **The resolved mascot mapping is contradicted on two screens.** 07 Recap has
   no `MascotSlot` at all, though the mapping assigns it one.

### Craft — 7

1. **Every looping animation is a sawtooth.** Sampled 24 times on the live
   ring: scale climbs to 1.039 then snaps to 0.923 in one frame, every 1.1s, on
   the mic rings, the processing mascot and the dots. `direction: normal` where
   it needed `alternate`.
   **Fix:** halve the period and add `alternate` in all three files.
2. **The reward mascot is invisible on all five celebration screens.**
   `excited.svg` head is `#0E0A18` on a `#090C18` page, about 1.01:1. The one
   pose reserved for winning is the only one that disappears, and on
   `/home/unlock` it is `3XL`, so the largest instance is the most broken.
3. **The Score chip is full-strength success green at 0%.** Colour binds to
   `data-stat`, never to the value. Works against the brief's own test that the
   summary must not flatter.

### UX judgment — 7

1. **The text fallback traps the student it exists for.** `/text/turn?sticky=1`
   renders two controls: an X and a **disabled** Send. No Skip, no "I don't
   know this one", no way back to voice. The voice turn offers three escapes.
   This fails the brief's hard constraint on the single screen written for a
   student who cannot speak, and makes `/permission/denied`'s promise untrue.
2. **The completion bonus is promised twice and never paid.** `sessionTotals`
   computes `withBonus`; `grep` finds that line and no consumer. A seeded
   4-term run renders **XP +17**, never +22. The only reason to finish rather
   than leave is invisible at the moment of finishing.
3. **`/session/lock-in` claims a "+1 bonus XP" that does not exist**, and
   `gaps-and-cuts.md` already records that chip as cut. A recorded decision the
   build did not make is worse than an undecided one.
4. **Overconfidence costs nothing and underconfidence is not rewarded.**
   `wasSure` never enters the XP arithmetic. Half the mechanic is missing, on
   the brief's explicit two-sided test.
5. **The prompt vanishes while the student is speaking.** Recording's full text
   is `1/4 | LISTENING | 0:04 | Tap to pause | Done speaking`. The term is gone,
   mid-retrieval, for no gain — the middle region is otherwise empty.
6. **The hint is below the fold on the Miss screen.** Middle region
   `clientHeight 398` against `scrollHeight 570`; about 6px of the `HintCard`
   is visible. The designed answer to a miss is off-screen.
7. **A literal escape sequence ships on every miss.** `miss/[term]/page.tsx:69`
   renders `Skip · no XP`. Confirmed in the DOM.
8. **The primer describes an interaction the build does not have** — "while you
   hold the button", against a tap-to-start mic.
9. **`/session/blank/[term]` has no AppBar or X**, breaking the pattern every
   other screen keeps.
10. **The empty recap asserts a failure** — "0 of 4", "SCORE 0%" alongside
    "this session hasn't been run".

### Accessibility — 4

Three failing gates, plus:

1. **`BottomSheet` is a modal that cannot be closed without a mouse.**
   `role="dialog" aria-modal="true"`, dismissal only via `onClick` on a
   `role="presentation"` scrim. No close control, and `grep` finds no
   `Escape` or `onKeyDown` anywhere in the repo.
2. **Inert status labels are exposed as focusable toggle buttons.** `Chips`
   always renders `<button aria-pressed>`, and is used with no `onClick` on
   Miss, Lock In, the drill bar and all three drill stumbles. Each is in the
   tab order, announced as a pressed toggle, and does nothing.
3. **A visible "+" whose accessible name says "See what you said"** on every
   recap row.
4. **`aria-pressed="true"` on a paused mic**, so a screen reader says "Paused,
   tap to resume, pressed".

### Structure — 5

1. **The shell scrolls its own chrome, on every route.** `globals.css:36` used
   `min-height: 100dvh`, so `.middle` never engaged its own overflow and the
   document scrolled instead, taking the app bar and progress ring off the top.
2. **Eight routes clip at 390x844 before any resize**, up to +188px. On
   `/drill/miss/letter` the mic sits 154px below the fold; on `/session/exit`
   the "Leave anyway" button is entirely off screen.
3. **The "fixed regions" contract is false as rendered**, same root cause as
   Coherence 1.
4. **Every Knowie renders cut off at the eyes.** All four assets declare a
   viewBox roughly 37% shorter than their own artwork.

**Note:** findings 1 and 4 were fixed after this grading run and verified by
measurement. They are recorded here as graded, not as outstanding. Scorecard 02
should re-measure.

---

## Blind spots, as reported

- **Craft:** never completed the flow as one unbroken click-through; the Chrome
  tab dropped twice, so most routes were reached by URL and `sessionStorage`
  never held a real four-term run. Every Recap observation is against a
  degenerate one-term state. The drill rungs were never rendered, so
  `StrengthMeter` — the component the rubric names as the canonical
  render-only failure — went unchecked.
- **System:** the full story-test suite reported 39/126 failing, but every
  visible failure was a 15s timeout on a loaded machine and a focused re-run
  passed 32/32. Could not establish them as real, so did not score them, and
  cannot confirm "story tests are clean" either. All measurements were against
  `next dev`, not a production build. Rendered 40 routes but only looked at 8
  screenshots; the other 32 were cleared on programmatic signals, so a screen
  could be rendering the wrong content and passing.
- **UX:** no real assistive technology, so focus order and focus trapping are
  inferred rather than observed. `prefers-reduced-motion` verified from CSS,
  not emulated. Contrast computed from the composited stack but without
  accounting for `backdrop-filter: blur(24px)`, which can only make the 4.18:1
  worse. Non-text contrast not checked at all. The drill got a thin pass: only
  two of its screens were audited, and the `Chips`-as-button defect almost
  certainly recurs across the rest.
- **Ambition:** read the flow largely from source and static screenshots and
  did not click the full walkthrough. Did not watch the beta screen recording,
  so "nothing moves on a result screen" may be a considered choice rather than
  a regression. Two of three proposals lean on `MascotSlot`'s size axis; if
  pinning everything to `2XL` was a decision rather than a default, the
  strongest evidence is misread.

**One cross-cutting caveat:** the craft and UX critics were driving the same
Chrome tab group for part of the run and interfered with each other. The UX
critic re-took its load-bearing measurements after getting an exclusive tab;
the craft critic lost its tab twice. Route lists are durable; individual pixel
values from early in those runs are less so.

---

## Reach — 6, excluded from the total

Measuring ambition, not correctness. A technically clean prototype that takes
no risks scores low here by design.

Three things lift it off a 5: the drill's thinning cue, the confidence tap
taken *before* the verdict lands, and a Recap that is genuinely derived rather
than canned. Everything downstream of those ideas is executed at competence and
stops there.

**Where it settles:**
- `MascotSlot` has four sizes and 26 of 28 screens use `2XL`. The one component
  whose whole job is expressing scale is pinned to one value.
  `drill/pass/[step]/page.tsx:15` states in a comment that "Knowie grows a step
  each pass" and line 45 hardcodes `2XL` on all four rungs. The idea was
  written down and not built.
- The confidence tap is invisible on the screen where it is taken and the one
  after. `wasSure` goes straight to `recordOutcome` and nowhere else.
- The requeued term landing — the session's one comeback — renders as an
  ordinary pass, byte-identical in composition to a first-try pass.

Its three proposals are in the agent's full report: coverage-driven mascot
growth, a confidence-branched result line, and a comeback screen that pays what
it promised. All three are built from existing components with props confirmed
in Storybook.

**This score is not averaged into the total.** A build can be flawless
everywhere else and score low here; that is the signal working.

---

## What to fix first

Ordered by whether it blocks a pass, then by cost.

1. **The three failed gates.** Nothing else counts until they clear. The
   contrast failure is one colour on one screen; the touch targets are a
   `min-width` on `Button` and a height on `Chips`; the identical-states gate
   needs a real `Paused` state on `MicButton` or the decision re-taken.
2. **`Skip · no XP`**, a one-character fix on the most-visited screen.
3. **The text fallback's missing escapes**, which is a hard-constraint failure
   on the screen that exists to satisfy that constraint.
4. **`min-height` to `height` on `ScreenShell`'s two chrome regions**, which
   closes Coherence 1, Structure 3 and part of Structure 2 together.
5. **The sawtooth animations**, three files, one line each.
6. **The invisible reward mascot**, one row in the mascot mapping.
