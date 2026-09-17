# Design System Rules — Voice Active Recall

Companion to `tokens.json`. That file has values. This file has rules.
Nowhere in here is a hex code, a pixel number, or a duration — if you
need one, go to `tokens.json` and reference the token path, don't copy
the value out.

**Source-of-truth order, when this doc and the actual file disagree:**
1. **Live usage in Example Screens** wins first. If a real, non-detached
   instance on that page does something differently than this doc
   describes, the doc is wrong, not the example. This has happened
   more than once, `Chat Input`, the `bottomSheet` component, and the
   `arrow-right` icon precedent were all found by checking Examples
   directly, not by reading a prior version of this file.
2. **The locally-defined components themselves** (on `"🎨 Mascot &
   components"` and `"Components"`) come next. A component's actual
   current bindings, variants, and structure outrank a stale
   description of it here.
3. **This document and `tokens.json`** come last. They're written
   summaries of 1 and 2, not the source. When they're out of sync with
   the file, that's a bug in the doc to fix, not a reason to change the
   file to match the doc.

This ordering exists because this doc has gone stale relative to the
actual file more than once already this sprint, describing components
as unbuilt after they were built, missing a real component that
existed the whole time, asserting a padding fix that turned out to be
a duplicate of already-correct content. None of that was caught by
re-reading this document, all of it was caught by checking the file
directly. Treat every claim below as a summary that needs
re-verifying against the live file for anything that actually matters,
not as ground truth on its own.

## Open questions this sprint can't route around

Seven things a senior review surfaced that aren't resolved by writing
better rules — they need a decision from someone. One below is marked
resolved, it stays in the numbered list so the reasoning that closed
it doesn't get lost. Two are new this pass, both more consequential
than anything already here: which mental model this feature actually
uses for voice input, and where this file's own components are
supposed to live going forward. Read those two first if you're
skimming.

1. **~~The mic button's states rest on tokens whose own adjacent
   tokens are marked unconfirmed.~~ Resolved, redirected.**
   `component.micButton.*` doesn't currently reference
   `highlight.surface` or its hover/pressed variants — that's still
   correct, and now has an answer instead of a caveat: the mic
   button has no "chosen" state, idle/listening/captured/disabled is
   the complete set. `highlight.surface`/`highlight.border` aren't
   unused, they're very likely meant for a component built this
   session instead: `optionRow`'s Selected state (a tapped-but-not-
   yet-verdicted multiple-choice answer). See `optionRow` under
   "Which component to reach for." Whoever gated those tokens
   should confirm that reassignment, but the mic button itself is
   settled: don't add a selected state to it.
2. **There's no verdict component, but there's a lead worth checking
   before building one.** See "What's missing" below — `snackbar` was
   corrected out of that recommendation because it was wrong, not
   because nothing exists. The "Ai Chat/Quiz" entry-point screen has a
   `thumbs-up`/`thumbs-down` + "approving" mascot pattern that's
   probably answer-quality feedback, not a recall verdict — but close
   enough that it needs eyes on it before `recallResult` gets built as
   if starting from zero.
3. **Four tokens are visually identical on purpose, except one of
   them is disabled state.** `interactive.secondary`,
   `interactive.disabled`, `background.stacking`, and
   `interactive.pressed` all resolve to the same value. That's fine
   when they never appear near each other. It's not fine if a
   permission-denied mic button (disabled) ever sits close to an
   ordinary secondary button in the same view — nothing about the
   color tells a student which is which. Flagged directly on each
   token in `tokens.json` now; still needs an actual answer for
   whichever screen puts these in proximity.
4. **Resolved 2026-09-16: the prototype uses the real brand font.**
   `fontFamily.display` and `fontFamily.default` both resolve to Greed,
   loaded as one variable file (Greed VF, `src/app/fonts/`) via
   `next/font/local` as `--font-greed`, with the page pinned to the
   Standard width (`font-stretch: 100%`; the file's own default is
   Condensed). This overrides Platform Constraints' substitution rule
   on purpose; no substitute font is wired anywhere. Never treat Greed
   as an installed system font.
5. **The scaffold component is already built for two device sizes**
   (`iPhone 13` at 390pt, and a larger `L - 17 Pro Max`), and both are
   in active use across Example Screens — this isn't hypothetical
   future-proofing, someone already built screens at the larger size.
   Platform Constraints says this feature targets 390px only.
   **Confirmed 2026-09-16: 390 only.** The `L - 17 Pro Max` size is
   out of scope for this sprint; build and check every screen at
   390.
6. **Two different, unreconciled answers now exist for how voice input
   works, and four components have already been built against only
   one of them.** A component called `Chat Input` lives on `"🎨 Mascot
   & components"`, undocumented until this pass, missed by every
   earlier audit including automated ones. Its `Recording` state
   models voice as something that happens inline in a persistent chat
   compose bar — an inline waveform swapping in for the text field, a
   small stop button beside it. Every screen in the "Say It Back"
   flow, and `micButton` itself, assumes the opposite: a full-screen
   takeover, one large dedicated control, no visible text field at
   all. `Chat Input` isn't instanced anywhere live, so it may be
   abandoned work rather than a competing spec, but nobody's confirmed
   that. This blocks more than it looks like it blocks: every
   additional screen built against the full-screen model between now
   and whenever this gets resolved is a screen that has to be redone
   if `Chat Input` turns out to be the intended pattern instead.
7. **This file's own components now live on two pages with no stated
   rule for which one gets what.** `button`, `buttonIcon`, `chips`,
   and the rest of the original library are on `"🎨 Mascot &
   components"`. `micButton`, `chatBubble`, `hintCard`, and
   `optionRow`, everything built this sprint, are on a separate page
   called `"Components"`. That split happened as a byproduct of where
   work landed mid-session, not as a stated decision — it can be made
   into one (new work here, legacy there, or whatever the actual rule
   should be), but right now it's something the next person has to
   reverse-engineer from file history instead of read.
