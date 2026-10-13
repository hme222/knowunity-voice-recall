# Code history

The long, dated reasoning that used to live inline in the source: why a value is what it is, which review or
designer decision changed it, and what broke before. Moved here on 2026-10-13 (engineering reviews: the narrative
was about a quarter of the source and drowned the logic). Each entry is verbatim. In the code, the comment is now
its first sentence plus a link to the entry below. Current behaviour is in docs/current-state.md; decisions are
in docs/sprint-context.md.

## `src/app/door/chat/page.tsx`

### H-001

Above: `export default function ChatDoor() {`

Door 3, chat — Figma frame "Chat (placeholder — existing door, refreshed)"
(15672:24166). The content-aware door: the offer is prefilled off a real
conversation, so it arrives already about something.

The frame shows the XP line above the mascot. It is the only door that does, because
chat is the one that already has a running XP context around it.

## `src/app/door/door.module.css`

### H-002

Above: `/* Gap at space.400, not betweenSections — the same trade the drill makes, for the same`

The four door screens. All are the same shape as the frames: a centred content block
in middleContent, and a two-button action row.

Deduped 2026-09-24. This file carried two `.body` and two `.doorActions` definitions
and the header comment twice — the cascade took the later one, so an edit to the
first silently did nothing. Found while fixing the door mics, when a gap change had
no effect at all. Same shape as recap.module.css, which was three concatenated
copies.

### H-003

Above: `.body {`

Gap at space.400, not betweenSections — the same trade the drill makes, for the same
reason. These screens carry a long question bubble above the mic's fixed region, and
at 24 they ran 6 to 8px past it, which is enough that margin-top:auto cannot pull the
region back: the mic landed at 480 and 482 against 466 everywhere else. The gaps give
way so the control does not.

## `src/app/door/doors.ts`

### H-004

Above: `export type DoorId = 'quiz' | 'exam-plan' | 'chat'`

The doors: the three places Say It Back is met for the first time.

Until a door has been shown, the feature does not exist on home — there is no chip
(docs/sprint-context.md § "Where it lives"). That makes a door the real first screen
of this prototype, and the reason the flow previously began one screen after its own
beginning, with a demo button standing in.

The rule these carry: IT IS THE SHOWING THAT UNLOCKS, NOT THE COMPLETING. Both of a
door's actions lead to the reveal, because by then the student has seen the offer.

## `src/app/door/exam-plan/page.tsx`

### H-005

Above: `export default function ExamPlanDoor() {`

Door 2, the exam plan — Figma frame "Exam plan (placeholder — existing door,
refreshed)" (15672:23959). A step inside a plan the student already has, so Knowie
asks in a bubble rather than announcing a feature.

The frame marks this a placeholder: the plan around it is the real app's and is not
ours to reproduce. What is real is the door itself and where it leads.

## `src/app/door/missed/page.tsx`

### H-006

Above: `export default function DoorMissedPage() {`

A door run that ended without a pass: revealed, skipped, or lost to the mic. No
Figma frame; added 2026-10-12 (designer, option 1a from the usability review).

