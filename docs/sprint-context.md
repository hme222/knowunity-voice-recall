# Sprint Context — Say It Back (voice active recall)

Voice-based active recall for Knowunity: student speaks a term,
Knowie replies in text. 2.5-week sprint, mobile iOS only, 390px, dark
mode, recall mocked (no real STT/judging).

**Concept:** A conversational, not quiz-graded, recall check. A clean
pass echoes the student's own transcript back as proof rather than
generating new praise. A miss requeues later in the same session
instead of resolving permanently on one attempt.

**Canonical source of truth: Complete Flow, not Main flow v1.** Main
flow v1 is the older, exploratory section. Both are now kept in sync
on every real decision (see "Screens" below), but if they ever
diverge again, Complete Flow wins.

## Where it lives

Post-quiz, inside the exam plan, on first encounter. After that, a
re-entry point on the home page.

**Home entry point, decided 2026-09-16: the "Say It Back" chip is the
entry point. The due-signal card is conditional, not an alternative.**
- **The chip is always there:** a plain "Say It Back" chip with a mic
  glyph, sitting among Scan/Summarize/Flashcards/Quiz in the existing
  home chat composer. Real, confirmed, built. Present in both Main
  flow v1 (where it always lived) and Complete Flow (copied in, since
  Complete Flow's own version turned out to be entirely empty, see
  below).
- **The due-signal priority card only surfaces when the student has
  quizzes or exams due.** Say It Back flags those on their dates so
  the student can practice ahead of them. The card is a due-driven
  layer on top of the chip, not a competing direction.
- **Card content and tap, decided 2026-09-16:** the card shows the
  **topic** and the **due date**, and tapping it goes **straight into
  the Say It Back session for that lesson**. No intermediate picker.
- **Picker page, decided 2026-09-16:** the DUE NOW/NEEDS
  PRACTICE/MASTERED picker page in Complete Flow is the **"pick what
  to practice" screen the chip opens, always** — whether or not
  something is due. So the two home paths are: card (only when
  something is due) → straight into that lesson; chip (always) →
  picker → chosen lesson. The picker is never on the card's path.
  Both the card frame and the picker frame were empty when checked
  directly and still need building.

## Core loop, decided

- Result states are Knowie's in-character text reaction, not a graded
  badge/icon.
- A distinct Commit state (idle) sits between Idle and Recording.
- Recording is a full-screen mic takeover, not the competing inline
  `Chat Input` composer pattern (that component is unused anywhere
  live and may be abandoned work, never confirmed either way).
- On a clean pass, Knowie's confirmation reuses the student's own
  transcript verbatim.
- A full transcript is reachable as its own bottom sheet, from an eye
  icon on the Miss result and every row of Recap.
- Couldn't-hear is a third, visually neutral result state, with a
  live mic for immediate re-record.
- Recap groups every term into four buckets: Unaided, Hinted,
  Revealed, Worth revisiting.
- Pause/resume mid-recording is in scope (built).

## Skip / Reveal — resolved

Skip is available at every question, not just before the first
attempt, and is explicitly worth zero XP. Three placements were built
and compared; **chosen: Skip as a plain, quiet text link below Reveal
answer / Try again**, which stay unchanged as the primary pair. Live
on the real Miss+Hint screen in both Complete Flow and Main flow v1.

**Still open:** whether Reveal should cost less than an unaided pass
was a separate question from Skip's placement, and remains only
partly answered, see XP below.

## XP model

Grounded in Knowunity's real reference screenshots where possible,
then deliberately adjusted on one point:

- The real screenshots confirm Reveal and Hint award the *same* XP
  (+5 each). **Built differently, on purpose:** Hinted is worth more
  than Revealed (+7 vs. +5), a deliberate departure from the
  reference, made explicitly rather than by accident.
- Full curve as built: **Unaided +10, Hinted +7, Revealed +5, Worth
  revisiting/Skipped 0.**
- Shown twice: per-term on Recap (summing to the total XP chip, +22),
  and live in-flow at the moment it's earned (the Pass screen, the
  Miss+Hint screen, and the new Reveal-answer-result screen).
- **Unaided's value (+10) is not confirmed by any real screenshot
  either way** — the App Inventory notes no screenshot shows a first,
  unhinted "Correct" in isolation. The Design Brief's own open
  question, "what the XP mechanic actually is," is narrowed by this
  work, not closed.

## Screens — Complete Flow, current state

All of these now share consistent treatment: a fraction ("N/4")
centered over the progress ring, an XP counter only on the two
screens where XP is actually earned (04, 05), and correct progress
fill via the component's real `progress` property, not a resized
rectangle.

- **00 Intro** — no XP shown (nothing earned yet).
- **01 Idle/Commit** — chatBubble retitled to the actual term
  ("Explain: Formal charge"), no XP shown. Restored to clean after an
  exit-confirmation sheet was mistakenly baked into it (see Process
  notes).
