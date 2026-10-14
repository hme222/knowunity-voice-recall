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

- **Decided 2026-10-08 by the designer, from a walkthrough:**
  - **No requeue.** A missed term no longer comes back at the end of the set
    (06 Lock It In is deleted). The run goes straight to the Recap, which leads
    with "Practice what I missed". This supersedes "a miss requeues later in the
    same session" wherever it appears below.
  - **Recap** emphasises what was learned ("You learned something new", with the
    term and its definition), then offers the misses, then home. "Run it again"
    and "Done" are gone.
  - **Skip is top right**, beside the progress bar, on every screen that offers
    it; the N/4 sits under the bar, not on it. Controls land in the same spot on
    every screen.
  - **Recording keeps the question on screen**, and its CTA is "Submit".
    Paused shows the pause symbol on the mic and drops the "Tap to…" line, and
    (2026-10-09) the visible "Paused" word too: the symbol and timer are enough.
  - **Couldn't hear (attempt 1) is a say-again, not a retry:** "I didn't catch
    that", labelled "Not a wrong answer", tag "Say it again" in Primary, not
    coral.
  - **Second Miss** drops "You said" so the hint shows without scrolling.
  - **Blank term keeps the question** on screen; the encouragement moves under
    the mic as a `MicCaption`.
  - ~~**Knowie is full size or absent.**~~ Superseded 2026-10-14: Knowie is on every
    screen at one size (2XL); short screens tighten the mic area instead.
  - **One subject, decided 2026-10-09:** the whole set is Chemistry: bonding —
    formal charge, covalent bond, electronegativity, octet rule — replacing three
    Biology terms. The due quizzes and picker topics are Chemistry too. The intro
    names it in its title, the way the explain screen names the term.
  - **Decided 2026-10-09:**
    - **"How sure are you?" is optional.** Unanswered, Processing moves on after
      10s (`motion.semantic.duration.confidenceGrace`) and records no confidence —
      no reward, no cost. Supersedes "the verdict waits indefinitely for the tap".
    - **The Recap keeps Knowie** (`ScreenShell mascotGivesWay={false}`: its term
      list is meant to scroll) and **ends on "You learned something new!"** with the
      term's definition; the headline is "Session recap" again.
    - **The drill works for every term**, not only formal charge: each term has
      its own rungs, missed word and stumbled take (`Term.drill`).
    - **07a is "Go back over what you missed".** Each missed term is a row that
      says why it is there and recommends a method — Drill it if the student
      skipped or needed the answer, Say it again if they needed a hint — with the
      other method as a link. "Practise all N" runs the rows in order and comes
      back to the Recap once. Replaces the frame's which-term-then-which-method
      screen, where a preselected row was easy to miss and the two methods were
      unexplained equals.
  - **The prototype opens on a journey map** (`/`), then the quiz door, the mic
    primer, and the session. The quiz door names the subject (Chemistry), and so
    does the intro's title. The line under the progress bar reads "Chemistry ·
    N/4" in a session and just "Chemistry" on a run from a door (2026-10-12).
  - **From the critic panel, decided 2026-10-12 (designer interview):**
    - Typing after a mishear pays full XP (`micFault`); typing by choice still
      pays the hinted rate. The "can't speak" exit already did, via sticky.
    - The confidence tap pays the same either way: sure-right = unsure-right = +1,
      sure-wrong 0. Informational, never the losing tap.
    - Skip after the mic failed is "mic trouble", not a miss: left out of the
      Recap's "of N", noted on its row, still offered for practice. Reveal's
      top-right action reads "Continue", not "Skip".
    - The offline screen and its "Having connection trouble?" link are removed;
      "still thinking" stays as an in-place state.
    - The typed path's confidence ask uses the same 10s grace as voice.
    - A partial looks one way: amber "Partially right" chip over a neutral card,
      in the session and the drill; no ✓ on any miss chip.
    - The selected exit reason carries a check mark; the pass card a "Correct"
      chip. Pass's XP and confidence lines sit in the content, so Continue is at
      the shared height.
    - A typed answer under 15 characters gets "Nothing to check yet", not
      claimed partial credit. The exit sheet only promises saved progress once
      there is some. Scaffold copy is gone from the chat door and home.
    - "Practice" (US) everywhere. A darker `background.scrimStrong` behind the
      drawn mic-permission sheet. The Recap's Knowie is laughing on a clean run,
      determined on a mixed one.
    - **Unlock is home, not a modal:** every door's back arrow lands on
      /home/unlock — home with the chip in the tool row and a "Say It Back
      feature unlocked" note. Home's Knowie is 3XL, 2XL or out by fit, and the
      greeting-to-content gap is 32.
    - **The start screen** gives the path in three steps and what a reviewer
      needs to drive it: hold-time decides the result, question 1 misses once.
  - **Later on 2026-10-12 (designer):**
    - **A door run is one definition, always.** Started from the quiz, chat or
      exam plan, the run ends after its one term — on the door's result if it
      passed, otherwise on home — never carrying on into the full set. The quiz
      says so: "Say one definition back: formal charge." The button is "Say It
      Back", not "Prove it". The full Chemistry set is the home chip's.
    - **A door run that ends without a pass gets its own result** (option 1a from
      the usability review, same day). A reveal or a skip used to go straight to the
      "unlocked" popup, a celebration with nothing about the definition, against the
      start screen's own step 3, "See how it landed". It now goes to `/door/missed`:
      the definition, "Continue" on to the unlock, or "Try again" (was "Try it again" until 2026-10-14). A pass is
      unchanged (the quiz door's result, or 04 Pass).
    - **The miss ladder says where you are, in the card** (options 2a and 2b, same
      day). Still one hint. The second miss's headline is "One more go, then I'll
      show you the answer." (it was a faint caption in the action zone); the third
      is "That's three tries. Let's look at the answer." (Try again used to vanish
      without a word).
    - **The prototype opens on `/home/unlock`** (same day): `/` redirects there, and
      the popup's Say It Back chip goes to 00 Intro (`/session/intro`), then the primer
      and the four terms. The testing brief moved to `/start`, and its Start goes to
      `/home/unlock` too. It used to open on the brief and go to the quiz door; the
      doors stay reachable from baseline home (`/home`).
    - **From the senior design review (same day):** the Recap leads with one
      earned sentence ("You can say 2 of 4 back without help"), a run strip, and
      "You were sure about N you missed"; XP and time fold into one line; missed rows
      say "Not yet"; the learned card shows every revealed and hinted term. The pass
      screen states the confidence call as a sentence and Knowie hops once (none
      under reduced motion). "Type instead" is text-weight on idle screens and the
      idle mic is captioned "Start speaking"; the reveal mic is "Optional · +3 XP";
      the mishear card drops its dead "Say it again" pill and the mic is captioned.
      The unlock popup's primary is "Try it now" → 00 Intro, with "Later". Practice
      rows share one layout; the intro is two lines; the exam-plan door uses the
      session's question card. Processing and Submit fire once only. NOT changed,
      because each reverses a recorded decision: merging the intro and primer, cutting
      02a Captured, moving the scripted mishear off term 1, and giving the chip one
      destination (`/home/unlock` → intro, `/home/unlocked` → picker).
    - **Second senior-review round, the held decisions (same day, designer):**
      - **Contextual mic permission (1b).** The question comes first; the primer is
        a sheet over it on the first mic tap, then the drawn OS prompt, and Allow
        goes straight into the recording. `micGranted` survives runs like a real
        permission. 00 Intro is retired: every way in goes to question 1.
      - **02a Captured carries the confidence ask (2b).** Transcript, "Not what you
        said? Say it again / Type instead", and "How sure are you?" on one screen;
        Processing is a judging beat with no ask. Both principles kept, one beat less.
        This supersedes "Did I get it?" (3b) below.
      - **The scripted mishear is on question 2 (3b, with a /start label).** Question
        1 shows a clean pass first; door runs never mishear.
      - **Two chip destinations kept, both one tap from a question (4c).** The
        picker leads with "Start Chemistry: bonding".
      - **A reason to come back (2a, 2026-10-13).** A revealed or skipped term goes
        on a review list that survives runs; the Recap row says "Comes back
        tomorrow." and home shows it as a due chip even with no exam plan. Tapping it
        is a say-again round of exactly those terms; a pass clears it.
      - **Two miss labels (8a, 2026-10-13).** "Partially right" (amber) is kept for a
        real half-answer; a wrong idea (the term's `partialKind: 'wrong'`), a typed
        miss the mock cannot read, and "too short" get the neutral "Not quite yet" /
        "Not enough to check".
      - **The drill pays +2 XP (9a, 2026-10-13),** once per term per run, against a
        receipt from its last judged round; shown on drill complete and the Recap.
      - **One grammar for the turn (coherence critic, 2026-10-13).** The action zone
        is top-anchored, so every screen's first row is at the same y (690 at 844,
        it drifted 688–718). Skip is the top-right slot on idle, recording, captured,
        miss and mishear, and never anything else (Reveal's "Continue" moved to the
        action zone). "Type instead" is text-weight everywhere except the second
        mishear, where typing leads by decision. Captured's optional-confidence exit
        is "Just check it", not "Skip", which means skip the TERM. Deliberately kept:
        "Start over" on Recording (it discards a take in progress, which "Say it
        again" would misname); Knowie stepping out on Recording (the question and the
        mic own the screen while the student speaks); Captured's "Say it again / Type
        instead" inline under the transcript, beside the words they correct.
      - **Practice suggests by two more rules (5, A and C).** Sure and still needed
        help → Drill it, even when hinted (a confident miss is a wrong idea to
        rebuild). Typed → Say it again, aloud (the point of the feature). A wins over C;
        mic trouble still says it again first. The row says "· typed" when C applies.
      - **The panel interview (designer, 2026-10-13, after the third critic run).**
        - *Dropped network on Submit: out of scope.* The prototype has no network
          layer; the offline screen stays removed (2026-10-12). Not a gap to flag.
        - *Back to the mic after a denial (C).* The typed turn, when the mic is
          denied, offers "Mic back on? Speak instead": through the drawn prompt,
          Allow clears the denial and opens the mic on that question. Denied still
          sticks until the student asks.
        - *"Start fresh" keeps the XP.* Any new run banks the run it replaces
          (`bankedXp`), so Resume's "Your XP is yours either way" is true.
        - *"I've turned it on" stays unverified.* Mocked: a real build asks the OS.
          Recorded in current-state.md.
        - *A second hint (B).* The second miss adds the drill's first-letter gap
          ("Fill the gap: …every bond's e____ are split evenly…") on the miss and
          the retry; the third offers only the reveal. Moved off the not-building
          list.
        - *Drill mishear.* A drill take under 2s shows "I didn't catch that" on drill
          Captured with Say it again / Type instead; no rung spent. Drill Captured
          says "Submit" (as on Recording), not "Looks right", so a student never agrees to a take
          and is then told it was partial.
        - *No verdict chip on the third miss: kept.* Three judgements in a row is the
          point to stop judging; the headline says where they are ("That's three
          tries. Let's look at the answer.").
        - *Typed stance: 7 XP stays, the language changes.* "You wrote" on typed
          takes; the Recap row says "Typed." and its working explains the rate once.
        - *Pass shows before/after on a retry (reach 1).* The take that first missed,
          faded, above "Just now". A first-time pass is unchanged.
        - *The Recap quotes the student (reach 2).* Each got term shows their own key
          phrase; rows build in one by one (none under reduced motion). The
          secondary lines (wins, sure-and-missed, the typed rate) live in "How it
          adds up".
        - *Drill rounds say "Got it".* A passed round holds a "Got it" chip for
          `motion.semantic.duration.verdictHold` before the next opens, spoken or
          typed.
      - **Fourth critic run's fixes (2026-10-13).** Short screens: ScreenShell's
        give-way has a second stage — after Knowie, anything marked `data-gives-way`
        (the unclear screen's repeated question, the chat door's XP line) drops, so no
        card is cut mid-line at 390x668. Reveal's bubble title is "Here's the answer."
        and the invitation lives once, under the mic. Verdict chips are announced
        inside the result card's live region (`RecallResult verdict`). `TextInput`
        promoted (typed answer box, picker search). Drill Captured's button is
        "Submit"; blank's is "Reveal answer". The Recap's wins are named in the
        caption, Knowie is XL there. Durations derived by ratio became tokens
        (`ambientStagger`, `celebrate`, `breathe`). Checked and left: labels are at the
        12px caption floor; mic captions already share a bottom line (666 / 490).
      - **Panel interview, round two (designer, 2026-10-13).**
        - *A. The drill's bar mirrors the session's.* "Drill · term · n/4" under the
          ring and Skip top right on every drill turn (not on the judging beats).
          "Come back to this one" is gone from the stumble rungs; Skip is the one way
          past.
        - *B. Home chip hit areas.* Already 48px overlays on every chip and "New"
          (history h-038/h-039); verified by probing outside the painted box. The
          critic measured painted boxes only.
        - *C1. Pass stages its payoff.* The verdict lands with the card; the "You
          said" line and the student's words rise `proofDelay` (600ms) later. A tap
          shows it all; reduced motion shows it all; practice is not staged.
        - *C2. Knowie does not grow across the run.* Size already means "the pass
          moment" (3XL); tying it to score would read as a judgement on a student who
          is struggling.
        - *01 Idle's action zone, restored.* "Type instead" is a Secondary (filled)
          pill over the "I don't know this one" Tertiary link, as before the senior
          review made it text-weight (2026-10-12). No "Start speaking" caption under
          the mic on a first try; the mic's accessible name is unchanged and the hint
          caption still shows on a retry.
        - *Button tiers by role (designer, 2026-10-13).* Primary moves forward;
          Secondary is another way to answer ("Type instead" as the screen's
          alternative to the mic — idle, blank, primer, doors, drill rungs, the first
          mishear; "Show full definition"; "Try it again"); Tertiary gives up or
          leaves ("Reveal answer" on misses 1–2, under a full-width "Try again";
          "I don't know this one", "Leave anyway", "Later", "Start over"). "Type
          instead" is an inline link only where it corrects a take, and Primary only
          where typing is the recommendation (exit sheet, second mishear). Reveal
          answer and Type instead were the same grey pill.
        - *The subject is said once.* The top bar says "Chemistry · 3/4"; question
          cards say "Explain: <term>" (the exam-plan door, whose bar does not name the
          subject, keeps it).
        - *Recording.* The question card sits above the pulse rings, which pass behind
          it at 390x668 instead of drawing across the text. Paused shows no caption
          ("Tap to resume" removed).
        - *02a Captured, simplified.* "Looks good" (Primary) and "Not quite right"
          (Tertiary, back to the question to say it again or type). The confidence
          call is a small optional "How sure? Sure / Not sure" chip pair under the
          card, read on "Looks good"; untapped scores nothing. Supersedes 2b's
          ask-in-the-action-zone and "Just check it" on this screen.
        - *The picker comes first.* "Try it now" and the unlock chip open `/picker`,
          which says "Pick Chemistry: bonding to start" and rings that row with a
          "Start here" label; it, or the Start button, begins the run.
        - *The typed check matches Captured.* "Here's what you wrote.", the small
          "How sure?" chips, "Looks good" / "Not quite right"; "Not quite right"
          reopens the typed box with the words in it (`unsendTypedAnswer`).
        - *Knowie: fourteen faces from Figma,* mapped one meaning each in
          design-system.md § Mascot poses.
        - *The brief is the first page again.* `/` → `/start` (what the prototype
          is, how to test it) → Start → `/home/unlock`.
        - *C3. The Recap shows one climb.* The first Hinted term with a stored first
          take: "First try" faded over "Then" and their key phrase. Absent when
          nothing climbed.
      - **Panel interview, round three (designer, 2026-10-14, after the fifth critic
        run).** Supersedes anything above it that disagrees.
        - *Stacked, not side by side.* Drill complete: "Continue" (Primary, full width)
          over "Run it again" (Secondary); "Done" is gone, as on the Recap. Drill miss:
          "Try again" (Primary) over a "Show full definition" link, the session miss's
          shape. The door quiz card keeps its side-by-side pair: it copies the live
          app's quiz card. The only side-by-side rows left are that card and the
          unlock popup.
        - *Retry names, by what is redone.* "Try again" redoes one question (the door
          missed screen's "Try it again" and the practice row's "Say it again" now
          say it). "Run it again" redoes a whole drill. "Say it again" means only "the
          mic didn't catch you".
        - *Picker spotlight: the cards fade, never the words.* Fading whole rows put
          "Your topics" at 2.24:1 and the row labels at 4.47:1 (contrast gate fail).
          Now only the other rows' fill, edge and icon recede
          (`component.picker.recededCardOpacity`); every label is full contrast. The
          ring and "Start here" carry the spotlight.
        - *Typed turn.* "I don't know this one" sits under the question it answers;
          under Send there is one link ("Say it instead", or "Mic back on? Speak
          instead" after a denial). The helper line under the box is gone.
        - *Sure / Not sure are buttons.* `ConfidenceAsk` in its optional toggle mode,
          on Captured and the typed check: "How sure are you?" with "Optional", two
          half-width Secondary buttons; the picked one shows the app's chosen look
          (highlight fill and edge, a check); a second tap clears it.
        - *Pass shows one XP figure.* "⚡ +11 XP" (the term plus the confidence
          bonus); the sentence says "Bonus included." with no number; the ⚡ is
          hidden from screen readers.
        - *Pass strength notches (option B of four mocked).* A new `PassNotches`
          component in the Pass card's footer: five notches, one per unaided pass on
          the term, today's ringed; never drops; a hinted pass or practice shows it
          without adding. **Not** the StrengthMeter, which stays the drill's
          continuous coverage bar. **The long-run count is mocked** per term
          (`Term.unaidedBefore`: 2/1/0/3); the prototype has no cross-session history
          and this is not a streak model.
        - *Recap: run accuracy, compact chips.* A third chip, "2/4 FIRST TRY" (the
          Score variant), beside XP and Time. StatChip is one row now, value then
          label, the label at the 12px floor (was 9px), so the first term row shows at
          390x668 with Knowie unchanged.
        - *"Not quite right" on Captured* returns to the question with "My mistake.
          Say it again." under the mic and `dazed` Knowie (the hint keeps the caption
          on a retry).
        - *Door mics record.* The chat and exam-plan doors' mic goes straight to
          Recording on question 1 (through the primer if the mic is not granted), not
          to 01 Idle for a second tap.
        - *Slow judge, scripted.* Question 3's first spoken take is judged in
          `scriptedSlowDwell` (7.5s, past `slowThreshold`), so "Still thinking…" is
          reachable by clicking; a dashed "Prototype note" on that screen says the wait
          is staged. Prototype only, like the scripted mishear on question 2.
        - *"Last one:" on question 4.* The final question's card reads "Last one:
          Octet rule" (not in practice) and Knowie is `excited` on its first try.
        - *Practice rows.* "Say it" with the Say It Back mic beside it, in the same
          place as "or drill it": both alternatives are words.
        - *Recording.* The pulse rings fade out under the mic
          (`pulse.ring.fadeFrom/fadeTo`) and never cross LISTENING; their reach above
          and to the sides is unchanged.
        - *Mic denied* has a close (back to the question) and numbered steps.
        - *Drill Captured keeps "Submit".*
        - *Not taken:* opening the Recap with the student's own words (reach 3).
      - **Same day, later (designer, 2026-10-14).**
        - *Knowie on every screen, one size.* 2XL (120, the size Figma's screen frames
          place `mascotSlot` at; the four Figma sizes XL/2XL/3XL/4XL = 64/120/200/320
          with a 12 inset are matched in code). Knowie never gives way or shrinks
          (`mascotGivesWay` is off by default); added to Recording (session and drill),
          the exit sheet (`questioning`) and the transcript sheet. Home drops from the
          frame's 3XL to 2XL, its ground shadow scaled with it. **Supersedes "Knowie is
          full size or absent" (2026-10-08) and the give-way stages.**
        - *Short screens make room around the mic instead.* Under
          `component.scaffold.shortHeight` (720) ScreenShell marks `data-short`: the
          mic region is 184 (was 200), the section gap 16 (was 24), the space under the
          mic and above it tighter, the ring fade follows. At 390x668 the voice screens
          still scroll 40-80px (the question's first lines show): accepted, as the
          option said.
        - *Pass: Knowie 2XL, the card compact* (Headline XS, Body S, 12 padding); the
          confidence sentence gives way on a short screen.
        - *Couldn't hear keeps Knowie;* its repeated question gives way first.
        - *Sure / Not sure at hint scale:* Secondary S, hugging their labels, under a
          Caption M "How sure are you?" with "Optional" beside it.
        - *Microcopy pass, P1 and P2* (senior UX writing review). Recap groups in the
          student's words ("Knew it", "Got it with a hint", "Saw the answer",
          "Skipped"); the picker note names the pill, not its colour; the bar no
          longer says "· last one" (the card does); "+2 XP" with a sign; curly
          apostrophes; US "practice". Captured's correction is "That's not what I
          said" (typed: "…wrote"), reversing "Not quite right". One verb set: "Send"
          (was "Submit" on Recording and drill Captured), "Show the answer" (was
          "Reveal answer" / "Show full definition"), "Say it instead", the mic's name
          and caption "Tap to answer" (was "Start speaking"). Knowie speaks as "I"
          (primer), contractions throughout, miss titles end on a question, one
          checking line ("Checking that against the definition…", slow: "Still
          checking. This one's taking a moment."), one mishear line, "Sure, and
          right. Bonus XP added.", "You felt sure about this one. Worth a second look."
        - *Practice is a rematch deck (option A of three mocked: "it feels like a
          checklist, can we make it fun").* "Rematch time / Three got away. Let's win
          them back." One card at a time from a fanned hand, Knowie (2XL, `giggling`)
          peeking over its top edge. The card: why it is there (amber chip) and the
          dots on its first row, the term at Headline M, Knowie's one line, then the
          suggested way (Primary) and the other (Secondary) as equal halves. Swipe,
          arrow keys or the dots move through it (the home due deck's SwipeDeck and
          SwipeDots). "Play all N" in the action zone. Empty: "Nothing to win back".
    - **02a Captured asks a question** (option 3b, same day): "Here's what I heard.
      Did I get it?" over the frame's "Looks right" / "Say it again". The frame's
      "Send it, or say it again." disagreed with its own button. Same in the drill.
    - **Every new run starts clean** (`startSession` on the start screen and every
      door): a stale practice round used to carry in, showing "+0" on a correct
      answer, opening the old round's drill, and running the old clock.
    - **Unlock is a popup over home:** the screen dims under a "Say It Back
      feature unlocked" card and only the Say It Back chip stays lit.
    - **The home chip's glyph is white** like the tools'; the due chip's glyph is
      24, not 40, and `/home/due` shows one Say It Back (subject, term, date).
    - **Every question card names the subject**: "Chemistry · Explain: …".
    - **Fixed layers stay in the phone frame** (`contain: layout` on
      `.device-frame`); the transcript sheet used to span a desktop window.
    - **The start screen is a prototype brief**: eyebrow, the three-step story,
      "To test it · about 2 minutes" with the hold-time rules, "Start at the quiz".
  - **Definition Drill Down, decided 2026-10-12:** no StrengthMeter (the green
    coverage bar) on any drill screen — progress is the top bar's alone. Each step's
    instruction ("Say the whole thing…", the nudge, "Let's say this one together")
    sits under the mic as a `MicCaption`, and DD 08 shows the climb as a four-step
    meter instead of the TrainingLog list, so every drill screen fits at 390×668
    with nothing faded.
  - **One phrase for the action, decided 2026-10-12:** "say it back" wherever a
    title, button or prompt names what the student does ("Ready to say it back?",
    "Now say it back", "Want to say one back?"). "Out loud" is retired from the
    feature's own copy; it survives only in the exit sheet's "I can't speak out
    loud right now", which is the student's words, not the feature's.
- **The retry hint sits under the mic, not above it. Decided 2026-10-07 by the
  designer.** On 01 Idle after a hint, the hint is a `MicCaption` ("Hint" label +
  one or two lines, no card) in the bottom 80 of the mic region. As a card above
  the mic it was pushed out of sight at 390x668, where the question alone fills the
  space above the control. The doors' "Tap to answer" uses the same component.
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

Added 2026-09-24, from the second grading run and its two roleplays:

- **Nothing that seeds an input reads `answerFor`.** It falls back to the canned
  transcript, so using it to keep a typed draft across a route change opened the typing
  screen PRE-FILLED WITH THE CORRECT ANSWER. A student in testing read it as the app
  having answered for her. `typedDraft()` reads only the student's own words. The fix
  that caused it was verified on its round trip and never on a cold open, which is the
  only path where the fallback fires.
- **The mic region does not shrink.** `flex-shrink: 1` let a taller content stack claim
  its space, so the control this region exists to pin sat at 466 in the session and at
  478, 488 and 526 across the drill. `position: sticky` is what actually protects a
  short viewport; verified at 844, 667 and 600 with nothing clipped. One value now, on
  every route.
- **The drill quotes what the student gave.** DD 07 hardcoded a stumble with an invented
  "um…" while DD 02a showed the clean transcript and asked them to confirm it — the same
  contradiction the core loop was fixed for on 2026-09-23, in the drill's own copy of it.
  One `DRILL_PARTIAL` feeds both. DD 07b's card also put the string "Starts with" under
  a label reading "You said", and DD 07c put the word Knowie was ASKING for there; both
  now quote the take and carry the nudge in a HintCard — and 07b finally shows the
  letter it was promising.
- **"Try again" lands on an idle beat.** It pushed straight into a live recording, so
  the timer was running when the screen arrived and the hint vanished at the moment the
  student meant to use it. Both roleplays named it, in both runs, as the point they
  would stop.
- **The stumble ladder's chip escalates with the ladder.** All three rungs printed one
  literal string, so the chrome built to announce severity said the same sentence from
  the first nudge to the guaranteed-completable echo.
- **Captured has its own fill.** It aliased `brand.bold`, the same value as Listening,
  and under reduced motion the pulse ring is `display: none` — so the two states rendered
  identically and only an invisible aria attribute separated recording from finished.
  The component's own token description claimed "the fill alone carries the state".
- **Practice does not rewrite the run.** 07a re-entered the ordinary session flow, so a
  clean practice pass overwrote the same outcome with the same bucket and the Recap came
  back byte-identical: a student did the work the app recommended and nothing it showed
  her changed. Practice is a flag on the run now, `recordOutcome` leaves the record
  alone while it is set, and 01 Idle says "Practice · <term>" instead of borrowing the
  session's "4/4 · last one".
- **The typed turn is not the flatter version.** It rendered the question as one flat
  white string and had no mascot at all, against voice-ux's "an equal path, not a
  downgrade". It gets Knowie and the accented term, like every voice screen.
- **`session/blank` keeps the ring and the fraction.** It dropped both, so saying "I
  don't know this one" also cost the student the only answer on screen to how far along
  they were.
- **`BottomSheet` is labelled by its heading**, not by a second copy of the same string
  announced a beat after it. And `useFocusTrap` no longer pretends to restore focus: every
  sheet here lives on its own route, so the trigger has already unmounted and it was
  restoring `<body>` to `<body>`. An honest no-op beats a convincing one.
- **The scaffold's documentation matches the build.** Three surfaces said 120/620 —
  ScreenShell's header, its Storybook doc, and the tokens file — while it has rendered
  136/570 since 2026-09-22, and a dead `bottomContent.height` token was still emitted
  with nothing consuming it. Corrected and removed.
- Smaller: "Continue" on 05b, which alone read "Next question" for the same call; a real
  glyph on the offline snackbar instead of the placeholder square.

**Two findings left open on purpose, both the designer's call.** Three independent
reports now say the typed-by-choice XP reduction contradicts voice-ux Principle 5, which
puts "can't speak right now — library, shared room, on a bus" in the same bucket as
"physically can't speak": a student who types by choice pays 7 where speaking pays 10,
is filed under Unaided anyway, and is never told. And `sureWrong: 0` still means "Sure"
strictly dominates. Both are recorded decisions and neither was changed.

Added 2026-09-24, closing the rest of eval/scorecard-06.md:

- **The Recap's action row has fixed positions.** Both the label and the variant used to
  swap on a rough run, so the white pill stayed left and changed meaning with the
  session — tapping by position got the opposite action depending on how you had done.
  "Run it again" is always left, "Done" always right; only which is Primary moves.
- **The drill's stumble mics record.** `/drill/miss/letter` and `/drill/miss/echo` gave
  their MicButton a push to the NEXT screen, so the rung whose whole point is saying a
  word out loud with Knowie completed without a take. They route through
  `/drill/recording?stumble=…`, which also gives them the Done speaking control the
  student was missing.
- **A hinted term cannot come back Unaided.** `hinted` rode the query string through
  four screens and 04a Couldn't hear's retry rebuilt the URL without it, so a term that
  was hinted, then misheard, then answered was credited as a cold recall. The run now
  remembers which terms were hinted and `recordOutcome` downgrades on the way in. A fact
  about the run belongs in the run.
- **A genuinely blank turn is one attempt, then the answer**, which is what voice-ux.md
  specified and the build never did. The mic carries `blank=1` and the take goes
  straight to 05a: no verdict, so no hint ladder offered to someone who just said they
  know none of it, and no scripted mishear on the screen that promises nothing is scored
  against them.
- **The confidently-wrong note is not only for skipped terms.** It was gated to
  `bucket === 'Worth revisiting'`, so a term the student was sure about, got wrong, and
  then reached via a hint or reveal showed nothing — and since `sureWrong` went to 0 it
  carries no cost either, so that run was invisible in both directions.
- **Bucket headers on the Recap are sticky**, so the overflow fade always lands on a row
  rather than on a bare label with an invisible row beneath it.
- **`/permission/prompt` traps focus**, via the same hook BottomSheet uses — pulled out
  to `src/lib/useFocusTrap.ts` once it turned out to be the app's other real dialog with
  the same defect.
- **"Practice what I missed" practises the term you picked.** Every row pushed to
  `/drill/intro` and the drill only has one definition's ladder, so tapping any term
  drilled Formal charge; the rows also had a hardcoded `state="Default"` so nothing ever
  looked chosen. They are a radiogroup now, "Say it back again" follows the selection,
  and the drill is offered only for the definition whose ladder exists rather than
  opening one for a term the student did not choose.
- **A typed draft survives leaving the screen.** It lived in component state only, so
  Leave → "Keep learning" came back to an empty box on a flow whose exit screen says
  "Your progress is saved".
- **The round sheet reports the word the rung actually removed** ("electrons"), read
  from the fixture instead of a hardcoded "evenly" that contradicted `/drill/miss` one
  screen away.
- **Two documents stopped contradicting the build.** `tokens/tokens.json` said the
  StrengthMeter darkens as it fills in one description and brightens in another, both
  dated the same day, with the component's own comment repeating the wrong half —
  settled by rendering, and the record corrected without moving a value.
  `design-system.md`'s "the verdict tag reuses feedback.success (green)" is marked
  superseded: the chip is `feedback.partial.bold` / `#F5B53D` because the frame binds it
  there, and the proposal to recolour it to green would have walked away from the frame
  to satisfy a document.

**Still open, and deliberately not fixed:** the ⚡2 / 🔥3 counters on home are the host
app's chrome, fixed values from the frame like the 09:41 clock. Both roleplays read them
as session XP failing to land. Wiring them to the run would invent a streak model the
prototype does not have; they stay as chrome, recorded here because the misread is real.

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
- **Superseded 2026-10-13 (9a): finishing a drill pays +2 XP, once per term per run.** Was: **No XP anywhere in Definition Drill Down.** Deliberate — the drill
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
`micGlyph` / `refreshGlyph`. Code-only, 2026-10-14: `PassNotches` (04 Pass's strength
notches), and `RecallResult`'s `footer` slot that holds it — not yet in the Figma set.

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
- ~~Second hint.~~ Built 2026-10-13 (designer, option B): the drill's first-letter
  gap on the second miss. See "The panel interview" above.
- Mid-answer language switching.
- Mic-busy handling.
- ~~XP inside Definition Drill Down.~~ +2 on finishing since 2026-10-13 (9a).

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
