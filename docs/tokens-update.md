# tokens.json — changes needed

Companion to the design system update. Every entry below was driven by
something that actually happened in the file this sprint, not by
tidying for its own sake. Each one says what consumes it, because the
existing file's own convention is that a token without a confirmed
consumer is a liability.

There are **three additions, one correction, and two confirmations**.
Nothing here removes an existing token.

---

## 1. ADD — `color.semantic.background.raised`

**The problem this solves.** `background.surface` is used for both a
bottom sheet *and* the rows inside it. They resolve to the same value,
so the rows render invisibly against their own container. This was
found when `01b`'s hand-built option rows were replaced with real
`optionRow` instances: the custom frames had been carrying a raw fill
that the component doesn't have.

The stopgap currently on those rows is a raw white 6% overlay. That is
exactly the kind of unbound value this file has been burned by before
(see `statChip`, which looked correct for a whole pass while being
bound to nothing).

**Proposed entry**, to sit in `color.semantic.background` directly
after `surface`:

```json
"raised": {
  "$type": "color",
  "$value": "{color.primitive.alpha.light-06}",
  "$description": "A surface sitting on top of another surface. Use when a card or row needs to separate from a container that is itself background.surface — the confirmed case is an optionRow inside a bottomSheet, where both would otherwise resolve to the same value and the row would vanish. Translucent on purpose so it composites correctly over any surface beneath it. Not a replacement for background.surface; only reach for it when there is a genuine second layer."
}
```

**This needs a primitive to reference.** If
`color.primitive.alpha.light-06` doesn't exist, add it alongside the
existing `alpha.dark-50` and `alpha.glass-60`:

```json
"light-06": {
  "$type": "color",
  "$value": "#FFFFFF0F",
  "$description": "Raw value, not for direct use. 6% white, for a raised surface composited over a darker one."
}
```

**Confirmed consumer:** `optionRow` instances inside `bottomSheet` on
screen `01b`. Currently eight of them, carrying the raw value that
this token replaces.

---

## 2. ADD — `color.semantic.feedback.warning.border`

**The problem this solves.** The plan-active home's Say It Back chip
(`swipeChip`) uses an amber **border** to signal a nearing deadline.
There is no token for that job. It is currently bound to
`feedback.warning.bold`, which is a *fill* token being used as a
stroke. That works visually and it is at least bound, but the naming
now lies about what it does, and the two will need to diverge the
moment a bordered and a filled warning element appear on the same
screen.

**Proposed entry**, inside the existing `feedback.warning` group:

```json
"border": {
  "$type": "color",
  "$value": "{color.primitive.gold.400}",
  "$description": "Outline for a due-or-caution element that is bordered rather than filled. Confirmed consumer: swipeChip on the plan-active home, where an amber border signals an approaching deadline without the weight of a solid fill. Currently the same value as feedback.warning.bold by design; split so a bordered treatment can move independently of a filled one."
}
```

**Confirmed consumers:** `swipeChip` (border), `swipeDots` (the active
dot, which deliberately matches the chip's border rather than a fill).

**Note on the parallel gap:** `feedback.success`, `error` and
`unclear` have no `border` entry either. Don't add them speculatively
— this file's own rule is that a token without a confirmed consumer is
upkeep with no payoff. Add them when something actually needs them.

---

## 3. ADD — `motion.semantic.duration.swipe`

**The problem this solves.** The due-signal chip is swipeable and
nothing in the motion tokens covers a card transition. The existing
three (`fast` 150ms, `standard` 250ms, `ambient` 1100ms looping) are
for micro-feedback, state changes, and the mic pulse respectively. A
swipe between cards is a different beat: it tracks the finger, then
settles.

**Proposed entry**, in `motion.semantic.duration`:

```json
"swipe": {
  "$type": "number",
  "$value": "{motion.primitive.duration.300}",
  "$description": "Card-to-card transition when the student swipes between due quizzes on the plan-active home. Longer than standard because the card travels a full screen-width and the count badge and dots update with it; the motion has to read as one continuous movement, not a state flip."
}
```

Requires a primitive if `300` doesn't exist:

```json
"300": {
  "$type": "number",
  "$value": 300,
  "$description": "300ms. Swipe-to-settle for a card carousel."
}
```

**Honest caveat:** 300ms is a considered starting point matched to
common iOS carousel timing, **not** a value verified against a real
reference or a prototype. It should be marked unconfirmed the same way
the `+10` XP value is, and tuned once the swipe is prototyped.

---

## 4. CORRECT — `component.micButton.listening`'s description

The current description reads:

> "Listening mic circle fill; the pulsing ring on top is additive
> motion, not load-bearing, so it still reads with reduced motion on."

That reasoning is sound and should stay. But the rings turned out to
have a failure mode the description doesn't anticipate: on
`02 Recording` all three rings were present, positioned, visible and
at full opacity — and invisible on canvas, because they sat below the
screen in z-order and the screen painted over them.

**Suggested amended description:**

> "Listening mic circle fill; the pulsing ring on top is additive
> motion, not load-bearing, so it still reads with reduced motion on.
> Implementation note: the rings are loose siblings of the recording
> screen, not children of it, so they must sit above it in z-order as
> well as being positioned on it. They have been silently buried by
> the screen once already."

No value change. Description only.

---

## 5. CONFIRM — `feedback.warning.bold` has more consumers now

The current description names one confirmed consumer: the "Hint used"
indicator on a recall result. It now has three more, all in the same
due-or-caution family the token was written for:

- the amber icon badge on `dueSignalCard`
- the count badge on `swipeChip` (via `warning.subtle` / `onSubtle`)
- the active dot on `swipeDots`

Worth appending to the description so the next person doesn't read it
as a single-use token.

---

## 6. CONFIRM — no new type or radius tokens are needed

The consistency audit found 18 font sizes and 12 corner radii across
the flow. That sounds like a token gap and isn't. Once app-shell
chrome is excluded, our UI resolves to:

**Type:** 21 / 17 / 15 / 13 / 11, plus three deliberate one-offs (32
home greeting, 18 composer chip, 28 echoed word).

**Radius:** 12 cards and rows, 99 pills, 24 sheets, 16 the coach-mark
card.

All five type steps and all four radii already map onto existing
primitives. The drift was screens not using the scale, not the scale
being incomplete. Five type drifts and two radius drifts were
corrected in the file directly. **No token change required** — this
entry exists so the audit result is on the record rather than being
re-run from scratch next time.

---

## Summary

| Change | Token | Driven by |
|---|---|---|
| ADD | `background.raised` (+ `alpha.light-06`) | `optionRow` invisible inside `bottomSheet` |
| ADD | `feedback.warning.border` | `swipeChip`'s amber due-border |
| ADD | `motion.duration.swipe` (+ primitive `300`) | swipeable due-quiz carousel |
| CORRECT | `component.micButton.listening` description | rings buried by z-order |
| CONFIRM | `feedback.warning.bold` description | three new consumers |
| CONFIRM | no type/radius additions needed | full consistency audit |

**Two of the three additions have confirmed consumers already built.**
`motion.duration.swipe` is the exception: its value is a considered
guess and should be tuned against a real prototype before anyone
treats it as settled.