8. **[NEW] Pause/resume during recording was built and locked in
   (long-press the mic to pause, hold again to resume, a separate
   Restart control underneath) against an explicit "Out of scope"
   note in `voice-recall-state-list.md`** ("Pause/resume into one
   take — Out of scope, brief already defers this"). This is a real
   scope decision, not an oversight, someone chose to build it anyway
   after being told the conflict directly. It needs to be recorded as
   a deliberate tradeoff in whatever tracks sprint scope, not
   discovered later as something that quietly crept in. It also
   leaves a real component question unresolved: `micButton` currently
   has four states (Idle/Listening/Captured/Disabled), none of them
   Paused. Whether pause becomes a fifth `micButton` state, or stays
   screen-level UI layered on top of Listening (an icon swap plus a
   label, no new component state), hasn't been decided, and the two
   answers have different implications for anywhere else `micButton`
   gets used.
9. **[NEW] Two real references (`IMG_7511`, `IMG_7538`) show an X in
   the top-left corner of a recall screen, not a back arrow.** Every
   screen in this file still uses a back arrow, kept for internal
   consistency rather than matching the reference. The icon lives
   inside the `appBar` component instance on every screen; changing
   it means detaching `appBar` from its component to make the edit,
   losing that screen's link back to future component updates. Not
   changed without a decision from whoever owns this file — every new
   screen built against the current pattern is one more screen that
   would need the same detach-and-fix later if the file moves to X.
10. **[NEW] `optionRow`'s label text cannot be reliably resized, cause
    unknown.** Every method that reliably resizes any other text node
    in this file — explicit fixed-width resize, font substitution,
    detaching the parent from auto-layout during the edit — failed on
    it silently, no error, the width just never actually changed. No
    bound variable on width was found. Worked around by building
    plain custom frames instead of instances of the component
    wherever multi-line copy was needed (the "What made you stop?"
    exit sheet). This means `optionRow` cannot currently be trusted
    with any answer option needing to wrap to a second line, and the
    workaround isn't wired to the component, it won't inherit a fix.
    Worth a direct look from someone with fuller Figma access.

**A note on how this document was verified, across two passes.** The
design tool's own component search stayed broken throughout (its
generic node-walking code throws on this file's `SLOT` nodes — a
real, reproducible bug, confirmed by isolating it to the exact page
and node type, not a connection issue). Running raw Plugin API code
directly, using type-scoped queries that route around that bug, got
clean reads throughout both passes. The first pass covered the local
component library page. This second pass covered the actual Example
Screens page (three sections: Dark, Entry points, Examples) and
corrected several claims the first pass got wrong by inferring from
App Inventory screenshots instead of checking real instances — the
bottom sheet claim in particular. Per explicit instruction, nothing
from the Strategy/Research page's "Say It Back — flow v1" section was
used as a source for this document, even though it was visible during
the audit; that section is exploratory work, not the canonical
reference. The "🔎 Cover" page and the rest of the Strategy page
weren't audited in depth — cover art and process documentation aren't
load-bearing for component or token accuracy.

**A third pass, after four components and one variant were actually
built.** This pass exists because the previous version of this
document had drifted from the file in a way worth naming plainly: it
described `micButton`, `chatBubble`, `hintCard`, and `optionRow` as
specified but not built, after all four had already been built. A
design-system doc that contradicts the file it documents is worse
than no doc, it's actively misleading whoever trusts it over looking
directly at Figma. This pass also surfaced `Chat Input` (see open
question 6), which no earlier pass, automated or manual, had found.

11. **[NEW] `text.tertiary` fails WCAG AA for 12px text on every dark
    surface it is bound to.** Measured 2026-09-16 with axe 4.13 across
    all 88 stories: 4.34:1 on `background.surface` (`hintCard` "Hint",
    `recallResult` CouldntHear "Try explaining"), 4.22:1 on
    `feedback.success.subtle` (`recallResult` Pass "You said"). The
    threshold is 4.5:1. The token's own description says it is not for
    text a student must read to proceed, and these are eyebrow labels
    beside the real content, so this was left as-is on purpose rather
    than promoted to `text.secondary` (which would flatten the card's
    three-tier hierarchy). The one card where it was genuinely low, Miss
    at 3.8:1, now binds its label to `feedback.error.onSubtle`, the
    token made for that surface, in Figma and code. Decide once for
    the tier, not per card: either accept the ratio for eyebrow labels
    and say so here, or lighten the tier.
