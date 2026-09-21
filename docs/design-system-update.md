# Design System — update for the Say It Back sprint

This replaces the correspondingly-titled sections of the existing
`Design System Rules — Voice Active Recall`. Everything here was
verified against the live file, not carried forward from the previous
version of the doc. The source-of-truth ordering in the original
(live usage first, components second, this doc last) still holds and
still applies to this document.

---

> **Precedence note, added 2026-09-20 — read before acting on this file.**
> `SPEC.md` wins on anything about what gets built. This document was drafted
> before four decisions were taken and still states the superseded position on
> each. The text below is left as written; these four are the exceptions:
>
> | This document says | Superseded by |
> |---|---|
> | §3 — the composer chip "is present in every home state" | There are **three** home states. No chip exists until a first encounter by any door; it then persists. See `docs/sprint-context.md` § "Where it lives". |
> | §4 — "the `N/4` fraction and progress ring are **not shown** on drill screens" | The ring **stays, four rungs**. The prototype ships the fixed-ladder fallback; the variable-length model in §4 is the intended future version, not the current build. See `SPEC.md` Open 5. |
> | §8.1 — Back arrow vs. X, "Unchanged" | **Resolved: X.** `appBar`'s glyph is an `INSTANCE_SWAP` on a nested `iconSlot`; exposing it once updates all 39 screens with nothing detached. See `SPEC.md` Open 1. |
> | §8.2 — Reveal XP, "Unchanged" | **Resolved: Revealed earns 0**, and the say-it-back repeat (+3) carries the reward. See `docs/sprint-context.md` § "XP model". |
>
> Everything else here stands, including §1, §2, §5, §6 and §7, which were
> verified against the live file.

---

## 1. `optionRow`'s resize bug — root cause found and fixed

The previous version of this doc and the Sprint Context both list this
as **"cause unknown, only worked around."** The stated symptom was
that the label's text could not be resized by any method, silently,
with no error, and that the workaround was to build plain custom
frames instead of instances wherever wrapping copy was needed.

**The cause is known now.** Two separate settings on the component
combined to make wrapping impossible:

1. The component's auto-layout is `VERTICAL`, and its
   `primaryAxisSizingMode` was `FIXED`. In a vertical layout the
   primary axis is the **height**, so the row was hard-locked at 56px
   and could never grow to fit a second line, no matter what the text
   did.
2. The label text node was set to `WIDTH_AND_HEIGHT` auto-resize, so
   it hugged its own content width and could never wrap in the first
   place. Long copy ran to 465px inside a 358px row and overflowed.

**The fix, applied to all four variants**
(`Default`/`Selected`/`Correct`/`Incorrect`):

- `primaryAxisSizingMode: AUTO` — the row now grows with its content.
- `counterAxisSizingMode: FIXED` — the row still takes its width from
  the parent.
- Label text: `textAutoResize: HEIGHT` and `layoutAlign: STRETCH` —
  the label fills the row's width and wraps.

Verified: a two-line label now produces an 80px row instead of a
clipped 56px one.

**Consequence for this doc's rules:** the "build a custom frame when
you need wrapping copy" workaround is retired. Don't create new
`optionRowCustom`-style parallel frames. If you find one, replace it
with a real instance.

**Already done:** screen `01b` (exit confirmation) had eight
`optionRowCustom` frames and two hand-built buttons. All ten were
replaced with real `optionRow` and `button` instances.

**One caveat that came out of that replacement, worth a decision:**
`optionRow` binds its fill to `background/surface`, which is the same
value as a bottom sheet's own fill. Inside a sheet the rows therefore
render invisibly against their container. They were given a subtle
white 6% overlay as a stopgap. That is a raw value, not a token, and
it should be replaced, see the tokens update for the proposed
`background.raised` entry.

---

## 2. Z-order is load-bearing for the recording screens

The listening pulse rings, the hold-to-pause caption and the
re-record pill are **loose siblings of the recording screens, not
children of them.** This has caused the same class of bug repeatedly
across this sprint, and it produced a new variant of it this session:

On `02 Recording` the three rings were present, correctly positioned
on the mic, visible, and at full opacity — and completely invisible on
canvas, because they sat at z-index 16–18 while the screen sat at 105.
The screen painted over them.