A door run is one definition (sprint-context, 2026-10-12) and used to go straight to
the "Say It Back feature unlocked" popup whatever happened, so a student who skipped
or was shown the answer got a celebration and nothing about the definition. The
start screen promises step 3, "See how it landed". This is that step for a miss: the
definition to take away, a way to try again, and only then the unlock. A pass already
has its own result (the quiz door's, or 04 Pass).

## `src/app/door/quiz/page.tsx`

### H-007

Above: `export default function QuizCompleteDoor() {`

Door 1, Quiz complete — Figma frame "Quiz complete — Prove It Again, Option 1
(CHOSEN, refreshed from production)" (15672:24061).

THIS IS THE FIRST SCREEN OF THE PROTOTYPE. Say It Back has no chip on home until a
door has shown it, so the flow cannot start on home — it starts here, at the end of
something the student was already doing.

Both actions lead to the reveal: it is the showing that unlocks, not the completing
(docs/sprint-context.md § "Where it lives").

## `src/app/door/quiz/result/page.tsx`

### H-008

Above: `export default function QuizDoorResult() {`

Door 1's result — Figma frame "Prove It Again — term result" (15672:19827).

The one-term version of 04 Pass: same card, same echoed transcript, but no session
fraction and no XP line, because a door run is not a session. Continue goes to the
reveal, which is the first time home has ever shown the feature.

## `src/app/drill/Cue.tsx`

### H-009

Above: `export function Cue({ text, className }: { text: string; className?: string }) {`

A thinned definition, with its blanks DRAWN rather than typed.

The cues store their gaps as runs of underscores. Rendered as text in Greed those
come out as a row of separate dashes — the glyph does not span its advance width —
so a blank read as several small marks instead of one line. Before that they were
literal U+25A2 WHITE SQUARE characters, which read as boxes.

Both attempts were the same mistake: a blank is a piece of UI, not a character. This
draws each run as a rule sized in `ch` from the number of letters removed, so the gap
is proportional to the word, continuous at any font size, and independent of whatever
the typeface does with `_`.

It announces as "blank" rather than letting a screen reader read the underscores out.

## `src/app/drill/complete/page.tsx`

### H-010

Above: `// The climb as a step meter, not a four-row list — designer, 2026-10-12. The list was`

DD 08 Complete — Figma frame "DD 08 Complete — definition reassembles"
(15782:12475). Meter full, Knowie's warm arrival, no badge.

The training log shows however many passes actually happened. The frame's footer
reads "all four takes"; that copy is a leftover from the fixed ladder and is not
reproduced — the count is derived.

No XP anywhere. Deliberate: the drill is practice, not scored performance.

### H-011

Above: `const ROUNDS = [`

The climb as a step meter, not a four-row list — designer, 2026-10-12. The list was
what pushed this screen 62px past 390x668; four steps on one line say the same thing
at a glance, and each still opens that round's take. Round 2 is where the mock
stumbles (see /drill/processing), so it carries the mark. Built inline: see
component-gaps.md.

### H-012

Above: `<div className={actionRowClass}>`

The same SHAPE as 07 Recap, not just the same variants. This matched Recap's
Primary/Secondary vocabulary and then stacked the pair full-width in the
opposite order — Done on top, Run it again beneath — while Recap puts them
side by side with "Run it again" always left. The comment claimed parity; the
position was never part of what got checked. Two screens, identical choice,
same row and same order now.

## `src/app/drill/complete/round/page.tsx`

### H-013

Above: `const ROUNDS = [`

DD 08a — a round tapped on Complete raises the transcript sheet.
Figma frame "DD 08a Round tapped — transcript sheet" (15800:19333).

Its OWN branch screen, with Complete rendered behind it. A sheet is never baked into
a screen that represents a default state — the mistake this file has made three
times. ScreenShell does have a showBottomSheetBackground prop, and this route
sets it: turning it on is what marks the route as a sheet branch.

Rows use PickerRow's `raised`: on background.surface inside a surface-filled sheet
they would resolve to the same value and vanish.

### H-014

Above: `const tapped = Number(useSearchParams().get('round') ?? '0')`

Which row was tapped. DD 08's caption says "Tap any round to see all 4 takes" and
every row opened this sheet in an identical state, so the tap was real but its
target never acknowledged it. The subtitle names the round now.

PickerRow has no `active`/selected prop — checked against its Storybook docs, which
list variant, label, state, raised and type. Marking the tapped ROW would mean
adding API to a component whose Figma set does not have it, so this says it in the
sheet's own copy instead.

## `src/app/drill/drill.module.css`

### H-015

Above: `.body {`

Definition Drill Down. A different mode from the recall loop: no XP, no verdict
badge, and the meter is the only progress signal.
The built screens carry the progress ring at 25/50/75/100 — the fixed-ladder
fallback, shipped by decision (SPEC.md Open 5). The doc's variable-length model is
the intended version.

### H-016

Above: `.frameBody {`

Gap at space.400, not betweenSections.
These screens carry more than a session screen does — mascot, chip, a card, a nudge,
a cue, and the mic's fixed region — and at 24 the gaps alone put the content 52 to
152px past the region, where the sticky mic rendered on top of the cue text it is
meant to sit under. The room has to come from somewhere and the gaps are the cheapest
place; the alternative was compressing the mic region, which is what made the control
sit at four different heights across this flow.

## `src/app/drill/intro/page.tsx`

### H-017

Above: `function DrillIntro() {`

DD 00 / 00b — drill intro. Figma frames "DD 00 Entry framing (first time ever)"
(15782:12588) and "DD 00b Entry framing (returning, compressed)" (15782:12675).

Two states on one route: first run explains the mechanic, the return visit is
compressed to the one rule. Static on purpose so it becomes a ritual.

No XP is mentioned anywhere, deliberately — the drill is practice, not scored
performance. If XP is ever added here, this copy needs rewriting.

## `src/app/drill/miss/echo/page.tsx`

### H-018

Above: `export default function DrillEchoPage() {`

DD 07c — third stumble, echo. Figma frame "DD 07c Miss — 3rd stumble (echo)"
(15810:11151).

The task bends until it is always completable: Knowie gives the word, the student
repeats it. THE LOOP TERMINATES HERE — that is the point of the scaffold. A stuck
student cannot cycle forever, because the third rung is a task nobody can fail.

Echoing barely fills the meter, because echoing is not unaided recall. That is the
honest trade: the student always gets out, and the meter never lies about how.

Built on DD 07's shape. The word to echo is the card's body, at echo size, so the
one thing the student has to say is the one thing the card is for.

## `src/app/drill/miss/letter/page.tsx`

### H-019

Above: `export default function DrillLetterPage() {`

DD 07b — second stumble on the SAME word. Figma frame "DD 07b Miss — 2nd stumble
(first letter)" (15810:11025).

The word stays visible with its first letter shown: a prompt, not a giveaway. The
meter barely moves, because a prompted recall is not an unaided one.

Scaffold state resets per definition, per session — which needs a per-word stumble
count, unconfirmed with engineering (docs/sprint-context.md open question 8).

Built on DD 07's shape: mascot, verdict, neutral result card, the prompt card, then
the mic alone. The graded red card and the full-bleed meter are not in this family.

## `src/app/drill/miss/page.tsx`

### H-020

Above: `export default function DrillMissPage() {`

DD 07 — first stumble. Figma frame "DD 07 Miss — local correction, keep going"
(15782:12362).

Reveal the missed word, retake the pass. The meter HOLDS — it does not drop. A
student must never watch progress go backwards for asking for help, which is the
second of the two rules the whole variable-length design rests on.

The transcript trails off mid-sentence, as on the frame: it shows where they got to,
which is what makes the missed word land.

REBUILT TO THE FRAME 2026-09-21, two differences worth naming:
  1. NO METER. The frame does not show one here at all. The built screen carried one
     labelled "Held while you get this one", which was explaining an absence.
  2. The result card is NEUTRAL. RecallResult state="Miss" paints it #532831 with a
     red title; the frame is a grey card with a white title. The drill is practice,
     not scored performance, so a miss here is not an error and must not be dressed
     as one. Built inline — see component-gaps.md.

## `src/app/drill/pass/[step]/page.tsx`

### H-021

Above: `export default function DrillPassPage({ params }: { params: Promise<{ step: string }> }) {`

DD 01 / 04 / 05 / 06 — the thinning passes. Figma frames 15782:11696, 11950, 12053,
12259. One route with a [step] rather than four near-identical files: the screens
differ only in their cue and meter value.

No StrengthMeter (designer, 2026-10-12): the green coverage bar under Knowie was a
second progress signal beside the top bar's, and it cost the cue its room — the cue
faded at 390x668. Progress is the top bar and its N/4.

"Knowie grows a step each pass" used to be the second half of that sentence, stated
as fact, and a review flagged it as a claim the screen contradicts — MascotSlot is
2XL on every rung. It IS a recorded intention (sprint-context.md § the drill, "Visual
metaphor"), so it is not stray prose; it is unbuilt. Checked against the frames
before attempting it: DD 01, 04, 05 and 06 all place `mascotSlot` at 120x120,
identical on all four, so the growth was never designed either. And it cannot be
built as written from what exists — the slot's next size up is 200px against roughly
48px of headroom here at step 4. sprint-context now carries it as an open question
rather than a behaviour; this comment no longer asserts it.

REBUILT TO THE FRAME 2026-09-21. This screen had been assembled from its parts in a
different order: a full-bleed labelled meter first, the instruction and the cue as
two loose paragraphs, the term as plain text, and the mascot pushed down beside the
mic. DD 01 reads top to bottom: mascot, meter, term pill, one card carrying the
instruction AND the cue, then the mic alone in the space above the actions.

## `src/app/drill/processing/page.tsx`

### H-022

Above: `function DrillProcessing() {`

DD 03 Processing — Figma frame "DD 03 Processing" (15782:11891).

Load-bearing in a way the core loop's Processing is not: this is where the pass is
scored for unaided coverage, and that score drives the meter. If the coverage judge
can't be built, this step becomes a pass counter and most of the drill's copy is
wrong. See docs/sprint-context.md open question 7.

No confidence tap here. That exists to make Recap honest about belief, and the drill
has no Recap and no XP.

## `src/app/drill/recording/page.tsx`

### H-023

Above: `const stumble = useSearchParams().get('stumble')`

Where Done speaking goes. The scaffold's own screens used to hand their mic a
`router.push` to the NEXT screen — /drill/miss/letter's mic went to
/drill/miss/echo, /drill/miss/echo's went to /drill/pass/3 — so the one rung that
asks the student to say a word out loud with Knowie completed without anyone
saying anything, and the mic was a control that advanced rather than recorded.
They route here now and this decides where they land.

## `src/app/globals.css`

### H-024

Above: `.screenTitle {`

---- Screen title ----
ONE scale for every screen title, Headline S over Body M Regular, which is how the
Complete Flow frames draw them: a loose text node, not a `textBlock` instance.

There were four scales before this. "Say It Back" was 21px on 00 Intro and 44px on
the picker — consecutive screens — the permission primer used 76px Display M, whose
own token description reserves it for "hero numeric moments" and whose three lines
ate 228px of a 620 region, and five more screens sat at 44px.

It lives here rather than in a component because it is not one: `TextBlock` is
faithful to its own Figma set (9003:9039), which really does have sizes that large.
The frames simply do not use textBlock for screen titles. A global utility is the
honest shape for "how this app sets a screen title".
Decided 2026-09-22, docs/sprint-context.md.

### H-025

Above: `.srOnly {`

A screen's h1 when its visible title lives in a component that is not a heading
(ChatBubble, RecallResult). Read by screen readers, not drawn. The session, drill and
door screens had no h1 at all (UX critic, 2026-10-12, axe page-has-heading-one), so
a screen-reader user landing on one had no heading to say where they were. Same
technique as Button's hidden label.

## `src/app/home/HomeShell.tsx`

### H-026

Above: `/** iOS status bar. Real chrome on the frame, so real chrome here. */`

The host app's home, built to Figma frame "Home card — where Say It Back lives,
native and unmodified" (15674:34093).

It used to be a stand-in: a left-aligned greeting and two grey "Your study plan" /
"Recent notes" boxes that appear on no frame. The point of this screen is that Say
It Back is judged where it actually lives, and a placeholder cannot show that — the
chip's competition for attention IS the design question. So this is the frame:
status bar, app bar with the streak chips, Knowie over a centred greeting, the tool
chips, the composer, the tab bar. Say It Back's own surfaces arrive as `children`,
in the frame's slot, 64 below the greeting.

Two honest differences, both recorded in the build report:
  - The tool and tab glyphs in Figma are bespoke multi-colour artwork exported as
    rasters. These are the Lucide equivalents, which is the house icon convention.
  - The frame's chips row stacks duplicates at identical positions (Flashcards and
    Summarize each appear twice, one under the other). That is a layering artifact,
    not six chips: the distinct set, in the frame's order, is what renders here.

## `src/app/home/due/page.tsx`

### H-027

Above: `function DueHome() {`

Home, plan active — Figma frames "Home due-signal — priority card, quiz due date
(chosen)" (15675:44721) and swipes 2 and 3.

The chip and the due-signal are not competing directions; they are two states of one
feature, gated on whether the student has a plan. The card is a reminder layer on
top of the chip, never a replacement — so the chip is present here too.

Swiping is real rather than three separate routes: the built frames are three states
of one carousel, and three routes would have implied three screens.

### H-028

Above: `<SwipeDots`

The dots ARE the non-gesture way through, so the swipe is not the
only route and nothing on screen describes a gesture it is not. The
full-width "Swipe to the next due quiz" button they replace was a
third way to do one thing and did not fit — the region's overflow
fade cut it in half.

## `src/app/home/home.module.css`

### H-029

Above: `.body {`

The home surfaces. Three states, gated first on whether the feature is unlocked and
then on whether the student has a plan (docs/sprint-context.md § "Where it lives"):
1. before first encounter — no chip at all
2. unlocked — the composer chip
3. unlocked + plan with due dates — chip plus the due signal

Rebuilt 2026-09-23 to Figma frame "Home card — where Say It Back lives, native and
unmodified" (15674:34093). The surround was previously a stand-in: a left-aligned
greeting and two grey placeholder cards that appear on no frame. Every value below
comes from the frame, rounded to the nearest token — the frame's appBar sub-tree is
a scaled instance, so its 10.884 / 36.279 / 43.535 / 21.767 are 12 / 40 / 44 / 24
at 0.907. Those are the numbers used.

### H-030

Above: `justify-content: safe center;`

`safe` centre, not plain centre. Centred flex overflows equally on BOTH sides, and
the half above the container cannot be scrolled to — so on the crowded home routes
Knowie's head was cut off with nothing to scroll. `safe` falls back to start
alignment the moment the content stops fitting, which is what makes the overflow
reachable and the shell's fade honest.

### H-031

Above: `overflow-y: auto;`

This region scrolls, the chrome does not. The tool chips, the composer and the tab
bar are the host app's furniture and pinning them is the whole point of a tab bar.
Without this the capped middle let its content escape the box instead of scrolling
it: on /home/due the swipe button and the second chip painted straight through the
tool row, with main reporting no overflow at all because nothing had grown.

### H-032

Above: `.middle[data-overflowing='true'] {`

Same fade as ScreenShell's own overflow rule, and measured the same way rather than
held on: sprint-context, "a content region that overflows shows a fade", and
/home/due sliced "Swipe to the next due quiz" clean through the middle with no cue
that more existed. An unconditional mask would dim the Say It Back chip on the
routes that fit. A mask reads only alpha, so `black` is "fully opaque", not a
colour.

### H-033

Above: `.mascotGroup {`

KNOWIE GIVES WAY, NOT THE CHIP — in one step, not a slide (2026-10-12). When the
middle would not fit with Knowie at the frame's 3XL, HomeShell sets data-compact and
Knowie is 2XL, the size it is on every other screen; past that the region scrolls.
The shrink used to be continuous flex: the hero was allowed to shrink below its own
content, so at 390x668 the greeting spilled into the slot and printed over the
doors on /home, and Knowie came out a different size on every home state.

### H-034

Above: `.groundShadow {`

The frame's ground ellipse: 134 x 24, at the foot of the 200 box.

A flat fill at scrim strength reads as a dark bar struck through Knowie's legs,
because the artwork's feet stop above the box edge. The frame's is a soft shadow, so
this fades out rather than ending on a hard rim — same token, same box, no edge.

### H-035

Above: `.greeting {`

32/32.651 Greed Condensed Heavy on the frame. headline-l is the nearest size token
(33); heavy and condensed come from the VF primitives the display style uses, so
nothing here is an untokenised literal.

A DELIBERATE DEPARTURE from "one screen-title scale" (sprint-context, 2026-09-22),
recorded here because an audit will otherwise read it as drift: every other h1 in the
app renders at 21 and this one at 33, and the mascot beside it is 176 against 96
everywhere else. Both come from frame 15674:34093. That decision governs the session
flow's screen TITLES; this is the host app's home and the line is a greeting, not a
title. If the two ever have to agree, the frame is what gives way, not this file.

### H-036

Above: `padding-block: calc((var(--spacing-semantic-tap-target) - var(--component-button-s-height)`

Room for the chips' 48 hit areas INSIDE the scroller. overflow-x: auto clips the
block axis too, so the ::after overlays below were cut back to the 32 the chips
paint at — measured 32 tall, a failed touch-target gate on the product's own entry
chip. Padding the row by (tapTarget - chip) / 2 and pulling it back with the same
negative margin keeps the layout exactly where the frame has it.

### H-037

Above: `.unlockWrap {`

The unlock popup, on Knowunity's own feature-intro pattern (reference/screenshots
36, 49, 61; designer, 2026-10-12: "the colors feel off brand"). The live app never
tints a panel violet or rings it: colour comes from one violet hero (here Knowie,
rising from behind the card's top edge as in 36), a small violet label with an icon
above the title, an all-white title and a grey line. A violet-filled, violet-edged
card with a violet word in the title was tried first and read as off brand.

### H-038

Above: `.tool::after {`

Hit area to 44pt without changing the paint.
These are the host app's chips and they are drawn at the size the frame draws them —
32 for a tool chip, 40 for the composer's new button. Growing the boxes would make
the row taller than the frame's; an overlay reaches the target size and leaves the
layout alone. Widths already clear 44 on every one of them, so only the block axis
needs it.

### H-039

Above: `/* The only one of these that is narrow as well as short: the composer's new button is a`

Hit area to 44pt without changing the paint.
These are the host app's chips and they are drawn at the size the frame draws them —
32 for a tool chip, 40 for the composer's new button. Growing the boxes would make
the row taller than the frame's; an overlay reaches the target size and leaves the
layout alone. Widths already clear 44 on every one of them, so only the block axis
needs it.

## `src/app/home/page.tsx`

### H-040

Above: `export default function HomePage() {`

Home, before first encounter. The baseline, and the state that was missing from all
39 frames: they assume the chip is already there.

Corrected 2026-09-20 — an earlier version of sprint-context said the chip is
"present in every home state". It isn't. Say It Back does not exist on home until
the student has met it once, by any door.

Moved off "/" 2026-09-21. This is not the start of the flow and never could be:
the feature does not exist on this screen. "/" is the quiz-complete door, which is
where a student actually meets Say It Back. This is here so the baseline state is
still reachable and the other two doors still have a home to sit on.

### H-041

Above: `<p className={styles.doorsNote}>Say It Back isn&rsquo;t here yet. It appears after you mee`

The tool chips, the composer and the tab bar are HomeShell's now — they are
the host app's chrome and were being rebuilt on each of the three home
routes. This route supplies only its own Say It Back surface, which on the
baseline is the absence of one.

No Say It Back chip. The only way to meet the feature is through a door.
These three stand in for arriving at one in the real app.

## `src/app/home/unlock/page.tsx`

### H-042

Above: `export default function UnlockPage() {`

Home, first-time reveal, after any door. Home with the Say It Back chip in its place
in the tool row, dimmed under a popup that says the feature is unlocked and why; the
chip alone stays lit, so "the chip below" points at something (designer, 2026-10-12:
a popup that darkens the rest of the screen). Reached by every door's back arrow and
its "Not now" — showing Say It Back is what unlocks it, not completing it.

## `src/app/permission/denied/page.tsx`

### H-043

Above: `function Denied() {`

Permission denied — a session-level choice, not a dead end.
voice-ux Principle 3: design the "No". The student must still have a way forward,
and that way is the text fallback. Telling them what they're missing and how to
re-enable is the difference between a fork and a trap.

Denied makes text sticky for the session: the mic can't work, so re-offering it
every term would be asking someone to do something they've already said they can't.

## `src/app/permission/primer/page.tsx`

### H-044

Above: `function Primer() {`

Mic permission primer, asked IN CONTEXT (designer, 2026-10-12, option 1b from the
senior review). It used to be a full screen between 00 Intro and question 1, so a
student met four screens of Knowie and a paragraph before the first question. Now
the question comes first, and this sheet opens over it on the first mic tap — the
moment the mic is needed. voice-ux Principle 3: never fire the OS request cold.
Modelled on Babbel, which asks at the speaking-practice moment.

`next` is where the mic tap was going; `alt` the typed route for "Type instead".

## `src/app/picker/page.tsx`

### H-045

Above: `export default function PickerPage() {`

Picker — Figma frame "Picker page — Say It Back + drill down" (15810:11285).
Where a student chooses what to practice: a topic for a full recall session, or a
single definition to drill out loud.

Gated, decided 2026-09-20: topic rows offer only revised material, drill rows only
definitions already attempted. Because the chip can be unlocked from the chat door
where nothing was revised, the picker is seeded with the material from whichever
session unlocked it — so the first visit is never empty. The seeded row says how it
got there, which is what stops one stale row reading as a broken picker.

## `src/app/session/SessionBar.tsx`

### H-046

Above: `export function SessionBar({`

The session's top bar, in one place. Every numbered-term screen used to build its own
— the same AppBar, ring and fraction, repeated a dozen times — and Skip lived in each
screen's action zone at a different size and position. Decided 2026-10-08 by the
designer: Skip sits top right, beside the bar, on every screen that offers it, and
the controls land in the same spot everywhere. The fraction sits under the bar.

### H-047

Above: `const state = useSession()`

The subject rides every session screen (designer, 2026-10-11): going from a
Chemistry quiz into Say It Back, nothing said it was still Chemistry, now out loud.
The run's context comes from the store, not the URL (dev review, 2026-10-12): the
door only rode some screens' query strings, so one door run read "Chemistry" on
idle and "Chemistry · 1/4" on its result; the practice label was only passed on
idle. The `door` prop still wins when given.

## `src/app/session/blank/[term]/page.tsx`

### H-048

Above: `export default function BlankPage({ params }: { params: Promise<{ term: string }> }) {`

A genuinely blank term — not a near-miss, nothing at all. This answers the Design
Brief's first open question, which had gone unanswered: encourage one attempt, then
reveal. A wrong attempt still beats silence for retrieval.

Distinct from Skip, which stays a silent exit. Skip is avoidance; this is a student
saying "I don't know this", which is different information.

### H-049

Above: `useEffect(() => {`

voice-ux.md §3: a denied mic stays denied for the SESSION, not for one turn. This
screen was mic-only, so a student already moved to typing could reach it from
/text/turn's "I don't know this one" and be handed a microphone they had refused —
the recording screen then rendered "LISTENING" with a running timer on a mic with
no permission. 01 Idle has had this redirect all along; blank and reveal did not.

### H-050

Above: `<MicButton state="Idle" label="Say whatever you've got" onClick={() => router.push(micGate`

One encouraged attempt, then the answer — voice-ux.md marks this state Must
and specifies exactly that. The mic used to push into the ordinary
recording pipeline with no marker, so a mid-length take landed on the
standard miss hint-ladder ("Try again", "One more go, then I'll show you
the answer") — a retry ladder offered to a student who has just said they
know none of it. It also inherited the scripted mishear, so a clean take
could come back "That one didn't come through" on the one screen that
promises nothing is scored against them. `blank=1` takes the verdict out
of it entirely: the take happens, then the answer.

## `src/app/session/captured/[term]/page.tsx`

### H-051

Above: `function CapturedScreen({ index }: { index: number }) {`

02a Captured — Figma frame "02a Captured — review before sending" (15785:13098).
Sits between Recording and the verdict: the student sees what was heard BEFORE
anything is judged, so a mishear reads as "the app misheard me", not "I failed"
(sprint-context § Screens).

Combined with the confidence ask, 2026-10-12 (designer, option 2b from the senior
review). Every attempt used to be record → submit → this screen → "Looks right" →
processing → "How sure are you?" → verdict: six beats before feedback, on a loop
with a 70% completion target. Now the transcript and the confidence question share
one screen, so both principles survive — the words before the judging, the call
before the verdict — with one beat fewer. Processing is a short wait with no ask.

## `src/app/session/exit/page.tsx`

### H-052

Above: `const REASONS = [`

01b Exit confirmation. Eight real reasons, matching IMG_7511. Tone stays light, no
guilt — this satisfies "never trap the student", it isn't a retention gate.

The note is the corrected version: per-term XP is banked, only the completion bonus
is forfeited (docs/sprint-context.md § "XP model", 2026-09-20). The frame's older
line said all session XP was lost, which contradicted the Design Brief's
"progress saves, returning resumes".

## `src/app/session/idle/[term]/idle.module.css`

### H-053

Above: `.body {`

01 Idle / Commit — the resting state of every term. Figma frame 15672:26255.

The frame stacks mascot, bubble, mic from the top with even spacing. The build used
margin-top:auto on the mascot to push it down, which is what produced the 170px gap
between the bubble and Knowie.

## `src/app/session/idle/[term]/page.tsx`

### H-054

Above: `useEffect(() => {`

Start the session clock here rather than only on 00 Intro. The doors go straight
to /session/idle/1?door=…, so a door run never ran startSession and the Recap's
Time chip read 0:00 on a session the student had just spent minutes on. 01 Idle is
the first screen of every entry path; the helper no-ops once the clock is running,
so terms 2-4 do not restart it.

## `src/app/session/intro/page.tsx`

### H-055

Above: `export default function IntroPage() {`

00 Intro is retired from the flow (designer, 2026-10-12, option 1b from the senior
review). With the popup already saying what Say It Back is and the mic asked for in
context on the first tap, an intro screen and a full-screen primer were two more
beats of Knowie-plus-paragraph before the first question. The route stays so old
links and the screens' own fallbacks (useRedirect to /session/intro) still land: it
starts a clean run and goes to question 1.

## `src/app/session/miss/[term]/page.tsx`

### H-056

Above: `useEffect(() => {`

The hint is on this screen, so the run now contains a hint for this term. Recorded
here rather than forwarded down the URL chain: 04a Couldn't hear's retry rebuilds
the query from scratch and used to lose `hinted`, so a term that was hinted, then
misheard, then answered came back bucketed Unaided and the Recap credited a cold
recall the student had been helped with.

### H-057

Above: `const lastRung = step ? !step.canRetry : false`

Where the student is on the ladder, as the card's headline (designer, 2026-10-12,
from the usability review). The second miss's warning was a faint caption in the
action zone that read as a footnote, and the third miss withdrew "Try again"
without a word. One hint by decision, so the rungs differ by what they SAY: the
second warns, the third says why the reveal is the only way on.

### H-058

Above: `{step?.canRetry && (`

Try again goes to an IDLE beat, not a live mic. It used to push straight
to /session/recording, so the timer was already running when the screen
arrived — no chance to gather yourself right after being told you were
wrong, and the hint you were about to use vanished with the screen. Two
students in testing named it as the moment they would put the phone
down, and one lost a 19-second take to it, mostly silence. 01 Idle
carries the hint through and starts when the student taps.

### H-059

Above: `{/* "Skip", like the other ten. sprint-context: "Skip has one placement and one`

No "See the full transcript" here. The card above already shows "You
said" and the transcript, so it repeated what was on screen — and it
opened the REVEALED sheet, which appends the definition. A tertiary link
was handing over the answer that "Reveal answer" exists to give, except
Reveal pays 0 XP while this route left the +7 and Try again intact.
The sheet is still reached from every Recap row.

### H-060

Above: `{/* No "Partially right" on the last rung: it sat over "That's three tries" and`

No PROVISIONAL XP here. "⚡ +7" sat in the same slot and style as the earned
"+10" on 04 Pass while Reveal pays 0 — a promise dressed as a balance.
sprint-context.md, 2026-09-22.

The confidence cost is different and stays: being sure and wrong is already
settled, not a promise, and hiding it would mean the one screen where that
cost is incurred never mentions it.

## `src/app/session/pass/[term]/page.tsx`

### H-061

Above: `const withHint = hinted || (!practising && outcome?.bucket === 'Hinted')`

The chip says how it was got, not only that it was (usability review, 2026-10-12):
a hinted or typed pass and a clean spoken one read identically but for the XP. The
bucket is the store's (it backstops a hint the URL dropped), except in practice,
where the stored outcome is the original run's, not this attempt's. Typed reads the
current attempt, which a spoken take clears.

## `src/app/session/processing/[term]/page.tsx`

### H-062

Above: `const unusable = verdictFor(index, ms, attempt, { practising }) === 'CouldntHear'`

The second state SPEC lists: judge slow past target. Copy escalates in place —
same screen, no state change, Knowie keeps breathing. voice-ux's triage calls for
"friendly, not a crash", and a new screen would read as an error.
A take the mock already knows is unusable gets no confidence question. Asking how
sure someone is about an answer that was never heard is a question the screen has
not earned, and it used to ask, then route to "that one didn't come through".

### H-063

Above: `const doorResult = verdict === 'Pass' ? doorResultHref(door) : null`

A tap that is given costs or pays something — the Design Brief's own test is
"overconfidence has to cost something", and sure/not-sure used to produce
identical screens and identical XP.
Recorded on 02a Captured, where the tap now happens.
A run that came through a door and landed a Pass goes to that door's own result
rather than into the session, which it was never part of. A Miss or a mishear
falls through to the normal verdict screens: the help they offer is the same
help, and a door run that goes wrong should not be a dead end.

### H-064

Above: `showBottomNavSlot`

Reserve the action zone before the question arrives. ScreenShell's own doc
says this flag exists so "a region that is on still reserves its height even
with nothing in it, which is what keeps the action zone in the same place from
screen to screen" — and here it keeps it in the same place from MOMENT to
moment: without it the wait jumped 60px the instant the ask appeared, and an unusable take has no ask at all.

## `src/app/session/recap/page.tsx`

### H-065

Above: `/**`

07 Recap — Figma frame "07 Recap (refreshed)" (15672:24456).

Four buckets, per-term XP, and the stat chips. Derived from the actual run: a
summary whose job is to avoid flattery cannot show a number the reviewer can see is
wrong (Design Brief: "overconfidence has to cost something").

Confidence reorders rather than relabels — a term the student was sure about and got
wrong sorts to the top of Worth revisiting. That is the whole surfacing mechanism;
there is no badge (decided 2026-09-20).

### H-066

Above: `const learnedTerms = [...outcomes.filter((o) => o.bucket === 'Revealed'), ...outcomes.filt`

Something the student did not have cold and has now: got with a hint, or shown the
answer. That is what this session taught; an unaided pass they already knew.
Every term the student needed help with, not only the first: with two revealed,
the card showed one and the other's definition was nowhere (senior review,
2026-10-12). Revealed first — those are the real gaps.