12. **[NEW] `progressIndicator`'s unit label fails on the bar.**
    `interactive.onSecondary` (#F4F2FF) over `brand.bold` (#9178E6) is
    3.14:1 at 9px; it only shows once the bar backs the label (75% and
    100%), and only when `showText` is on, which Figma has off by
    default. `brand.onBold` is the token designed for text on
    `brand.bold`. Not changed because no screen turns the label on;
    fix it in Figma before one does. The bar itself now carries an
    accessible name (`label`, default "Progress") and "N of total" as
    its value text, which axe had flagged on every story that
    contained one.

---

## The scaffold

`scaffold` is a real, published component — but it lives in an
external team library this file consumes, not on the local "🎨
Mascot & components" page. That means its full variant catalog isn't
fully inspectable from here; what follows is verified from instances
actually in use across Example Screens, not the library file itself.

Verified structure, from real instances:

- **Two size variants confirmed in active use**: `iPhone 13` (390pt —
  matches Platform Constraints) and `L - 17 Pro Max` (larger). Most
  example screens use iPhone 13. A few use the larger size. Platform
  Constraints states this feature targets 390px only — worth
  confirming on purpose whether the larger size is in scope too,
  since it's clearly not hypothetical, it's already built and used
  elsewhere in this file.
- **Three boolean toggles**: `showTopNavSlot`, `showBottomNavSlot`,
  `showBottomSheetBackground`. These control visibility, they don't
  remove the underlying slot.
- **Four named content slots**: `topNavigation` (holds an `appBar`
  instance), `middleContent` (the scrollable body), `bottomContent`
  (holds either a bottom input bar or the tab navbar, depending on
  screen), and `bottomSheetOnly` (empty in every instance checked so
  far except one — see below).
- **A bottom sheet is a scaffold capability, not a separate
  component.** Flip `showBottomSheetBackground` to true and populate
  `bottomSheetOnly`. Exactly one screen in the "Dark" section of
  Example Screens does this. This corrects an earlier version of this
  doc, which listed "no bottom sheet component" as a gap — that was
  wrong. It's not missing, it's a mode of the scaffold.
- **The bottom tab bar (`Navigation Button` × 4 + `Avatar`) and
  `Status Bar` are also external-library components**, assembled
  inside the scaffold's `bottomContent` and header regions
  respectively. Same caveat as scaffold itself: verified as present
  and in use, not fully auditable for every variant from here.

Every screen builds inside the scaffold by using it, with its real
slots and toggles, not by re-deriving header/content/footer regions
from the Platform Constraints doc's plain-English description of safe
areas. That description is still correct about intent (respect the
status bar and home indicator), it just undersells how much structure
already exists to do it with.

---

## Which component to reach for

Two tiers exist. **Locally defined** in this file, split across two
pages (see open question 7, that split isn't a settled decision) —
`appBar`, `button`, `buttonIcon`, `buttonGroup`, `chips`, `mascotSlot`,
`progressIndicator`, `snackbar`, `textBlock` on "🎨 Mascot &
components"; `micButton`, `chatBubble`, `hintCard`, `optionRow` on
"Components".
(`iconSlot` also exists but its own variants are named "Size
(IGNORE)=400" etc. — that's the component author telling you not to
use it directly; it's scaffolding for other components, not a
component itself.) **Consumed from an external library** — `scaffold`,
`Status Bar`, `Navigation Button`, `Avatar`. Both tiers are real,
reach-for components; the difference is only that this file's own
naming/never-invent rules can be fully audited against the first tier,
not the second, since the second lives somewhere this file doesn't
own.

- **Any screen** → build it inside `scaffold`, using its real slots
  and toggles (`topNavigation`, `middleContent`, `bottomContent`,
  `bottomSheetOnly`; `showTopNavSlot`, `showBottomNavSlot`,
  `showBottomSheetBackground`). See "The scaffold" above.
- **Any screen header** (back/X on the left, a title or progress
  indicator centered, an XP counter or "Skip" on the right) → `appBar`
  inside the scaffold's `topNavigation` slot. It already has variants
  for left-icon-only, left+right icon, left+right button,
  left+two-right-icons, and left+two-right-buttons.
- **Any tappable text action** → `button`, in Primary / Secondary /
  Tertiary, at S / M / L, with Default / Pressed / Disabled / Loading
  states already built. **Icon-only version** → `buttonIcon`, same
  variant structure. **Two or more buttons that need to lay out
  together** → `buttonGroup` (Vertical/Horizontal, M/L) instead of
  manually spacing individual button instances.
- **Compact, low-commitment selectable options** (tags, short choices)
  → `chips`, in XXS through M, Primary or "pro" color, active
  true/false.
- **The student needs a way out of something** (can't talk right now,
  permission denied, mid-session exit) → the scaffold's sheet mode:
  `showBottomSheetBackground` on, content placed in `bottomSheetOnly`.
  Confirmed in real use on one Example Screens instance. Not a
  separate sheet component to build or search for.
- **Circular or ring progress** → `progressIndicator`, Primary or
  Coral, thickness 16 or 24. Its progress values are discrete steps —
  0/25/50/75/100 — not a continuous range. If a recall session needs
  to show progress at a value that doesn't land on one of those steps,
  that's a real decision someone needs to make (round to nearest, or
  ask design-system to add a step), not something to eyeball in Figma.
- **A transient, peripheral status message** ("saved," "connection
  lost") → `snackbar`, Default / Success / Error. **Not** the recall
  verdict. The verdict is the payoff moment of the entire feature —
  it needs to hold attention, not announce itself quietly at the
  screen edge the way a snackbar is built to. Reaching for `snackbar`
  here because it's the closest existing thing is exactly the
  "search-harder problem" this system is supposed to avoid creating —
  it isn't one; see "What's missing."
- **Any body or heading text that follows the type scale** →
  `textBlock` (XL/L/M/S) instead of a raw text node with manual
  styling. Below that scale, `captionSBold`/`captionSRegular` in
  `tokens.json` sit at 9px, under Platform Constraints' stated 11px
  caption minimum — fine for decorative or redundant labels, not for
  anything a student needs to actually read.
- **Character or mascot artwork sizing** → `mascotSlot`
  (XL/2XL/3XL/4XL). It wraps an expression-state sub-component
  (`excited`, `standby`, `approving` confirmed in use) — check for an
  existing expression before assuming a new mascot mood needs to be
  invented too.
- **The student needs to record an answer** → `micButton` (on the
  `Components` page), states Idle/Listening/Captured/Disabled. Real,
  built, fully bound. Not finished: the icon inside it is still the
  generic placeholder that's in every fresh `iconSlot` by default, not
  a mic glyph — that swap needs a person in Figma's UI, it couldn't be
  done from here. Not used in any screen yet either.
- **Knowie's spoken-back response, as text** → `chatBubble` (on
  `Components`), `showTitle` on only when it opens a new question, off
  for a follow-up reply. Built. Not used in any screen yet.
- **A passive, one-directional nudge after a miss** → `hintCard` (on
  `Components`). Built, label reads "Hint" in sentence case on the
  component itself. The live screens still hand-build this pattern
  with the label in full caps — that's the old version, not this one,
  and the correction hasn't propagated to anything real yet.
- **Revealing something layered over another surface** (a transcript,
  anything with the same shape) → `buttonIcon`, `variant=Overlay`,
  size S. Not a new component, a new value on the existing one. Only
  the S/Default cell of that variant exists — the rest of the grid
  (M, L, Pressed, Disabled, Loading) that every other variant fills
  doesn't exist for Overlay yet, don't assume it does.
- **A single selectable row in a multiple-choice answer list** →
  `optionRow` (on `Components`), one `state` property:
  Default/Selected/Correct/Incorrect. Built, with two disclosed gaps:
  state is carried entirely by fill and text color, no shape or icon
  signal, and the one `state` axis can't represent "this was the
  correct answer, but the student picked something else," since
  Selected and Correct are two values of the same property rather than
  independent. Left/right padding is bound to a real token
  (`cardPadding`) as a placeholder, not because that's the resolved
  answer to whether the original 20px was intentional.

**Before adding anything not on this list:** search the file first —
that's still the rule, and it now covers two tiers instead of one.
Between the locally-defined set and the external-library set, most of
what a recall session needs already exists. A genuine gap is
specifically one that's absent from *both* tiers, not just the one
that happens to be easiest to search.

## What's missing

This is exactly the kind of thing the "never invent a component" rule
exists for, so naming it plainly rather than working around it
quietly:

- ~~No mic button component.~~ **Built this session as `micButton`.**
  See "Which component to reach for." What's still actually missing
  isn't the component, it's a real mic icon in place of the
  placeholder, and any screen using it at all.
- **No bottom sheet component.** The exit-confirmation and
  permission-denied patterns visible across the App Inventory
  screenshots may be repeated, hand-built frames rather than instances
  of a shared component. Worth checking directly in Figma whether
  those screens actually share one sheet component (in which case my
  search just isn't finding it — possible, given the tool issues
  above) or whether each one was built separately, which would be a
  duplication problem independent of this feature.
- **No dedicated result/verdict component** for "correct / partial /
  incorrect / couldn't hear" — this is still the highest-priority gap,
  but check before building anything: the "Ai Chat/Quiz" entry-point
  screen in Example Screens already uses a `thumbs-up`/`thumbs-down`
  feedback pattern paired with an "approving" mascot expression state.
  That's most likely rating an AI explanation's helpfulness, not a
  recall verdict — different job — but it's close enough that whoever
  builds the actual verdict component should look at it first rather
  than starting from nothing. Proposed name if it does need to be new:
  `component.recallResult`.
- ~~No radio-option-list component~~. **Built this session as
  `optionRow`.** Ships with two disclosed, real gaps, not styling
  polish, see "Which component to reach for": state is color-only,
  and the single `state` property can't represent an unselected
  option later revealed as correct. **No text input component** is
  still accurate on its own — though see open question 6, `Chat
  Input` may already be that component, if it turns out to be live
  work rather than something abandoned.
- **Three of the fifteen example screens in "Dark" have been detached
  from the scaffold component** (type `FRAME`, not `INSTANCE`) —
  meaning they silently stopped receiving updates the moment someone
  detached them. One of the three is the single screen most relevant
  to this entire feature: a recall-style question prompt ("According
  to Newton's third law of motion, what happens when one object
  exerts a force on a second object?"). That's worth a direct look in
  Figma — if it was detached to make a one-off edit, whatever that
  edit was needs to either become a real scaffold-based screen again,
  or get understood as a deliberate deviation before it's used as a
  reference for anything.
- **No fourth feedback verdict for a due-but-not-yet-attempted state.**
  Surfaced from exploratory work, not from Example Screens, so treat
  this one as reported, not confirmed the way `feedback.unclear` was.
  `color.primitive.gold` already exists in the same four-step shape as
  coral's ramp, and three of its four steps (`400`, `900`, `950`) sat
  completely unbound; only `gold.300` was referenced anywhere, by
  `text.warning`, described as "caution text: limits, expiry notices,
  'one attempt left.'" This proposed wiring up
  `feedback.warning.{bold, onBold, subtle, onSubtle}` to
  `gold.{400, 950, 900, 300}`, the same justification already on
  record for how `feedback.unclear` claimed coral. Named
  `feedback.warning`, not `feedback.due`: keeps the existing word
  `text.warning` already uses rather than naming a specific trigger.
  **Now has a real consumer, see the Fourth pass section below** — this
  entry stays here so the reasoning for why the token was safe to add
  isn't lost once it's no longer sitting unused.
- **~~No component for a row of small stat pills (XP / Score / Time
  together).~~ Built as `statChip` this pass.** See "Built this
  session" for the real component entry. What follows here is the
  original gap reasoning, kept for context: confirmed as a real,
  existing app pattern, `IMG_7508` in the App Inventory shows exactly
  three color-coded chips (blue XP, green Score, purple Time) on the
  session-summary screen, not a plain text line. `chips` didn't fit
  this job, its whole reason to exist is compact *selectable* options
  with an `active` boolean, these three pills are read-only display,
  nothing to select.
- **[NEW] `buttonIcon`, `variant=Overlay` needs to work on every row
  of a result list, not once.** The existing gap note above already
  flags that only the S/Default cell is built. What's new here:
  confirmed the transcript-eye affordance belongs on *every* term in
  a session recap (Unaided, Hinted, Revealed, Worth Revisiting alike),
  not as a single demonstrated example. Four icon instances per recap
  screen is the real requirement, not one, worth knowing before
  someone builds this assuming a single decorative instance is
  enough.

None of these get built by default. If any of them turn out to be
real gaps once checked by hand in Figma, the move is: name what's
missing, propose a name that follows the conventions below, and let
whoever owns this system decide — not quietly build a one-off that
becomes a second, undocumented answer to a question a future component
might answer differently.

**One more thing worth naming plainly for sprint planning:** the
published library is general app chrome — headers, buttons, chips,
progress, snackbars, text, mascot sizing. Nothing in it is
voice-specific or conversational. That's not a criticism of the
library; it just means this sprint is extending the system while also
shipping a feature, not assembling from a kit that already anticipated
this feature. Worth planning time for accordingly rather than
discovering it mid-sprint.

---

## Built this session, and what's still actually open on each

Four new components and one new variant exist as real Figma components
now, checked directly against the file, not asserted from a spec. None
of them are used anywhere. Screens 01 through 07 in the "Say It Back"
flow still contain the original hand-built `⚠`-flagged frames,
unchanged — building the component was step one, nothing has replaced
what it was built to replace yet. Treat everything below as
built-but-not-adopted until that swap happens, and don't read "built"
as "done."

- **`micButton`** (`Components` page). `component.micButton.*` tokens
  are complete — `captured.glyph` and `disabled.glyph` were added this
  session, `disabled.glyph` required a new general token,
  `color.semantic.interactive.onDisabled`, not a mic-specific one,
  other disabled controls in this file were presumably sitting on the
  same gap. `state` is a real variant axis (Idle/Listening/Captured/
  Disabled, default Idle), built from an `iconSlot` instance, no
  hand-drawn vectors. Two real gaps: the icon inside it is still the
  generic placeholder every fresh `iconSlot` defaults to, not a mic
  glyph, swapping that needs a person working in Figma's UI, the icon
  library isn't searchable by name through the tools available this
  session. And it's not instanced anywhere.
- **`chatBubble`** (`Components` page). `showTitle` boolean property,
  default false. Binds to `background.surface`, `radius.400`,
  `spacing.cardPadding`, `headlineS`/`bodySRegular` + `text.primary`.
  Not instanced anywhere.
- **`hintCard`** (`Components` page). Binds to `background.surface`,
  `radius.200` (deliberately smaller than `chatBubble`'s 16, a real
  distinction, not drift), `spacing.cardPadding`, `captionMBold` +
  `text.tertiary` for the label, `bodySRegular` + `text.secondary` for
  the body. Label reads "Hint," sentence case, on the component
  itself. Not instanced anywhere — the live screens' hand-built
  version still reads "HINT," in caps, that correction exists only on
  this component so far.
- **`buttonIcon`, `variant=Overlay`** (stayed on `"🎨 Mascot &
  components"`, this one edited an existing component rather than
  creating a new one, so it stayed where `buttonIcon` already lives,
  it didn't move to `Components`). Fill `interactive.secondary`, icon
  color `text.secondary`, a deliberate exception to `buttonIcon`'s
  usual fill/on-token pairing, flag it to whoever owns `buttonIcon`
  before this goes further. Only S/Default is built, 1 of the 12
  cells every other variant fills — M, L, Pressed, Disabled, and
  Loading don't exist for Overlay. The `transcriptToggle` instance
  rename can't happen yet either, there's no live instance anywhere to
  rename.
- **`optionRow`** (`Components` page). Verdict colors:
  `feedback.success.subtle`/`.onSubtle`,
  `feedback.error.bold`/`.onBold`. Selected uses `highlight.surface`/
  `highlight.border`, the reassignment noted in resolved open question
  1. Corner radius `radius.400`. **What shipped is narrower than what
  was recommended, on two separate points, worth naming plainly rather
  than letting the gap between recommendation and build go unnoticed
  a second time:**
  - It has one `state` property (Default/Selected/Correct/Incorrect),
    not the two independent axes originally recommended
    (`selection` × `verdict`). One axis can't represent "this was the
    correct answer, but the student picked a different one," since
    Selected and Correct are two values of the same property instead
    of independent. That specific case has no visual representation in
    what's built.
  - It has no `leadingIndicator`. State is carried entirely by fill and
    text color, exactly the pattern this file's own tokens repeatedly
    flag as a risk elsewhere, and exactly what the original
    recommendation called out as a real accessibility problem, not
    styling polish. The built component reproduces it.
  - Left/right padding is bound to `spacing.cardPadding` (16) as a
    placeholder. That's a real token, nothing's hardcoded, but it
    doesn't resolve whether the original 20px was intentional, it's
    the same value as the top/bottom padding because that was the one
    already-bound number available, not because 16 was decided on.

**One new shared token**, not specific to any single component above:
`spacing.semantic.cardLabelGap` (6px, `size.primitive.space.150`).
Both `chatBubble`'s title-to-body gap and `hintCard`'s label-to-body
gap used this same 6px unbound, independently, before this token
existed. Distinct from `betweenSections`, that one is for gaps
between separate blocks on a screen, this is for the gap inside one
card between its own label and its own body.

**One documented policy, resolving an inconsistency the senior review
flagged rather than leaving it unexplained**: only `micButton` has its
own `component.*` token namespace. `chatBubble`, `hintCard`, and
`optionRow` don't, even though `optionRow` branches by state the same
way `micButton` does. See `tokens.json`'s own `component` group
description for the actual rule; the short version is that
`micButton`'s indirection layer is being treated as an existing,
legacy pattern, not the template new components are expected to
follow.

---

## Built today: `recallResult` and the `chips` Coral variant

Two things exist now that didn't at the start of today: a new
component, and a new variant on an existing one. Both are wired into
real screens, not just built and left sitting on the components page
the way most of the previous session's work was. Descriptions below
are copied directly from each component's own Figma description field,
not paraphrased.

### `recallResult`

**Where:** `Components` page.

**States (the `state` variant, default `Pass`):** `Pass`, `Miss`,
`CouldntHear`.

**Other properties:** `title` (text), `transcript` (text).

**Description, verbatim from Figma:**

> WHAT: A result card for a single recall attempt. state has three
> values, Pass and Miss use feedback.success/feedback.error subtle
> tinted cards with a colored title. CouldntHear keeps the card
> neutral (background.surface) and signals with a small coral tag
> instead, matching the real app reference screenshot (IMG_7512)
> rather than inventing a third card tint. transcript and title are
> both text properties, so Miss can carry Knowie's specific feedback
> line instead of a generic label.
>
> WHEN: Directly after processing, one per attempt. Pass is wired into
> screen 04, Miss into screen 05, CouldntHear into screen 04a (moved
> onto the Say It Back flow v1 section, not yet linked to from any
> other screen).
>
> DON'T: The coral tag on CouldntHear reuses chips, variant=Coral, it
> is not a separate component, don't rebuild it. Don't put rich text
> (bold spans) in title or transcript, they're plain text properties,
> partial bolding like the reference screenshot's bolded term isn't
> supported without a real component change.

**What each state means, beyond the description above:** `Pass` and
`Miss` are verdicts on a single spoken attempt, colored by
`feedback.success`/`feedback.error` per `tokens.json`. `CouldntHear`
is not a verdict, it's a third, distinct outcome for when the app
didn't understand what was said at all, right there being conflated
with a wrong answer is exactly the gap this state exists to close.
Don't treat `CouldntHear` as a variant of `Miss`, the card treatment
is deliberately different (neutral, not tinted) precisely because it
isn't a wrong-answer signal.

### `chips`, `color=Coral` (new variant on an existing component)

**Where:** `"🎨 Mascot & components"` page, alongside the rest of
`chips`. It did not move, the same rule from last session's
`buttonIcon` edit applies: editing an existing component keeps it
where that component already lives.

**What's new:** `color` now has a third option, `Coral`, alongside
the existing `Primary`/`pro`. Only one cell of the full grid is
built: `size=S`, `active=True`. The other three sizes and the
inactive state don't exist for Coral.

**Updated component description, verbatim from Figma:**

> WHAT: Optional leading iconSlot, text label, optional trailing
> iconSlot. Variants: size (XXS/XS/S/M), color (Primary/pro/Coral),
> active (boolean). Coral is new: fill/text bound to
> feedback.unclear.bold/onBold, only built at size=S, active=True, the
> one cell recallResult's CouldntHear state needed as a retry tag.
>
> WHEN: Confirmed in real use standalone and grouped (a chipsGroup
> context appeared twice). GUESS, not confirmed: the active boolean
> strongly suggests this backs the Topic Picker's selected-topic
> chips, inferred from the prop name matching documented behavior, not
> independently verified. Coral specifically is confirmed only inside
> recallResult's CouldntHear state.
>
> DON'T: Don't use the pro color casually, given the Pro badge context
> elsewhere in this file it's almost certainly reserved for
> subscription-gated content. Don't assume Coral exists at other sizes
> or active=False, only one cell is built.

**The icon inside it:** the leading `iconSlot` was replaced with a
hand-drawn refresh glyph, a ring with a gap plus nothing else — an
arrowhead was attempted twice and both attempts rendered broken and
disconnected from the ring, so it was dropped rather than shipped
looking wrong. If a real arrow-headed refresh icon is ever sourced
from the actual icon library, it belongs here in place of the ring,
this was a fallback, not the intended final art.

### The token this required

`feedback.unclear.{bold, onBold, subtle, onSubtle}`, bound to
`color.primitive.coral.{400, 950, 900, 200}`. See `tokens.json` for
the actual values; the reasoning for why this was safe to add without
it being an invented value lives in `tokens.json`'s own description
for that token group, not repeated here. In short: coral's four
primitive steps already sit in the exact same shape as red's, this
wired up a ramp that existing evidence suggests was built for exactly
this purpose, it did not invent a new color.

### `statChip` (new component)

**Where:** `"Components"` page, alongside `chatBubble`, `hintCard`,
`optionRow`, `recallResult` — this sprint's components, not the
original library.

**Component description, in the same shape as the rest of this file:**

> WHAT: A read-only stat pill: a bold value and a small caption label
> beneath it. One variant property, `stat`, three values: XP, Score,
> Time. No `active` boolean and no interactive states at all, there's
> nothing to tap or select, it's display only.
>
> WHEN: Confirmed real usage, `IMG_7508` in the App Inventory shows
> exactly this, three of these together on the session-summary screen
> after a recall session, color-coded and side by side. Not yet
> instanced on any built screen in this file; exists as a component
> only so far.
>
> DON'T: Don't add an `active` state or make this tappable, it isn't
> a selection control and extending it that way would blur it with
> `chips`, which already owns that job. Don't assume a fourth `stat`
> value exists, only XP/Score/Time are built, because those are the
> only three the real reference shows.

**The token gap this surfaced, not fully closed:** XP binds to
`accent.blue`, Score to `accent.green`, whose own description already
says "positive stat chips" before this component existed to consume
it. Time has no equally exact home, there's no `accent.purple` or
`accent.violet` in the semantic layer. Used `accent.magenta` instead,
the closest existing accent not already claimed by XP or Score, rather
than inventing a new primitive or semantic value for one component.
That's a real substitution, not a perfect match, `IMG_7508`'s Time
chip reads as purple, magenta is pink-leaning. Flagging it here
instead of quietly treating magenta as if it were always the intended
color: if a true purple/violet accent gets added to the palette later
for other reasons, `statChip`'s Time variant should move to it.

---

## Fourth pass — locked decisions from Complete Flow and comment
resolution

This pass didn't audit the component library again, it audited a
different kind of source: a working comparison section built to
answer specific, confirmed reviewer comments, then applied to the
real Complete Flow screens once a direction was chosen. Everything
below is a decision that actually got made, not a proposal still
waiting on one, distinguished from everywhere it's still open.

**`feedback.warning` (proposed above with no real consumer yet) now
has one.** The orange "Hint" indicator on a recall result, confirmed
distinct from the "Partially right" verdict tag itself, is exactly
the due/caution-adjacent meaning this token was wired up for. The
verdict tag reuses `feedback.success` (green), it's still a positive
outcome, just a partial one; the hint marker is not a verdict at all,
it's a note about *how* the answer was reached, which is why it needed
its own color rather than reusing success or error. Two tokens, two
different jobs, confirmed against a real built screen instead of
staying a theoretical binding.

**`progressIndicator`'s ring is confirmed to pair with a plain "N/4"
text label next to it, not stand alone.** `IMG_7538` in the App
Inventory shows both together on a real recall turn screen. An
earlier build in this same session used a text pill instead of the
ring ("Term 1 of 6"), which was wrong on two counts: wrong shape (text
instead of the real component), and wrong count (this feature's real
turn structure is 4 terms per session, confirmed by the ring's own
discrete 25% step matching 1-of-4, not 6). Worth stating plainly since
it's an easy mistake to repeat: the ring is the component, the
fraction is a plain text label beside it, not a replacement for it.

**Session summary is a row of three color-coded stat chips (XP,
Score, Time), not two, and not a plain number.** Built as a real
component this pass, `statChip`, see "Built this session" for the
full entry. An earlier build in this same session showed XP and Score
only, missing Time entirely, and used a single uncolored text line
instead of the real chip treatment `IMG_7508` documents. Corrected
once the actual reference was checked directly rather than approximated
from memory. **Score itself stays** — a later instruction to cut it
in favor of XP+Time turned out not to trace to anything actually
written in the Design Brief; what the brief does say is that the
score needs to be *earned*, not that it should be removed, and cutting
it would have meant losing the "1 of 4 unaided ÷ 4 total" breakdown
built specifically to answer that concern.

**Prove It Again's CTA carries a mic glyph in its own microcopy**
("🎤 Prove it"), confirmed against the specific comment thread that
asked for it. This is a real production screen change, not a
comparison-only mockup, it's live on the Quiz Complete screen in
Complete Flow.

**Transcript access (the eye icon / `buttonIcon` `variant=Overlay`
pattern) is confirmed to belong on every term in a session recap.**
See the updated gap note above. This was initially built and shown as
a single demonstrated example, which undersold the actual requirement,
corrected once the actual comment thread was reread.

**A real score breakdown is now shown, not just a percentage.** "75%"
alone reads as an assertion; showing "1 of 4 unaided ÷ 4 total"
underneath it, plus the XP chip's own value, lets a student see how a
headline number was actually earned rather than being asked to trust
it. This isn't a new token or component, it's a content requirement
worth recording here since it came directly out of a real reviewer
concern about the summary reading as flattery rather than evidence,
the same concern `voice-recall-state-list.md` names independently
about recap-before-stats ordering. Both point the same direction.

**What's still genuinely open from this pass, not resolved by it:**
whether pause/resume becomes a real `micButton` state (see open
question 8 above), whether `statChip` gets built at all versus staying
a documented gap, and whether the muted/secondary text pattern used
throughout this pass's own exploratory work (a solid gray, invented on
the spot) should have instead been `text.secondary` /
`text.tertiary` — it should have, those tokens already exist and
already do this exact job via `alpha.light-68` / `alpha.light-48`
rather than a flat color. Caught and corrected in the exploratory
work itself once checked against the real token; worth stating here so
the same invented-gray mistake doesn't get repeated by whoever reads
this next, since it's an easy one to make when a solid color feels
like the obvious answer and the alpha-based pattern doesn't.

---

## Fifth pass — Complete Flow consistency, Skip resolved, real gaps found in two components

This pass covered a full consistency sweep of Complete Flow (every
screen with a `progressIndicator`, the Recap XP breakdown, the Skip
decision) and syncing Main flow v1 to match. It also surfaced two real
component bugs that cost significant time to work around, both worth
recording so they aren't rediscovered the hard way a second time.

### Skip/Reveal — actually resolved this time

Open question in earlier passes and in `voice-recall-state-list.md`:
whether Skip and Reveal should be one unified control. **Decided, not
unified.** Skip stays available at every question, including after a
miss, not just before the first attempt, and is explicitly zero XP.
Three placements were built and compared side by side (Skip as a
quiet text link below the primary pair, Skip near the top of the
screen away from the decision, Skip as a third equal-weight pill).
**Chosen: Skip as a plain text link below Reveal answer / Try again**,
unchanged as the primary pair. Applied to the real Miss+Hint screen in
both Complete Flow and Main flow v1.

**Still open:** whether Reveal should cost less than an unaided pass.
Resolving Skip's placement didn't resolve this, it's a separate
incentive question. See the XP entry below for where the numbers
actually landed.

### XP model — grounded in the real reference, then deliberately adjusted

The App Inventory's real screenshots confirm: revealing an answer
awards XP "at the same increment as a single hint step" (+5 for
both, confirmed by a real XP counter going 0→5 on the reveal-result
screen). No screenshot shows a first, unhinted "Correct" in isolation,
so an unaided pass's exact value is genuinely unconfirmed by any
reference.

Built against that evidence, then changed on purpose: **Hinted (+7)
now sits above Revealed (+5)**, a deliberate departure from the
reference's equal treatment, made explicitly, not by accident. Full
curve as built: Unaided +10, Hinted +7, Revealed +5, Skipped/Worth
revisiting 0. This is shown twice, per-term on Recap (summing to the
total XP chip, currently +22) and live in-flow the moment it's earned
(screen 04 for a pass, screen 05 for a hint, the new reveal-result
screen for a reveal). **The Design Brief's own open question, "what
the XP mechanic actually is," is narrowed by this, not closed** — the
unaided value in particular is still a guess, not a confirmed number.

### New screen: reveal-answer result

Built from the real reference (`IMG_7513`): no verdict badge, a plain
untinted bubble stating the answer directly, a "Try it yourself after
reading" caption above an idle `micButton`, and a "Next question" text
link, no other action. This state didn't exist anywhere in the file
before this pass, tapping "Reveal answer" on the Miss+Hint screen had
nowhere to go. Exists now in Complete Flow only, not yet wired from
the actual "Reveal answer" tap, and not mirrored into Main flow v1.

### `progressIndicator` fraction: it needs a real width, not just a resize

Confirmed again this pass, worth stating precisely since it wasn't
fully spelled out before: the "N/4" label beside the ring is a
**plain text node with `textAutoResize` set to `NONE` and an explicit
width matching the ring**, not a text node left on auto-resize. A
text node on `HEIGHT` or `WIDTH_AND_HEIGHT` auto-resize will not
honor `textAlignHorizontal: CENTER` against a wider box, it just hugs
its own content and sits wherever its origin point lands. This is an
easy, invisible mistake, the text renders fine, it's just not
centered, and nothing about it looks broken until compared directly
against the reference.

### `progressIndicator`'s ring fill is a real component property, not free-form width

The ring's actual fill amount is driven by a `progress` **variant
property** (confirmed values include `25`, `75`), not the width of
the fill rectangle inside it. Directly resizing that inner rectangle
does not work reliably, and even when it appears to take effect, nothing
guarantees it survives the next time the instance's variant gets
touched. The correct approach, confirmed working: `setProperties({
progress: "75" })` on the `progressIndicator` instance itself. Anyone
setting a non-1-of-4 progress state on this component should use the
property, not touch the fill rectangle directly.

### `optionRow`: a real, reproducible bug, not solved this pass

`optionRow`'s label text node **could not be resized** by any method
tried, including the fixed-width approach that reliably works on
every other text node in this file (`textAutoResize: "NONE"` plus an
explicit `.resize()` call), font-family substitution, and detaching
the parent from auto-layout during the edit. The width stayed locked
at a stale value regardless of technique. No bound variable on width
was found; the cause wasn't identified, only worked around, by
building plain custom frames instead of instances of the component
wherever `optionRow` needed to show text longer than a few words (the
"What made you stop?" exit sheet). **This means `optionRow` cannot
currently be trusted with any answer option that needs to wrap to a
second line.** Worth a direct look from someone with fuller Figma
access before this component gets used anywhere with longer copy, the
workaround (custom frames) is not wired to the component and won't
inherit any future fix to it.

### A new pattern this pass surfaced by getting it wrong first: bottom sheets belong on their own branch, never baked into the main screen

Built the "What made you stop?" exit-confirmation sheet (matching
`IMG_7511`, the real reference) directly onto the live "01 Idle"
screen the first time, which meant that screen showed the sheet
permanently instead of on a real trigger. Caught, and fixed by
extracting the sheet onto its own separate branch screen and
restoring "01 Idle" to clean. **The same pre-existing bug was then
found independently on Main flow v1's Miss+Hint screen**, a
"Transcript sheet" instance sitting permanently in `bottomContent`,
not something this pass introduced, but the same shape of mistake,
fixed the same way. Given this has now happened twice, independently,
**treat "does this sheet only appear inside its own branch screen,
never baked into a screen that's supposed to represent a default
state" as a real thing to check on any screen using
`showBottomSheetBackground` + `bottomSheetOnly`**, not an edge case.

### Home entry point: resolved 2026-09-16, the chip is the entry point and the due-signal card is conditional

Two directions existed for how the home screen surfaces this feature,
and they turned out not to compete. **Main flow v1's version is real
and confirmed working**: a plain "Say It Back" chip with a mic glyph,
sitting among Scan/Summarize/Flashcards/Quiz in the existing home chat
composer. That is the entry point, always present. **Complete Flow's
due-signal priority card only surfaces when the student has quizzes
or exams due** — Say It Back flags those on their dates so the
student can practice ahead of them. The card shows the topic and the
due date, and tapping it goes straight into that lesson's session.
The DUE NOW/NEEDS PRACTICE/MASTERED picker page is not on that path;
it is the "pick what to practice" screen the chip always opens,
whether or not something is due. Both frames have a real screen name and a detailed annotation
and zero actual content, so both still need building; see
`docs/sprint-context.md` § "Where it lives". The real Main flow v1 screen was copied into
Complete Flow so it's no longer missing there.

**A pattern worth naming, since it happened four separate times this
sprint across unrelated screens:** a screen's Figma name and written
annotation describing specific content, with the actual frame empty
or the content sitting nearby as a disconnected floating element. The
due-signal card, the picker page, the "Partially right" tag before it
was properly placed, and a hero score line in an earlier merge
exploration all had this shape. Worth treating as a known failure
mode in how content gets drafted in this file, not four coincidences.

### `statChip` was reading raw hex instead of its documented tokens

Built correctly in principle in the Fourth pass, bound to
`accent.blue`/`accent.green`/`accent.magenta` per that pass's own
record. In practice the actual Figma instances had literal RGB values
on every fill and stroke, `boundVariables: {}` throughout, confirmed
by checking directly, not by looking (it rendered identically either
way). Fixed: every `statChip` variant now genuinely binds to its
documented token via `setBoundVariableForPaint`. See `tokens.json`'s
own updated descriptions on `accent.blue/green/magenta.bold` for the
confirmed-consumer note. Worth repeating the general lesson: a
hardcoded value that happens to match the right token is the hardest
version of this class of bug to catch, since nothing about the
rendered result looks wrong.

### `button` built in code, 2026-09-16, and two things it surfaced

`src/components/Button/` is the first React component, built from the
Figma set's actual bindings (36 variants read directly, not from this
doc). Props are the Figma names and options unchanged: `variant`,
`size`, `state`, `showLeftIcon`, `showRightIcon`, `CTA`. Stories under
`Components/Button` carry the Figma description verbatim. Two gaps
came out of reading the real component:

1. **Heights were unbound numbers in Figma.** The pill's 32/40/56 and
   the 48 outer hit area had no variable behind them on any of the 36
   variants. Now they do, in both places: `component.button.{s,m,l}.height`
   and `spacing.semantic.tapTarget` exist in `tokens.json` and as Figma
   variables, and every variant's outer `minHeight` (all 36) and pill
   `height` (the 24 Primary/Secondary ones; Tertiary's pill hugs its
   text) bind to them. This earns the `component.button` namespace
   under the `component` group's own rule: the bindings genuinely
   route through it.
2. **`tokens.json` was wrong about `interactive.onPrimary` and
   `text.inverse`.** Both said `homie.inkwell`; Figma has both aliased
   to `navy.950`, and the button's Primary label rendered navy in
   Figma all along. The inkwell version failed contrast on
   `interactive.primary` (3.1:1); navy.950 is 16.6:1. Corrected in
   `tokens.json` per the source-of-truth order. Nothing in Figma
   changed.

Matched to Figma property-for-property after a second comparison pass
the same day: the label wrapper's bottom lift (2 on S/M, 4 on L, now
`space.050`/`space.100` in code — unbound raw numbers in Figma),
Tertiary's text-hugging pill on S/M and its radius on the outer
frame, the Pressed overlay on the label only for Tertiary, the icon
set's `square` glyph as the slot placeholder, and a hidden label layer
in Loading. Two things Figma has no opinion on were filled from this
doc rather than left raw: a `border.focus` ring at Stroke/Heavy Border
on keyboard focus, and the press/spinner motion on `duration.fast` /
`duration.ambient`.

