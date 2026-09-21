# Scorecard 02 — Say It Back

Second grading pass, run after the scorecard-01 fixes. Four critics, each in
its own context, each given only the screens, the rubric and its own
dimensions. No critic received another critic's output or any score.

Run on 2026-09-21 against `main` at `0bc1082`, rendered at 390 in dark mode.

---

## Result

**Weighted total: 4.9 / 10**, down from 6.1.

**All four hard gates PASS**, up from one of four.

That combination is the whole story of this run, and it is not a paradox. The
gates were fixed. The dimension scores fell because fixing one of them exposed
a layout fault that had been hidden, and because one critic's main finding was
a measurement artefact. Read the two numbers together or neither is useful.

| Dimension | 01 | 02 | Weight | Weighted |
| --- | --- | --- | --- | --- |
| System fidelity | 7 | **3** | High (3) | 9 |
| Coherence | 5 | **4** | High (3) | 12 |
| Craft | 7 | **4** | High (3) | 12 |
| UX judgment | 7 | **7** | High (3) | 21 |
| Accessibility | 4 | **7** | Medium (2) | 14 |
| Structure | 5 | **5** | Low (1) | 5 |
| | | | **15** | **73** |

73 / 15 = **4.87**.

Reach scored **5**, down from 6, and is excluded. See the end.

### Two things that moved besides the code

**The scope changed.** Scorecard 01 graded all 43 routes. This run covers the
main recall flow, with the permission and text paths added for the UX critic
because they carry Must states. The drill, home and picker screens were not
graded. Any dimension comparison across the two carries that caveat.

**The model changed**, Opus to Sonnet. Reach also had its agent rewritten
between runs, so its 6 to 5 move is not attributable to the model.

---

## Hard gates — all pass

| Gate | Result | Measurement |
| --- | --- | --- |
| Contrast 4.5:1 | **PASS** | Sampled computed colours on the rendered page and ran the WCAG formula on every composite, including the tinted result cards. Lowest pair measured **5.0:1** ("You said" at 52% white on dark green). Pass title 9.2:1, Miss title 6.4:1, CouldntHear chip 6.9:1, all three recap StatChips 6.3 to 6.7:1. |
| Touch targets 44pt | **PASS** | Hit areas, not pills: Leave/X 48x48, MicButton 120x120, "Type instead" 117x48, "I don't know this one" 135x48, text-only **Skip 48x48**. |
| No raw hex in component source | **PASS** | `npm run check:tokens` clean. |
| No two states rendering identically | **PASS** | Listening (purple fill, running timer, pulse) vs Paused (grey fill, heavy border, frozen timer, no pulse) vs Captured (different layout entirely) rendered side by side and distinct. |

The three that failed in scorecard 01 were contrast at 4.18:1, `Skip` at 30x48,
and Listening/Paused identical. All three are measured clear.

---

## The regression, and it is one root cause

**Four findings, from three critics who did not see each other's work, trace to
a single change I made between the two runs.**

To fix scorecard-01's Coherence finding that the action zone moved up to 272px
between turns, I changed `ScreenShell`'s `topNavigation` and `bottom` from
`min-height` to `height`. That stopped the movement and revealed what the
movement had been concealing: **the content never fitted the regions.** With
`min-height` the boxes silently grew. With `height` the excess spills, and
because neither region sets `overflow`, it paints over the scrollable content
beneath.

Measured overflow at 390 x 844:

| Screen | topNavigation | bottomContent |
| --- | --- | --- |
| 01 Idle | 56 box, 76 content, **+20** | 120 box, 204 content, **+84** |
| 05 Miss | **+20** | 120 box, 154 content, **+34** |
| 06 Lock It In | **+20** | **+28** |

Rendered consequences the critics found independently:

- **Craft 1 / System 3:** the `SessionFraction` bleeds out of `topNavigation`
  and is painted over by the first card in `middleContent`. On 01 Idle only the
  glyph tops of "1/4" are visible above the `ChatBubble`; on 06 Lock It In it
  overlaps the "Back for round two" chip.
- **Craft 2 / UX 1:** on 05 Miss the `⚡ +7` line renders **on top of the
  HintCard's body text**, and `See the full transcript` paints after "Reveal
  answer" despite coming before it in DOM order. The hint is a Must state, and
  the nudge is illegible.

