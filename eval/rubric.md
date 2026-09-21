# Rubric — Say It Back

For grading this prototype. Six dimensions, two scoring rules, four hard gates.

Anchors are written against this project, not against design in general. They
name things that actually happened here, so a grader can check a claim rather
than form an impression. Where an anchor cites a rule it comes from
`docs/voice-ux.md`, `docs/design-system.md` or `docs/design-brief.md`
§ "Hard constraints".

---

## Scoring rules

These override any anchor below.

1. **"Looks good" is a 6, not a 9. A 9 survives a senior critique untouched.**
   A screen that reads well on first glance has cleared 6. Nine means someone
   who knows the system went looking for the seam and did not find one.

2. **A dimension scores 8 or above only if it was verified by rendering,
   measuring or testing. Never from reading code.**
   This is not pedantry, it is the failure mode this project has hit most. Two
   examples worth holding in mind while grading:
   - `strengthMeter` read correctly in source — four greens, ascending. Rendered,
     it *darkened* as it filled, so a full meter was the least visible state on
     a dark background, in four colours that were not in the palette.
   - The `attempt`/`hinted` query chain typechecked, linted, and passed a
     read-only review. Clicked, term 1 could never be completed and the Hinted
     bucket was unreachable.

   If the evidence is "I read it and it looked right", the ceiling is 7.

---

## The six dimensions

| Dimension | What it asks | Weight |
| --- | --- | --- |
| System fidelity | Does every value trace back to a token, and every component to the library | High |
| Coherence | Does it read as one product, or as screens that arrived separately | High |
| Craft | Spacing, rhythm, states, the small deliberate decisions | High |
| UX judgment | Are the states handled, the hierarchy clear, the failure paths designed | High |
| Accessibility | Contrast, touch targets, whether meaning ever rests on colour alone | Medium |
| Structure | Does the layout hold together and the thing render | Low |

Suggested numeric weights if you need a single score: High 3, Medium 2, Low 1.
Four Highs means craft and judgment dominate, which is the intent — this is a
design prototype, not a shipping build.

---

### 1. System fidelity — High

**Scoring:** whether values are bound rather than typed, and whether the
library was reached for before something was hand-rolled. Not whether it looks
consistent — whether it *is*.

**4** — Raw hex or px in component source. Something hand-built that already
exists in the catalog. A `component.*` token namespace added just because a
component has variants, against the rule in `tokens.json`'s own group
description that the namespace is earned.

**6** — Values are tokenised and components reused, but the bindings were never
checked. This is the `statChip` case: it matched the documented colours closely
enough to look right for a whole pass while being bound to literal hex on every
fill and stroke. Looking cannot catch this. Only checking the binding can.

**9** — Every value resolves through a token path, and that was verified, not
eyeballed. A value with no token was added to `tokens/tokens.json` and
regenerated rather than patched inline. Any literal that survives is on a named
exception list with the condition that would retire it. A new `component.*`
namespace is justified in its own `$description` against the earned-not-
automatic rule. `npm run check:tokens` passes.

---

### 2. Coherence — High

**Scoring:** whether the screens were built from one set of decisions, or
assembled and then made to match.

**4** — Screens with different region geometry, so the action zone moves as you
advance. The same action named three ways across the flow. A colour meaning one
thing on one screen and something else two screens later.

**6** — Components and spacing are consistent, but the seams show in language
and hierarchy: Skip is Tertiary on seven screens and Secondary on one; the same
verdict is a chip here and a badge there; copy voice drifts between screens
written at different times.

**9** — Every screen sits on the same scaffold regions, so chrome never shifts
between turns. One action has one name and one button variant everywhere. Where
the design departs from its own reference — Hinted worth more than Revealed,
against the real screenshots — the departure is recorded as deliberate, so it
reads as a decision rather than an inconsistency. A reviewer moving through the
flow never has to relearn anything.

---

### 3. Craft — High

**Scoring:** the decisions nobody asked for. Whether the small things were
chosen or defaulted.

**4** — Default spacing throughout. No motion, or motion as decoration. States
that differ only in their text. Nothing that suggests anyone looked at it twice.

**6** — Spacing comes off the scale, states are present and distinct, motion
exists. But nothing shows a decision being made: a dead spinner where the brief
asked for a designed wait; an animation that plays because animations are nice.