3. **Secondary's Pressed overlay was buried in Figma.** On all three
   sizes of `button` and `buttonIcon`, `background/stacking` sat
   *below* the opaque `background/surface` fill, so Pressed rendered
   identical to Default — contradicting the component's own
   description. Fill order swapped on those six variants; bindings
   untouched.

### Component audit, 2026-09-16: what's still unbound across both pages

Same check the button got, run over all 16 components (153 variants)
on "🎨 Mascot & components" and "Components". Colours are almost
entirely clean: every fill and stroke is bound except two shapes inside
`recallResult`'s CouldntHear tag. What isn't bound is *dimensions*:

- **Fixed heights with no variable** on nearly everything: `appBar`
  root 56 and its 48 icon buttons, `buttonIcon` pill 32/40/56 (same as
  `button` was), `optionRow` rows at 56, `micButton` glyph 48,
  `mascotSlot` 64/120/200, `chips` 20+, `snackbar` containers, every
  icon container's height (widths bind to `Icon/*`, heights don't).
- **Unbound padding and gaps**: `progressIndicator` (80 padding
  values, 40 unbound radii of 12), `appBar` slot 10/10 with 10 gaps,
  `buttonIcon` wrapper 2/4/10, the 4–5px gaps inside every `iconSlot`.
- **`statChip` is the outlier**: Inter, not Greed, at 7.5px and 13px
  with no text style and no bound size, plus unbound padding
  (12/10), gap 4 and radius 14. The Fifth pass fixed its colours; its
  type and dimensions were never bound.
