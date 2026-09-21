// Fixture data for the mocked recall. There is no speech recognition and no judging
// model — the prototype designs the states, not the engine (Design Brief, Hard
// constraints). Every screen reads from here; no screen hardcodes its own copy.
//
// Copy marked "from the frame" is verbatim from the Complete Flow screens in Figma.
// Copy not marked is written for this prototype, because only term 1 has real copy on
// any frame — see the build report.

import { useSyncExternalStore } from 'react'

export type Verdict = 'Pass' | 'Miss' | 'CouldntHear'
export type Bucket = 'Unaided' | 'Hinted' | 'Revealed' | 'Worth revisiting'

export type Term = {
  /** 1-based, and the value in the route: /session/idle/[term]. */
  index: number
  /** Figma `chatBubble` title on 01 Idle, e.g. "Explain: Formal charge". */
  title: string
  /** The term itself, for copy that interpolates it. */
  name: string
  /** Figma `chatBubble` body on 01 Idle. */
  prompt: string
  /** What the student "said". No STT exists; this is the canned transcript. */
  transcript: string
  /** Figma `recallResult` title, state=Pass. */
  passTitle: string
  /** Figma `recallResult` title, state=Miss. */
  missTitle: string
  /** Figma `hintCard` body — one line, one direction, no reply expected. */
  hint: string
  /** Shown on 05a Reveal answer, as Knowie's own bubble. */
  answer: string
  /** The drill uses "Define:", the recall loop uses "Explain:". From the frames. */
  drillTitle?: string
}

/** XP curve — docs/sprint-context.md § "XP model", revised 2026-09-20. */
export const XP = {
  unaided: 10,
  hinted: 7,
  /** The say-it-back repeat after a reveal. Carries the reward Revealed no longer does. */
  repeat: 3,
  /** Being told the answer retrieves nothing, so it pays nothing. */
  revealed: 0,
  skipped: 0,
  /** Forfeited by leaving; per-term XP is banked. */
  completionBonus: 5,
} as const

export const XP_BY_BUCKET: Record<Bucket, number> = {
  Unaided: XP.unaided,
  Hinted: XP.hinted,
  Revealed: XP.revealed,
  'Worth revisiting': XP.skipped,
}

export const TERMS: Term[] = [
  {
    index: 1,
    name: 'Formal charge',
    // from the frame — 01 Idle (refreshed 2)
    title: 'Explain: Formal charge',
    prompt: "Say what formal charge means, in your own words. However you'd explain it to a friend.",
    // from the frame — 02a Captured
    transcript:
      "It's the charge on an atom if you split every bond's electrons evenly between the two atoms.",
    // from the RecallResult stories, which carry the frame's copy
    passTitle: "Nailed it — that's the whole definition.",
    // from the frame — 05 Miss + Hint
    missTitle:
      'You\u2019ve got the \u201ccharge on an atom\u201d part right. The \u201cevenly split\u201d piece is what\u2019s missing.',
    hint: 'Think about how the electrons\nin each bond get divided up.',
    // from the frame — 05a Reveal answer
    answer:
      "Formal charge is the charge on an atom when every bond's electrons are split evenly between the two atoms.",
    drillTitle: 'Define: Formal charge',
  },
  {
    index: 2,
    name: 'Cell membrane',
    title: 'Explain: Cell membrane',
    prompt: 'Say what the cell membrane does, in your own words. However you would explain it to a friend.',
    transcript: 'It is the layer around the cell that decides what gets in and what stays out.',
    passTitle: 'That is it — you named the job and the mechanism.',
    missTitle: 'Close — you described the cell wall, not the membrane.',
    hint: 'Think about what the membrane is made of, and why that lets it choose.',
    answer:
      'The cell membrane is a phospholipid bilayer around the cell that controls which substances pass in and out.',
  },
  {
    index: 3,
    name: 'Cytoskeleton',
    title: 'Explain: Cytoskeleton',
    prompt: 'Say what the cytoskeleton is for, in your own words. However you would explain it to a friend.',
    transcript: 'It is the scaffolding inside a cell that holds its shape.',
    passTitle: 'Yes — shape and movement, both.',
    missTitle: 'Partly — you have the shape half, not the movement half.',
    hint: 'It does more than hold the cell up. What moves along it?',
    answer:
      'The cytoskeleton is a network of protein filaments that gives a cell its shape and moves structures around inside it.',
  },
  {
    index: 4,
    name: 'Cell transport',
    title: 'Explain: Cell transport',
    prompt: 'Say what cell transport means, in your own words. However you would explain it to a friend.',
    transcript: 'It is how things move across the membrane, sometimes using energy.',
    passTitle: 'Nailed it — you split the passive and active cases.',
    missTitle: 'Close — that is diffusion. Cell transport is the wider idea.',
    hint: 'Some of it costs the cell energy and some of it does not.',
    answer:
      'Cell transport is the movement of substances across the membrane — passively, by diffusion and osmosis, or actively, using energy.',
  },
]

