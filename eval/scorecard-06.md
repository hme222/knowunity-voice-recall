# Scorecard 06 — 2026-09-23

Four critics, each in its own context, each given only the rubric, the route list
and its own two dimensions. No critic saw another's output, and all four were
blocked from reading scorecards 01–05, so this is a fresh read rather than a
re-grade. Two student roleplays ran alongside and are reported separately below:
they answer a different question from the rubric and are not averaged into it.

## Weighted total: **5.5 / 10** — down from 5.9

| Dimension | Weight | 03 | 04 | 05 | 06 | Weighted |
| --- | --- | --- | --- | --- | --- | --- |
| System fidelity | High (3) | 7 | 7 | 7 | 7 | 21 |
| Coherence | High (3) | 5 | 5 | 5 | **4** | 12 |
| Craft | High (3) | 5 | 6 | 5 | **6** | 18 |
| UX judgment | High (3) | 5 | 7 | 6 | **4** | 12 |
| Accessibility | Medium (2) | 5 | 7 | 6 | 6 | 12 |
| Structure | Low (1) | 7 | 8 | 7 | **8** | 8 |
| **Total** | **15** | 5.5 | 6.5 | 5.9 | **5.5** | **83 → 5.5** |

**Ambition: 6/10, unchanged**, reported separately and excluded.

## Read the drop before you read the number

Two dimensions rose and two fell. Almost the whole decline is UX judgment going
6 → 4, and the single largest input to that is `XP.sureWrong = 0`.

**That is a decision, not a regression.** The designer overruled the brief on it
this morning, on the record, with the reasoning kept in `session.ts` and
`sprint-context.md`: a student who was confident and wrong has already had the
worse experience of the two, and charging them punishes honesty about belief
rather than the belief itself. The critic graded it against the brief's mandate
— "overconfidence has to cost something… or the screen is just flattery" — and
by that measure it is the failure that caps the dimension. Both are right. A
scorecard that averages this into one number without saying so is useless.

What the critic found *inside* that decision is the part nobody chose, and it is
worth separating out:

- **A confidently-wrong term gets no cost AND no flag.** The "You were sure about
  this one" note on Recap is gated to `bucket === 'Worth revisiting'`
  (`recap/page.tsx:177`). A term the student was sure about, got wrong, and then
  reached via a hint or a reveal is indistinguishable in the UI from one they
  were unsure about. Removing the penalty was the call; erasing the signal was
  not. This is fixable without charging anyone.
- **"Sure" now strictly dominates.** `session.ts` already records this as a known
  consequence and already names the right fix: flatten `sureRight` and
  `unsureRight` to one value so the tap stays informational, rather than
  reintroducing a penalty. Still a designer's call.

## Hard gates — 4 of 4 PASS

Measured by the critics who own them, not inherited.

| Gate | Result | Evidence |
| --- | --- | --- |
| Contrast 4.5:1 | **PASS** | 6.45–17.77:1, composited through the real ancestor chain rather than read off token swatches. |
| Touch targets 44pt | **PASS** | Measured via `boundingBox()`, not visible pill size. Smallest 48×48. |
| No raw hex / unresolved vars | **PASS** | `check:tokens`, `check:vars` (414 resolved), `npm run tokens` no diff — all run, not read. |
| Renders without error | **PASS** | 43 routes × 2 viewports (844 and 667), all HTTP 200, zero page or console errors. |

## Findings I verified myself before recording them

Ordered by severity. Everything here I confirmed in the tree or the browser
after the agents finished; the two I could not confirm are marked.

### 1. The requeue forgets which term it is requeuing

`src/app/session/lock-in/page.tsx:38-45`. A self-erasing lookup:

```
mount   missed = outcome where bucket 'Worth revisiting' && !requeued   → term 3
effect  markRequeued(3)  → write() → listeners → useSession() re-renders
render  !o.requeued now fails → missed is undefined
        term = TERMS.find(...) ?? TERMS[0]                              → term 1
```

So 06 marks the missed term as requeued and immediately forgets which it was,
re-asking term 1. The student is re-tested on something they already passed
while the term they actually missed is silently closed. `session.ts:766-771`
warns about this exact failure for 06b and exists to solve it — "a bucket search
finds nothing and falls back to term 1" — and `requeuedOutcome()` is the answer.
06 never adopted it. Fix: `missed ?? requeuedOutcome(state)`.

