# Component gaps

One line per thing a screen needed that wasn't in Storybook. Written by the
`build-screen` skill as it goes — see `.claude/skills/build-screen/SKILL.md`
step 5.

**The rule:** first time, build it inside the screen from tokens and add a line
here. If it shows up again from a different screen, build it properly as a
component in `src/components/<Name>/` with a story, and mark both lines
promoted. Two consumers is the bar for a real component; one is a screen-local
detail.

| What it was | Screen | Status |
|---|---|---|
| Session fraction ("N/4") under the app bar | 00 Intro | **Promoted** → `src/components/SessionFraction/` when 01 Idle needed it |
| Session fraction ("N/4") under the app bar | 01 Idle | **Promoted** → `src/components/SessionFraction/` |
| Recording status — LISTENING label, elapsed timer, pause caption | 02 Recording | **Promoted immediately** → `src/components/RecordingStatus/` (DD 02 Recording is the known second consumer) |
| Captured result card (Figma `recallResult/Captured`, 15782:13076) | 02a Captured | **Promoted** → `src/components/RecallResultCaptured/` |
| Captured result card | DD 02a Captured | **Promoted** — this was the second consumer. A spec review caught that the promotion had been predicted here and never done. |
| Confidence ask (the sure / not-sure pair) | 03 Processing | Inline. Second consumer will be DD 03 — promote then |
| Recap bucket row (term + per-term XP + confidence note) | 07 Recap | Inline |
| Stat chip row wrapper | 07 Recap | Inline |
| Drawn iOS permission sheet | Mic primer + prompt | Inline. Deliberately a facsimile — the prototype has no mic and the real dialog never fires |
| Multi-line text input | Text fallback turn | Inline. No text input exists in the catalog at all |
| Pulse rings around the mic | 02 Recording | Inline, but sized from `component.micButton.pulse.ring.*`. **This claim was FALSE until 2026-09-22** — the CSS referenced those tokens from the day it was written, the `pulse` group was added later with only the scale and opacity values, and all three rings rendered 2x2px. `npm run check:vars` now fails on a var() that resolves to nothing rather than literals |
| Home surround (greeting, plan cards, composer chip row) | Home ×3 | Inline in `src/app/home/HomeShell.tsx` — the real app's home isn't ours to reproduce |
| Drill top bar (ring + fraction + Drill chip) | Drill ×9 | Inline in `src/app/drill/DrillBar.tsx` — drill-only, and it's the piece that goes if the coverage judge is confirmed |
| Transcript sheet content, three bucket variants | Transcript sheet, DD 08a | Uses `BottomSheet` + `PickerRow raised`; the per-bucket copy is screen-local |

## 2026-09-21 — the DD frame rebuild

- **`termPill`** — DD 01's "Define: Formal charge" pill: surface fill, radius-full, the
  label in text.secondary and the term in brand.bold. Built inline in
  `src/app/drill/drill.module.css` for `/drill/pass/[step]`. Not `Chips`: every Chips
  colour is a verdict colour, and this is a neutral label for what is about to be
  defined. ONE consumer, so it stays screen-local.
- **`resultCard`** (neutral result) — title + "You said" + transcript on
  `background.surface`, white title. DD 07 / 07b / 07c all use it. `RecallResult
  state="Miss"` is the graded version, `#532831` with a red title, which is wrong for
  the drill: the drill is practice, not scored performance. Built inline in
  `drill.module.css`. **PROMOTED 2026-09-21** to `RecallResult state="Neutral"`
  (surface fill, `text.primary` title) with its own story. All three drill stumble
  screens use it and the inline CSS is deleted. Closed.

- **`Cue`** (`src/app/drill/Cue.tsx`) — renders a thinned definition with its blanks
  DRAWN as rules rather than typed as characters. Two consumers: `/drill/pass/[step]`
  and `/drill/miss/letter`. Not promoted to `src/components/`: it is a route-local
  render helper for the drill's fixture strings, not a design-system component, and
  nothing outside the drill has blanks. Promote if a third consumer appears outside
  `src/app/drill/`.
