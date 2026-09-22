# Scorecard 04 — 2026-09-22

Four critics, each in its own context on Fable, each given only the screens, the
rubric and its own dimensions. No critic saw another's output. Run after the
fix pass that followed scorecard-03.

## Weighted total: **6.5 / 10** (was 5.5)

| Dimension | Weight | 03 | 04 | Weighted |
| --- | --- | --- | --- | --- |
| System fidelity | High (3) | 7 | 7 | 21 |
| Coherence | High (3) | 5 | 5 | 15 |
| Craft | High (3) | 5 | **6** | 18 |
| UX judgment | High (3) | 5 | **7** | 21 |
| Accessibility | Medium (2) | 5 | **7** | 14 |
| Structure | Low (1) | 7 | **8** | 8 |
| **Total** | **15** | **5.5** | **6.5** | **97 → 6.5** |

**Ambition: 7/10, unchanged, reported separately and excluded** per its own
definition.

The two dimensions that did not move are the two about *design* rather than
correctness. System fidelity held at 7 because a fix introduced a new dead
binding while closing others. Coherence held at 5 because nothing in the pass
addressed it: the fixes were correctness fixes, and the screens still disagree
with each other in the same ways.

---

## Hard gates — 4 of 4 PASS (was 1 of 4)

I measured all four myself rather than inheriting them.

| Gate | 03 | 04 | Evidence |
| --- | --- | --- | --- |
| Contrast 4.5:1 | FAIL | **PASS** | 303 text nodes across 46 routes, compositing the full ancestor chain: 0 below threshold. Lowest non-exempt is 5.67:1. |
| Touch targets 44pt | FAIL | **PASS** | 46 routes, every interactive control ≥ 44pt. |
| No identical states | FAIL | **PASS** | 68 states, 68 unique hashes — and the harness now seeds the state the differences depend on. |
| No raw hex | PASS | **PASS** | `check:tokens` clean; a literal sweep also found zero raw px, ms, easing keywords or `rgba()`. |

### Both gate fixes were mine to make and mine to get wrong

The contrast fix: `brand.bold` is a FILL token and was being used as 12px text
on `background.surface`, measuring 4.43:1. New `brand.onSurface` (violet.300)
is 5.67:1 on surface and 7.16:1 on page.

**My first contrast sweep reported five failures and was wrong.** It composited
the background from each node's PARENT and ignored the node's own, so a
dark-brown label on an amber pill was measured against the dark page behind it
and came out at 1.07:1. Corrected to composite the whole chain and to skip
disabled controls, which WCAG 1.4.3 exempts: 0 failures. A measuring instrument
that has not been checked is not evidence.

---

## The severe one: a token path bound to nothing

`src/app/session/recording/[term]/recording.module.css` sizes the three
Listening pulse rings from
`--component-mic-button-pulse-ring-inner|middle|outer`. **None of the three
exists.** `calc(var(<undefined>) * 1px)` is invalid at computed-value time, so
`width` falls to `auto` and each ring renders **2×2px**:

```
ring 1: 2x2, border 1px rgba(255,255,255,0.25)
ring 2: 2x2, border 1px rgba(255,255,255,0.18)
ring 3: 2x2, border 1px rgba(255,255,255,0.10)
mic:    120x120
```

The three designed rings are absent from the screen. MicButton's own 130px halo
masks the gap, which is why looking at the recording screen never caught it.

This is the rubric's 6-anchor verbatim — a token path named, bound to nothing —
and it is worse than drift: **`component-gaps.md` claims these rings are "sized
from new `component.micButton.pulse.*` tokens"**. I added that `pulse` group
earlier the same day with restScale, peakScale, pausedOpacity and the two glyph
values, and never added the three ring diameters the CSS was already
referencing. The documentation asserts a binding that was never made.

---

## Verified findings, most severe first

Each of these I reproduced myself; the critic that raised it is noted.

### 1. The recap buries the thing the whole confidence mechanic exists to produce (ambition) — **FIXED 2026-09-22**

Seeded a mixed run — one confidently-wrong term among passes:

| | |
| --- | --- |
| Content region bottom | 618 |
| `Worth revisiting · 1` heading | y = **770** |
| `You were sure about this one.` | y = **812**, visible: **false** |
| At the top of the screen | `SCORE 25%` |

The payoff sits 152px below the fold, under a percentage that grades the
session as a quiz in a feature defined as *not quiz-graded*. `ORDER` in
`recap/page.tsx:29` puts Worth revisiting last.

**Fixed.** Two orders now: when anything is owed a revisit the recap opens with
it, otherwise it leads with what was earned. Nothing is regraded or relabelled —
the same rows in the same buckets. Re-measured on the same seeded run: the
heading moves 770 → 392 and `You were sure about this one.` moves 812 → **434,
visible**. A clean run still reads Unaided → Hinted.

