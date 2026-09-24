# Sprint Context — Say It Back (voice active recall)

Voice-based active recall for Knowunity: student speaks a term,
Knowie replies in text. 2.5-week sprint, mobile iOS only, 390px, dark
mode, recall mocked (no real STT/judging).

**Concept:** A conversational, not quiz-graded, recall check. A clean
pass echoes the student's own transcript back as proof rather than
generating new praise. A miss requeues later in the same session
instead of resolving permanently on one attempt.

**Canonical source of truth: Complete Flow, not Main flow v1.** Main
flow v1 is the older, exploratory section. If they diverge, Complete
Flow wins. Main flow v1 has **not** been re-synced since Definition
Drill Down was added and is now meaningfully behind; treat it as
archive rather than a parallel copy to maintain.

## Where it lives

Post-quiz, inside the exam plan, on first encounter. After that, a
re-entry point on the home page.

**The home entry point is resolved.** The chip and the due-signal card
were treated for most of this sprint as two competing directions
needing a decision. They aren't alternatives — they're two states of
the same feature. There are **three** home states, not two, gated
first on whether the feature has been unlocked and then on whether
the student has a plan:

- **Before first encounter → no chip at all.** Corrected 2026-09-20:
  an earlier version of this section said the chip is "present in
  *every* home state." That was wrong. The chip does not exist on
  home until the student has met Say It Back once. **This pre-unlock
  home state is the baseline and it is not yet built** — the 39
  screens all assume the chip is already there.
- **Unlocked → the composer chip.** A plain "Say It Back" chip with a
  mic glyph, among Scan/Summarize/Flashcards/Quiz in the existing home
  composer. Once it appears it is permanent; nothing takes it away.
- **Unlocked, plan with due dates → the chip plus a due-signal card.**
  As a deadline approaches, a Say It Back chip surfaces with an amber
  accent border, naming the term and its due date. It reads from the
  exam/quiz plan's *existing* due dates — not a new scheduling system.
  It's a reminder layer on top of the chip, never a replacement.

**What unlocks it, decided 2026-09-20: any first encounter, by any
door.** Prove It shown on quiz complete, the exam-plan step, or the
chat door — whichever the student hits first puts the chip on home
from then on. It is the *showing* that unlocks, not the completing.
The unlock reveal is the transition between the first and second
states above; it fires once.

A student with no plan never sees the card, so there's no mixed
message and no competing entry point.

**The picker is gated, decided 2026-09-20.** Topic rows offer only
material the student has actually revised; drill rows only definitions
they've already attempted. Because a student can unlock the chip from
the chat door without having revised anything, **the picker is seeded
with the material from whichever session unlocked it** — so it is
populated by construction and the first run can never open empty.

**The card is swipeable.** With more than one quiz due, each swipe
shows a different quiz with its own term and date, and a count badge
counts down (`+2` → `+1` → `last one`) as the student clears them.
Three swipe states are built in the flow.

**A first-run unlock reveal introduces the chip.** After the student's
first quiz, exam, or Prove-it, home dims and the composer chip is
spotlighted with an earned "You've unlocked Say It Back." Shown once.
After that, home is either chip-alone or chip-plus-card per the rule
above.

## Core loop, decided

- Result states are Knowie's in-character text reaction, not a graded
  badge/icon.
- **"Commit" describes the Idle screen, it is not a second state.**
  Clarified 2026-09-20: an earlier version of this line read "a distinct
  Commit state (idle) sits between Idle and Recording," which implied a
  screen that was never drawn in any pass. There is one screen — `01 Idle`,
  captioned "01 · Idle / Commit" — and the commit is the student deciding to
  speak on it, not a separate UI state. `MicButton` has no Commit state and
  neither does Figma's set; that is correct, not a gap.
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
- **Pause/resume mid-recording is built but unratified.** It was added
  against voice-ux.md's explicit "Out of scope" triage without a
  recorded decision, and both docs now mark it experimental rather
  than settled. It stays on screen; treat it as an open question, not
  a conclusion.

Added 2026-09-22, resolving the findings in `eval/scorecard-04.md`:

- **A typed pass scores as Hinted (+7), not Unaided (+10), when voice was
  available.** This puts a number on the decision already recorded above
  ("typed answers are reduced, but only when voice was available") without
  inventing a new tier: choosing to type removes the retrieval-out-loud the
  feature exists to test, so it lands where "got there with help" lands. A
  student whose mic is denied keeps the full +10 — the build distinguishes them
  by the sticky flag. The Recap BUCKET still says Unaided; only the XP is
  reduced, because the student did retrieve it unaided, just not aloud.
- **The action zone is ONE fixed height, 136, on every screen.** It holds one row of
  up to two controls, plus optionally one tertiary link beneath. It had been a
  min-height that grew to whatever a screen stacked in it — six values across 44
  routes, 120 to 248 — so its top moved by up to 128px as the student advanced and no
  control ever landed twice in the same place. Anything that does not fit belongs in
  middleContent, not in a taller zone.
- **The mic has one fixed region on every voice screen.** It sat at eight
  different heights and moved 91px on the very tap that starts recording. One
  region, and the content above absorbs the difference.
- **One screen-title scale.** Headline S, as the Complete Flow frames draw it.
  "Say It Back" was 21px on 00 Intro and 44px on the picker, consecutive
  screens, and the permission primer used 76px Display M — a token whose own
  description reserves it for "hero numeric moments".
- **Skip has one placement and one label**, overriding the frames' per-screen
  positions. Four placements and two labels for one escape was the clearer
  problem.
- **A content region that overflows shows a fade.** Four screens sliced a row
  mid-height with no cue that more existed.
- **Three waits become one composition.** 03 Processing, DD 03 and the typed
  checking beat share a shell, mascot position and dots; only the content below
  differs. The typed beat had been dropping the app bar entirely, so the chrome
  blinked for one screen mid-flow.
- **The confidence tap is not asked on a take the app is about to reject.** A
  too-short take goes straight to 04a Couldn't hear. Asking how sure you are
  about an answer that was never heard is a question the screen has not earned.

Added 2026-09-24, from the same two roleplays — the copy half rather than the state half:

- **The Recap does not show a score, so it stops saying it does.** The chip measured
  first-attempt-with-no-help and printed "SCORE 25%", which invites comparison with a
  test mark; both students read it as one, on sessions where they had ended up right on
  three of four. It reads "FIRST TRY · 1 of 4" now — the `Score` variant is unchanged,
  only its label, via a new optional `label` prop on StatChip so the Figma default is
  untouched everywhere else. A count cannot be misread as a percentage.
- **The Recap caption leads with where the student ended up.** It said only "You
  explained N of 4 without help" — true, and the only sentence on the screen, so the
  deficit was the whole verdict. Now: "You got 3 of 4 in the end. 1 first time, no
  help." Both halves are facts; showing only one was a choice, and it made an honest
  screen read as an accusation. The worst-first bucket ordering stays — that is a
  recorded decision and it is doing real work.
- **"Unaided" is not claimed where the student was aided.** 05b said "Said back
  unaided" about an answer read off the reveal screen ten seconds earlier; it says "Said
  it back in your own words", which is what the +3 is actually for. The drill's complete
  screen and its round sheet said "You said all of it unaided" after the scaffold had
  handed over the missing word, its first letter, and the word to echo; both now say
  "The whole definition, start to finish". Praise a student knows they did not earn is
  worse than no praise.
- **The prompt and the marking ask the same question.** Term 2 asked "what the cell
  membrane does" and marked a correct what-it-does answer as incomplete for omitting
  what it is made of — a question it had not asked. Term 4 told a student "that is
  diffusion", a word they never used, and handed them a hint restating what their own
  quoted transcript already said. Both prompts and both partial transcripts are rewritten
  so that on all four terms the prompt asks for X, the partial delivers part of X, the
  verdict names the missing part of X, and the hint points at it. This is the product's
  central claim — the transcript is proof — and a verdict that contradicts the quote
  printed beneath it teaches the student to blame the mic instead.
- **The baseline Say It Back chip is sized like the tools it sits among**
  (`--component-button-s-height`, 32), not 68. It read as a banner above the tool row
  rather than a chip belonging to it. The due chip keeps the taller box: it carries a
  term, a date and a count on two lines, and a deadline is meant to outweigh a tool.