**The correct fix is not to raise the token.** The Figma frames say why:

- `topNavigation` is 56 and holds the appBar at `y=0 h=56` **and** the `1/4`
  text at `y=17`. The fraction **overlays** the bar. I stacked them in a column
  with a gap, which needs about 80.
- `bottomContent` is 120 and holds an `Action zone` 88 tall with buttons **side
  by side** at `x=16 w=157` and `x=185 w=157`. I stacked them full width,
  which needs 204 on Idle.

Raising `component.scaffold.topNavigation.height` to fit a stack would encode
my layout error into the design system. The screens need to be composed the way
the frames compose them.

---

## Disputed finding

**System fidelity finding 1 is a measurement artefact, and it distorts that
dimension's score.**

The critic reported that `build/css/tokens.css` shipped stale, leaving four
`var()` references inert, and graded System fidelity 3/10 substantially on it.
Verified against the commit:

| Token | In `0bc1082` | In working tree |
| --- | --- | --- |
| `--typography-primitive-tracking-wide` | present | present |
| `--color-semantic-border-subtle` | present | present |
| `--component-mic-button-paused-fill` | present | present |
| `--component-mic-button-paused-glyph` | present | present |

Working tree clean. `npm run tokens` ran in the same batch that added those
tokens, before the commit. The critic sampled the tree during the window
between the JSON edit and the regeneration, and could not distinguish that from
a defect.

**The 3 is recorded as given.** Adjusting a blind critic's score after the fact
would defeat grading blind. But roughly half that dimension's drop is
measurement error, and a re-run on a quiet tree is the way to settle it.

---

## Findings by dimension

### System fidelity — 3

1. ~~`tokens.css` stale~~ — **disputed, see above.**
2. **`MicButton`'s `Paused` state contradicts the system of record in three
   places and has no story.** Adding it made four files assert one fact, three
   of them now false: `MicButton.stories.tsx`'s Figma description still says
   "Don't add a fifth state"; `SPEC.md` Open 12 records the opposite as
   **RESOLVED**; `RecordingStatus.tsx` and its story both still say "MicButton
   has no Paused state... not an oversight to fix here". No `Paused` story
   exists, so a state used in production is undocumented.
3. **`topNavigation` is too short for its own documented contents**, with no
   `overflow`, so it bleeds into `middleContent`. Same root cause as above.
4. *Retracted by the critic itself* after zooming: `/session/exit`'s last
   reason row was correct clipping by `.middle`, not an overlap.
5. `component-gaps.md` and `gaps-and-cuts.md` checked and clean.

### Coherence — 4

1. **Coral means three different things.** `design-system.md` scopes it
   narrowly to `CouldntHear`. It is now also the "Partially right" verdict on
   05 Miss and the neutral pre-verdict "Try again" on 02a Captured. The system
   built `CouldntHear` precisely to stop being conflated with `Miss`, and the
   chip reintroduces it.
2. **Two retry pills on one screen.** `/session/unclear/1` renders a standalone
   `Chips` above a `RecallResult` that already supplies its own, both bound to
   the same handler, labelled differently.
3. **The `pro` chip used against its own documented reservation** on 06 Lock It
   In, which `design-system.md` says is almost certainly for subscription-gated
   content.
4. **07a Practice flattens the hierarchy**: all three actions Tertiary, so the
   dismissal weighs the same as the two real choices, inverting the pattern
   every other screen keeps.

### Craft — 4

1. **Region overflow**, findings 1 and 2, covered above.
2. **A shipped placeholder icon.** `/session/repeat/1` passes no `icon` to
   `Snackbar`, so it renders the `square` fallback where a checkmark belongs,
   on the one required-scope screen where that component ships.

### UX judgment — 7

1. **The hint is illegible on 05 Miss**, covered above. A Must state broken on
   render while correct in source, which is rule 2's own example.
2. **`/session/blank/1`'s mic is off-centre.** `.actions` in
   `interrupt.module.css` has no `align-items: center`, so the fixed-diameter
   button falls to flex-start. On the one screen whose job is reassurance.
