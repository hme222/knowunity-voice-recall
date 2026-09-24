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
  /** What the student "said" on a full take. No STT exists; this is canned. */
  transcript: string
  /**
   * What a SHORT take produced — the same student, having said less.
   *
   * One transcript used to serve both verdicts, and 02a Captured shows it before the
   * verdict lands. So a student saw a complete, correct answer, tapped "Looks right",
   * and was then told a piece of it was missing. The words on the miss screen
   * contradicted the words they had just confirmed.
   *
   * Each of these omits exactly what its `missTitle` goes on to name.
   */
  partialTranscript: string
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
  // The confidence tap (03 Processing, "How sure are you?") is the Design Brief's own
  // test — "overconfidence has to cost something and underconfidence has to be
  // rewarded, or the screen is just flattery." These three make it mechanical. They
  // are judged on the FIRST tap that got a real verdict (a couldn't-hear does not
  // count), so a hint or a reveal can never launder the original call.
  /** Sure, and right first time. Called it. */
  sureRight: 2,
  /** Not sure, and right first time. Knew more than they thought — a little, never a
   *  penalty. Below sureRight on purpose: if doubting paid as well as knowing, "Not
   *  sure" would be the only rational tap and the signal would die. */
  unsureRight: 1,
  /** Sure, and wrong. COSTS NOTHING, decided 2026-09-23.
   *
   *  This was -3, on the reading that "overconfidence has to cost something". The
   *  designer overruled it: a student who was confident and wrong has already had the
   *  worse experience of the two, and charging them for it punishes honesty about
   *  their own belief rather than the belief itself.
   *
   *  The reward side stays, so the tap still means something — but note what it now
   *  implies: with no downside, "Sure" strictly dominates, and a student optimising XP
   *  should always tap it. If that becomes a problem the answer is to flatten
   *  sureRight and unsureRight to the same value and let the tap be purely
   *  informational, NOT to reintroduce a penalty. */
  sureWrong: 0,
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
    partialTranscript:
      "It's the charge on an atom, worked out from its bonds.",
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
    transcript: 'It is a double layer of fatty molecules around the cell, and that is what lets it choose what gets in and what stays out.',
    partialTranscript:
      "It is the layer around the cell that decides what gets in and what stays out.",
    passTitle: 'That is it — the job and why it can be selective.',
    // Was "you described the cell wall, not the membrane", which contradicted this
    // term's own answer: the canned transcript says the membrane decides what gets in
    // and out, and the answer says it controls what passes in and out. The miss has to
    // point at what is actually missing from the transcript — the mechanism.
    missTitle: 'The job is right. What it is made of is the part that explains how it chooses.',
    hint: 'Think about what the membrane is made of, and why that lets it choose.',
    answer:
      'The cell membrane is a phospholipid bilayer around the cell that controls which substances pass in and out.',
  },
  {
    index: 3,
    name: 'Cytoskeleton',
    title: 'Explain: Cytoskeleton',
    prompt: 'Say what the cytoskeleton is for, in your own words. However you would explain it to a friend.',
    transcript: 'It is the scaffolding inside a cell that holds its shape and moves things around inside it.',
    partialTranscript:
      "It is the scaffolding inside a cell that holds its shape.",
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
    transcript: 'It is how things move across the membrane — some of it just drifts across, and some of it costs the cell energy.',
    partialTranscript:
      "It is how things move across the membrane, sometimes using energy.",
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
// The hint ladder
// ---------------------------------------------------------------------------
// hint → retry → second hint → retry → reveal (Design Brief § "What Knowunity
// specified"). Keyed on the attempt number the miss arrived with, which is what the
// screens already carry, so the ladder needs no new state. Bounded: from the third
// missed attempt on, Try again is withdrawn and the reveal is the only way forward. A
// requeue starts at attempt 2 (06 Lock It In), so a missed requeue gets the strong hint
// and one retry — a second chance, not a whole new ladder.

/** The attempt at which a miss can no longer be retried. */
export const REVEAL_AT_ATTEMPT = 3

export type HintStep = {
  /** 1 on the first miss, 2 from the second on. Which `hintCard` body to show. */
  level: 1
  /** The hint body for this rung. */
  hint: string
  /** False from REVEAL_AT_ATTEMPT on: hide Try again, or go straight to the reveal. */
  canRetry: boolean
  /** The attempt number to send Try again to. Undefined once retrying is closed. */
  nextAttempt?: number
}

/** Which rung of the ladder a miss on `attempt` lands on. */
export function hintFor(term: Term, attempt: number): HintStep {
  const n = Number.isFinite(attempt) && attempt > 0 ? Math.floor(attempt) : 1
  // ONE hint, repeated. `docs/sprint-context.md` § "Not building this sprint" lists
  // "Second hint", and CLAUDE.md makes that list binding. The Design Brief describes a
  // two-hint ladder, but under § "What Knowunity specified at kickoff" — the kickoff
  // ask, which this sprint scoped down. A `hint2` was briefly added here against that
  // rule and is removed.
  //
  // What DOES stay is the bound. The real defect was that "Try again" was still offered
  // at attempt 10 with byte-identical copy: a loop with no end. It ends at
  // REVEAL_AT_ATTEMPT now, and the reveal is the escalation the second hint would have
  // been.
  const canRetry = n < REVEAL_AT_ATTEMPT
  return {
    level: 1,
    hint: term.hint,
    canRetry,
    nextAttempt: canRetry ? n + 1 : undefined,
  }
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
    cue: "Formal charge is the charge on an atom when every bond's _________ are split evenly between the two atoms.",
    coverage: 50,
  },
  {
    step: 3,
    cue: "Formal charge is the ______ on an atom when every bond's _________ are split ______ between the two atoms.",
    coverage: 75,
  },
  { step: 4, cue: '______ ______ \u2014 all of it, no cues.', coverage: 100 },
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
  /**
   * The confidence adjustment for this term — XP.sureRight, XP.unsureRight,
   * XP.sureWrong, or 0 (not sure and wrong, or never asked). Kept apart from `xp` so a
   * Recap row can print the bucket's figure and the call separately, and so a negative
   * never has to be shown as a term's XP: `xp` is what the term paid, `calibration` is
   * what the call did to the session total.
   */
  calibration?: number
  /** Set once the term has come back at 06 Lock It In. There is no second requeue. */
  requeued?: boolean
}

