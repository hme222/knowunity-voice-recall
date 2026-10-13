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

Other entries: `/home/unlocked` chip → `/picker` ("Start Chemistry: bonding" or a drill); `/home/due` due chips; `/session/resume`; guided one-definition runs from `/door/quiz`, `/door/chat`, `/door/exam-plan` (reached from `/home`), which end on the door's result (pass) or `/door/missed` (no pass), then the unlock popup. `/start` is the reviewer brief. `/session/intro` is retired: it starts a run and redirects to Q1.

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

One store, `src/lib/session.ts`, over `sessionStorage` key `sayitback.session`, read with `useSyncExternalStore` (server snapshot = empty). Fields: `outcomes[]` (per term: bucket, xp, calibration, wasSure, typed, repeated, micTrouble), `startedAt/lastAt`, `misses` (judged misses per term → hint rung), `hinted[]`, `confidence` (first judged tap per term), `typed` / `sentTyped` (draft vs. sent typed answer), `micFault[]`, `sticky` (mic denied this session), `micGranted` (survives runs), `door`, `practising` + `practiceQueue`, `drillTerm`, `earned` (one-time receipts). Some run facts still also ride the URL (`attempt`, `ms`, `hinted`, `sure`); the store wins where both exist.

Invariants enforced in code: judging screens move on with `router.replace`, so back cannot replay them; Pass and say-it-back pay only against a receipt from the judging step (`markEarned`/`spendEarned`); judging handlers fire once; a bad term link goes to `/session/resume`, never a fresh run; query-string paths are internal-only (`safeInternalPath`).

## Rules

- **Verdict (mock).** Spoken: under 2s → couldn't hear, 2–5s → miss, 5s+ → pass. Question 2's first attempt is a scripted couldn't-hear (never in practice, never on a door run). Typed: 40+ chars → pass, under 15 → "too short to check", else miss. Say-it-back under 2s pays nothing.
- **Hint ladder.** One hint, repeated; from the 3rd judged miss only Reveal is offered. A mishear does not spend a rung.
- **XP.** Unaided 10 · Hinted 7 · Revealed 0 (+3 for a judged say-it-back) · Skipped 0 · finishing bonus +5 (only if at least one term was got). Typed by choice pays the Hinted rate; typing after a real couldn't-hear or with the mic denied pays in full.
- **Confidence.** Asked on Captured (optional: Sure / Not sure / Skip). Right first time +1 either way; sure and wrong costs 0 but is named on the miss, the reveal and the Recap.
- **Practice suggestion.** Mic trouble → say it again; sure and still needed help → drill; typed → say it again (aloud); else revealed/skipped → drill, hinted → say it again.

## Tokens and assets

`tokens/tokens.json` → `npm run tokens` → `build/css/tokens.css` (+ `build/ios/KnowunityTokens.swift`, `build/android/*.xml`). CSS sizes are unitless tokens × `--size-primitive-unit` (0.0625rem), so the UI scales with text size. `check:tokens` (no raw hex) and `check:vars` (every `var()` resolves) guard it. Knowie: four Figma-exported faces in `public/knowie/` (~50KB gzipped each); Storybook-only peek frames in `storybook-assets/knowie-peek/`.

## Mocked, or missing for production

Mocked: speech recognition and the judge, transcripts, the OS permission sheet, Chemistry fixtures and the home chrome. Missing: analytics, i18n (~1,000 English strings), a server-side session, a reducer/state machine with take IDs, Pro/free rules, a retention loop after the Recap, light mode, end-to-end tests. Font is a TRIAL licence (`src/app/fonts/GreedCollectionVF-TRIAL.ttf`).

## Checks

`npm run lint` · `npx tsc --noEmit` · `npm run test:unit` (30) · `npm run check:tokens` · `npm run check:vars` · Storybook tests (`npx vitest run --project storybook`; slow, times out under load).