**9** — The small decisions are visible and each has a reason. Some that count
here: pulse rings parented to the mic so z-order cannot bury them, which is a
failure this file has had; `prefers-reduced-motion` removing every animation
while status stays legible, because Principle 1 says status must never rest on
motion alone; a meter that brightens as it fills, because the reward state
should be the most visible one; a timer lifted out of a component so its story
stays deterministic. A senior reviewer asking "why is this like that?" gets an
answer, not a shrug.

---

### 4. UX judgment — High

**Scoring:** whether the hard parts were designed or avoided. The failure paths
are the dimension.

**4** — Happy path only. Permission priming, the denied state and the text
fallback are absent — all three are **Must** in `voice-ux.md` and were the
longest-standing hole in this project. A button that leads nowhere. An error
state that exists in a flow diagram and not in the build.

**6** — The Must states exist, but the failure paths are thin or wrong-headed. A
dropped network routed into "couldn't hear", which blames the student's speech
for a connection fault — the exact misattribution Principle 4 exists to prevent.
A summary that reports a number the student can see is wrong.

**9** — Every Must and If-time state is reachable **by clicking**, not just
present as a file. The student is never trapped: there is a non-mic way out of
every screen, per the brief's hard constraint. A mishear is visibly separated
from not-knowing. The summary makes overconfidence cost something rather than
flattering — the brief's own test for whether the screen is earned. A stuck
student is given a task that always completes, so the loop terminates. Skip and
"I don't know this" are treated as different information, because they are.

---

### 5. Accessibility — Medium

**Scoring:** whether it works for someone who cannot see colour, cannot speak
right now, or is using a screen reader. Hard gates below are pass/fail and sit
outside this score.

**4** — A gate fails. State signalled by colour alone. A control with no
accessible name. Motion with no reduced-motion path.

**6** — The gates pass, but status rests on a single channel. Colour carries the
verdict with no shape or icon beside it; or motion carries "recording" and
stops meaning anything when motion is off.

**9** — Gates pass *and were measured*, not assumed. Every state is
distinguishable on at least two channels — `voice-ux.md` Principle 1: no hover
on mobile, and colour alone is not enough, pair it with shape, icon or motion.
Accessible names match visible labels rather than contradicting them. A
decorative duplicate of information already announced is hidden from screen
readers instead of read twice. The text fallback is framed as an equal path,
not a downgrade, because some students cannot speak at all.

---

### 6. Structure — Low

**Scoring:** whether it holds up. Low weight because this is table stakes, not
the point — but a 4 here caps everything else, since an unrendered screen cannot
be graded on craft.

**4** — Does not build, renders blank, or 404s. A route that exists as a file
and not as a destination.

**6** — Renders at 390 and holds together there, but breaks elsewhere: fixed
heights that clip on a shorter window, or chrome that scrolls with the content.

**9** — Renders and holds at 390 and at other viewport heights, with the content
region absorbing the difference rather than the shell scrolling itself.
Typecheck, lint and story tests are clean. Every route is reachable by clicking
from another screen — no orphans, which is its own finding, not a nicety.

---

## Hard gates

Pass/fail. **Not scored, and not tradeable against a high score elsewhere.** A
failed gate is a failed submission regardless of the six dimensions above.

| Gate | Threshold | How to check |
| --- | --- | --- |
| **Contrast** | 4.5:1 for body text against its actual background | Measure the rendered pixels, not the token's documented value. Check text over tinted result cards and over translucent surfaces, where the composite differs from the swatch. |
| **Touch targets** | 44pt minimum | Measure the hit area, not the visible pill — they differ. This project's `spacing.semantic.tapTarget` is 48, which clears the gate; the check is that every control actually binds to it. |
| **No raw hex in component source** | Zero | `npm run check:tokens`. It strips comments and skips generated output, so a hit is real drift. |
| **No two states that should differ rendering identically** | Zero | Render them side by side. This is the gate that catches a paused mic reusing the `Captured` state — two meanings on one appearance, where the accessible name then says "Answer captured" for a paused recording. |

**On the last gate specifically:** it is the one most often passed by assertion.
Two states differing in a prop that maps to the same rendered output is a
failure even when the code plainly distinguishes them. Rendering is the only
check that finds it, which is scoring rule 2 restated as a gate.