- `textBlock`, `chatBubble`, `hintCard` are fully bound. `iconSlot`'s
  own sizes are unbound but it's scaffolding by its own admission.

None of this was changed at audit time. Resolved the same day, below.

### Every component built in code, 2026-09-16, and how the audit was resolved

All 15 remaining components now exist under `src/components/`, each
read from its Figma set's actual bindings, with props named as the
Figma variants and the Figma description verbatim in its Storybook
docs. `iconSlot` was not built: its own variants say IGNORE. The
audit's unbound dimensions were resolved by the rule "reuse an
existing token where value *and kind* match, add one only where
nothing fits", and every binding was mirrored in Figma:

- `buttonIcon` pills → `component.button.{s,m,l}.height`, both axes;
  outer hit area → `spacing.semantic.tapTarget`. Its Secondary
  Pressed overlay was buried like `button`'s and fixed the same way.
- `chips` heights → `icon.250` (XXS), `icon.300` (XS),
  `component.button.s/m.height` (S/M).
- `mascotSlot` height → the same `illustration.*` token as its width.
- `progressIndicator` track → `space.600` / `space.400` (the
  thickness variant), radius → `radius.full`, inset → `space.050`.
- `appBar` slot → `tapTarget` tall, padding `space.0`, gap `space.200`
  (was 10/10/10, no visual change since the slot content is centred).