- **01b Back button tapped — exit confirmation** — separate branch,
  matches the real reference (`IMG_7511`): "What made you stop?"
  title, 8 real reasons, "Keep learning" primary / "Leave anyway"
  secondary, plus a new line not in the reference: "You won't earn XP
  for this session if you leave now."
- **02 Recording, 03 Processing** — no XP shown.
- **04 Pass** — +10 XP shown live.
- **04a Couldn't hear** — no XP shown (not yet a resolved attempt).
- **05 Miss + Hint** — +7 XP shown live, Skip/Reveal resolved layout.
- **05a Reveal answer result** — new screen, matches the real
  reference (`IMG_7513`): no verdict badge, plain answer bubble, "Try
  it yourself after reading" above an idle mic, "Next question" link.
  Not yet wired from the actual "Reveal answer" tap.
- **06 Lock It In** — shows "3/4" with the ring genuinely filled to
  75%, not just the text changed.
- **07 Recap** — four buckets with real per-row XP, summing correctly
  to the total chip.

**Main flow v1 is synced to match all of the above** as of this pass,
including a second instance of the same baked-in-sheet mistake found
independently on its own Miss+Hint screen and fixed the same way (see
Process notes). Main flow v1 does not yet have its own copies of 01b
or 05a — those exist only in Complete Flow. Given Main flow v1 is the
superseded section, that's a reasonable place to stop rather than a
gap, but it's a judgment call, not a settled rule.

## Known component bugs, not fixed, worked around

- **`optionRow`'s label text cannot be reliably resized.** Every
  method that works on every other text node in this file failed on
  it, silently, no error, just a value that never actually changed.
  Worked around by building plain custom frames instead of instances
  of the component wherever wrapping text was needed. Don't trust
  `optionRow` with multi-line copy until someone with fuller Figma
  access finds the actual cause.
- **`statChip` looked correct but wasn't actually bound to its
  tokens** — literal hex values, not `boundVariables`, on every fill
  and stroke, despite matching the documented colors closely enough
  to look right. Fixed: genuinely bound to `accent.blue/green/magenta`
  now. See the tokens notes for the full writeup; the takeaway worth
  repeating here is that this kind of drift is invisible by looking,
  only checking the actual binding caught it.

## Process notes, worth reading before touching this file again

- **A bottom sheet must live on its own branch screen, never baked
  into a screen meant to represent a default state.** Happened twice
  this pass, once by mistake (the exit-confirmation sheet, caught and
  fixed), once pre-existing and found independently (Main flow v1's
  transcript sheet). Check any screen using
  `showBottomSheetBackground` for this specifically before trusting
  it as a "normal" screen state.
- **A screen's name and annotation describing content that isn't
  actually on the frame has now happened four separate times**: the
  due-signal card, the picker page, the "Partially right" tag before
  it was properly placed, and a hero score line in an earlier
  exploration. Treat this as a known failure mode in how content gets
  drafted in this file, not four coincidences, and check the actual
  frame contents before trusting a screen's label.
- **The progress ring's fill is a component `progress` property**
  (confirmed values `25`, `75`, set via `setProperties`), not
  something to resize by hand. The fraction label beside it is a
  separate plain text node that needs `textAutoResize: NONE` and an
  explicit width to actually center, an auto-resizing text node will
  render fine but sit uncentered with no visible error.

## Not building this sprint

- Knowie speaking (voice out).
- Auto-endpointing.
- A hint that accepts a reply or branches into conversation.
- Second hint.
- Mid-answer language switching.
- Mic-busy handling.

## Open, unresolved, needs a decision from someone

1. **Back arrow vs. X.** Both real references (`IMG_7511`,
   `IMG_7538`) show an X for exiting a recall screen. Every screen in
   this file still uses a back arrow, kept for internal consistency
   rather than matching the reference. Changing it means detaching
   `appBar` from its component on every affected screen, a real
   tradeoff, not done without a decision.
2. **Whether Reveal should cost less than an unaided pass** — Skip's
   placement is resolved, this incentive question is not, and is
   separate from it.
3. **Unaided's exact XP value (+10)** is unconfirmed by any real
   screenshot, an informed guess, not a verified number.
4. ~~Due-signal card vs. plain home chip~~ — resolved 2026-09-16, see
   § "Where it lives". The chip is the entry point; the card is
   conditional on quizzes or exams being due, shows topic + due date,
   and taps straight into that lesson's session; the chip always opens
   the picker page, due or not. Still open underneath it:
   the visual design of both the card and the picker, both frames are
   empty.
5. **05a isn't wired** from the actual "Reveal answer" tap on screen
   05 yet, it exists as a standalone frame.
6. **`optionRow`'s resize bug** — cause unknown, only worked around.