/** The first judged confidence tap for a term. Set at 03 Processing, read at record time. */
export type ConfidenceTap = {
  wasSure: boolean
  /** Whether the verdict that followed the tap was a Pass. */
  right: boolean
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
  /** What the student typed, by term index. Absent for spoken turns. */
  typed?: Record<number, string>
  /**
   * The first tap per term that got a real verdict. A tap that preceded a couldn't-hear
   * is not stored: that was the app failing, not the student, and it must not be scored
   * as either a hit or a miss.
   */
  confidence?: Record<number, ConfidenceTap>
  /**
   * The mic was denied this session (docs/voice-ux.md § 3: "a denied mic stays sticky
   * for the session, because it can't work anyway"). Every term routes to the typed
   * turn. Survives Try again — startSession keeps it — because the OS setting has not
   * changed just because the run restarted.
   */
  sticky?: boolean
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
  const { sticky } = readSession()
  write({ outcomes: [], startedAt: now, lastAt: now, ...(sticky ? { sticky } : {}) })
}

/**
 * Start the clock if nothing has started it yet, and leave a run in progress alone.
 *
 * `startSession` only ran on 00 Intro, and the doors go straight to
 * `/session/idle/1?door=…` — so a door run never started the clock, `startedAt` stayed
 * 0, and the Recap's Time chip read 0:00 for a session the student had just spent four
 * minutes on. Every other Recap number survived because they derive from `outcomes`,
 * which is written lazily as terms resolve; the clock was the one value that needed a
 * beginning and never got one.
 *
 * Called from 01 Idle, which is the first screen of EVERY entry path. Guarded on
 * `startedAt` so terms 2-4 don't restart it.
 */
export function ensureSessionStarted() {
  const state = readSession()
  if (state.startedAt) return
  const now = Date.now()
  write({ ...state, startedAt: now, lastAt: now })
}

// ---------------------------------------------------------------------------
// The confidence tap
// ---------------------------------------------------------------------------