3. **Verified positives, by clicking rather than reading:** the whole
   permission-denial fork is built and walkable, intro through primer, drawn OS
   sheet, Don't Allow, denied, into a sticky text turn where "Say it instead"
   is correctly absent. `voice-ux.md` still calls this "the largest hole in the
   feature... unbuilt". It is not. Skip and "I don't know this one" are
   genuinely different destinations. The dropped-connection path never blames
   the student's speech.

### Accessibility — 7

Up from 4. All four gates pass. Remaining:

1. **`aria-pressed` on momentary actions.** `Chips.tsx:58` sets it for any
   chip with an `onClick`, so both retry pills on `/session/unclear/1` announce
   as "toggle button, pressed" while toggling nothing.
2. **`MascotSlot` alt text is noise.** `alt={"Knowie, " + expression}` announces
   the internal prop name before every card, session-wide, while the actual
   state is in the adjacent title. Should be `alt=""`.

### Structure — 5

Unchanged. The shell no longer scrolls its own chrome and the mascots are no
longer clipped, both fixed before scorecard 01 was written. The region overflow
above replaced them.

---

## Blind spots, as reported

- **Craft:** did not verify motion at all, so whether the pulse rings animate
  and whether a reduced-motion path exists are unchecked, despite the Craft-9
  anchor naming both. One viewport only. Did not reach the drill, where it
  expects the Coral defect recurs.
- **System:** lost roughly twenty minutes to a shared browser tab and discarded
  those observations rather than report them.
- **UX:** tested in a 776px content viewport rather than a true 844, which is
  what surfaced the overflow. A taller viewport might mask it and a shorter one
  would worsen it. No real screen reader, so the `aria-pressed` finding is a
  DOM read. Did not render a multi-term session, so the confidently-wrong recap
  sort is unverified and not credited.
- **Ambition:** read source and CSS rather than rendered motion, and scoped to
  14 screens without checking whether Definition Drill Down's answers transfer.

**Cross-cutting, and my fault, not the work's:** the craft and system critics
were driving the same Chrome tab group and contaminated each other. The system
critic discarded a tiled-layout bug and a mystery screen jump because it could
not separate app behaviour from another agent's navigation, and warned that any
other critic reporting those should be doubted. Browser-driving critics need
isolated tabs. The disputed token finding has the same cause: parallel agents
sampling a tree that was still moving.

---

## Reach — 5, excluded from the total

Down from 6, on a rewritten and stricter agent, so the move is not comparable.

"No moment in the scoped flow takes a position it didn't have to take. Every
screen does the job the spec assigns it and stops. That is the definition of a
5 on this scale, not a compliment."

Where it settles: 04 Pass renders byte-identically on all four terms, so the
last one is not marked as last; 06b, the hardest-won pass in the session, uses
the same `2XL` mascot as an easy first-try win, and its own code comment names
the settling as "a quiet success, not a celebration"; **07 Recap has no
`MascotSlot` at all**, though `design-system.md`'s resolved mapping assigns
`laughing` to it.

That last one also appeared in scorecard 01, found by a different critic on a
different model at a different scope. It is the strongest candidate in either
run for a rule rather than a fix.

Its proposals are in the agent's report. Notably it **rejected two of its own
ideas on system grounds**: `Chips color="pro"` because the doc reserves pro for
subscription-gated content, and `Coral` because every existing use means
"something is still wrong, act again" and would contradict a clean pass.

---

## What to fix first

1. **Compose the regions as the frames do.** Fraction overlaying the app bar,
   action zones as side-by-side rows. This closes four findings across three
   critics and is the only one currently making a Must state illegible.
2. **Reconcile `MicButton`'s `Paused` state with its own record** — story,
   Figma description, `SPEC.md` Open 12, and the two false statements in
   `RecordingStatus`.
3. **`aria-pressed` on momentary chips**, and remove the duplicate retry pill.
4. **Coral's three meanings**, and the `pro` chip on Lock It In.
5. **`MascotSlot alt=""`**, the `Snackbar` checkmark, `.actions` centring, and
   07a's button hierarchy. All one-liners.
6. **Re-run System fidelity on a quiet tree** to get a score that is not half
   artefact.