- `micButton` glyph → new `component.micButton.glyph.size` (48).
- `statChip` retyped from Inter 7.5/13 to Caption S Bold / Caption M
  Bold; padding `space.300`/`space.200`, gap `space.100`, radius
  `radius.400`; given a WHAT/WHEN/DON'T description. Labels are
  sentence case in code per this doc, where Figma's samples read
  SCORE / TIME.
- `optionRow` 56 and `snackbar` 80 are content-derived; nothing added.
- Two Figma variables the file references are not local:
  `border/subtle` and `Padding/sm`. They resolve to the same values as
  `border.default` and `space.200`, which code uses.

Filled from this doc where Figma has no opinion: a `border.focus`
ring on every tappable component, press feedback on `duration.fast`,
the mic's Listening pulse and the progress bar's step transition on
`duration.ambient` / `duration.standard`. Two literal motion
parameters exist with no token to name them: the pulse ring's start
opacity and end scale in `MicButton.module.css`.

Second comparison pass, same day, matched property-for-property:
ButtonIcon Overlay S icon at `icon.300`; Chips Coral hides its right
icon by default; StatChip label text as Figma's (`XP` / `SCORE` /
`TIME`, which contradicts the sentence-case rule below and was matched
on request) with the 14 artwork drawn inside the `icon.200` box;
TextBlock and HintCard hug content; AppBar's two stacked fades and
the 16 right edge on `leftAnd2RightButtons`; Snackbar's 28×48 icon
container (`space.700` × `tapTarget`) and a real Chips instance for
its tag; ButtonGroup applies Figma's fill overrides itself. Two more
Figma-side defects fixed in Figma: the Idle mic frame bound
`border/strong` directly, bypassing its own `component/micButton/idle/stroke`
(now routed through it, and the token aliases `border.strong` in both
places since that is what it always rendered); and the CouldntHear
tag was a hand-built frame, now a `chips` Coral instance as its
description says. Still not matched, and intentionally: fixed widths
in Figma (`buttonGroup` 319, `statChip` 90, `progressIndicator` 350)
fill their container here; `mascotSlot` shows `public/knowie/` SVGs
rather than Figma's Homie pose instances; Overlay and Coral cells
Figma never built are extrapolated from the same tokens.