### H-067

Above: `{row.micTrouble ? (`

Any term the student was sure about and did not get first
time, not only the skipped ones. Gated to 'Worth revisiting' it
missed exactly the case the brief cares about: sure, wrong, and
then hinted or revealed — which since sureWrong went to 0 carries
no cost either, so the run showed nothing at all.

## `src/app/session/recap/practice/page.tsx`

### H-068

Above: `/** Why the term is on this list, in the student's terms. */`

07a Practice what I missed. Redesigned 2026-10-09 with the designer, replacing the
Figma frame "07a Practice what I missed — choose how" (15785:13615).

The frame asked "How do you want to practice?" over a list of terms, so the student
made two choices (which term, which method) with one of them hidden: a row was
preselected, and both methods were equal-weight Secondary buttons with nothing to say
how they differed. Now each row IS the action. The app recommends the method from
what happened to the term (recommendedMode), says why the term is there, and offers
the other method as a quiet alternative. "Practice all" runs every row in order and
comes back to the Recap once.

The drill is still OFFERED here, never entered mid-session (decided 2026-09-20).

## `src/app/session/recap/recap.module.css`

### H-069

Above: `.buckets {`

07 Recap — Figma frame "07 Recap (refreshed)" (15672:24456). No fraction here, which
is correct: the run is over, so there is no "N of 4" left to report.

