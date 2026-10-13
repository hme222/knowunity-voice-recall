# Say It Back — current state

One page: what the build does **today** (2026-10-13). For why, see `docs/sprint-context.md` (decisions) and `docs/code-history.md` (the reasoning that used to live inline). For per-screen detail, `SPEC.md`. Where those disagree with this page, this page describes the code.

## What it is

Voice-in / text-out active recall for Knowunity. A student explains a Chemistry definition out loud; Knowie answers in text. A clean pass echoes the student's own words back as proof. Four terms per run, then a Recap. Next.js 16 prototype at 390×844 (also holds at 390×668); dark mode only; no real speech recognition.

## The flow

```
/  →  /home/unlock (popup: "Try it now" / "Later")
        └─ Try it now or the lit chip → startRun() → Q1
Q(n): idle ─tap mic─► [first time only: primer sheet → drawn OS prompt → Allow]
      └► recording ─Submit─► captured (transcript + "How sure are you?" / Skip)
            └► processing (judging beat, moves on by itself)
                 ├─ Pass  → pass   ─Continue─► Q(n+1) or Recap
                 ├─ Miss  → miss (hint ladder, max 3) → Try again → idle | Reveal → reveal
                 └─ Couldn't hear → unclear → Say it again | Type instead | Skip
      side doors: "Type instead" (typed turn → checking → pass/miss), "I don't know this one" (blank → reveal)
Recap → "Practice what I missed" → practice list → drill or say-again → back to Recap
```

Other entries: `/home/unlocked` chip → `/picker` ("Start Chemistry: bonding" or a drill); `/home/due` due chips; `/session/resume`; guided one-definition runs from `/door/quiz`, `/door/chat`, `/door/exam-plan` (reached from `/home`), which end on the door's result (pass) or `/door/missed` (no pass), then the unlock popup. `/start` is the reviewer brief, reached by direct URL only, on purpose: it is for whoever is handed the link, not part of the product, so nothing in the app links to it (system critic flagged it as an orphan, 2026-10-13). `/session/intro` is retired: it starts a run and redirects to Q1.

## Routes (43)

| Area | Routes |
|---|---|
| Home | `/` (redirect), `/home`, `/home/unlock`, `/home/unlocked`, `/home/due`, `/picker`, `/start` |
| Session | `/session/{idle,recording,captured,processing,pass,miss,unclear,reveal,repeat,blank}/[term]`, `/session/recap`, `/session/recap/practice`, `/session/transcript/[bucket]`, `/session/exit`, `/session/resume`, `/session/intro` (redirect) |
| Typed | `/text/turn`, `/text/checking` |
| Permission | `/permission/primer` (sheet), `/permission/prompt` (drawn OS sheet), `/permission/denied` |
| Drill | `/drill/{intro,recording,captured,processing,miss,miss/letter,miss/echo,complete,complete/round}`, `/drill/pass/[step]` |
| Doors | `/door/{quiz,quiz/result,chat,exam-plan,missed}` |

## State