---

## Naming conventions

These follow directly from how `tokens.json` is structured, so a name
tells you which layer it lives in just by shape.

- **Three layers, in this order: primitive → semantic → component.**
  A token name should make it obvious which layer it's in without
  opening the file. `color.primitive.violet.500` is a raw value.
  `color.semantic.interactive.primary` is a role. `component.micButton.idle.stroke`
  is a specific part of a specific component.
- **Semantic names describe role, not appearance.** `interactive.primary`,
  not `violetButton`. `feedback.error.bold`, not `redBanner`. If a name
  describes what a thing *looks like* rather than *what it's for*, it's
  in the wrong layer or it's not a semantic name yet.
- **Component tokens are scoped to their component and state.**
  `component.micButton.listening.fill` reads as component → state →
  property, in that order, every time. Don't shorten this pattern for
  a new component; a new component's tokens should read the same way
  a person unfamiliar with it could guess the next state's name.
- **Dot-path grouping mirrors Figma's own collection structure**, not
  an invented hierarchy. If Figma groups something under Semantic
  color token, it stays under `color.semantic` here, it doesn't get
  reorganized into a taxonomy that felt cleaner.
- **Sentence case, everywhere text is shown to a student.** Buttons,
  headings, labels, sheet titles, empty states, error copy — sentence
  case throughout. Capitals only for actual proper nouns: Knowie,
  product names, place names. "Continue," not "Continue" written in
  Title Case, and never full caps outside of the one instance
  (`spacing/screenMargin`-adjacent eyebrow labels like "YOUR AI STUDY
  SPACE" in the App Inventory are themselves worth flagging as an
  inconsistency against this rule, not a precedent to repeat).