Deduped 2026-09-23. The file was three concatenated copies of an overlapping rule
set — 35 selectors in 260 lines, twelve of them defined more than once, and the
header comment repeated three times. It came from restoring classes a regex had
eaten by appending the recovered block rather than merging it. Nothing rendered
wrong, because the cascade takes the last definition, which is exactly what this
keeps.

### H-070

Above: `.bucketLabel {`

Pinned. The region's overflow fade used to land on a bucket header — the label faded
to nothing and the row under it was invisible with no trace, which is a weaker cue
than the half-row the fade exists to replace ("a half-row is not an affordance",
ScreenShell). A sticky header cannot be the thing that fades: it holds at the top of
the region and the rows travel under it, so whatever the fade catches is always a
row.

### H-071

Above: `border-left: calc(var(--size-primitive-stroke-heavy-border) * 2px) solid transparent;`

A leading rule, coloured by bucket. Every row rendered identically — same fill,
same name colour, same XP colour whether the term paid 10 or 0 — so the only thing
separating "nailed it cold" from "flagged for revisit" was a grey section header
and the digit itself. The bucket is the one thing the Recap exists to communicate.
A left edge, not a card tint: the tint reads as a verdict, and this screen groups
rather than grades.

## `src/app/session/recording/[term]/page.tsx`

### H-072

Above: `function RecordingScreen({ index }: { index: number }) {`

02 Recording — Figma frame "02 Recording" (15672:20100).
Tap the mic to pause or resume; "Submit" ends the take and goes to review.
There is no cancel here — 02a Captured already offers Re-record, so discarding a
take is one tap through a screen that exists (SPEC.md § "Explicitly out of scope").

The take's duration selects the verdict downstream. It is carried in the query so it
survives the navigation without needing session state for a value used once.

### H-073

Above: `const segmentStart = useRef(0)`

Start of the CURRENT un-paused stretch, plus everything banked before it.

The take used to be scored as `Date.now() - startedAt` with `startedAt` set once on
mount, while `paused` only stopped the display interval. So the on-screen timer and
the scored duration disagreed the moment anyone paused: 0:12 on screen against
ms=31690 logged, and a student who paused to think was graded as though they had
been talking the whole time. The timer is the thing they trust, so the timer is the
thing the verdict is now taken from.

### H-074

Above: `if (verdictFor(index, took, Number(attempt), { practising: isPractising() }) === 'CouldntH`

A take the mock already knows is unusable does NOT get a review screen. 02a
Captured is "here's what I heard, send it or say it again" — it prints a clean,
complete transcript and asks the student to confirm it. On term 1 the scripted
mishear fired anyway, so confirming "Looks right" led straight to "That one
didn't come through", on the first term of the session. The app cannot show you
your words and then say it never heard them. Nothing was captured, so there is
nothing to review: go to the judging beat, which already routes an unusable take
to 04a without asking the confidence question either.

### H-075

Above: `<div className={styles.micStack}>`