**Rule:** any overlay that belongs to a recording screen must sit
**above** that screen in the section's child order. Position alone is
not enough. When a recording screen is moved, reordered, or re-cloned,
re-check the z-order, not just the coordinates.

**Better fix, still not done:** parent these overlays into their
screens as absolutely-positioned children so they travel with the
screen and cannot be orphaned or buried. This has been flagged
repeatedly and remains the single highest-value structural cleanup in
this file.

---

## 3. Home entry point — resolved

The previous version lists this as an open product decision: a
low-commitment composer chip versus a more prominent due-signal card,
with no answer. **It has an answer now, and the two are not
alternatives.** They are two states of the same feature, gated on
whether the student has a plan:

- **No plan → the composer chip.** Say It Back is an always-available
  tool with no schedule attached, sitting among Scan / Flashcards /
  Quiz in the existing home composer. This is the baseline and it is
  present in every home state.
- **Plan with due dates → the chip *plus* a due-signal card.** As a
  deadline approaches, a Say It Back chip surfaces with an amber
  accent border. It reads from the exam/quiz plan's existing due
  dates; it is not a new scheduling system. It is a reminder layer on
  top of the chip, never a replacement for it.

A student with no plan never sees the card, so there is no mixed
message and no competing entry point. This closes item 4 of the old
open-questions list.

**The card is swipeable.** When more than one quiz is due, each swipe
shows a different quiz with its own term and date, and a count badge
counts down (`+2` → `+1` → `last one`) as the student clears them.

**Correcting the record on the due-signal card:** a previous pass
concluded this card "was never designed." That was wrong. It was
designed — the reference screen `5 — Priority card, one topic + count
badge` holds it — but its content frame was set `visible: false`, so
every check that looked at the rendered screen found an empty shell.
This is the fifth instance of the "name and annotation describe
content that isn't on the frame" failure mode, and the first where the
content was hidden rather than absent. **Check `visible` on a frame's
children before concluding a screen is empty.**

---

## 4. Definition Drill Down — fixed rungs replaced by a coverage meter

The drill was originally built as a fixed four-rung ladder. That is
gone, because a fixed count lies: a student who has the definition
after two passes gets padded, and one who needs six gets cut off.

**What replaced it:**

- **`strengthMeter`** is now a continuous fill (`fill=0/25/50/75/100`),
  not a four-segment counter. It fills by **how much of the definition
  the student can say unaided**, expressed as coverage of the
  sentence — not by which pass they're on.
- The drill has **no fixed length.** It ends when coverage reaches
  full, whether that is the second pass or the sixth.
- The `N/4` fraction and progress ring are **not shown** on drill
  screens. Progress lives in the meter.

**Two rules the meter depends on, both load-bearing:**

1. **The judge must score unaided coverage per pass.** This is the
   single capability the whole variable-length design rests on. If it
   can't be built reliably, the design reverts to counting passes.
   Unconfirmed with engineering.
2. **Help holds the meter; it never drops it.** A reveal or a miss
   parks the meter rather than reducing it. A student must never watch
   their progress go backwards for asking for help.

