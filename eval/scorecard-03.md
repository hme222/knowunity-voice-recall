# Scorecard 03 — 2026-09-21

Four critics, each in its own context on Fable, each given only the screens, the
rubric and its own dimensions. No critic saw another's output. Run after the
door build, the drill rebuild, the Figma meter alignment and the two roleplay
walkthroughs.

## Weighted total: **5.5 / 10**

| Dimension | Weight | Score | Weighted |
| --- | --- | --- | --- |
| System fidelity | High (3) | 7 | 21 |
| Coherence | High (3) | 5 | 15 |
| Craft | High (3) | 5 | 15 |
| UX judgment | High (3) | 5 | 15 |
| Accessibility | Medium (2) | 5 | 10 |
| Structure | Low (1) | 7 | 7 |
| **Total** | **15** | | **83 → 5.5** |

**Ambition: 7/10, reported separately and excluded from the total**, per its own
definition. It is the only dimension that went up against a build this flawed,
because it grades reach rather than correctness.

The shape of this is worth naming: the two dimensions about whether the thing is
*built right* score 7, and the three about whether it is *designed right* score
5. The tokens hold, the layout holds, and the judgment underneath is thinner
than either.

---

## Hard gates — 3 of 4 FAIL

Pass/fail, not tradeable against the scores above. **A failed gate is a failed
submission.** All four verified by me directly, not taken from the critics.

| Gate | Result | Evidence |
| --- | --- | --- |
| Contrast 4.5:1 body text | **FAIL** | `SessionFraction` measured from rendered pixels: **3.15:1** on `/session/idle/4` and `/drill/pass/3`, white 12px on the filled bar rgb(145,120,230). |
| Touch targets 44pt | **FAIL** | The Coral "Try again" chip is a `<button>` at **92×32** on `/session/captured/1`, `/session/unclear/1`, `/drill/captured`. |
| No raw hex in source | **PASS** | `npm run check:tokens` clean; every `var(--…)` in `src` resolves. |
| No two states that should differ rendering identically | **FAIL** | Four pairs hash-identical (below). |

### The contrast failure is conditional, which is why it survived

I measured it twice and got two different answers. On `/session/idle/1` the
fraction sits over the *unfilled* track at **13.95:1** and passes. On
`/session/idle/4`, where the bar is full, the same label sits over purple at
**3.15:1** and fails. A check that samples one screen clears it; the rubric's
instruction to "measure the rendered pixels" is what catches it. My first
measurement made exactly that mistake and I corrected it.

Root cause is mine: making `SessionFraction` `position: absolute` to overlay the
ring put white text on a background that changes colour as the session
progresses. The label gets less readable the further in you get.

### The identical-states gate

The 59-state render pass found **no collisions**, and I reported that as a clean
result. It was the wrong test. The states that collide are the ones distinguished
by a *query parameter*, which that pass never varied:

| Pair | Result |
| --- | --- |
| `/session/pass/1?sure=1` vs `?sure=0` | **identical** |
| `/session/miss/1?sure=1` vs `?sure=0` | **identical** |
| `/session/miss/1?attempt=1` vs `?attempt=2` | **identical** |
| `/session/unclear/1?attempt=1` vs `?attempt=2` | **identical** |

And the near-miss from the pixel pass: `/session/pass/1` unaided vs hinted differ
by **0.08%** — a 43×15px region holding `+10` against `+7`. Both say *"Nailed it
— that's the whole definition."*

This is the rubric's own warning about this gate, landing exactly as written: it
is "the one most often passed by assertion", and two states differing in a prop
that maps to the same rendered output is a failure even when the code plainly
distinguishes them.

---

## The three findings that matter most

### 1. The confidence tap costs nothing — and it is load-bearing

`/session/processing` asks "How sure are you?", **blocks the verdict on the
answer**, and then discards it. `sure=1` and `sure=0` produce identical screens
and identical XP (+10/+10 on pass, +7/+7 on miss).

The Design Brief's own test is *"overconfidence has to cost something"*. It
doesn't. The screen asks the student for something it has not earned and spends
a tap on it. This is the single clearest gap between what the prototype claims
and what it does.

### 2. The requeue replays the session instead of ending it

Verified by driving it: `/session/lock-in` → Start speaking →
`/session/recording/1?attempt=2&requeued=1` → `/session/captured/1?ms=3326&attempt=2`.

**The `requeued=1` flag is dropped at `captured`.** Every post-requeue outcome
then routes through `nextAfter(index)` to term+1, so the session runs again from
term 2. The rubric's 9-anchor for UX judgment is "the loop terminates"; on this
path it does not.