The rings are centred on the MIC, not on the region. They are absolute
with no offsets, so they take their static position from this stack —
once the mic moved to the top of the region, a stack of its own is what
keeps them concentric. Offsets would not work: the pulse animates
`transform`, so a centring translate would be overwritten every frame.

## `src/app/session/recording/[term]/recording.module.css`

### H-076

Above: `.root {`

02 Recording — full-screen mic takeover. Figma frame "02 Recording" (15672:20100):
no mascot, no chat bubble.

The pulse rings are loose ELLIPSE siblings of the frame in Figma. Here they are
children of the mic, so they cannot be orphaned or buried in z-order — the failure
docs/design-system-update.md § 2 records, where all three were present, positioned
and invisible at once.

The rings carry their stagger in colour, not opacity: three alpha border tokens
rather than three raw opacity values, so nothing here is an untokenised literal.
Only `transform` animates.

### H-077

Above: `.micWrap {`

Same fixed region as every other voice screen. Without it the mic sat at y=383 here
and y=566 on 01 Idle, so it moved 183px on the tap that starts the recording — the
one tap where the control must not move. The rings are absolute children, so the
height comes from the region rather than from them.

The mic sits at the TOP of the region, not centred in it — matching ScreenShell's
.micRegion, which was moved at the same time so idle and recording still agree to
the pixel. That is what frees the bottom of the region for the status.

### H-078

Above: `.micCaption {`

BELOW the mic, which is where it belongs and where the frame has it.

It has been in three places. In the action zone it was 235px from the control it
describes. Centred in the region with the mic it ran 610-666 against a mic of
506-626, printing "Tap to pause" on top of the thing you tap. Moved above the mic it
was clear of everything and read as a heading for the screen rather than a caption
for the control.

What made below unusable was the mic being centred in a 200 region: there were 40px
under it and the caption needs 56. Top-aligning the mic gives the status the bottom
80 of the region, so it sits under the control, clear of it, and in the reading
order the sentence actually has — the mic, then what it is doing.

## `src/app/session/repeat/[term]/page.tsx`

### H-079

Above: `<Snackbar Text="Said it back in your own words." variant="Success" icon={<CheckIcon />} ch`

NOT "said back unaided". The student read the answer off 05a ten seconds
earlier, so unaided is the one thing this was not, and praise a student
knows they did not earn is worse than no praise. The +3 is for saying it
back in their own words, which is a real retrieval act and is what this
now claims.

## `src/app/session/resume/page.tsx`

### H-080

Above: `export default function ResumePage() {`

Session resume. Implied by banking per-term XP on leaving — the Design Brief says
progress saves and returning resumes, and nothing in the 39 frames covers returning.

The XP already earned is shown because that is the point: leaving cost the +5
finishing bonus, not the work.

## `src/app/session/reveal/[term]/page.tsx`

### H-081

Above: `export default function RevealPage({ params }: { params: Promise<{ term: string }> }) {`

05a Reveal answer — Figma frame "05a Reveal answer result" (15752:17156), which
matches the real reference IMG_7513: no verdict badge, a plain answer bubble, the
offer to say it back, and a quiet way on.

Revealed earns 0 (docs/sprint-context.md § "XP model", revised 2026-09-20). The
optional repeat carries +3, because saying it unaided under a cue is retrieval and
being told the answer is not. The repeat never changes the bucket: a revealed term
stays revealed however well it is repeated.

### H-082

Above: `useEffect(() => {`

voice-ux.md §3: a denied mic stays denied for the SESSION, not for one turn. This
screen was mic-only, so a student already moved to typing could reach it from
/text/turn's "I don't know this one" and be handed a microphone they had refused —
the recording screen then rendered "LISTENING" with a running timer on a mic with
no permission. 01 Idle has had this redirect all along; blank and reveal did not.

## `src/app/session/reveal/[term]/reveal.module.css`

### H-083

Above: `.body {`

05a Reveal answer.

This screen is a voice prompt — mascot, what Knowie says, mic — and it had been
borrowing result.module.css, which is the *result* stack: intrinsically sized, gap
16. That shape sizes to its content and spills, so the screen rendered 558 tall in a
554 region, clipped 4px and raised the overflow fade for nothing. It read as cut off
because it was.

Same shape as 01 Idle instead: fill the region, let the mic region's margin-top:auto
take the slack, and space at betweenSections like every other prompt screen.

## `src/app/session/transcript/[bucket]/page.tsx`

### H-084

Above: `const COPY = {`

The transcript sheet, reachable from the Miss result's eye icon and every Recap row.
Its own branch screen, per the sheet rule.

It ADAPTS by bucket, because not every term has a transcript:
  passed   → what the student said
  revealed → the attempt plus the answer they were given
  skipped  → the answer alone, since nothing was said
One sheet, three content states. Without this, Recap would have rows that open
nothing, or an eye icon on some rows and not others.

## `src/app/session/unclear/[term]/page.tsx`

### H-085

Above: `const repeated = attempt >= 2`

A second mishear is a different situation from the first. It used to render
byte-identically — same "a little closer to the mic" after the mic had already
failed once — so the screen kept asking for the thing that was not working.
voice-ux Principle 4: a mishear is the app's problem, so the escalation offers the
way out rather than blaming the student.

## `src/app/session/unclear/[term]/unclear.module.css`

### H-086

Above: `.body {`

04a Couldn't hear.

A voice screen, not a result screen: the whole point is to say it again, so it wears
01 Idle's shape — fill the region, mic pinned at the foot — rather than the result
stack it borrowed, which sizes to its content and leaves no room for a control.

## `src/app/start/page.tsx`

### H-087

Above: `// Rewritten 2026-10-12 after a UX and copy review: the screen is a prototype brief, so`

THE FIRST SCREEN IS A START SCREEN: what this is, the path, and what to know before
testing it. Not part of the product.

Rebuilt 2026-10-12 (designer: "feels confusing, provide key information for flow").
The five-step list described the journey but left out the two facts a reviewer needs
to actually drive it: there is no speech recognition, so how long you hold the mic
decides the result, and the first try on question 1 is scripted to miss you so that
state is always seen. The thresholds below are verdictFor's in src/lib/session.ts —
change them together.

At /start since 2026-10-12: the link now opens on /home/unlock (src/app/page.tsx).
Start goes there too, then the chip, 00 Intro, the mic primer and the four terms.
The doors are still reachable from baseline home at /home.

### H-088

Above: `const STORY = [`

Rewritten 2026-10-12 after a UX and copy review: the screen is a prototype brief, so
it says so; the story steps match what the reader actually does (the quiz is already
done); and the testing notes are plain sentences, not shorthand.
The path from home (designer, 2026-10-12): the unlock popup, its chip, then 00 Intro
and the session. It went to the quiz door, a one-definition run.

## `src/app/text/checking/page.tsx`

### H-089

Above: `function CheckingScreen() {`

The typed path's equivalent of 03 Processing.

IT NOW ASKS THE CONFIDENCE QUESTION TOO. It used to be "a brief checking beat, no
confidence tap", and that opened a hole in the one mechanic the Design Brief asks
for by name: a typist could never be confidently wrong, so the -3 never applied to
them and Recap's confidently-wrong sort was blind to typed answers. The cost the
brief demands could be dodged by typing. Verified before the fix: a typed pass
stored `wasSure:false, calibration:0` with no tap recorded at all.

sprint-context.md § "Added 2026-09-20" says the tap "occupies a wait the design
already had to cover" — this screen is exactly such a wait, so asking here follows
that decision rather than bending it. The dwell still runs first, so the question
arrives after the judging beat, never before it.

A drill turn is exempt: the drill is not graded and has no XP, so there is nothing
for a confidence signal to price.

### H-090

Above: `recordConfidence(index, sure, verdict === 'pass' ? 'Pass' : 'Miss')`

Same call 03 Processing makes, so a typed turn lands in the same ledger — but
with THIS path's own verdict, not a duration fed through the spoken mock.

It used to synthesise a fake take (`verdictFor(index, len >= 40 ? 6000 : 3000, 1)`)
and `verdictFor` returns CouldntHear unconditionally for the scripted mishear
term on attempt 1, while `recordConfidence` drops a CouldntHear on the grounds
that a take nobody heard is not evidence about belief. Both are right on their
own terms and wrong together: on term 1 of every typed run the screen asked how
sure the student was and threw the answer away. A typed answer cannot be
misheard, so this path has no business asking the mishear mock anything.

### H-091

Above: `showBottomNavSlot`

Reserve the action zone before the question arrives. ScreenShell's own doc
says this flag exists so "a region that is on still reserves its height even
with nothing in it, which is what keeps the action zone in the same place from
screen to screen" — and here it keeps it in the same place from MOMENT to
moment: without it the wait jumped 60px the instant the ask appeared.

## `src/app/text/text.module.css`

### H-092

Above: `.body {`

The text fallback turn. No Figma frame — the journey map has one card saying
"Idle shows the prompt with a text field instead of the mic, she types and taps
submit, a brief checking beat covers judging, then the same Result branches".
That card is the whole spec; the rest is built from voice-ux Principle 5.

The field is a local build — there is no text input in the component catalog.
Logged in component-gaps.md.

## `src/app/text/turn/page.tsx`

### H-093

Above: `function TextTurnScreen() {`

The text fallback turn. Not a "nice to have": some students can't speak, and many
more can't speak right now — a library, a shared room, a bus. voice-ux Principle 5.

No Recording or Processing equivalent is needed. The student types, submits, a brief
checking beat covers judging, and the same result branches follow.