/**
 * Record the tap from 03 Processing. Call it in the tap handler, before routing to the
 * verdict screen, with the verdict `verdictFor` produced for this attempt. Only the first
 * judged tap per term is kept: a retry after a hint, or the requeue at 06, never
 * overwrites the original call, because that call is the thing being scored. A
 * CouldntHear verdict is ignored entirely.
 */
export function recordConfidence(index: number, wasSure: boolean, verdict: Verdict) {
  if (verdict === 'CouldntHear') return
  const state = readSession()
  if (state.confidence?.[index]) return
  write({
    ...state,
    confidence: { ...(state.confidence ?? {}), [index]: { wasSure, right: verdict === 'Pass' } },
  })
}

/** The stored first tap for a term, if there was one. Pure; pass the state from useSession(). */
export function confidenceFor(state: SessionState, index: number): ConfidenceTap | undefined {
  return state.confidence?.[index]
}

/**
 * The confidence adjustment for a call. `right` is whether the first judged verdict was
 * a Pass. Undefined `wasSure` means the tap was never made (typed path, a skip from
 * Idle) and scores nothing either way.
 */
export function calibrationFor(wasSure: boolean | undefined, right: boolean): number {
  if (wasSure === undefined) return 0
  if (right) return wasSure ? XP.sureRight : XP.unsureRight
  return wasSure ? XP.sureWrong : 0
}

/**
 * Whether the first judged verdict was a Pass, read off the bucket. Unaided is the only
 * bucket a term reaches without first missing: Hinted means a retry after a miss,
 * Revealed and Worth revisiting mean it was never passed. A couldn't-hear never stores
 * a tap, so it cannot masquerade as a miss here.
 */
function firstAttemptRight(bucket: Bucket): boolean {
  return bucket === 'Unaided'
}

/**
 * What a term is worth, given its bucket and the first judged tap. `total` is base plus
 * calibration, floored at 0 for the live in-flow figure — the negative case is charged
 * to the session total in sessionTotals, so a term never displays below zero.
 *
 * Pass: `xpFor('Unaided', tap?.wasSure)` → { base: 10, calibration: 2, total: 12 } when
 * they said Sure. Miss (skip or reveal after a Sure): base 0, calibration -3, total 0.
 */
/**
 * Did this term's answer come from the keyboard when the mic was available?
 *
 * sprint-context.md: "Typed answers are reduced, but only when voice was available."
 * A student whose mic is denied keeps the full value — the reduction is for choosing
 * the keyboard, not for being unable to speak, and `sticky` is how the build tells
 * those apart.
 */
export function typedByChoice(state: SessionState, index: number): boolean {
  return Boolean(state.typed?.[index]?.trim()) && !isSticky(state)
}

/**
 * What a bucket pays, reduced when the answer was typed by choice.
 *
 * Decided 2026-09-22: a typed pass scores as Hinted rather than Unaided, reusing an
 * existing tier instead of inventing a number — typing removes the retrieval-out-loud
 * the feature exists to test, so it lands where "got there with help" lands. The Recap
 * BUCKET stays Unaided, because the student did retrieve it unaided, just not aloud.
 * Only an unaided pass has anything to lose; every lower tier already sits at or below
 * the hinted value.
 */
export function bucketXp(bucket: Bucket, typedWhenVoiceWorked: boolean): number {
  if (typedWhenVoiceWorked && bucket === 'Unaided') return XP.hinted
  return XP_BY_BUCKET[bucket]
}

export function xpFor(
  bucket: Bucket,
  wasSure?: boolean,
  opts?: { repeated?: boolean; typedWhenVoiceWorked?: boolean },
): { base: number; calibration: number; total: number } {
  const base = bucketXp(bucket, opts?.typedWhenVoiceWorked ?? false) + (opts?.repeated ? XP.repeat : 0)
  const calibration = calibrationFor(wasSure, firstAttemptRight(bucket))
  return { base, calibration, total: Math.max(0, base + calibration) }
}

/** A term's recorded outcome, if it has resolved. Pure; pass the state from useSession(). */
export function outcomeFor(state: SessionState, index: number): TermOutcome | undefined {
  return state.outcomes.find((o) => o.index === index)
}

