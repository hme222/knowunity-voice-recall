# Gaps and cuts — Say It Back

Two tables. The first is every state `docs/voice-ux.md` triages, against what is
actually built. The second is everything deliberately left out, with the reason
next to it.

Written 2026-09-20, after the build and two review passes. Verified against the
running app, not against intentions.

---

## 1. The gap table

**Figma** = a 390×844 frame exists in Complete Flow. **Built** = a route a
student reaches by clicking. A state can be built without a frame — nine of
them are, because the frames were never drawn for the states the brief called
Must.

### Must

| State | Figma | Built | Route |
| --- | --- | --- | --- |
| Idle (mic ready, prompt shown) | ✅ 01 | ✅ | `/session/idle/[term]` |
| Commit | — *(same screen as Idle)* | ✅ | same screen — it describes Idle, it is not a second state |
| Recording / listening | ✅ 02 | ✅ | `/session/recording/[term]` |
| Captured — review before sending | ✅ 02a | ✅ | `/session/captured/[term]` |
| Processing (STT + judge) | ✅ 03 | ✅ | `/session/processing/[term]` |
| Confidence tap | ❌ no frame | ✅ | on 03, inside the wait |
| Result: pass | ✅ 04 | ✅ | `/session/pass/[term]` |
| Result: partial / miss | ✅ 05 | ✅ | `/session/miss/[term]` |
| Cancel & re-record before send | ✅ 02a | ✅ | Re-record on 02a |
| Text fallback turn | ❌ no frame | ✅ | `/text/turn`, `/text/checking` |
| Mic permission primer | ❌ no frame | ✅ | `/permission/primer`, `/permission/prompt` |
| Permission denied → route to text | ❌ no frame | ✅ | `/permission/denied` |
| Skip a term | ✅ 05 | ✅ | Tertiary on every question |
| Genuinely blank term | ❌ no frame | ✅ | `/session/blank/[term]` |
| Session resume after leaving | ❌ no frame | ✅ | `/session/resume` |

### If time

| State | Figma | Built | Route |
| --- | --- | --- | --- |
| Empty / silent recording | ⚠️ folded into 04a | ✅ | shares `/session/unclear/[term]` with garbled |
| Very noisy / garbled transcript | ✅ 04a | ✅ | `/session/unclear/[term]` |
| Judge slow / times out | ❌ no frame | ✅ | escalated copy in place on 03, after ~6s |
| No / dropped network mid-answer | ❌ no frame | ✅ | `/session/offline` |
| Say-it-back repeat after a reveal | ✅ 05a | ✅ | `/session/repeat/[term]` |

### Out of scope — see the cuts table

| State | Status |
| --- | --- |
| Mic hardware busy | Cut |
| Student switches language mid-answer | Cut |
| Pause/resume into one take | Partial — caption only, no visible mic state |

**Nothing on the Must or If-time list is unbuilt.** The three Musts that had no
design at all through several passes — primer, denied, text fallback — are the
ones that most needed building, and they had no frames to build from.

---

## 2. What was cut, and why

### Cut by the brief — not ours to reopen

| Cut | Reason |
| --- | --- |
| Knowie speaking (voice out) | Hard constraint. Voice in, text out; the student's voice is the input, every response is on screen. |
| Auto-endpointing | Hard constraint. Push-to-talk with an explicit stop — the most common voice failure is the system guessing wrong about when someone stopped. |
| A hint that accepts a reply | Hard constraint: recall, not tutoring. A hint that branches is a conversation. |
| Real speech-to-text and judging | The brief mocks the recall. We are designing the experience, not building the engine. |
| Light mode | Mobile iOS, 390px, dark. There are no light values in `tokens.json`; honouring a light preference would be a bug. |
| The `L - 17 Pro Max` width | 390 only, confirmed 2026-09-16. |

### Cut by decision this sprint