`sticky=1` arrives from a denied mic: the mic can't work, so it isn't re-offered.
Situational typing (from 01 Idle's "Type instead") reverts to the mic next term.

### H-094

Above: `const state = useSession()`

Seeded from the student's own draft, and from NOTHING ELSE. The draft lived in
component state only, so Leave → "Keep learning" came back to an empty box on a
flow whose exit screen says "Your progress is saved"; it is written on every
keystroke now, which is what makes coming back mean anything.

The first version of this seeded from `answerFor`, which falls back to the canned
transcript — so on a first visit the box opened pre-filled with the correct answer.
I verified the round trip (type, leave, return) and never opened the screen cold,
which is the only path where the fallback fires.
The saved draft comes from the store (same snapshot on server and client), until the
student types; reading storage in the initializer mismatched on hydration (dev
review, 2026-10-12).

### H-095

Above: `useEffect(() => {`

The URL flag and the session flag were two sources of truth that disagreed. This
screen treated `?sticky=1` as equal to the stored flag and hid "Use the mic
instead" on it — but `typedByChoice`, which decides whether the answer is priced at
+10 or the typed-by-choice +7, reads only the stored one. So a turn reached by URL
showed a student their mic was unavailable and then charged them for not using it.
In the built flow 01 Idle only redirects here once the flag is already stored, so
this never fired by clicking; it fires the moment anyone opens the route directly,
which on a prototype meant for review is a path that gets taken.

### H-096

Above: `<MascotSlot size="2XL" expression="excited" className={styles.mascotCentred} />`

Knowie and the accented term, as on every voice screen. The typed path rendered
the title as one flat white string and had no mascot at all — voice-ux calls
text "an equal path, not a downgrade", and it was visibly the lesser one.
ChatBubble's own doc records why the accent exists: without it "the one word
the screen is about had no emphasis at all".

## `src/components/AppBar/AppBar.module.css`

### H-097

Above: `.root {`

appBar — mirrors the Figma component set `appBar` (9003:8606).
56 tall = a tapTarget row plus space.200 below. Background is background.page fading
to transparent (Figma: two unbound linear gradients of that colour), for content
scrolling underneath. The controls at each end are ButtonIcon and Button from the
catalog (see AppBar.tsx); nothing about them is styled here.

## `src/components/AppBar/AppBar.tsx`

### H-098

Above: `export const APP_BAR_VARIANTS = [`

Mirrors the Figma component set `appBar` (9003:8606): a "Top Nav Default" frame
holding one Slot, six variants for what sits around it. The left/right controls are
the library's "App Bar Button Icon" (48 hit area, no fill, 24 icon) and "App Bar
Button" (text, no fill). Both were rebuilt inline here until 2026-09-21; they are now
the catalog's own ButtonIcon (Tertiary, L: 48 hit box, 24 icon, no pill fill) and
Button (Tertiary, M: 48 hit box, label hugs the text). One difference worth naming:
the text button's type is Button's bodySBold rather than the frame's headlineXXSBold.
Same size, weight and tracking; only the line-height box differs (20 vs 16), and the
label is centred in a 48 box either way, so nothing visible moves.

## `src/components/BottomSheet/BottomSheet.tsx`

### H-099

Above: `export type BottomSheetProps = {`

Mirrors the Figma component `bottomSheet` (15813:37265). `Title` is its text property.

THE RULE, not just the shape: a sheet lives on its own branch screen and must never
be baked into a screen that represents a default state. That mistake has been made
three times in the Figma file, and the scaffold's `showBottomSheetBackground`
toggle is deliberately not reproduced in ScreenShell for the same reason.

Content rows need `background.raised`: an optionRow inside a sheet resolves to the
sheet's own fill and vanishes. PickerRow takes a `raised` prop for this.

### H-100

Above: `aria-labelledby={titleId}`

Labelled BY the visible heading, not a second copy of the same string. With
aria-label AND an <h2> carrying identical text, a screen reader announced
"dialog, What you said" and then "heading level 2, What you said" a beat
later. Snackbar already solved this for its own duplicate chip; the fix had
not reached here.

## `src/components/Chips/Chips.module.css`

### H-101

Above: `.root[data-interactive] {`

Interactive chips only: the <button> box itself is spacing.semantic.tapTarget tall,
and the pill inside it keeps its designed height. Transparent block borders make up
the difference and background-clip keeps the fill off them, so the pill paints at 32
(S) while the element measures 48. The previous version drew the hit area on an
::after pseudo, which extended what a finger could press but left the element's own
box at 32 — which is what every audit tool measures, and what the gate failed on.
The negative block margin gives the extra height back to the layout, so the pill sits
exactly where an inert chip of the same size would; the hit area overlaps the
neighbouring padding, never a neighbouring target.

## `src/components/Chips/Chips.tsx`

### H-102

Above: `return (`

A chip that does nothing is a LABEL, not a live region. It used to carry
role="status", which was the right instinct — stop announcing it as a button —
aimed at the wrong role: role="status" marks content that CHANGES and should
interrupt, and these never change. The cost showed up when one landed inside a
region that is genuinely live: 04a Couldn't hear puts the coral chip inside
RecallResult's own role="status", so "Try again" was announced as a second status
on top of the result it belongs to. No role: the text is read once, in order, as
part of the thing it labels.

## `src/components/ConfidenceAsk/ConfidenceAsk.tsx`

### H-103

Above: `export type ConfidenceAskProps = {`

"How sure are you?" — the Design Brief's own test, in one place.

Promoted 2026-09-22 under this repo's two-consumer rule: it was written inline on 03
Processing and then again on the typed checking beat, and the two had already begun
to differ. `component-gaps.md` had flagged it as awaiting its second consumer.

Why it blocks the verdict rather than sitting beside it: the tap has to be taken
BEFORE the outcome is known, or the signal is contaminated by knowing the answer —
and it costs no extra step because it occupies a wait the design already had to
cover (docs/sprint-context.md, "Added 2026-09-20").

## `src/components/DueSignalCard/DueSignalCard.module.css`

### H-104

Above: `.root {`

Figma `dueSignalCard` (15812:15287): 287×56, horizontal, gap space.300, pad 10/12,
surface fill, amber 1px border, fully rounded. An amber clock badge, a due label,
and the Say It Back action.
The border was a raw hex in Figma; bound to feedback.warning.border here, the same
token swipeChip uses — they are the same due-signal accent and were diverging.

## `src/components/DueSignalCard/DueSignalCard.tsx`

### H-105

Above: `export type DueSignalCardProps = {`

Mirrors the Figma component `dueSignalCard` (15812:15287). `DueLabel` is its one
text property.

The simpler one-quiz case. With several due, the swipeable swipeChip carousel
supersedes it on the flow — this is kept because one quiz due doesn't need a pager.

## `src/components/PickerRow/PickerRow.module.css`

### H-106

Above: `.root {`

Figma `pickerTopicRow` (15813:37270) and `pickerDrillRow` (15813:37281). Same shape —
318 wide, space-between, surface fill, radius 400, a trailing mic — differing only
in the left content: a topic name, or a term plus a state pill.
One component with a `variant`, because two components differing by one child is
two names for one thing.

Both were originally built as custom frames in Figma because of the optionRow resize
bug. That bug is fixed, but these are still not optionRow variants: optionRow has no
slot for a trailing action.

## `src/components/ProcessingBeat/ProcessingBeat.tsx`

### H-107

Above: `export type ProcessingBeatProps = {`

The wait, wherever it happens.

There were three of these and they were designed three different ways: 03 Processing
kept the app bar and showed three dots at mascot y=308; DD 03 pinned the meter to the
top with no dots at y=416; the typed checking beat dropped the app bar entirely at
y=358, so the chrome blinked for one screen mid-flow. Same job, three shapes.

One composition now. The mascot sits at one height, breathes as the "still working"
signal, and the dots are the same dots. What differs between the three is CONTENT —
a status line, an optional thing above it (the drill's coverage meter), and whatever
the screen puts in its action zone — not the shape of the wait itself.

Knowie breathing rather than a spinner is deliberate: the wait needs somewhere to
live that isn't a dead indicator (SPEC.md § Conventions, docs/voice-ux.md Principle
6). Both the breathe and the dots stop under prefers-reduced-motion, where the line
carries the state on its own.

## `src/components/RecallResult/RecallResult.module.css`

### H-108

Above: `.label {`

One eyebrow style for every state. It used to carry only a colour here and pick up
the body's 16px/400, while the Miss override set 12px/600 and RecallResultCaptured
set 12px/600 again — three renderings of the same "You said" label across three
cards that sit next to each other in the flow. captionMBold is the one the other two
already agreed on.

## `src/components/RecallResultCaptured/RecallResultCaptured.tsx`

### H-109

Above: `export type RecallResultCapturedProps = {`

Mirrors Figma's `recallResult/Captured` (15782:13076) — a sibling of the
`recallResult` set rather than a state of it, which is why it isn't a fourth
RecallResult state: nothing has been judged yet, so there is no verdict to show.

It is the review beat. The transcript is shown BEFORE judging, so a misheard answer
reads as "the app misheard me" rather than "I failed" — voice-ux Principle 4, given
its own screen.

Promoted from an inline card on 02a Captured when the drill's DD 02a became a second
consumer. See component-gaps.md.

## `src/components/RecordingStatus/RecordingStatus.tsx`

### H-110

Above: `export type RecordingStatusProps = {`

The three text elements on the recording screens: the LISTENING label, the elapsed
timer, and the pause caption under the mic. Loose text nodes in Figma; one component
here because all three describe the same state and must never disagree.

It does NOT own the clock. The page ticks and passes `seconds` — a component that ran
its own interval would make its story non-deterministic and flake the a11y run.

Only the state word is live. The whole block was one role="status" region, so a
screen reader re-read "Listening 0:05 Tap to pause" on every tick. The timer stays
in the DOM and readable on demand; it just no longer announces itself each second.

## `src/components/ScreenShell/ScreenShell.module.css`

### H-111

Above: `.root {`

Mirrors the Figma `scaffold` component set (variant size=iPhone 13), whose regions
are Panel Header 48 / topNavigation 56 / middleContent 570 / actionZone 136 /
bottomSheetOnly 34 = 844. The four chrome regions are fixed from tokens; the middle
flexes, so at an 844-tall viewport it computes to 570, and at
any other height it absorbs the difference rather than the shell scrolling itself.
`flex: 1` on .middle is a sanctioned exception — see SPEC.md § Conventions.

### H-112

Above: `.middle[data-overflowing='true'] {`

A fade at the foot of the region when it overflows, so a cut row reads as "more
below". Applied by the shell rather than per screen: four screens were slicing a row
mid-height with nothing to say more existed, and the only cue was the half-row
itself. `mask-image` rather than a gradient overlay so it works over any background
and costs no element.

### H-113

Above: `.micRegion {`

The mic's region, at the foot of middleContent on every voice screen.
It is a PREFERRED height, not a fixed one. Fixed at 200 it clipped: at 390x600 the
mic rendered at 454-574 with the content region ending at 430, so the primary
control of the screen was entirely below the fold and the fade masked the empty
clear-space above it — nothing on screen said a mic existed. The control must
survive a short window; the clear space around it is what gives way.

### H-114

Above: `flex-shrink: 0;`

DOES NOT SHRINK. It used to, so that a short viewport could reclaim the clear space
around the control — but shrink is not viewport-aware, and the drill's taller stack
(mascot + meter + term pill + cue card) claimed it at full height too. Measured at
390x844: the mic sat at 466 on every session screen and on /drill/recording, and at
478, 488 and 526 on /drill/pass/4, /drill/miss/letter and /drill/pass/1 — four
heights for the one control this region exists to pin. A short window is handled
by the content above scrolling in its own box, not by this region giving way.

### H-115

Above: `.bottom {`

FIXED, not min-height. It used to grow to whatever a screen stacked in it — six
values across 44 routes, 120 to 248 — so the zone's top moved by up to 128px as you
advanced and no control landed twice in the same place. It holds one row of up to two
controls, plus optionally one tertiary link beneath. Anything more belongs in
middleContent. See docs/sprint-context.md, 2026-09-22.

### H-116

Above: `.actionRow {`

The frames' action row: two pills that HUG their labels, pushed to the edges of the
zone. 01 Idle and DD 01 both draw "Type instead" left and "Skip" right with open
space between them, not two equal half-width slabs — which is what `flex: 1` on the
children was producing, and why a Tertiary Skip measured 173px here, 358px on one
screen and 48px on another.

## `src/components/ScreenShell/ScreenShell.tsx`

### H-117

Above: `export type ScreenShellProps = {`

The React counterpart of the Figma `scaffold` component set, variant `size=iPhone 13`.
Every screen in Complete Flow is an instance of it, so every screen here fills its
slots rather than laying itself out. See SPEC.md § Conventions and
docs/design-system.md § "The scaffold".

The three booleans mirror the Figma component's own toggles. Per design-system.md:
"These control visibility, they don't remove the underlying slot" — so a region that
is on still reserves its height even with nothing in it, which is what keeps the
action zone in the same place from screen to screen.

### H-118

Above: `const hasMic = mic != null`

When the content does not fit, Knowie gives way before the words do: 0 = as
designed, 2 = out. Every screen, not only voice screens — attempt 2's hint was
scrolled out of sight on a screen with no mic (designer, 2026-10-08). No shrunk
stage: Knowie at XL read as too small, so it is full size or not there. The stage is
chosen from the layout AS DESIGNED — the attribute is lifted for one synchronous
read and put back — so it never reads its own effect and cannot flip-flop.

### H-119

Above: `<div className={styles.panelHeader} aria-hidden={panelHeader ? undefined : true}>`

Panel Header — the status-bar region, and a real slot as of 2026-09-23. It was
a reserved 48 of nothing on the reasoning that the real app's Status Bar is an
external-library component. Home is built to a frame that HAS one, and with no
slot the status bar had to go into topNavigation, which is a fixed 56 with
overflow:hidden — so it pushed the app bar out and the app bar simply vanished.
The scaffold has this region; the shell now exposes it.

## `src/components/SessionFraction/SessionFraction.module.css`

### H-120

Above: `.root {`

UNDER the progress bar, left-aligned with its start — decided 2026-10-08 by the
designer, who found the count overlaid on the ring hard to read. It used to sit on
the ring in a page-coloured pill so the fill could pass under it. Here it is clear of
the bar, so the pill has nothing to cut out of.

Placement, all from tokens: the bar is the AppBar slot's centred 16 (y 16-32 of the
56 region), so this starts space.100 under it at 36 and ends at 52, inside the region
without changing its height. The left edge is the AppBar's space.100 inset, the
tap-target close button, and the bar's space.100 gap.