/**
 * Resolve a term. Re-recording the same index replaces its bucket and XP but keeps what
 * the run already knows about it — `requeued` above all. Dropping that flag was the
 * requeue bug: a term re-answered at 06 Lock It In came back through here as a fresh
 * outcome, nextAfter no longer saw it as requeued, and the session ran again from term 2.
 *
 * The confidence adjustment comes from the tap stored by recordConfidence, never from
 * `opts.wasSure`: that option only feeds the Recap sort, and it can arrive from a tap
 * that preceded a couldn't-hear, which must not be scored. Until 03 Processing calls
 * recordConfidence, calibration is 0 everywhere — exactly today's behaviour.
 */
export function recordOutcome(
  index: number,
  bucket: Bucket,
  opts?: { repeated?: boolean; wasSure?: boolean },
): TermOutcome {
  const state = readSession()
  const prior = state.outcomes.find((o) => o.index === index)
  const tap = state.confidence?.[index]
  const wasSure = tap?.wasSure ?? opts?.wasSure ?? prior?.wasSure
  // Reduced when the student chose the keyboard over a working mic.
  const xp = bucketXp(bucket, typedByChoice(state, index)) + (opts?.repeated ? XP.repeat : 0)
  const calibration = tap ? calibrationFor(tap.wasSure, tap.right) : 0
  const outcome: TermOutcome = {
    index,
    bucket,
    xp,
    repeated: opts?.repeated,
    wasSure,
    calibration,
    requeued: prior?.requeued,
  }
  const outcomes = state.outcomes.filter((o) => o.index !== index)
  outcomes.push(outcome)
  outcomes.sort((a, b) => a.index - b.index)
  write({ ...state, outcomes, lastAt: Date.now() })
  return outcome
}

/**
 * The Recap's numbers, all derivable from the rows so the total is never a figure the
 * reviewer can see is wrong:
 *
 *   termXp      = Σ row.xp                       (what the buckets paid)
 *   calibration = Σ row.calibration              (signed; the confidence line)
 *   earned      = max(0, termXp + calibration)   (the session, before the bonus)
 *   withBonus   = earned + XP.completionBonus    (only once the set is complete)
 *
 * `earned` and `withBonus` keep their names so existing callers stay correct; they now
 * include the calibration. Recap should print the calibration line whenever it is
 * non-zero, otherwise the rows will not appear to add up.
 */