| Cut | Reason |
| --- | --- |
| A second hint | The ladder is miss → hint → retry → reveal. Capping it makes worst-case length knowable. |
| Mid-answer language switching | Real for a multilingual product, not a v1 sprint problem. |
| Mic-busy handling | Rare in practice. Recorded as a known gap rather than pretended away. |
| XP anywhere in Definition Drill Down | The drill is practice, not scored performance. If XP is ever added, all its copy needs rewriting. |
| A visible paused state on `MicButton` | Accepted risk, recorded once. The caption carries pause; the mic doesn't change. If pause turns out to matter, the fix is a real component state, not more caption copy. |
| Cancel-the-take during recording | 02a Captured already offers Re-record, so discarding is one tap through a screen that exists. Recording keeps one action. |
| The XP reduction for typed answers | The mechanic needs to track *why* a student is typing — a denied mic must not be penalised. Threading that through was more invention than the decision authorised. |
| Real persistence | Session state is `sessionStorage`, cleared when a new session starts. Enough for a prototype, honest about not being a backend. |
| Notifications and the notification-permission flow | Sketched in the journey map, never started. Out of scope for 2.5 weeks. |
| Main flow v1 | Archive. Complete Flow is canonical and the two diverged after Drill Down landed. |

### Cut from the frames, on purpose

Four places where the built screen deliberately does not match Figma. Each was
a decision, not drift.

| Cut | Figma shows | Reason |
| --- | --- | --- |
| XP on 05a Reveal | `⚡ +5` | Revealed earns 0. Being told the answer retrieves nothing; the +3 repeat carries the reward instead. |
| `+1 bonus XP` on 06 Lock It In | `+1 bonus XP` | Not in the curve. The bonus is +5, at completion, forfeited on leaving. |
| XP on 02a Captured | `⚡ +10` | XP appears only where it is earned, and nothing has been judged at 02a. |
| The exit sheet's XP line | `You won't earn XP for this session if you leave now.` | Contradicted the brief's "progress saves, returning resumes". Per-term XP banks; only the +5 bonus is lost. |

### Cut in translation — Figma had it, code couldn't

| Cut | Reason |
| --- | --- |
| `Chips color="Partial"` and `"Unclear"` | The code component has `Primary \| pro \| Coral`. Coral *is* Figma's Unclear under the older name, so those match; `Partial` is a genuine substitution and is recorded as one. |
| `strengthMeter`'s original colour ramp | It darkened as it filled, making a full meter the least visible state on a dark background, and none of its four greens were in the palette. Rebuilt brightening through palette tokens. |
| `trainingLog`'s "all four takes" footer | A leftover from the fixed ladder. The drill is variable-length, so the count is derived. |
| `DueSignalCard` on the multi-quiz home | Superseded by the swipeable `SwipeChip` carousel. Kept for the one-quiz case, which needs no pager. |
| Fixed 844 letterboxing | The app fills the viewport instead. A browser window is rarely 844 tall, and a prototype that scrolls its own chrome is less faithful than one that flexes. |
| `/home/due/2` and `/3` as routes | Three frames are three states of one carousel, not three screens. |
| `/drill/intro/returning` as a route | Two states of one screen, behind `?returning=1`. |

### Cut by definition

| Cut | Reason |
| --- | --- |
| Screens in Storybook | A screen is a route a student reaches by clicking. A screen rendered in isolation has had the routing, params and session state removed — the things that make it a screen. Storybook is the component catalog; the prototype is the app. **Consequence worth knowing: Chromatic snapshots stories, so it never sees a screen.** The shareable Storybook link shows the parts, not the prototype. |

---

## Still open — neither built nor cut

These are decisions nobody has taken, not things that were left out. Full list
in `SPEC.md` § Open and `docs/sprint-context.md` § "Open, unresolved".

- **The coverage judge.** The drill's variable length needs per-pass unaided
  scoring. Unconfirmed with engineering — and the prototype ships the
  four-rung fallback because of it, with the variable-length model living in
  the doc.
- **Per-word stumble tracking** and **drill eligibility data** — same status.
- **Unaided's +10** is an informed guess, by decision rather than oversight.
- **Worst-case session length is unbounded** against the 70% completion
  target. Taken deliberately; nothing caps it.
- **Swipe timing** is 300ms, matched to iOS convention, unverified.