## `src/components/SessionFraction/SessionFraction.tsx`

### H-121

Above: `export type SessionFractionProps = {`

The session fraction, e.g. "1/4". In Figma this is a loose text node in the
scaffold's topNavigation slot, centred under the progress ring — not part of appBar.
It is deliberately NOT bundled with appBar into a SessionHeader: 07 Recap has an
app bar and no fraction, and a component that forced one would change that screen's
design to suit the component. See SPEC.md § Conventions.

The ring beside it carries the same information visually; this is its text
equivalent, so it is aria-hidden and ProgressIndicator's own label does the
announcing. Two announcements of one fact is noise.

TWO THINGS IT NOW SAYS THAT IT DID NOT (2026-09-21). A student could not tell how
far off the end was:
  1. On the last term it says so — but only when it IS the last thing. "4/4" alone
     does not read as an ending until it is already over, and "4/4 · last one" is a
     lie if a requeued term is still owed. See `moreToCome`.
  2. The requeue is a named round, not a term number. The frames drew 06 Lock It In
     as 3/4 at 75%, which ran the bar 100% -> 75% -> 100% and made the session look
     like it had gone backwards.

It paints its own backing (2026-09-21). Overlaid on the ring, text.primary measured
13.95:1 over the empty track and 3.15:1 over the filled brand.bold — it got harder to
read as the session went on. No single text colour clears 4.5:1 against both, so the
text sits in a background.page pill: a cut-out in the bar, readable at any progress.

## `src/components/StrengthMeter/StrengthMeter.module.css`

### H-122

Above: `.root {`

The Definition Drill Down coverage meter.

IT BRIGHTENS AS IT FILLS, and that is the inversion of Figma, not a match to it.
This comment used to say "ALIGNED TO THE FIGMA RENDER 2026-09-21… Figma's ramp
darkens as it fills", which described the decision that was overturned rather than
the one that shipped — and the tokens file said both things at once, in two
descriptions dated the same day. Settled by rendering: 25% computes rgb(59,109,17),
100% computes rgb(192,221,151). Figma's own ramp does darken, which put a full meter
at 1.03:1 against the track and made the reward state the invisible one. Every hue
is still Figma's; only which rung carries which changed.

Every value here is a token.

## `src/components/StrengthMeter/StrengthMeter.tsx`

### H-123

Above: `export type StrengthMeterProps = {`

Mirrors Figma's `strengthMeter` (15808:17668), but continuous rather than stepped.

Figma's variants are fill=0|25|50|75|100 — a leftover from the fixed four-rung
ladder. The drill has no fixed length: the meter fills by how much of the definition
the student can say unaided, as coverage of the sentence, not by which pass they are
on. A strong student finishes in two passes, a struggling one in six. So `fill` is a
number here, and Figma's five values are sampled states of it.

Two rules this depends on (docs/sprint-context.md § "Definition Drill Down"):
  1. the judge must score unaided coverage per pass — unconfirmed with engineering
  2. help holds the meter, never drops it: a reveal or a miss parks it rather than
     reducing it. A student must never watch progress go backwards for asking.

Colour is bound to the Figma component render, including its darkens-as-it-fills
ramp. See the module CSS for why that was reverted to Figma on 2026-09-21.

## `src/components/SwipeChip/SwipeChip.module.css`

### H-124

Above: `.root:not([data-due='true']) {`

The BASELINE chip is one of the composer's tools, so it is sized like them.
It was 162x68 against Scan/Flashcards/Quiz at 40, which made "Say It Back" read as a
banner sitting above the tool row rather than a chip belonging to it. The due chip
keeps the larger box: it carries a term, a date and a count on two lines, and the
deadline is supposed to have more weight than a tool.

## `src/components/SwipeChip/SwipeChip.tsx`

### H-125

Above: `export type SwipeChipProps = {`

Mirrors the Figma component `swipeChip` (15813:37232). Props carry the Figma names
where they exist: `QuizLabel` and `Count` are its two text properties.

This is the Say It Back chip on home. With a plan and a due date it gains the amber
border and the count badge; without one it is the plain composer chip. Two states of
one component, not two components — the same relationship the chip and the
due-signal card have (docs/sprint-context.md § "Where it lives").

## `src/components/SwipeDeck/SwipeDeck.tsx`

### H-126

Above: `/** How far the pointer must travel before it counts as a swipe rather than a tap. */`

The gesture behind the due-signal carousel on home.

sprint-context.md § "Where it lives" says "the card is swipeable… each swipe shows a
different quiz". It was not: the only way to advance was a tertiary button reading
"Swipe to the next due quiz", which told the student to swipe and then required a tap.
Dragging the card did nothing and tapping it started the session.

Pointer events rather than touch events, so the same code serves a finger, a trackpad
drag and a mouse — and so a reviewer on a desktop browser can exercise it at all.

Three things this has to get right beyond "it moves":
  - Vertical scrolling must survive. `touch-action: pan-y` hands the browser the
    vertical axis and keeps the horizontal one.
  - A drag must not fire the card's own onClick. The card navigates into a session,
    so a swipe that also started the session would be worse than no swipe at all.
    `onClickCapture` swallows the click when the pointer actually travelled.
  - It must work without a pointer. Arrow keys move the deck, and the whole thing is
    a labelled group that reports its position.