Found by the ambition critic, outside its own remit, and confirmed here.

### 2. Paused seconds are scored as speech

`src/app/session/recording/[term]/page.tsx:43-63`. `startedAt` is set on mount
and `took = Date.now() - startedAt.current` on Done. `paused` stops the *display*
interval only. So wall-clock time spent paused counts toward the verdict, and the
visible timer and the scored duration disagree — measured at 0:12 on screen
against `ms=31690` logged. A student who pauses to think is graded as though they
had been talking. The timer is the thing they trust, and it is the thing that is
wrong.

### 3. The text route collapses on the three screens that most need it

`session/blank/[term]`, `session/reveal/[term]` and `session/lock-in` contain no
reference to `/text/turn` — confirmed by grep, zero hits in all three. They are
mic-only. In a denied-mic session that is a hard dead end: `/text/turn?sticky=1`
→ "I don't know this one" → `/session/blank/2`, which offers only a mic. The flow
that opens with "No mic, no problem — you keep the full XP" ends with no way
forward, and a student who has just said they are stuck has the one option they
would have taken removed.

### 4. The app shows LISTENING on a microphone it was denied

Reached by clicking: deny at `/permission/prompt` → "Type this session" →
`/text/turn?sticky=1` → "I don't know this one" → `/session/blank/2` → mic →
`/session/recording/2` renders "LISTENING" with a running timer. A consequence of
finding 3 — `blank` does not carry the sticky state — but it earns its own line,
because claiming to record someone who refused permission is the worst version of
this bug rather than an inconvenience.

### 5. The Recap's primary action swaps sides

`recap/page.tsx:89-98`. `rough ? 'Run it again' : 'Done'` on the Primary and the
inverse on the Secondary, so the white pill stays on the left and changes meaning
with the run. Tapping by position gets the opposite action depending on how you
did. Both roleplays hit this independently. This one is mine, from the
action-row restructure.

### 6. The drill's echo step is a mic that records nothing

`src/app/drill/miss/echo/page.tsx:55` — the MicButton's handler is
`router.push('/drill/pass/3')`. Every other voice screen routes to a recording
screen first. This one routes straight to the result, so the rung where the
scaffold asks the student to say the word out loud with Knowie completes without
anyone saying anything.

### 7. The token file contradicts itself about the StrengthMeter

Both descriptions are dated 2026-09-21 and both say "on the designer's call", and
they describe opposite outcomes. The group `$description` says it "DARKENS as it
fills. Reverted to Figma"; `fill.low` says "REVERSED… a fuller meter is now a
more present one". Two critics independently measured `rgb(59,109,17)` at 25% to
`rgb(192,221,151)` at 100%, so `fill.low` is the true account and the group
description preserves the decision that was overturned as though it shipped.
`StrengthMeter.module.css` repeats the wrong half. No value changes; the record
does. This is the source of truth every other file defers to.

### 8. The blank-term state has no distinct behaviour

`docs/voice-ux.md` marks it Must and specifies "one encouraged attempt, then
reveal". Its mic pushes into the ordinary recording pipeline with no marker, and
a mid-length take lands on the standard miss hint-ladder — "Try again", "One more
go, then I'll show you the answer". A student who has just said "I don't know
this at all" is offered a retry as if they had nearly had it. It also collides
with the scripted mishear: a clean 5.3s answer through `/session/blank/1` lands on
"That one didn't come through", on the screen that promises "nothing here is
scored against you".

### 9. The Recap overflow fade lands on a section header

Measured on a real 4-term session: `scrollHeight 776` against `clientHeight 570`,
`data-overflowing="true"`, mask applied — but it falls on the "Hinted · 1" label,
so the header fades to nothing and the row beneath it is invisible with no trace.
The shell's own comment says this composition exists to stop exactly this: "a cut
row reads as 'more below'… a half-row is not an affordance." A faded bare header
is a weaker cue than the half-row it replaced.

### 10. `/permission/prompt` leaks focus

`role="dialog" aria-modal="true"`, but focus starts on `<body>` and the sibling
content is not `aria-hidden` or `inert`. `BottomSheet` got a focus trap earlier
today; this dialog is not one, so it did not.

### 11. The vocabulary problem — one root, several symptoms

Both roleplays arrived at this independently and it is the strongest
non-mechanical finding in the batch. The app measures *first attempt without
help* and names it **score** and **unaided**:

- "SCORE 25%" and "SCORE 50%" on sessions where the student ended up right on
  every term, rendered as a stat tile beside XP and Time.
- `/session/blank` promises "nothing here is scored against you"; the Recap shows
  a score.
- "Said back unaided" after a reveal the student read off the screen ten seconds
  earlier, and "You said all of it unaided" after the drill handed them the
  missing word.
- The Recap orders worst-first, so the deficit is above the fold and the wins are
  behind the fixed button bar.

Marcus: *"the app is flattering itself rather than describing me."* Aisha: *"praise
I know I didn't earn is worse than no praise."* Opposite students, same objection.

### 12. The grading contract does not match the prompts

Term 2 asks "say what the cell membrane **does**", and marks against what it is
made of. Term 4's hint restates what the student's own quoted transcript already
said. Both `missTitle` strings are mine, rewritten this morning to stop
contradicting the transcript; they now contradict the prompt instead. Marcus
named the cost precisely: *"the moment the verdict card contradicts the quote
printed underneath it, the student stops trusting the echo and starts blaming the
mic"* — which is the failure mode this design exists to prevent.

### Not yet confirmed by me

- **A first-click race.** 2 of 3 clean runs swallowed the first tap on Skip at
  `/session/idle/1`. The critic explicitly declined to score it without a
  production build, which is the right call — needs `next build && next start`
  before it counts.
- **"Practice what I missed" drilling the wrong term**, the practice rows reading
  as dead controls, a typed answer being cleared by the exit sheet, the drill
  reporting two different missed words, and XP never reaching home. All reported
  by both roleplays or by one with steps; none verified by me yet.

## False positives I caught

Recording these because the batch is only useful if its errors are visible too.

- **"Rebind the partial verdict chip to green."** The gold is frame-sourced and
  deliberate — `feedback.partial.bold` carries its own rationale: frame 05 Miss +
  Hint binds that chip to `#F5B53D`, and it was already corrected once from an
  invented magenta. The critic's underlying observation stands: that hue now
  serves the PRO badge, due urgency and a recall verdict with no shape
  differentiator. But the fix would walk away from the frame to satisfy a passage
  in `design-system.md` that the token supersedes. **The real defect is that
  passage**, which still claims the verdict is green.
- **"The exit reasons have no accessible state."** They do. `OptionRow` sets
  `role="radio"` and `aria-checked` when `inGroup`, and the exit screen passes it.
  The UX critic checked this and found it correct; the roleplay missed it.
- **"A clipped Knowie badge on every screen."** That is the Next.js dev
  indicator, not our UI. No badge component exists in source.

## What held

Verified, not assumed: the mic at `top:466` on every voice screen and the action
zone at `674` on all 46 routes; scaffold region heights matching their
`component.scaffold.*` tokens to the pixel across four different flows; the pulse
rings at 141/169/202px, confirming a previously claimed fix; the StrengthMeter
brightening monotonically as it fills, which is the rubric's own named historical
defect for this project; Paused and Listening differing in paint and not only in
aria; zero animations under `prefers-reduced-motion` with the text status still
carrying state; `ConfidenceAsk` genuinely blocking the verdict; every voice screen
having a working non-mic exit; the denied-mic path keeping full XP; and the Chips
double-announce confirmed absent.

## The honest read

The number went down and the build got better. Those are both true and the
scorecard should not smooth them together.

What actually changed: two roleplays clicked through the product for the first
time since the flow was finished, and they found a class of defect the static
critics had not — state that does not survive a route change. The requeue
forgetting its term, paused time scoring as speech, the sticky flag not reaching
`blank`, the text route collapsing exactly where a nervous student reaches for
it. Every one of those typechecks, lints, renders and passes every gate. They
only appear when someone walks the flow as a person rather than auditing it as a
tree.

The pattern under them is the same one scorecard-05 named and it has not been
fixed, only relocated: **state is verified where it is written and not where it
is read.** Last time that was one screen family and not the other. This time it
is one route and not the next one along.

The vocabulary finding is the one I would act on first, and it is the cheapest.
Both students — built to be opposites, and disagreeing about almost everything
else — objected to the same three words. "Score", "unaided" and a worst-first
Recap are doing more damage to the brief's central claim than any of the
mechanical bugs above, and none of them requires a new component.