The Skip path *does* terminate correctly (`/session/lock-in/second`) — I checked,
because the critic's summary implied both were broken and only one is.

### 3. The mic moves under the finger

`/session/idle/1` mic at y=414; tapping it lands on `/session/recording/1` with
the mic at y=323 — **a 91px jump on the tap that starts recording**. The drill
does the same (544 → 411). The mic also sits at three different heights across
idle, drill and the screens where it was pushed into `bottomContent`.

---

## Scored, with what each critic verified

**System fidelity 7** — 13 computed-style checks resolved to expected token
values; `check:tokens` clean; `npm run tokens` produced no diff. Held off higher
because the library is bypassed: `ButtonGroup` exists and is never used while
three screens hand-roll a stacked pair with a contradicting 8px gap; `AppBar`
rebuilds `ButtonIcon`/`Button` inline; literal `ease-in-out`/`ease-out`/`linear`
survive against an existing `motion.semantic.easing.standard`.

**Structure 7** — all 52 routes render at 390×844, ×640 and ×1000; no console
errors, no horizontal overflow, document never scrolls. Held off higher because
four screens overflow their content region at the frame's own height with only a
half row as the affordance (`/session/exit` 736>626, `/drill/complete` 700>626,
`/picker` 725>706, `/session/miss/1` 522>514).

**Craft 5** — measured geometry shows the mic, mascot and action zone landing in
different places screen to screen. The full strength meter is **1.03:1** against
its track — invisible at 100% while 25% is the brightest. See "Open decisions".

**Coherence 5** — "Try again" means four different things (a Coral status chip, a
retry-this-term Primary, a restart-session Primary, a restart-drill Tertiary).
`/session/recap` and `/drill/complete` invert the same two buttons: Try
again/Done as Primary/Secondary on one, Done/Try again as Primary/Tertiary on the
other, two screens apart in one session.

**UX judgment 5** — the three findings above, plus: the denied-mic "sticky" state
decided in `voice-ux.md` §3 is not delivered (it survives one turn then returns
the student to a mic screen); the hint ladder is flat and unbounded, offering
"Try again" through attempt 10 with byte-identical text.

**Accessibility 5** — two gate failures, plus a live region re-announcing the
ticking timer every second on the recording screens, and three `.blink`
animations still running under `prefers-reduced-motion: reduce` on
`/session/processing`.

---

## Not reproduced

I checked the severe claims rather than passing them through.

- **`/door/quiz/result` Back does nothing** — it navigates to `/door/quiz`.
  Not reproduced.
- **`SessionFraction` fails contrast on "all loop screens"** — it fails on the
  screens where the bar is filled, and passes at 13.95:1 where it is not. The
  failure is real; the scope was overstated.
- Two findings in an earlier walkthrough (a dead Recap "Done", an undercounting
  Recap) were **contamination**: the dev server was recompiling mid-run while I
  was editing. My dispatch fault, not defects.

## Corrections to my own earlier claims

- I said "fullWidth removed inside actionRow". It was removed only where the prop
  sat on its own line; idle's Skip had it inline and kept it. Fixed since.
- I said "mascot centred on every screen that has one". I measured 21 screens and
  `/session/captured/1` was not among them; it was at x=76. Fixed since.
- I reported the identical-states gate as passing off a 59-state render. That
  pass never varied query parameters, which is where every collision is.
- The `MicButton` Paused story I wrote as evidence for that gate has **never
  run**: `play: async ({ canvas, expect })` throws `TypeError: expect is not a
  function` in this Storybook. The sibling story imports `expect` from
  `storybook/test`; mine destructures it from a context that does not provide it.

## Open decisions — yours, not defects

- **The strength meter at 1.03:1.** Aligning to the Figma render was your
  explicit call, and Figma's ramp darkens as it fills, so a full meter is its
  least visible state. The critic measures that against the rubric and calls it a
  failure. Both are true. Options: keep Figma's hues but reverse the band order,
  or darken the track.
- **`TextBlock variant="L"` at 44px.** The component is faithful to its Figma set
  (9003:9039), which really does have sizes that large. The frames simply do not
  use `textBlock` for screen titles — Quiz complete draws a loose Headline S node
  at 21px. So the call sites are the question, not the component.
- **Promoting `resultCard`.** Three consumers, past the repo's own two-consumer
  bar. I deferred because promoting means adding a neutral state to
  `RecallResult` and Figma's rate limit blocked re-reading it. That was a
  judgement call, not a constraint.