### 2. A typist can dodge the cost the brief demands (UX) — **FIXED 2026-09-22**

Drove the typed path end to end:

```
/text/turn?term=2 → Send → /session/pass/2
outcome:    {"bucket":"Unaided","xp":10,"wasSure":false,"calibration":0}
confidence: {}
```

There is no confidence tap on the typed path, so a typist can never be
confidently wrong. The −3 never applies, and the recap's confidently-wrong sort
is blind to them. `/permission/denied` promises "same questions, same hints, and
you keep the full XP" — the path is equal in reward and unequal in cost.

**Fixed.** `/text/checking` now asks the same question in the same shape after
its dwell, and calls the same `recordConfidence`. sprint-context says the tap
"occupies a wait the design already had to cover", and this screen is exactly
such a wait, so asking here follows that decision rather than bending it.
Verified on all four outcomes: typed pass + sure = +2, typed pass + not sure =
+1, typed miss + sure records `right:false` so the −3 applies, typed miss + not
sure = 0. A drill turn stays exempt — it is not graded and has no XP for a
confidence signal to price.

STILL OPEN from the same finding, and it needs a number from the designer:
sprint-context line 234 decides that "typed answers are reduced, but only when
voice was available" and names no reduction. The build already tracks *why*
someone is typing (the sticky flag distinguishes a denied mic from a choice), so
the mechanism is there and only the value is missing. A typed pass with voice
available still pays the full +10.

### 3. The mic moves under the finger (craft)

Mic centre-y, measured: 383, 471, 474, 565, 604, 674, 678, 678 — a **295px
spread**. Tapping the idle mic moves it **91px** on the very tap that starts
recording; the drill moves it 133px.

### 4. Processing is silent to assistive technology (UX)

`/session/processing` and `/text/checking` contain **zero** `aria-live`,
`role="status"` or `role="alert"` elements. "Let me check…", the 6s escalation,
and the arrival of "How sure are you?" are announced to nobody. This is the one
state `voice-ux.md` Principle 1 names explicitly, covered visually only.

### 5. The paused mic loses its toggle semantics (accessibility)

```
listening: aria-label="Listening, tap to pause"  aria-pressed="true"
paused:    aria-label="Paused, tap to resume"    aria-pressed=null
```

It announces as a plain button once paused. This is a regression from my own
earlier fix, where I made `aria-pressed` fire only for `Listening` to stop it
lying — and removed it from the state that most needs it.

### 6. Two Skips on one screen (craft)

`/door/exam-plan` renders "Skip question" at y=637 **and** "Skip" at y=746. Mine,
from building that door.

### 7. Provisional XP shown as earned (UX)

`/session/miss/1` shows "⚡ +7" in the same slot and style as the earned "+10" on
pass, at attempts 1–3, unlabelled. Reveal then pays 0.

### 8. Inert controls that promise content (UX)

`/drill/complete` says "Tap any round to see all 4 takes"; the four rows are
`<button>`s that do nothing. The transcript quote is a `<button>` with the full
transcript as its accessible name and no action. Home's tool chips are inert
buttons.

---

## What the pass actually bought

Verified as fixed and still holding: the confidence tap now prices itself
(−3 sure+wrong, +2 called it, +1 unsure+right); three loops that did not
terminate now do (hint ladder, requeue, couldn't-hear escalation); the denied
mic stays denied; `router.back()` no longer lands on `about:blank`; the
transcript sheet shows the term you opened; every exit control navigates; 0
animations run under `prefers-reduced-motion`.

Structure rose to 8 on a wider check than 03 got: all 68 states at three
viewport heights, no document scroll, no horizontal overflow, no console errors,
and no orphan routes.

---

## Methodology problems found in my own harness

- **The shot set is state-dependent and partly stale.** `eval/shots/07-recap.png`
  does not match what the dev server renders by default, because shots capture
  whatever `sessionStorage` happened to exist. `render-states.mjs` seeds the
  confidence tap and the requeue but not Recap. A critic reading shots instead
  of rendering can be graded against the wrong picture. Raised by craft as its
  blind spot; it is a real defect in the tooling, not in the build.
- **A differentiator below the fold is not a differentiator.** When I fixed the
  attempt-1/2 collision, my first attempt put the note at the end of the body,
  where it rendered under the fold: the DOM differed, the screenshot did not, and
  the harness correctly kept failing it. The same mistake is finding 1 above, at
  a larger scale.

## Still open, and still the designer's call

- The meter ramp reversal (done, on your instruction) versus Figma's own
  darkening ramp. Recorded in the token's `$description`.
- `TextBlock variant="L"` on the seven screens with no frame. Fixed on the door
  and Recap only, which was the scope chosen.
- Whether `component.card` has earned its namespace, or whether
  `captionMaxWidth` belongs in `spacing.semantic`.