- **Component names are nouns, not descriptions.** `micButton`, not
  `voiceRecordingButtonWithStates`. If a component needs a sentence to
  name, it's probably two components.
- **A `component.*` token namespace is earned, not automatic.** Don't
  add one just because a component has states or variants. Add one
  only when its Figma bindings genuinely route through it, when the
  token is the real indirection layer between the component and the
  semantic tokens, not a second name for a semantic value the
  component could've referenced directly. `micButton` has one.
  `optionRow` branches by state the same way and doesn't, its variants
  bind straight to semantic tokens. See `tokens.json`'s `component`
  group description for the full reasoning; treat that as the current
  policy, not `micButton`'s pattern as the default.
- **Every component description follows the same three-part shape:
  WHAT, WHEN, DON'T.** WHAT states what it is and what its properties
  actually do, factually, not aspirationally. WHEN says where it's
  really used, and says plainly when that's a guess rather than
  confirmed usage, don't blur that distinction. DON'T names the real
  gaps and misuse risks, not generic warnings. Keep this format for
  every new component going forward, it's what let today's
  `recallResult` and `chips` entries above get written directly from
  Figma without translation.
- **Check for a component to extend before building a new one.**
  `recallResult`'s retry tag didn't become its own component, it
  became a new `color` value on `chips`, because `chips` already did
  everything the tag needed structurally. A property name doesn't
  have to match its layer's name one-for-one either — `recallResult`'s
  `transcript` property drives a layer literally named `body`, because
  the layer's structural role (body text) and the property's semantic
  content (a transcript quote) are two different things worth naming
  differently. Reach for an existing component's structure before
  reaching for a new frame.

---

## Never do this

- **Never invent a value that isn't in `tokens.json`.** If a color,
  size, duration, or type value you need doesn't exist there, that's a
  gap to report, not a number to pick. Say what's missing and what you
  needed it for.
- **Never use a CSS fallback like `var(--token, #333)`.** A token that
  resolves to nothing is a bug in the token pipeline or the build, and
  it needs to be fixed at the source. A fallback hides that bug behind
  a value nobody chose on purpose, and it'll drift from the real token
  silently.
- **Sentence case on every label, button and heading.** Capitals only
  for proper nouns. Covered above, repeated here because it's a rule,
  not a suggestion.
- **Never put an appearance word in a semantic name.** "Green," "red,"
  "purple," "bold-looking" — words that describe how a color looks
  belong in the primitive layer (`color.primitive.green.500`) and
  nowhere else. A semantic name that leaks an appearance word
  (`greenSuccessText`) breaks the moment the brand decides success
  should be a different color, because now the name is lying.
- **Never read a primitive directly from a component or a screen.**
  Components consume the semantic layer; the semantic layer is the only
  thing allowed to reference a primitive. If a component needs
  `color.primitive.violet.500`, that's a sign a semantic token is
  missing, not a reason to reach past the semantic layer to get it.
- **Never build something new when a component in this system already
  does the job.** Check the "which component" section and the file
  itself before adding anything. A slightly-wrong existing component
  extended with a new variant is almost always the right call over a
  parallel one-off.
- **Never invent a component to fill a gap.** This is a real system
  that's meant to be extended on purpose, not patched around. If
  nothing here covers what you need, say what's missing, propose a
  name that follows the naming conventions above, and let the person
  who owns the system decide whether it gets built — don't just build
  it and let it become a second, undocumented answer to the same
  question a real component already answers differently.
- **Never detach an instance to make a one-off edit.** A detached
  instance silently stops receiving updates from its component —
  three of the fifteen example screens in the file's "Dark" section
  are already like this, including the one showing an actual recall
  question. If a screen needs something the component can't currently
  do, that's a reason to extend the component (or flag the gap), not
  to detach and fork it quietly.