**The stumble scaffold (why a stuck student can't loop forever).**
Help escalates on the *same word*, and the task bends until it is
always completable:

- **1st stumble** — reveal the missed word, take the pass again.
- **2nd stumble, same word** — the word stays visible with its first
  letter shown. A prompt, not a giveaway. The meter barely moves.
- **3rd stumble, same word** — echo. Knowie says the word, the student
  repeats it. Always completable, so the loop terminates here.
  Echoing barely fills the meter, because echoing is not unaided
  recall.

State resets **per definition, per session.** This requires the drill
to track a per-word stumble count for the session — a small but real
data requirement, also unconfirmed with engineering.

---

## 5. New components

Seven components were added or repaired. Full descriptions live on the
components themselves in Figma; these are the rules that don't fit in
a description field.

| Component | Why it exists |
|---|---|
| `swipeChip` | The plan-active home's Say It Back card. Amber accent border = due signal. `QuizLabel` and `Count` are text properties. |
| `swipeDots` | Carousel position, `active=1/2/3`. Amber active dot matches the chip's border. |
| `bottomSheet` | Shared sheet shell. See the warning below. |
| `dueSignalCard` | The earlier single-quiz priority card. Superseded on the flow by `swipeChip`, kept because it is the simpler one-quiz case. |
| `pickerTopicRow` | Topic row on the picker. |
| `pickerDrillRow` | Drillable-definition row on the picker. |
| `trainingLog` | The "what you climbed" list on drill Complete. Row count is **variable** — the drill is variable-length, so this shows however many passes actually happened. |

**Removed:** the obsolete four-segment `strengthMeter`. There were two
components with the same name; the counter version is gone and the
continuous-fill version is the only one.

**`bottomSheet` carries a rule, not just a shape.** A sheet must live
on its own branch screen and must never be baked into a screen that
represents a default state. This has caused bugs three times in this
file. The component's established spec: 24px top radius, 16px padding,
32×4 grabber, 17px Bold title, 0.50 scrim.

**`pickerTopicRow` / `pickerDrillRow` were originally built custom
because of the `optionRow` bug.** Now that the bug is fixed, whether
they should collapse back into `optionRow` variants is a real open
question. They still carry a trailing mic affordance that `optionRow`
has no slot for, so they are not simply redundant.

---

## 6. Consistency rules that were being violated

A full audit of the Complete Flow found these. All are fixed; they are
written as rules because they will drift again.

**Type scale.** The flow had 18 distinct font sizes. The ones that
belong to this feature:

- `21` — screen titles
- `17` — sheet and card titles
- `15` — body and result copy
- `13` — supporting and subtext
- `11` — labels, chips, count badges

`32` (home greeting), `18` (composer chip label) and `28` (the drill's
echoed word) are deliberate and stay. Everything else in the earlier
count was app-shell chrome, which is not ours to normalise.

**Corner radius.** Had 12 distinct values, now four in our UI:

- `12` — cards and rows
- `99` / `9999` — pills
- `24` — bottom sheets
- `16` — the unlock coach-mark card

**Button hierarchy.** Skip is a Tertiary text link at every question —
it was Secondary on one screen. "Not now" is Tertiary — it was
Secondary on one screen. Every button in the flow is 48px.

**Mascot sizing.** `2XL` on all session and drill screens, `3XL` on
the three home screens only, `XL` behind the transcript sheet.

---

## 7. Flow-diagram conventions

These are documentation rules, not product rules, but the flow is a
deliverable and it kept degrading.

- **Captions sit directly under their screen**, left-aligned to the
  screen's x, 22px below it: a Bold title then a 3–4 sentence
  description.
- **Vertical connectors run down a screen's right edge**, never its
  centre, because the centre passes straight through the caption text
  below. 29 lines were crossing text before this rule.
- **Horizontal connectors travel in the gutters between rows**, which
  are clear of both screens and captions.
- **Colour-coded:** purple = forward path, amber = branch (miss /
  couldn't-hear), green = requeue, grey = return to a previous step,
  dashed = a tap or swipe that opens an overlay rather than advancing.
- **Every screen has at least one connector.** Entry doors legitimately
  have one (nothing points back at them); everything else has two or
  more.
- **No orphan segments.** 24 disconnected line fragments were removed
  this pass, left over from earlier re-routing.

---

## 8. Still open

Carried forward, plus what this session added.

1. **Back arrow vs. X.** Both real references show an X for exiting a
   recall screen; every screen here still uses a back arrow. Unchanged.
2. **Whether Reveal should cost less than an unaided pass.** Unchanged.
3. **Unaided's exact XP value (+10)** is still an informed guess, not
   a verified number.
4. ~~**Due-signal card vs. plain home chip.**~~ **Resolved** — see
   section 3.
5. ~~**`05a` isn't wired.**~~ **Resolved** — it is captioned and
   connected in the flow now.
6. ~~**`optionRow`'s resize bug.**~~ **Resolved** — see section 1.
7. **NEW — the coverage judge.** The drill's meter needs per-pass
   unaided-coverage scoring. Unconfirmed as buildable.
8. **NEW — per-word stumble tracking.** The scaffold needs it, scoped
   per definition per session. Unconfirmed as buildable.
9. **NEW — no elevated-surface token.** Rows inside a sheet have no
   way to separate from the sheet without a raw value. See the tokens
   update.
10. **NEW — recording overlays are still loose siblings.** Structural
    cleanup, not yet done, highest value of anything remaining.
