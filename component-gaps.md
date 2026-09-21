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
| Captured result card (Figma `recallResult/Captured`, 15782:13076) | 02a Captured | Inline. Second consumer will be DD 02a — promote then |
| Confidence ask (the sure / not-sure pair) | 03 Processing | Inline. Second consumer will be DD 03 — promote then |
| Recap bucket row (term + per-term XP + confidence note) | 07 Recap | Inline |
| Stat chip row wrapper | 07 Recap | Inline |
| Drawn iOS permission sheet | Mic primer + prompt | Inline. Deliberately a facsimile — the prototype has no mic and the real dialog never fires |
| Multi-line text input | Text fallback turn | Inline. No text input exists in the catalog at all |
| Pulse rings around the mic | 02 Recording | Inline, but sized from new `component.micButton.pulse.*` tokens rather than literals |
| Home surround (greeting, plan cards, composer chip row) | Home ×3 | Inline in `src/app/home/HomeShell.tsx` — the real app's home isn't ours to reproduce |
| Drill top bar (ring + fraction + Drill chip) | Drill ×9 | Inline in `src/app/drill/DrillBar.tsx` — drill-only, and it's the piece that goes if the coverage judge is confirmed |
| Transcript sheet content, three bucket variants | Transcript sheet, DD 08a | Uses `BottomSheet` + `PickerRow raised`; the per-bucket copy is screen-local |
