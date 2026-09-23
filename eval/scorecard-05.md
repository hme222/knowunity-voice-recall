# Scorecard 05 — 2026-09-23

Four critics, each in its own context on Fable, each given only the screens, the
rubric and its own dimensions. No critic saw another's output. Run after the
twelve-decision fix pass that followed scorecard-04.

## Weighted total: **5.9 / 10** — down from 6.5

| Dimension | Weight | 03 | 04 | 05 | Weighted |
| --- | --- | --- | --- | --- | --- |
| System fidelity | High (3) | 7 | 7 | 7 | 21 |
| Coherence | High (3) | 5 | 5 | 5 | 15 |
| Craft | High (3) | 5 | 6 | **5** | 15 |
| UX judgment | High (3) | 5 | 7 | **6** | 18 |
| Accessibility | Medium (2) | 5 | 7 | **6** | 12 |
| Structure | Low (1) | 7 | 8 | **7** | 7 |
| **Total** | **15** | 5.5 | 6.5 | **5.9** | **88 → 5.9** |

**Ambition: 6/10, down from 7**, reported separately and excluded.

**The score went down after a pass that fixed twelve things.** That is the
finding, not an anomaly to explain away. Four dimensions fell and none rose.

## Why it fell

Three causes, and all three are mine.

**1. I fixed one family and left the other.** The mic region, the strongest
change in the pass, reached six of the ten screens that have a mic. The commit
message says "every voice screen puts its mic there". It does not:

| In the fixed region | Not |
| --- | --- |
| `session/idle`, `session/reveal`, `session/blank`, `session/lock-in`, `drill/recording`, `session/recording` (own `micWrap`, same token) | `drill/pass/[step]`, `drill/miss/letter`, `drill/miss/echo`, `door/exam-plan` |

I reported the residual 41px spread as "content pressure, not layout drift". It
is not: it is the four screens that never got the region. The number was right
and the explanation was wrong.

Worse, the drill now reproduces the exact transition I claimed to have fixed:
`/drill/pass/1 → /drill/recording` moves the mic 30px and the StrengthMeter
**144px**. A half-applied fix reads worse than uniform drift, because the two
families now visibly disagree.

**2. Extraction without deletion.** `ProcessingBeat` and `ConfidenceAsk` were
promoted and the code they replaced was left behind.
`processing.module.css` defines **twelve** selectors; its page references
**two**. `drill.module.css` and `text.module.css` each still carry a `.mascot`
breathe no TSX uses — three orphaned copies of the composition the commit says
was unified, including duplicate `breathe` and `blink` keyframes.

**3. New rigidity traded for old.** The fixed 200px mic region is a fixed height
that clips: at 390×600 the mic on `/session/idle/1` renders at 454–574 with
`main` ending at **430** — entirely below the fold, and the fade masks the empty
clear-space above it, so nothing signals more exists. I measured at 844 only.
`/session/lock-in` overflows at 844 itself, putting the mic's lower arc under the
mask on the reference frame.

---

## Hard gates — 4 of 4 PASS

Measured by me, not inherited.

| Gate | Result | Evidence |
| --- | --- | --- |
| Contrast 4.5:1 | **PASS** | No body text under 4.5:1 on any state, composited through the ancestor chain. |
| Touch targets 44pt | **PASS** | Smallest interactive rect 48×48. |
| No raw hex | **PASS** | `check:tokens` clean; `check:vars` 414 resolved; `npm run tokens` no diff. |
| No identical states | **PASS** | 68 of 69 states, no collisions. |

Two caveats I will not paper over. The identical-states gate passed at **aria
level** — the UX critic did not pixel-diff recording against paused, so the gate
rests on names, not paint. And my own render pass reached **68 of 69**: one state
hit a 45s navigation timeout under four concurrent critics. Neither is a failure;
both mean the gate is slightly less proven than "PASS" suggests.

---

## The two that matter most, both verified by me

### 1. The Recap reports a number the student can check and disprove — **FIXED 2026-09-23**

Seeded two sure-wrong plus two unaided:

```
header:  XP +19        "+14 earned, +5 for finishing"
rows:    0 + 0 + 10 + 10 = 20
```