export const TOTAL_TERMS = TERMS.length

/**
 * Quizzes due, for the plan-active home. Three because the built flow shows three
 * swipe states — not because three is a rule. The count badge counts down as the
 * student clears them: "+2" → "+1" → "last one".
 */
export const DUE_QUIZZES = [
  { term: 'Formal charge', subject: 'Chemistry', due: '9/15' },
  { term: 'Photosynthesis', subject: 'Biology', due: '9/17' },
  { term: 'Kinematics', subject: 'Physics', due: '9/19' },
]

export function dueCountLabel(indexFromZero: number) {
  const remaining = DUE_QUIZZES.length - indexFromZero - 1
  if (remaining <= 0) return 'last one'
  return `+${remaining}`
}

/**
 * The picker's topics. Gated to material the student has revised, and seeded from
 * whichever session unlocked the chip — so a student who arrived via the chat door,
 * having revised nothing, still has something to practise on their first visit.
 */
export const PICKER_TOPICS = [
  { label: 'Chemistry: bonding', seeded: true },
  { label: 'Chemistry: acids and bases', seeded: false },
  { label: 'Biology: cell transport', seeded: false },
]

/** The drill list on the picker, from the frame. Amber = needs the most work. */
export const PICKER_DRILLS = [
  { label: 'Formal charge', state: 'drill' as const },
  { label: 'Hybridisation', state: 'drill' as const },
  { label: 'Resonance', state: 'sharp' as const },
]

/** The home greeting, from the frame. */
export const HOME_GREETING = 'Evening study session, Harry?'

export function getTerm(index: number): Term | undefined {
  return TERMS.find((t) => t.index === index)
}

/** Figma's progressIndicator takes fixed 25% steps; the prototype runs the 4-term case. */
export function progressFor(index: number): '0' | '25' | '50' | '75' | '100' {
  const steps = ['0', '25', '50', '75', '100'] as const
  return steps[Math.max(0, Math.min(index, 4))]
}

// ---------------------------------------------------------------------------
// The mock
// ---------------------------------------------------------------------------

/** Under this, the take reads as nothing said. */
const COULDNT_HEAR_UNDER_MS = 2000
/** Under this, a partial answer. At or above, a clean pass. */
const PASS_AT_MS = 5000

/**
 * One term is scripted to CouldntHear on its first attempt so the state appears in
 * every walkthrough without anyone hunting for it. Term 1, because the built
 * CouldntHear copy names formal charge.
 */
export const SCRIPTED_COULDNT_HEAR_TERM = 1

export function verdictFor(termIndex: number, durationMs: number, attempt: number): Verdict {
  if (termIndex === SCRIPTED_COULDNT_HEAR_TERM && attempt === 1) return 'CouldntHear'
  if (durationMs < COULDNT_HEAR_UNDER_MS) return 'CouldntHear'
  return durationMs >= PASS_AT_MS ? 'Pass' : 'Miss'
}

// ---------------------------------------------------------------------------
// Definition Drill Down
// ---------------------------------------------------------------------------
// A separate opt-in practice mode: work one definition out loud until you own it.
// Not graded, verbatim-oriented, NO XP — the reward is completing the thing.
//
// NOTE ON WHAT IS BUILT. The doc's model is variable-length: the meter fills by unaided
// coverage and the drill ends when coverage reaches full, whether that is the second
// pass or the sixth. That depends on a judge scoring unaided coverage per pass, which
// is unconfirmed with engineering. The built screens ship the FALLBACK — the four-rung
// ladder — by decision (SPEC.md Open 5). The meter is continuous either way, so the
// variable-length version is a data change, not a rebuild.