Added 2026-09-23, from two student roleplays driving the built flow (eval/scorecard-06.md).
All three were state that did not survive a route change — each typechecked, linted,
rendered and passed all four hard gates:

- **The requeued term rides in the route.** `nextAfter` now returns
  `/session/lock-in?term=N`. 06 used to re-derive it every render from "first outcome
  bucketed Worth revisiting and not yet requeued", then mark it requeued on arrival —
  and the mark made its own predicate stop matching, so the screen forgot which term it
  was asking about between one render and the next and fell through to `TERMS[0]`. The
  student was re-tested on a term they had already passed while the one they actually
  missed was closed in silence. `session.ts` already warned about this exact shape for
  06b; 06 had never adopted the fix. 06 also names the term now ("Cytoskeleton was
  tricky") instead of asking about an unnamed one.
- **Paused seconds are not speech.** The take was scored as `Date.now() - startedAt`
  with `startedAt` set once on mount, while `paused` only stopped the display interval.
  The on-screen timer and the scored duration disagreed the moment anyone paused — 0:12
  shown against 31690ms logged — so a student who paused to think was graded as though
  they had been talking. The verdict is taken from un-paused time now, which is what the
  timer has been counting all along. Note for anyone touching this: the first attempt
  banked the stretch inside a `setPaused` updater, and React 19's StrictMode
  double-invokes updaters to catch impurity, so every pause counted twice. Bank outside
  the updater.
- **A denied mic stays denied on every screen.** `blank`, `reveal` and `lock-in` were
  mic-only, so a student already moved to typing could reach them from "I don't know
  this one" and be handed a microphone they had refused — the recording screen then
  rendered "LISTENING" with a running timer on a mic with no permission. All three
  redirect to the typed turn when the session is sticky, and all three now offer "Type
  instead" when it is not. 01 Idle had had this redirect all along; the rest of the flow
  never got it.

Added 2026-09-23, from the designer clicking the built prototype:

- **Being sure and wrong costs nothing.** `XP.sureWrong` was -3, on the Design
  Brief's "overconfidence has to cost something". Overruled: a student who was
  confident and wrong has already had the worse experience of the two, and
  charging them for it punishes honesty about their own belief rather than the
  belief itself. The reward side stays (+2 called it, +1 knew more than they
  thought). **Known consequence, recorded on purpose:** with no downside, "Sure"
  strictly dominates and an XP-optimising student should always tap it. If that
  becomes a problem the fix is to flatten the two rewards to one value and let
  the tap be purely informational, NOT to bring the penalty back.
- **A take the app cannot use never reaches 02a Captured.** Captured prints a
  clean, complete transcript and asks the student to confirm it. The scripted
  mishear fires on term 1, so confirming "Looks right" led straight to "That one
  didn't come through" — on the first term of the session. The app cannot show
  you your words and then say it never heard them. An unusable take now goes
  from Recording to the judging beat directly.
- **04a Couldn't hear has a mic.** Its whole job is "say it again" and the retry
  was a text chip inside the result card, with no mic anywhere on the screen
  recovering from a voice failure. The mic sits in the same fixed region as every
  other voice screen; the coral chip stays as the state signal, with no handler,
  so there are not two controls doing one thing.
- **The mic sits at the top of its fixed region, not centred in it.** The status
  line belongs under the control it describes, and a centred mic left only 40px
  beneath it for a 56px caption. Top-aligning frees the bottom 80. Applied to the
  region itself, so idle and recording still agree to the pixel — the invariant
  the region exists for.
- **The session clock starts on 01 Idle, not on 00 Intro.** The doors go straight
  to `/session/idle/1?door=…`, so a door run never started it and the Recap's
  Time chip read 0:00 on a session the student had just spent minutes in. Idle is
  the first screen of every entry path.
- **Home is the real app's home, not a stand-in.** It had a left-aligned greeting
  and two grey "Your study plan" / "Recent notes" boxes that appear on no frame.
  Built to "Home card — where Say It Back lives, native and unmodified"
  (15674:34093): status bar, app bar with the PRO and streak chips, Knowie over a
  centred greeting, the tool chips, the composer, the tab bar. The whole point of
  this screen is that Say It Back is judged where it actually lives, and the
  chip's competition for attention IS the design question — a placeholder cannot
  show that.
- **`Panel Header` is a real ScreenShell slot.** It had been a reserved 48 of
  nothing, on the reasoning that the real app's status bar is an external
  component. Home's frame has one, and with no slot it had to go into
  topNavigation, which is a fixed 56 with `overflow: hidden` — so it pushed the
  app bar out and the app bar silently vanished.
- **Mascot poses, three overrides.** 01 Idle and both Captured screens move to
  `excited`. See `docs/design-system.md` § "Mascot poses" for each one's
  reasoning; the table there now records them against its own earlier
  amendments rather than contradicting the tree.
- **XP is shown only where it is earned.** 05 Miss had "+7" in the same slot and
  style as Pass's earned "+10", while Reveal pays 0 — a promise dressed as a
  balance.
- **Nothing renders as a button unless it does something.** DD 08's round rows
  open the round sheet; the transcript quote and home's tool chips become
  non-interactive reference chrome.
- **The exit reasons are a radiogroup.** Eight `aria-pressed` toggles with no
  group announced as eight independent switches for one single-choice question.
  "Other" stays selectable and opens nothing, like the other seven.
- **The Recap keeps its Score chip**, and this is a KNOWN TENSION rather than a
  settled point: the Design Brief calls this "conversational, not quiz-graded",
  and a percentage grades it. The chip is on the built 07 Recap frame, and the
  frame wins under `docs/design-system.md`'s source-of-truth order. Revisit if
  the brief's framing is ever given precedence over the frames.

Added 2026-09-20:

- **A per-term confidence tap sits inside Processing.** "How sure are
  you?" is asked after the answer is sent and before the verdict
  lands, so the signal can't be contaminated by knowing the outcome,
  and it costs no extra step — it occupies a wait the design already
  had to cover. **The verdict waits indefinitely for the tap**, with
  Knowie animating as the "still working" signal so the screen never
  reads as stuck.
- **A genuinely blank term gets one encouraged attempt, then a
  reveal.** "Say whatever you've got" — a wrong attempt still beats
  silence for retrieval. This answers the Design Brief's first open
  question; skip remains available and stays a silent exit.
- **The say-it-back repeat after a reveal is worth 1 XP and does not
  change the term's Recap bucket.** A revealed term stays revealed no
  matter how well it's repeated. It's rehearsal, not a re-verdict.
- **A second miss offers the drill on Recap; it never routes there
  mid-session.** Definition Drill Down stays picker-entered and
  opt-in exactly as built, and DD 00's framing does not have to
  change.
- **Try again re-presents the same terms in a shuffled order**, not
  just the ones missed — 07a Practice-what-I-missed already covers
  the targeted second pass.
- **Recap reorders rather than relabels.** The confidence tap means a
  term can be confidently wrong; those sort to the top of Worth
  revisiting instead of getting their own badge. The signal drives
  the list, it doesn't decorate it.
- **The transcript sheet adapts per bucket.** Passed → what the
  student said. Revealed → the attempt plus the answer they were
  given. Skipped → the answer alone. One sheet, three content states,
  each still on its own branch screen.

## Definition Drill Down — in scope, added this sprint

A separate opt-in practice mode, entered from the picker, for working a
single definition out loud until the student owns it. Evidence-backed
(diminishing-cues retrieval practice). Not graded, verbatim-oriented,
**no XP** — the reward is completing the thing, not winning a game.

**It has no fixed length, and this is the central decision.** It was
originally built as a fixed four-rung ladder. That's gone, because a
fixed count lies: a student who has the definition after two passes
gets padded, and one who needs six gets cut off.

**What the built screens show, decided 2026-09-20.** The 13 DD screens
still render the four-rung ladder — progress ring at 25/50/75/100,
titles reading "Step N of 4". That is deliberate and it is not a bug
to fix: **the screens illustrate one concrete walkthrough, this doc
carries the real rule.** If you are reading a DD frame and it
disagrees with the variable-length model below, the model wins. Don't
"correct" the screens to match the doc, and don't infer the design
from the screens.

- **`strengthMeter` is a continuous fill**, not a segment counter. It
  fills by **how much of the definition the student says unaided**,
  as coverage of the sentence — not by which pass they're on.
- The drill ends when coverage reaches full, whether that's the second
  pass or the sixth.
- The `N/4` fraction and progress ring are **not shown** on drill
  screens. Progress lives in the meter.

**Two rules the meter depends on:**

1. **The judge must score unaided coverage per pass.** The whole
   variable-length design rests on this one capability.
2. **Help holds the meter; it never drops it.** A reveal or a miss
   parks it rather than reducing it. A student must never watch
   progress go backwards for asking for help.

**The stumble scaffold — why a stuck student can't loop forever.**
Help escalates on the *same word*, and the task bends until it's
always completable:

- **1st stumble** — reveal the missed word, retake the pass.
- **2nd stumble, same word** — the word stays visible with its first
  letter shown. A prompt, not a giveaway. Meter barely moves.
- **3rd stumble, same word** — echo. Knowie says the word, the student
  repeats it. Always completable, so the loop terminates here. Echoing
  barely fills the meter, because echoing isn't unaided recall.

Scaffold state resets **per definition, per session.**

**Visual metaphor:** within-session muscle. Each completed pass is a
rep — Knowie grows a step with a spring/overshoot, and the meter fills.
Deliberately resets per definition; it's not a long-run streak.

**The Knowie half of that is NOT BUILT, and was never designed.** Recorded
2026-09-23 after a review flagged the code claiming it. Checked against the
frames: DD 01, 04, 05 and 06 all place `mascotSlot` at 120x120, identical on all
four — the growth exists in this document and nowhere else. It also cannot be
built as written from what exists: `MascotSlot` has four sizes and the next one
up is 200px, against roughly 48px of headroom on the pass screen at step 4. So
either the slot needs sizes between 120 and 200, or the rep lands somewhere
other than Knowie's height. **The meter carries the whole metaphor today.**
Treat this as an open question, not a built behaviour.

## Skip / Reveal — resolved

Skip is available at every question, not just before the first
attempt, and is explicitly worth zero XP. Three placements were built
and compared; **chosen: Skip as a plain, quiet text link below Reveal
answer / Try again**, which stay unchanged as the primary pair.

Skip is **Tertiary everywhere** — it was Secondary on one screen and
that's been corrected. Same for "Not now."

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
- Full curve, revised 2026-09-20: **Unaided +10, Hinted +7, Say-it-back
  repeat +3, Revealed 0, Worth revisiting/Skipped 0, plus a +5 completion
  bonus forfeited on leaving.**
- **Revealed dropped from +5 to 0.** Being told the answer retrieves nothing,
  so it pays nothing. The optional say-it-back repeat afterwards carries the
  reward instead, because saying it unaided under a cue *is* retrieval. This
  is a second deliberate departure from the real screenshots, which award +5
  for a reveal — made explicitly, like the Hinted +7, not by accident.
- **The +5 completion bonus** is the only thing forfeited by leaving. Roughly
  a fifth of a 4-term session's take: enough to notice, not enough to pull
  attention off the recall, which is the Design Brief's second open question.
- Shown twice: per-term on Recap and live in-flow at the moment it's earned
  (Pass, Miss+Hint, and Reveal-answer-result). **The +22 on the built Recap
  frame is now stale sample data** — it was 10+7+5+0 under the old curve, and
  Recap is derived from the actual run rather than canned, so no fixed total
  is correct any more.
- **No XP anywhere in Definition Drill Down.** Deliberate — the drill
  is practice, not scored performance. If XP is ever added there, the
  copy needs rewriting, nothing currently mentions it.
- **The say-it-back repeat is +3**, and never moves a term between buckets.
  Repriced from 1 on 2026-09-20 when Revealed went to 0: the repeat became
  the thing that carries a revealed term's reward, so a token amount would
  have removed the incentive rather than relocated it. +3 sits below a hinted
  pass on purpose — a cued repetition is easier than a partial retrieval.
- **Typed answers are reduced, but only when voice was available.**
  A student who chooses to type when they could have spoken takes the
  reduction; a student whose mic is denied or unavailable does not.
  Decided 2026-09-20 — a flat reduction penalises the accessibility
  path for something outside the student's control, which is the
  opposite of what "never trap the student" is for. This means the
  build has to track *why* a student is typing, not just that they
  are.
- **Leaving banks per-term XP; only a completion bonus is forfeited.**
  Corrected 2026-09-20: screen 01b's line "You won't earn XP for this
  session if you leave now" contradicted the Design Brief's "progress
  saves, returning resumes." XP already earned stays earned. This
  introduces a completion bonus the curve above doesn't yet price,
  and **a resume entry screen that doesn't exist in the 39.**
- **Unaided's value (+10) is not confirmed by any real screenshot** —
  the App Inventory notes no screenshot shows a first, unhinted
  "Correct" in isolation. The Design Brief's own open question, "what
  the XP mechanic actually is," is narrowed by this work, not closed.

## Screens — Complete Flow, current state

39 screens, all captioned with a title and a 3–4 sentence description,
all connected, laid out on a 610px column grid.

**Session length is 3–5 terms, decided 2026-09-20**, per the Design
Brief. Every built screen, the progress ring's 25% steps, the
fraction and the +22 XP total currently hardcode exactly four. As
with the drill ladder, the screens illustrate the 4-term case and
this doc carries the rule. Supporting 3–5 properly needs **a new
continuous session-progress ring** — the library's `progressIndicator`
has a fixed five-value `progress` variant that cannot express thirds
or fifths, and it stays untouched for everything else.

**Entry doors:** Exam plan, Quiz complete, Chat, Home (baseline),
Home + composer chip, Home + due-signal card, Picker. Plus the
Prove-it detail (the explicit unlock step off Quiz complete) and the
first-run unlock reveal.

**Core loop:** 00 Intro, 01 Idle/Commit, 02 Recording, 02a Captured,
03 Processing, 04 Pass, 07 Recap, 07a Practice picker.

**Branch states:** 01b Exit confirm, 04a Couldn't hear, 05 Miss+Hint,
05a Reveal answer.

**Requeue:** 06 Lock It In, 06b Lock It In (2nd pass).

**Definition Drill Down:** DD 00 / 00b intro, DD 01 full definition,
DD 02 Recording, DD 02a Captured, DD 03 Processing, DD 04–06 the
thinning passes, DD 07 Miss, DD 08 Complete, DD 08a Round tapped, plus
the scaffold states DD 07b (first letter) and DD 07c (echo).

Notes on specific screens:

- **02a Captured** sits between Recording and Processing: the
  transcript is shown *before* judging, so a misheard answer reads as
  "the app misheard me," not "I failed."
- **05a Reveal answer** matches the real reference (`IMG_7513`) and is
  now captioned and connected — it was previously an unwired
  standalone frame.
- **06b Lock It In (2nd pass)** had lost its title and transcript
  content; rebuilt as a real success result.
- **DD 08 Complete** shows a `trainingLog` of however many passes
  actually happened — row count is variable, matching the drill.

## Screens these decisions created, not yet built

Recorded 2026-09-20. Every one of these is a direct consequence of a
decision above, not a wishlist.

| Screen | Why |
|---|---|
| Home, pre-unlock (no chip) | The baseline home state. See "Where it lives" |
| Mic permission primer | Design Brief F5. Never built at 390 |
| Primer + drawn iOS permission sheet | So Allow / Don't Allow is a real fork in the prototype |
| Permission denied — session choice | "Type this session, or fix mic access?" |
| Text fallback turn | Idle with a text field in place of the mic |
| Text "checking" beat | The typed path's equivalent of Processing. No Recording state needed |
| 03 Processing + confidence tap | Also DD 03. Knowie animates while the verdict waits |
| Processing, escalated copy | Judge slow past target: "still thinking" in place, no new screen |
| Network held-take | Between Captured and Processing: "saving your answer", retries on reconnect |
| Picker, seeded first run | Populated from the unlocking session |
| Blank-term prompt | "Say whatever you've got", then reveal |
| Say-it-back result | The 1 XP repeat after a reveal |
| Transcript sheet ×3 | Passed / revealed / skipped content, each on its own branch screen |
| Session resume | Implied by banking XP on leave. Nothing in the 39 covers returning |

## Component bugs

- **~~`optionRow`'s label text cannot be reliably resized.~~
  RESOLVED — root cause found.** Two settings combined: the
  component's vertical auto-layout had `primaryAxisSizingMode: FIXED`,
  which in a vertical layout locks the *height*, so the row could
  never grow for a second line; and the label was set to
  `WIDTH_AND_HEIGHT`, so it hugged its own width and could never wrap.
  Fixed on all four variants (primary axis AUTO, label STRETCH +
  HEIGHT). A two-line label now produces an 80px row instead of a
  clipped 56px one. **The "build a custom frame for wrapping copy"
  workaround is retired** — screen 01b's eight custom rows and two
  custom buttons have been replaced with real instances.
- **~~`statChip` looked correct but wasn't bound to its tokens.~~**
  Fixed in an earlier pass; genuinely bound now. The takeaway still
  stands: this kind of drift is invisible by looking, only checking
  the actual binding catches it.

## Process notes, worth reading before touching this file again

- **A bottom sheet must live on its own branch screen, never baked
  into a screen meant to represent a default state.** Three instances
  so far. Check any screen using `showBottomSheetBackground`.
- **A screen's name and annotation can describe content that isn't on
  the frame. Five instances now**, and the newest has a different
  cause worth naming separately: the due-signal card *was* designed
  and *was* on its frame — with `visible: false`. Every check that
  looked at the rendered screen found an empty shell, and a previous
  pass wrongly concluded it had never been designed. **Check `visible`
  on a frame's children before concluding a screen is empty.**
- **NEW — z-order is load-bearing for the recording screens.** The
  listening rings, hold-to-pause caption and re-record pill are loose
  *siblings* of the recording screens, not children. On 02 Recording
  all three rings were present, positioned, visible and at full
  opacity — and invisible on canvas, because they sat at z-index 16–18
  while the screen sat at 105 and painted over them. Position alone
  isn't enough; after any move or re-clone, check the order too.
- **NEW — reparenting nodes inside a screen instance can corrupt it.**
  Grouping the swipe chip and its dots inside an instance left
  dangling internal references that crashed the renderer on three
  screens. They had to be rebuilt. Prefer spacers and layout settings
  over reparenting inside instances.
- **The progress ring's fill is a component `progress` property**, not
  something to resize by hand. The fraction label beside it is a
  separate plain text node needing `textAutoResize: NONE` and an
  explicit width to center.
- **Recording overlays are still loose siblings.** Parenting them into
  their screens as absolutely-positioned children remains the single
  highest-value structural cleanup left in this file. Flagged
  repeatedly, still not done.

## Components added this sprint

`swipeChip`, `swipeDots`, `bottomSheet`, `dueSignalCard`,
`pickerTopicRow`, `pickerDrillRow`, `trainingLog`, plus the earlier
`sessionHeader`, `drillListItem`, `strengthMeter`, and the Lucide
`micGlyph` / `refreshGlyph`.

The obsolete four-segment `strengthMeter` was deleted; the
continuous-fill version is the only one.

**Still to build, 2026-09-20:** a continuous session-progress ring
(3–5 terms, see Screens above), and `bottomSheet` needs three content
variants for the adapting transcript sheet.

**`appBar`'s exit icon is now cheap to change.** The glyph is an
`INSTANCE_SWAP` property on a nested `iconSlot`, but the nested
instance is not exposed, which is why changing it looked like a
39-screen detach. Exposing it on the component once surfaces the
property on every instance. See open question 1, now resolved.

See the Design System doc for the rules that don't fit in a Figma
description field, particularly `bottomSheet`'s own-branch-screen rule.

## Not building this sprint

- Knowie speaking (voice out).
- Auto-endpointing.
- A hint that accepts a reply or branches into conversation.
- Second hint.
- Mid-answer language switching.
- Mic-busy handling.
- XP inside Definition Drill Down.

## Open, unresolved, needs a decision from someone

1. ~~**Back arrow vs. X.**~~ **RESOLVED 2026-09-20 — X.** Both real
   references (`IMG_7511`, `IMG_7538`) show an X. This was deferred
   on the belief that changing it meant detaching `appBar` on every
   affected screen; that turned out to be false. Expose the nested
   `iconSlot`'s instance-swap property on the component once and all
   39 screens pick up the change with nothing detached.
2. ~~**Whether Reveal should cost less than an unaided pass**~~ —
   **RESOLVED 2026-09-20: Revealed earns 0**, and the say-it-back repeat
   (+3) carries the reward instead. See the XP model above.
3. **Unaided's exact XP value (+10)** is an informed guess, not a
   verified number.
4. ~~**Due-signal card vs. plain home chip.**~~ **RESOLVED** — they're
   plan-gated states of one feature, not alternatives. See "Where it
   lives."
5. ~~**05a isn't wired.**~~ **RESOLVED** — captioned and connected.
6. ~~**`optionRow`'s resize bug.**~~ **RESOLVED** — root cause found
   and fixed. See "Component bugs."
7. **NEW, and the most consequential — the coverage judge.** The
   drill's meter needs per-pass unaided-coverage scoring. If that
   can't be built reliably, the variable-length design reverts to
   counting passes and most of the drill's copy needs rewriting.
   **Unconfirmed with engineering.**
8. **NEW — per-word stumble tracking.** The scaffold needs a
   stumble count per word, scoped per definition per session.
   **Unconfirmed with engineering.**
9. **NEW — drill eligibility data.** The picker's drill list assumes
   per-student, per-definition Recap-bucket tracking (only definitions
   already attempted appear). **Unconfirmed with engineering.**
10. ~~**NEW — no elevated-surface token.**~~ **RESOLVED 2026-09-20.**
    An `optionRow` inside a `bottomSheet` resolves to the same fill as the
    sheet and vanishes; the raw 6% white patch stays and is documented as the
    one sanctioned literal in the system. Don't copy it to the next nested
    surface — add `background.raised` properly instead.
11. **NEW — swipe timing is a guess.** 300ms, matched to common iOS
    carousel timing, not verified against a reference or prototype.
    Same epistemic status as the +10 XP value.
12. **NEW 2026-09-20 — worst-case session length is unbounded.** The
    working assumption is that Partial is a real and common outcome.
    If it is, the hint ladder fires on most terms and requeues extend
    the session further — and the decision taken was to let it run and
    let requeue absorb it. That is a direct bet against the 70%
    completion target, made deliberately, but nothing caps it. If
    completion is the number that matters most, this is the first
    thing to revisit.
13. **NEW 2026-09-20 — the chat door unlocks a gated picker.** The
    chip unlocks from any first encounter including chat, where the
    student has revised nothing; but the picker only offers revised
    material. Seeding the picker from the unlocking session patches
    the empty case, and it doesn't resolve what a chat-unlocked
    student's picker should contain on their *second* visit.
14. ~~**NEW 2026-09-20 — `strengthMeter` is unbound and its ramp runs
    backwards.**~~ **RESOLVED 2026-09-20.** Same four-step mechanism, palette
    colours, running *brighter* as it fills: `accent.green.subtle` →
    `accent.green.bold` → `text.success`, track on `background.stacking`, all
    token-bound. The original literals (`#c0dd97 → #97c459 → #639922 →
    #3b6d11`) darkened toward near-black, so a full meter was the least
    visible state — and the palette's own greens can't darken legibly anyway.
    This was the third instance of invisible binding drift in this file. Same unbound issue in `trainingLog`, `sessionHeader`,
    the picker/drill mic circles, and `dueSignalCard`'s stroke —
    which uses a different amber from `swipeChip`'s
    `feedback.warning.bold` despite being the same due-signal accent.
15. **NEW 2026-09-20 — nine of the eleven new components are not
    instanced anywhere.** The screens use hand-built frames *named
    after* the components: `swipeChip` and `swipeDots` on the home
    screens are FRAMEs, not instances; DD 08a's `transcript sheet` is
    a FRAME, not a `bottomSheet`; DD 08 uses four `optionRow`s rather
    than `trainingLog`; the picker has no `pickerTopicRow` or
    `pickerDrillRow` instances at all. Only `recallResult/Captured`
    and `strengthMeter` are genuinely in use. This is the
    name-describes-content-that-isn't-there failure mode one level
    up: the component exists, the screen just doesn't use it.

## What a reviewer should look at first

If you have ten minutes: the **Definition Drill Down** block in
Complete Flow, specifically the three stumble-scaffold screens
(DD 07 → 07b → 07c). That's where the most new thinking is, and it's
the part that depends most heavily on the two unconfirmed engineering
capabilities above. If the judge can't score unaided coverage, that
block is the thing that changes.