export function sessionTotals(state: SessionState) {
  const termXp = state.outcomes.reduce((sum, o) => sum + o.xp, 0)
  const calibration = state.outcomes.reduce((sum, o) => sum + (o.calibration ?? 0), 0)
  const sureWrong = state.outcomes.filter((o) => (o.calibration ?? 0) < 0).length
  const unsureRight = state.outcomes.filter((o) => o.calibration === XP.unsureRight).length
  const sureRight = state.outcomes.filter((o) => o.calibration === XP.sureRight).length
  const earned = Math.max(0, termXp + calibration)
  const unaided = state.outcomes.filter((o) => o.bucket === 'Unaided').length
  const elapsedMs = state.startedAt ? Math.max(0, state.lastAt - state.startedAt) : 0
  return {
    termXp,
    calibration,
    sureRight,
    unsureRight,
    sureWrong,
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
  const state = readSession()
  // A term that has already come back at 06 Lock It In closes there, whatever the
  // verdict — "no further requeue". Without this it re-enters the normal sequence and
  // the student re-runs terms they already finished. The flag is read from the run, not
  // the query string: 06 marks the term on arrival, and recordOutcome now keeps the
  // mark when the term is re-recorded, so no screen has to carry `requeued=1` along.
  const alreadyRequeued = state.outcomes.find((o) => o.index === index)?.requeued
  if (alreadyRequeued) return '/session/lock-in/second?answered=1'
  if (index < TOTAL_TERMS) return termHref(index + 1, state)
  // The term rides in the route, as it does everywhere else in this flow.
  //
  // 06 used to re-derive it from the session on every render — "first outcome bucketed
  // Worth revisiting and not yet requeued" — and then mark it requeued on arrival. The
  // mark made its own predicate stop matching, so the screen forgot which term it was
  // asking about between one render and the next and fell through to term 1. Naming it
  // here makes the screen's identity immutable for the life of the visit.
  const requeueable = state.outcomes.find((o) => o.bucket === 'Worth revisiting' && !o.requeued)
  return requeueable ? `/session/lock-in?term=${requeueable.index}` : '/session/recap'
}

// ---------------------------------------------------------------------------
// The denied mic
// ---------------------------------------------------------------------------

/**
 * Mark the mic as denied for the rest of the session. Call from /permission/denied
 * before routing to the typed turn. Idempotent; `setSticky(false)` clears it, for a
 * student who has gone and turned the mic back on.
 */
export function setSticky(on = true) {
  const state = readSession()
  write({ ...state, sticky: on || undefined })
}

/** Whether the mic is denied this session. Pure; pass the state from useSession(). */
export function isSticky(state: SessionState): boolean {
  return state.sticky === true
}

/** isSticky, subscribed. Safe to call during render. */
export function useSticky(): boolean {
  return isSticky(useSession())
}

/**
 * Where a term is answered: the mic screen, or the typed turn when the mic is denied.
 * Every route that starts a term should go through here — nextAfter does — so a denied
 * student is never handed a mic screen. `sticky=1` is still put on the URL so the typed
 * turn reads the same on a cold load.
 */
export function termHref(index: number, state: SessionState = readSession()): string {
  return isSticky(state) ? `/text/turn?term=${index}&sticky=1` : `/session/idle/${index}`
}

/**
 * Try again re-presents the same terms in a different order, so position cues from the
 * first run don't carry over. Returns the term to start on.
 */
export function shuffledFirstTerm(): number {
  return TERMS[Math.floor(Math.random() * TERMS.length)].index
}

/**
 * What the student actually said for a term, when we have it.
 *
 * SPEC § "How the mocked recall behaves" 3 says transcripts are canned, which is right
 * for the spoken path: there is no recogniser, so there is nothing real to echo. The
 * TYPED path is different — the student's own words are sitting right there. Echoing a
 * fixture at someone who just typed something else breaks the one promise the concept
 * rests on ("a clean pass echoes the student's own transcript back as proof") and it
 * does it at the exact moment the proof is being offered.
 */
export function setTypedAnswer(index: number, text: string) {
  const state = readSession()
  write({ ...state, typed: { ...(state.typed ?? {}), [index]: text } })
}

/**
 * What to SHOW as the student's words, given how the take is about to be judged.
 *
 * A short take produced less, so 02a Captured and 05 Miss both show the partial. A
 * typed answer always wins — those are the student's real words.
 */
export function shownAnswer(index: number, verdict: Verdict): string {
  const typed = readSession().typed?.[index]
  if (typed && typed.trim()) return typed.trim()
  const term = getTerm(index)
  if (!term) return ''
  return verdict === 'Pass' ? term.transcript : term.partialTranscript
}

/** The typed answer if there is one, else the term's canned transcript. */
export function answerFor(index: number): string {
  const typed = readSession().typed?.[index]
  if (typed && typed.trim()) return typed.trim()
  return getTerm(index)?.transcript ?? ''
}

/** True while any term is still owed its one requeue. Pass the state from useSession() in render. */
export function revisitsPending(state: SessionState = readSession()): boolean {
  return state.outcomes.some((o) => o.bucket === 'Worth revisiting' && !o.requeued)
}

/**
 * The term that has come back at 06 Lock It In, whatever it resolved to since. 06b must
 * look this up by the `requeued` mark, not by bucket: a requeued term that is answered
 * is re-recorded as Unaided or Hinted, so a bucket search finds nothing and falls back
 * to term 1. Pure; pass the state from useSession().
 */
export function requeuedOutcome(state: SessionState): TermOutcome | undefined {
  return state.outcomes.find((o) => o.requeued)
}

/** Whether the requeued term was actually answered — passed, not skipped or revealed. */
export function requeuePassed(state: SessionState): boolean {
  const o = requeuedOutcome(state)
  return !!o && (o.bucket === 'Unaided' || o.bucket === 'Hinted')
}

/**
 * How many terms are still owed a revisit. The requeue rounds use this to say where
 * they are ("Revisit 1 of 2") instead of borrowing a term number they do not have.
 */
export function revisitPlan(state: SessionState = readSession()): { index: number; total: number } {
  // A requeued term keeps counting as owed after it is re-recorded into another bucket.
  const owed = state.outcomes.filter((o) => o.bucket === 'Worth revisiting' || o.requeued)
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