export type DrillRung = { step: number; cue: string; coverage: number }

/** The definition the drill works, thinning one rung at a time. */
export const DRILL_TERM = TERMS[0]

export const DRILL_RUNGS: DrillRung[] = [
  {
    step: 1,
    cue: "Formal charge is the charge on an atom when every bond's electrons are split evenly between the two atoms.",
    coverage: 25,
  },
  {
    step: 2,
    cue: "Formal charge is the charge on an atom when every bond's \u25a2\u25a2\u25a2\u25a2\u25a2\u25a2\u25a2\u25a2\u25a2 are split evenly between the two atoms.",
    coverage: 50,
  },
  {
    step: 3,
    cue: "Formal charge is the \u25a2\u25a2\u25a2\u25a2\u25a2\u25a2 on an atom when every bond's \u25a2\u25a2\u25a2\u25a2\u25a2\u25a2\u25a2\u25a2\u25a2 are split \u25a2\u25a2\u25a2\u25a2\u25a2\u25a2 between the two atoms.",
    coverage: 75,
  },
  { step: 4, cue: '\u25a2\u25a2\u25a2\u25a2\u25a2\u25a2 \u25a2\u25a2\u25a2\u25a2\u25a2\u25a2 \u2014 all of it, no cues.', coverage: 100 },
]

/**
 * The word the scaffold escalates on. `electrons` on every stumble frame — the whole
 * scaffold hangs off one word, so this lives here rather than being repeated.
 */
export const DRILL_MISSED_WORD = 'electrons'

export const DRILL_TOTAL_RUNGS = DRILL_RUNGS.length

export function drillRung(step: number): DrillRung | undefined {
  return DRILL_RUNGS.find((r) => r.step === step)
}

/**
 * The stumble scaffold. Help escalates on the SAME word and the task bends until it is
 * always completable, so a stuck student cannot loop forever. Resets per definition,
 * per session.
 */
export const STUMBLES = {
  first: { verdict: '\u2713 Partially correct, one missed', copy: "One word off. It's below, then take it again." },
  second: { verdict: '\u2713 Partially correct, one missed', copy: "Still tricky? Here's a nudge." },
  third: { verdict: '\u2713 Partially correct, one missed', copy: "Let's say this one together." },
} as const

// ---------------------------------------------------------------------------
// Session state
// ---------------------------------------------------------------------------
// Verdicts accumulate so 07 Recap reports the actual run rather than a canned result.
// sessionStorage, not React context: a context on the session layout dies on refresh,
// which would contradict the addressable-route decision. Never read during render —
// that breaks hydration. See SPEC.md § Conventions.

const KEY = 'sayitback.session'

export type TermOutcome = {
  index: number
  bucket: Bucket
  xp: number
  repeated?: boolean
  /**
   * What the student said on 03 Processing, before the verdict landed. Recap sorts
   * confidently-wrong terms to the top of Worth revisiting — the signal drives the
   * list rather than decorating it, so there is no badge.
   */
  wasSure?: boolean
  /** Set once the term has come back at 06 Lock It In. There is no second requeue. */
  requeued?: boolean
}
export type SessionState = {
  outcomes: TermOutcome[]
  startedAt: number
  /**
   * When the last term resolved. Session time stops when the session ends rather than
   * ticking while the student reads the recap — and it keeps sessionTotals pure, so
   * Recap can compute during render without calling Date.now().
   */
  lastAt: number
}

const EMPTY: SessionState = { outcomes: [], startedAt: 0, lastAt: 0 }