## `src/components/SwipeDots/SwipeDots.module.css`

### H-127

Above: `.target {`

The hit area around an interactive dot.
The dot is 6px by design and the target has to clear 44pt, so the target is an
overlay rather than a bigger box: growing the button itself made a 48px row out of a
6px dot, which pushed the region into overflow and raised the scroll fade over a row
that was not actually cut. The button keeps the dot's footprint; `::after` reaches
out to 48 on both axes without touching layout.

### H-128

Above: `.root:has(.target) {`

Each target is a tapTarget-wide slot, edge to edge, so the hit areas TILE.
They used to be 6px dots 6px apart, each with a 48 overlay — so every overlay covered
its neighbours, the last one painted on top, and tapping dot 1 or 2 selected dot 3
(measured 2026-10-12). Centres 48 apart is the price of three real targets; the
non-interactive dots (one quiz, no pager) keep the frame's tight gap.

## `src/components/SwipeDots/SwipeDots.tsx`

### H-129

Above: `export type SwipeDotsProps = {`

Mirrors the Figma component set `swipeDots` (15813:37248), whose variant is
`active=1|2|3`. Expressed here as numbers rather than a string union: the batch size
is however many quizzes are due, and hardcoding three would be the same
fixed-count-that-lies problem the drill's ladder had.

Two shapes, decided by whether `onSelect` is passed:

  - With it, the dots are real tabs and the dot IS the control. This is what the due
    carousel uses. It replaced a full-width tertiary button reading "Swipe to the next
    due quiz" — which described a gesture that did not exist, and once the gesture did
    exist was a third way to do one thing, sliced in half by the region's overflow
    fade because the screen had no room for it.
  - Without it, they are decoration beside something else that pages.

The role follows the shape. It used to be `role="tablist"` in both cases, with
`role="presentation"` spans inside — a tablist containing no tabs, which tells a
screen reader a widget is there and then gives it nothing to operate.

## `src/components/TrainingLog/TrainingLog.module.css`

### H-130

Above: `.root {`

Figma `trainingLog` (15813:37292): vertical, gap space.100, pad 12/16, radius 400,
a "What you climbed" heading in feedback/success/onSubtle, one row per pass, and a
footer line.

The card sits darker than the rows inside it so the rows read as raised. Figma used
a literal #1a1c2e; background.input is the nearest bound value (navy-900) and the
closest thing this system has to an elevated-but-recessed container — the gap
background.raised was added to solve from the other direction.

## `src/components/TrainingLog/TrainingLog.tsx`

### H-131

Above: `export type TrainingLogRound = {`

Mirrors the Figma component `trainingLog` (15813:37292) — the "what you climbed"
list on the drill's Complete screen.

Row count is VARIABLE. The drill has no fixed length, so this shows however many
passes actually happened. Figma's sample has four and its footer says "all four
takes"; that copy is a leftover from the fixed ladder and is not reproduced here.

## `src/components/icons/index.tsx`

### H-132

Above: `function lucide(Glyph: ComponentType<{ className?: string }>) {`

Lucide glyphs, matching Figma's micGlyph_lucide / refreshGlyph_lucide, which are
exact Lucide geometry. Lucide emits its own width/height from a `size` prop; every
icon in this file instead fills its box so the parent slot sizes it. `lucide` wraps
one to that house convention — without it, a Lucide icon in AppBar's 24px slot
ignores the slot. Stroke stays currentColor like the rest.

### H-133

Above: `export const MenuIcon = lucide(Menu)`

The host app's home chrome — Figma frame "Home card — where Say It Back lives,
native and unmodified" (15674:34093). The frame's own glyphs are bespoke multi-colour
artwork exported as rasters and groups; these are the Lucide equivalents, which is
the house convention for icons and the only thing reproducible from tokens. The
shapes differ from the frame; the slots, sizes and positions do not.

## `src/lib/session.ts`

### H-134

Above: `import { useSyncExternalStore } from 'react'`

Fixture data for the mocked recall. There is no speech recognition and no judging
model — the prototype designs the states, not the engine (Design Brief, Hard
constraints). Every screen reads from here; no screen hardcodes its own copy.

Copy marked "from the frame" is verbatim from the Complete Flow screens in Figma.
Copy not marked is written for this prototype, because only term 1 has real copy on
any frame — see the build report.

### H-135

Above: `/** Sure, and right first time. Called it.`

The confidence tap (03 Processing, "How sure are you?") is the Design Brief's own
test — "overconfidence has to cost something and underconfidence has to be
rewarded, or the screen is just flattery." These three make it mechanical. They
are judged on the FIRST tap that got a real verdict (a couldn't-hear does not
count), so a hint or a reveal can never launder the original call.

### H-136

Above: `{`

Terms 2-4 are Chemistry: bonding, the same topic as formal charge — decided
2026-10-09 by the designer: one subject, like a normal Say It Back session. They
were three Biology terms, so a "Chemistry quiz" door led into a mixed set.

The rules the Biology set learned the hard way still hold: the prompt asks for
every part the marking checks, and `partialTranscript` leaves out exactly what
`missTitle` names, so the verdict never contradicts the quote printed under it.

### H-137

Above: `/** The attempt at which a miss can no longer be retried. */`

---------------------------------------------------------------------------
The hint ladder
---------------------------------------------------------------------------
hint → retry → second hint → retry → reveal (Design Brief § "What Knowunity
specified"). Keyed on the attempt number the miss arrived with, which is what the
screens already carry, so the ladder needs no new state. Bounded: from the third
missed attempt on, Try again is withdrawn and the reveal is the only way forward. A
requeue starts at attempt 2 (06 Lock It In), so a missed requeue gets the strong hint
and one retry — a second chance, not a whole new ladder.

### H-138

Above: `const canRetry = n < REVEAL_AT_ATTEMPT`

ONE hint, repeated. `docs/sprint-context.md` § "Not building this sprint" lists
"Second hint", and CLAUDE.md makes that list binding. The Design Brief describes a
two-hint ladder, but under § "What Knowunity specified at kickoff" — the kickoff
ask, which this sprint scoped down. A `hint2` was briefly added here against that
rule and is removed.

What DOES stay is the bound. The real defect was that "Try again" was still offered
at attempt 10 with byte-identical copy: a loop with no end. It ends at
REVEAL_AT_ATTEMPT now, and the reveal is the escalation the second hint would have
been.

### H-139

Above: `export type DrillRung = { step: number; cue: string; coverage: number }`

---------------------------------------------------------------------------
Definition Drill Down
---------------------------------------------------------------------------
A separate opt-in practice mode: work one definition out loud until you own it.
Not graded, verbatim-oriented, NO XP — the reward is completing the thing.

NOTE ON WHAT IS BUILT. The doc's model is variable-length: the meter fills by unaided
coverage and the drill ends when coverage reaches full, whether that is the second
pass or the sixth. That depends on a judge scoring unaided coverage per pass, which
is unconfirmed with engineering. The built screens ship the FALLBACK — the four-rung
ladder — by decision (SPEC.md Open 5). The meter is continuous either way, so the
variable-length version is a data change, not a rebuild.

### H-140

Above: `first: { verdict: 'Partially right', copy: "One word off. It's below, then take it again."`

The verdict escalates with the rung. All three used to be the same literal string,
so the one piece of chrome built to announce severity said the same sentence from
the first gentle nudge to the guaranteed-completable echo — the copy below escalated
three times and the chip above it never moved.
No ✓ on any of these (designer, 2026-10-12): a check mark on a miss contradicted
the screen, and the first one now reads the same as the session's partial,
"Partially right", so one verdict has one name in both flows.

### H-141

Above: `const KEY = 'sayitback.session'`

---------------------------------------------------------------------------
Session state
---------------------------------------------------------------------------
Verdicts accumulate so 07 Recap reports the actual run rather than a canned result.
sessionStorage, not React context: a context on the session layout dies on refresh,
which would contradict the addressable-route decision. Never read during render —
that breaks hydration. See SPEC.md § Conventions.

### H-142

Above: `export function typedDraft(state: SessionState, index: number): string {`

And only a draft that has NOT been sent. A sent answer has been judged; putting it
back in the box on "Try again" (or on the next drill rung, which is the same term)
let a student resend it without recalling anything (click-through, 2026-10-12). An
unsent draft still survives Leave → "Keep learning". Pure; pass the state from
useSession().

## `src/lib/useFocusTrap.ts`

### H-143

Above: `const FOCUSABLE =`

Keeps focus inside an open dialog, and puts it there in the first place.

`aria-modal="true"` SAYS the rest of the page is inert; it does not make it so.
Nothing is removed from the tab order, so Tab walks straight out of an open dialog
into a screen the student cannot see — and focus never enters the dialog on open, so
a keyboard or screen-reader user is never told one appeared.

Written for BottomSheet, then pulled out here when /permission/prompt turned out to
be the other real dialog in the app and to have the same defect. One implementation,
because the second copy is where these drift.

Trapped rather than inerting the rest of the page: these dialogs render inside the
screen's own tree rather than through a portal, so there is no reliable "everything
else" to mark. The trap is what the student experiences either way.

### H-144

Above: `const first = root.querySelector<HTMLElement>(FOCUSABLE)`

NO focus restore on unmount.

It used to capture document.activeElement here and refocus it on cleanup, which
reads correctly and does nothing: every sheet in this app lives on its own route
(session/transcript/[bucket], drill/complete/round, permission/prompt), so by the
time this mounts the triggering control has already unmounted and activeElement
is <body>. Restoring <body> to <body> is not a restore. Honest no-op beats a
convincing one — a real fix has to hand the trigger's identity across the
navigation, which is the routing layer's job, not this hook's.