`totals.earned` folds in calibration; the rows render base `xp`; no confidence
line appears. So the pass screen says "+2 · called it", the miss says
"−3 · you were sure", and the summary quietly drops both and shows a total that
does not add up.

This is mine, from the confidence work, and it lands on the Design Brief's own
words — *"a summary whose job is to avoid flattery cannot show a number the
reviewer can see is wrong"*, which is quoted in `recap/page.tsx`'s own header
comment.

**Fixed.** The model was right — `earned = termXp + calibration` — and the
working was invisible, so nothing on screen reconciled the chip to the rows. The
sum is now shown: `+20 from the terms below · -6 for how sure you were · +5 for
finishing`. Verified in both directions: the penalty run reconciles 20 - 6 + 5 =
19, and a called-it run reconciles 37 + 3 + 5 = 45. The caption no longer states
arithmetic it does not show.

### 2. An offline retry becomes the student's fault — **FIXED 2026-09-23**

```
/session/offline?term=2 → "Try sending again"
  → /session/processing/2   (no ms, no attempt)
  → /session/unclear/2?attempt=1
  → "That one didn't come through… a little closer to the mic."
```

A held, confirmed answer and a connection fault come back as a mishear. That
inverts `voice-ux.md` Principle 4, and `/session/offline`'s own copy exists
specifically to blame the connection rather than the speech.

**Fixed.** The take now travels with the student: 03 Processing hands `ms`,
`attempt`, `hinted` and `door` to the offline screen, and the offline screen
hands them back unchanged. A retry resolves to the verdict the original take
earned, because the network dropping is not new evidence about how the student
spoke. Driven end to end: a 6s take → slow escalation → offline → "Try sending
again" → `/session/pass/2`, where it previously landed on
`/session/unclear/2?attempt=1`.

---

## Also verified, not yet fixed

- **The drill's stated metaphor is not built.** `drill/pass/[step]`'s own header
  says "Knowie grows a step each pass"; `MascotSlot size` is `2XL` on 28 of 30
  slots, varied only on `/home/unlock` (3XL) and `/drill/complete/round` (XL).
  A claim in the repo that the screen contradicts — the same class as the pulse
  rings.
- **`component-gaps.md` line 20 is stale**: still "Inline. Second consumer will
  be DD 03 — promote then" while `src/components/ConfidenceAsk/` exists with a
  story and two consumers. My edit did not match the table row and I did not
  check. The ledger the rubric leans on contradicts the tree.
- **Recap's two action rows touch** — 694 and 742, 0px gap, where every other
  stacked pair uses 8. From the action-row restructure; I verified the height fit
  and never looked at the gap.
- **Captured contradicts its own verdict**: it shows a clean full transcript,
  takes "Looks right", then says "That one didn't come through."
- **The denied path asks the confidence tap and discards it** — no `confidence`
  key written on the sticky route, so the screen asks a question it throws away,
  which is the thing `processing/page.tsx` condemns in its own comment.
- **Sheets do not inert the backdrop**; nested live regions announce twice on
  `/session/repeat` and `/session/offline`; the "Listening" caption paints *under*
  the mic (y610–626 inside the mic's 506–626).

## What did hold

Every state reachable by clicking; every screen has a non-mic exit; the requeue
terminates; miss attempt 3 removes retry; the denied path keeps full XP as
promised; 0 animations under `prefers-reduced-motion` with status text still
carrying the state; the action zone is a fixed 136 with its top at **674 on every
route**; the type scale is six clean steps; all five region heights match their
`component.scaffold.*` tokens on 46 of 46 routes.

## The honest read

The pass improved what it aimed at and the score still fell, because correctness
work created new seams faster than it closed old ones. The pattern in all three
causes is the same: **I verified the change where I made it and not where it
propagated** — one family not two, the new component but not the old CSS, one
viewport but not the short one.

Ambition's drop from 7 to 6 says the same thing from the other side: every
moment the brief names as the point now "resolves at spec — a card, a number, a
Continue". Twelve fixes made the build more correct without making it take a
position, and reach is not a by-product of correctness.