// Exposed through useSyncExternalStore rather than a read-in-useEffect, which is the
// React 19 way to subscribe to an external store: it has a server snapshot, so there is
// no hydration mismatch and no setState-in-effect.
const listeners = new Set<() => void>()
let cachedRaw: string | null = null
let cached: SessionState = EMPTY

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export function readSession(): SessionState {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = window.sessionStorage.getItem(KEY)
    if (raw !== cachedRaw) {
      cachedRaw = raw
      cached = raw ? (JSON.parse(raw) as SessionState) : EMPTY
    }
    return cached
  } catch {
    return EMPTY
  }
}

function serverSnapshot(): SessionState {
  return EMPTY
}

/** Subscribe a screen to the session. Safe to call during render. */
export function useSession(): SessionState {
  return useSyncExternalStore(subscribe, readSession, serverSnapshot)
}

function write(state: SessionState) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(state))
    cachedRaw = null
    listeners.forEach((l) => l())
  } catch {
    /* private mode, cleared storage — the session simply doesn't persist */
  }
}

export function startSession() {
  const now = Date.now()
  write({ outcomes: [], startedAt: now, lastAt: now })
}

export function recordOutcome(
  index: number,
  bucket: Bucket,
  opts?: { repeated?: boolean; wasSure?: boolean },
) {
  const state = readSession()
  const xp = XP_BY_BUCKET[bucket] + (opts?.repeated ? XP.repeat : 0)
  const outcomes = state.outcomes.filter((o) => o.index !== index)
  outcomes.push({ index, bucket, xp, repeated: opts?.repeated, wasSure: opts?.wasSure })
  outcomes.sort((a, b) => a.index - b.index)
  write({ ...state, outcomes, lastAt: Date.now() })
}

export function sessionTotals(state: SessionState) {
  const earned = state.outcomes.reduce((sum, o) => sum + o.xp, 0)
  const unaided = state.outcomes.filter((o) => o.bucket === 'Unaided').length
  const elapsedMs = state.startedAt ? Math.max(0, state.lastAt - state.startedAt) : 0
  return {
    earned,
    withBonus: earned + XP.completionBonus,
    unaided,
    score: state.outcomes.length ? Math.round((unaided / state.outcomes.length) * 100) : 0,
    elapsed: formatElapsed(elapsedMs),
  }
}

export function formatElapsed(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

/**
 * Next step after a term resolves.
 *
 * Within the set, the following term. At the end of the set, a missed term is
 * requeued once — it comes back cold at /session/lock-in rather than resolving
 * permanently on one attempt (docs/sprint-context.md § Concept). Requeue sits outside
 * the [term] numbering by decision: its own screen, its own copy, its own progress
 * value. A term already requeued once is not requeued again; 06b closes it.
 */
export function nextAfter(index: number): string {
  // A term that has already come back at 06 Lock It In closes there, whatever the
  // verdict — "no further requeue". Without this it re-enters the normal sequence and
  // the student re-runs terms they already finished.
  const alreadyRequeued = readSession().outcomes.find((o) => o.index === index)?.requeued
  if (alreadyRequeued) return '/session/lock-in/second'
  if (index < TOTAL_TERMS) return `/session/idle/${index + 1}`
  const { outcomes } = readSession()
  const requeueable = outcomes.some((o) => o.bucket === 'Worth revisiting' && !o.requeued)
  return requeueable ? '/session/lock-in' : '/session/recap'
}

/**
 * Try again re-presents the same terms in a different order, so position cues from the
 * first run don't carry over. Returns the term to start on.
 */
export function shuffledFirstTerm(): number {
  return TERMS[Math.floor(Math.random() * TERMS.length)].index
}

/**
 * How many terms are still owed a revisit. The requeue rounds use this to say where
 * they are ("Revisit 1 of 2") instead of borrowing a term number they do not have.
 */
export function revisitPlan(): { index: number; total: number } {
  const { outcomes } = readSession()
  const owed = outcomes.filter((o) => o.bucket === 'Worth revisiting')
  const done = owed.filter((o) => o.requeued).length
  return { index: Math.max(1, done), total: Math.max(1, owed.length) }
}

/** Marks the requeued term so it can't come back a second time. */
export function markRequeued(index: number) {
  const state = readSession()
  write({
    ...state,
    outcomes: state.outcomes.map((o) => (o.index === index ? { ...o, requeued: true } : o)),
  })
}