One store, `src/lib/session.ts`, over `sessionStorage` key `sayitback.session`, read with `useSyncExternalStore` (server snapshot = empty). Fields: `outcomes[]` (per term: bucket, xp, calibration, wasSure, typed, repeated, micTrouble), `startedAt/lastAt`, `misses` (judged misses per term → hint rung), `hinted[]`, `confidence` (first judged tap per term), `typed` / `sentTyped` (draft vs. sent typed answer), `micFault[]`, `sticky` (mic denied this session), `micGranted` (survives runs), `door`, `practising` + `practiceQueue`, `drillTerm`, `earned` (one-time receipts), `reviewQueue` (survives runs), `drilled`, `firstTakes` (the first missed take per term, for Pass's before/after), `bankedXp` (survives runs). Some run facts still also ride the URL (`attempt`, `ms`, `hinted`, `sure`); the store wins where both exist.

Invariants enforced in code: judging screens move on with `router.replace`, so back cannot replay them; Pass and say-it-back pay only against a receipt from the judging step (`markEarned`/`spendEarned`); judging handlers fire once; a bad term link goes to `/session/resume`, never a fresh run; query-string paths are internal-only (`safeInternalPath`).

## Rules

- **Verdict (mock).** Spoken: under 2s → couldn't hear, 2–5s → miss, 5s+ → pass. Question 2's first attempt is a scripted couldn't-hear (never in practice, never on a door run). Typed: 40+ chars and at least one of the term's `keywords` → pass, under 15 → "too short to check", else miss. Say-it-back under 2s pays nothing.
- **Hint ladder.** The hint on the 1st judged miss; the hint plus the drill's first-letter gap ("Fill the gap") on the 2nd, carried onto the retry; from the 3rd only Reveal is offered, with no verdict chip. A mishear does not spend a rung.
- **XP.** Unaided 10 · Hinted 7 · Revealed 0 (+3 for a judged say-it-back) · Skipped 0 · finishing bonus +5 (only if at least one term was got). Typed by choice pays the Hinted rate (explained once, in the Recap's working); typing after a real couldn't-hear or with the mic denied pays in full. Starting any new run banks the old run's XP into `bankedXp`, so Resume's "Start fresh" loses nothing.
- **Confidence.** Asked on Captured (optional: Sure / Not sure / Skip). Right first time +1 either way; sure and wrong costs 0 but is named on the miss, the reveal and the Recap.
- **Miss labels.** "Partially right" (amber) for a real half-answer; "Not quite yet" (neutral) for a wrong idea (`partialKind: 'wrong'`) or a typed miss; "Not enough to check" under 15 typed characters.
- **Coming back.** Revealed or skipped terms join `reviewQueue` (survives runs); the Recap says "Comes back tomorrow."; `/home/unlocked` shows them as a due chip; tapping runs `startReview()`, a say-again round; a pass clears them.
- **Drill.** Finishing pays +2 XP once per term per run (receipt from the last judged round). A passed round shows "Got it" for `verdictHold` (1100ms) before the next. A take under 2s is a mishear on drill Captured (Say it again / Type instead), no rung spent. Typed drill turns show the rung's "Define:" cue; a typed miss quotes the typed words.
- **Mic denied.** Typed for the session until the student taps "Mic back on? Speak instead" on the typed turn, which goes through the drawn prompt; Allow clears the denial. The denied screen's "I've turned it on" takes the student's word (mocked: a real build asks the OS).
- **Pass and Recap.** A pass after a miss shows the first missed take faded above "Just now"; typed takes are labelled "You wrote". Recap rows for got terms quote the student's own key phrase (`keyPhrase`) and build in one by one.
- **Practice suggestion.** Mic trouble → say it again; sure and still needed help → drill; typed → say it again (aloud); else revealed/skipped → drill, hinted → say it again.

## Tokens and assets

`tokens/tokens.json` → `npm run tokens` → `build/css/tokens.css` (+ `build/ios/KnowunityTokens.swift`, `build/android/*.xml`). CSS sizes are unitless tokens × `--size-primitive-unit` (0.0625rem), so the UI scales with text size. `check:tokens` (no raw hex) and `check:vars` (every `var()` resolves) guard it. Knowie: four Figma-exported faces in `public/knowie/` (~50KB gzipped each); Storybook-only peek frames in `storybook-assets/knowie-peek/`.

## Mocked, or missing for production

Mocked: speech recognition and the judge, transcripts, the OS permission sheet, Chemistry fixtures and the home chrome. Missing: a network layer (a dropped connection on Submit is out of scope by decision, 2026-10-13), analytics, i18n (~1,000 English strings), a server-side session, a reducer/state machine with take IDs, Pro/free rules, real spacing (the review list is "tomorrow" in copy only), light mode, end-to-end tests. Font is a TRIAL licence (`src/app/fonts/GreedCollectionVF-TRIAL.ttf`).

## Checks

`npm run lint` · `npx tsc --noEmit` · `npm run test:unit` (41) · `npm run check:tokens` · `npm run check:vars` · Storybook tests (`npx vitest run --project storybook`; slow, times out under load).
