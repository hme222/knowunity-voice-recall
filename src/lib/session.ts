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
  /**
   * Definition Drill Down's material for this term. Every term has one since
   * 2026-10-09 (designer: "Drill it out loud" for each term, not only formal charge).
   */
  drill: TermDrill
}

/**
 * One term's drill. `cues` are rungs 1-3, the definition thinning one rung at a time,
 * blanks written as underscores (Cue draws them as rules); rung 2 blanks exactly
 * `missedWord`, the word the stumble scaffold escalates on. `partial` is the stumbled
 * take — the definition with `missedWord` simply absent — used by both the screen that
 * shows the take and the screen that judges it, so the two can never disagree.
 */
export type TermDrill = {
  cues: [string, string, string]
  missedWord: string
  partial: string
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
  /** Sure, and right first time. Called it.
   *
   *  FLATTENED 2026-10-12 (designer, from the critic panel): sureRight and unsureRight
   *  pay the same. At 2 against 1, with sureWrong at 0, "Sure" strictly dominated and
   *  the tap stopped measuring anything — the remedy this block's own note below
   *  prescribed. The tap is now informational: it pays a little for a right answer
   *  either way, costs nothing, and the Recap still marks "you were sure" on a miss. */
  sureRight: 1,
  /** Not sure, and right first time. Knew more than they thought. Equal to sureRight
   *  since 2026-10-12, so doubting is never the losing tap. */
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
    drill: {
      cues: [
        "Formal charge is the charge on an atom when every bond's electrons are split evenly between the two atoms.",
        "Formal charge is the charge on an atom when every bond's _________ are split evenly between the two atoms.",
        "Formal charge is the ______ on an atom when every bond's _________ are split ______ between the two atoms.",
      ],
      // `electrons` on every stumble frame — the whole scaffold hangs off one word.
      missedWord: 'electrons',
      // DD 07 used to hardcode a different string with an invented "um…" in it, while
      // /drill/captured showed the CLEAN transcript; one string now feeds both.
      partial: "It's the charge on an atom if you split every bond's… evenly between the two atoms.",
    },
  },
  // Terms 2-4 are Chemistry: bonding, the same topic as formal charge — decided
  // 2026-10-09 by the designer: one subject, like a normal Say It Back session. They
  // were three Biology terms, so a "Chemistry quiz" door led into a mixed set.
  //
  // The rules the Biology set learned the hard way still hold: the prompt asks for
  // every part the marking checks, and `partialTranscript` leaves out exactly what
  // `missTitle` names, so the verdict never contradicts the quote printed under it.
  {
    index: 2,
    name: 'Covalent bond',
    title: 'Explain: Covalent bond',
    prompt: 'Say what a covalent bond is and what holds it together, in your own words. However you would explain it to a friend.',
    transcript: 'It is when two atoms share a pair of electrons, and both nuclei pulling on that shared pair is what holds them together.',
    // Names the atoms, says nothing about the electrons — which is what `missTitle` names.
    partialTranscript: 'It is a bond between two atoms, usually two non-metals.',
    passTitle: 'That is it — shared electrons, and why they hold.',
    missTitle: 'Right atoms. What they do with their electrons is the piece that is missing.',
    hint: 'Think about what the two atoms do with their electrons.',
    answer:
      'A covalent bond is a pair of electrons shared between two atoms, held together by both nuclei attracting the shared pair.',
    drillTitle: 'Define: Covalent bond',
    drill: {
      cues: [
        'A covalent bond is a pair of electrons shared between two atoms, held together by both nuclei attracting the shared pair.',
        'A covalent bond is a pair of electrons shared between two atoms, held together by both ______ attracting the shared pair.',
        'A covalent bond is a pair of _________ ______ between two atoms, held together by both ______ attracting the shared pair.',
      ],
      missedWord: 'nuclei',
      partial: "It's a pair of electrons shared between two atoms, held together by both… attracting the shared pair.",
    },
  },
  {
    index: 3,
    name: 'Electronegativity',
    title: 'Explain: Electronegativity',
    prompt: 'Say what electronegativity means, in your own words. However you would explain it to a friend.',
    transcript: 'It is how strongly an atom pulls shared electrons toward itself in a bond, so the more electronegative atom gets more than its share.',
    // Where you look it up, not what it measures.
    partialTranscript: 'It is a number each element has on the periodic table.',
    passTitle: 'Yes — the pull on shared electrons, and what it does.',
    missTitle: 'True, but that is where you look it up. What it measures is the piece that is missing.',
    hint: 'In a bond, which atom gets more of the shared electrons?',
    answer:
      'Electronegativity is how strongly an atom attracts the shared electrons in a bond toward itself.',
    drillTitle: 'Define: Electronegativity',
    drill: {
      cues: [
        'Electronegativity is how strongly an atom attracts the shared electrons in a bond toward itself.',
        'Electronegativity is how strongly an atom ________ the shared electrons in a bond toward itself.',
        'Electronegativity is how ________ an atom ________ the ______ electrons in a bond toward itself.',
      ],
      missedWord: 'attracts',
      partial: "It's how strongly an atom… the shared electrons in a bond toward itself.",
    },
  },
  {
    index: 4,
    name: 'Octet rule',
    title: 'Explain: Octet rule',
    prompt: 'Say what the octet rule is, in your own words. However you would explain it to a friend.',
    transcript: 'Atoms tend to bond until they have eight electrons in their outer shell, by sharing, gaining or losing electrons.',
    // The number, with neither where the eight are nor how an atom gets them.
    partialTranscript: 'Atoms want to have eight electrons.',
    passTitle: 'Nailed it — eight in the outer shell, and how they get there.',
    missTitle: 'That is the right number. Where the eight are, and how atoms get them, is what is missing.',
    hint: 'Eight electrons where? And how does an atom reach it?',
    answer:
      'The octet rule says atoms tend to gain, lose or share electrons until they have eight in their outer shell.',
    drillTitle: 'Define: Octet rule',
    drill: {
      cues: [
        'The octet rule says atoms tend to gain, lose or share electrons until they have eight in their outer shell.',
        'The octet rule says atoms tend to gain, lose or share electrons until they have eight in their _____ shell.',
        'The octet rule says atoms tend to gain, lose or _____ electrons until they have _____ in their _____ shell.',
      ],
      missedWord: 'outer',
      partial: 'Atoms tend to gain, lose or share electrons until they have eight in their… shell.',
    },
  },
]

export const TOTAL_TERMS = TERMS.length

/** The set's subject, named on every session screen so the run never loses it. */
export const SUBJECT = 'Chemistry'

/**
 * Quizzes due, for the plan-active home. Three because the built flow shows three
 * swipe states — not because three is a rule. The count badge counts down as the
 * student clears them: "+2" → "+1" → "last one".
 */
export const DUE_QUIZZES = [
  { term: 'Formal charge', subject: 'Chemistry', due: '9/15' },
  { term: 'Covalent bond', subject: 'Chemistry', due: '9/17' },
  { term: 'Electronegativity', subject: 'Chemistry', due: '9/19' },
]

export function dueCountLabel(indexFromZero: number) {
  const remaining = DUE_QUIZZES.length - indexFromZero - 1
  if (remaining <= 0) return 'last one'
  return `+${remaining}`
}

/**
 * The picker's topics. Gated to material the student has revised, and seeded from
 * whichever session unlocked the chip — so a student who arrived via the chat door,
 * having revised nothing, still has something to practice on their first visit.
 */
export const PICKER_TOPICS = [
  { label: 'Chemistry: bonding', seeded: true },
  { label: 'Chemistry: molecular shape', seeded: false },
  { label: 'Chemistry: intermolecular forces', seeded: false },
]

/** The drill list on the picker, from the frame. Amber = needs the most work. */
export const PICKER_DRILLS = [
  { term: 1, label: 'Formal charge', state: 'drill' as const },
  { term: 2, label: 'Covalent bond', state: 'drill' as const },
  { term: 3, label: 'Electronegativity', state: 'sharp' as const },
]

/** The home greeting, from the frame. */
export const HOME_GREETING = 'Evening study session, Harry?'
/** The profile tab's initial, as the live app draws it (reference/screenshots/54). */
export const STUDENT_INITIAL = 'H'

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

/** Coverage per rung, the meter's fill. The same on every term. */
const RUNG_COVERAGE = [25, 50, 75, 100] as const

/** The drill's rungs for a term: its three cues, then the no-cue rung. */
export function drillRungs(term: Term): DrillRung[] {
  return [
    ...term.drill.cues.map((cue, i) => ({ step: i + 1, cue, coverage: RUNG_COVERAGE[i] })),
    { step: 4, cue: '______ ______ \u2014 all of it, no cues.', coverage: RUNG_COVERAGE[3] },
  ]
}

export const DRILL_TOTAL_RUNGS = RUNG_COVERAGE.length

export function drillRung(term: Term, step: number): DrillRung | undefined {
  return drillRungs(term).find((r) => r.step === step)
}

/**
 * The few words around a term's missed word, from its full definition, with the word
 * itself replaced — DD 07b's "…every bond's e_____ are split evenly…". It was that
 * formal-charge string, hardcoded, on every term.
 */
export function missedWordContext(term: Term, replacement: string): string {
  const words = term.drill.cues[0].split(' ')
  const at = words.findIndex((w) => w.replace(/[^\p{L}]/gu, '') === term.drill.missedWord)
  if (at < 0) return `…${replacement}…`
  const before = words.slice(Math.max(0, at - 2), at)
  const after = words.slice(at + 1, at + 4)
  // No closing ellipsis when the fragment runs to the end of the sentence.
  const tail = at + 4 >= words.length ? '' : '…'
  return `…${[...before, replacement, ...after].join(' ')}${tail}`
}

/** Choose which term the drill works. Set by whoever opens /drill/intro. */
export function setDrillTerm(index: number) {
  const state = readSession()
  if (state.drillTerm === index) return
  write({ ...state, drillTerm: index })
}

/**
 * The term the drill is working — formal charge until something picks another. A
 * hook over the session store, so the server render (formal charge) hydrates cleanly
 * and the picked term arrives with the store, like every other session fact.
 */
export function useDrillTerm(): Term {
  const state = useSession()
  return getTerm(state.drillTerm ?? 1) ?? TERMS[0]
}

/**
 * The stumble scaffold. Help escalates on the SAME word and the task bends until it is
 * always completable, so a stuck student cannot loop forever. Resets per definition,
 * per session.
 */
export const STUMBLES = {
  // The verdict escalates with the rung. All three used to be the same literal string,
  // so the one piece of chrome built to announce severity said the same sentence from
  // the first gentle nudge to the guaranteed-completable echo — the copy below escalated
  // three times and the chip above it never moved.
  // No ✓ on any of these (designer, 2026-10-12): a check mark on a miss contradicted
  // the screen, and the first one now reads the same as the session's partial,
  // "Partially right", so one verdict has one name in both flows.
  first: { verdict: 'Partially right', copy: "One word off. It's below, then take it again." },
  second: { verdict: 'Same word again', copy: "Still tricky? Here's a nudge." },
  third: { verdict: 'Let\u2019s do this one together', copy: "Let's say this one together." },
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
  /**
   * The answer that resolved it was typed, not said aloud. The Recap tags the row and
   * the transcript sheet stops claiming it was "heard" (usability review, 2026-10-12).
   */
  typed?: boolean
  /**
   * Skipped after the mic failed on it (2026-10-12). Still offered for practice, but
   * the Recap does not count it as a miss: the app failed, not the student.
   */
  micTrouble?: boolean
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
  /**
   * True while the student is in a practice round from 07a, not the graded session.
   *
   * "Practice what I missed" used to re-enter the ordinary session flow, so a clean
   * practice pass rewrote the same outcome with the same bucket and the Recap came back
   * byte-identical — a student did the remedial work the app recommended and nothing it
   * showed her changed. Practice is practice: it does not rewrite the run, and it says
   * so rather than dressing itself as the last question of the session.
   */
  practising?: boolean
  /**
   * Terms the mic failed on (a couldn't-hear), whatever happened next. Typing one of
   * these is not "typing by choice", so it pays in full (designer, 2026-10-12).
   */
  micFault?: number[]
  /**
   * Judged misses per term — the hint ladder's rung (dev review, 2026-10-12). It used to
   * ride the URL as `attempt`, which the typed path dropped (so its ladder never ended)
   * and which a mishear's retry bumped (so a couldn't-hear spent a rung). A fact about
   * the run belongs in the run, like `hinted`.
   */
  misses?: Record<number, number>
  /**
   * The door a one-definition run started from. A door run is ONE definition, however
   * it goes (designer, 2026-10-12): when that term resolves, the run ends on home
   * rather than carrying on into the full set. Absent for a full session.
   */
  door?: string
  /** Which term Definition Drill Down is working (index into TERMS). Absent = term 1. */
  drillTerm?: number
  /**
   * The practice round still to run, head first: the term being practiced now, then
   * the rest. Set by 07a ("Practice all 3" or one row); each finished term shifts it,
   * and the Recap comes back once, at the end — not after every term.
   */
  practiceQueue?: PracticeItem[]
  /**
   * Terms the student has been SHOWN a hint for, whatever happened afterwards.
   *
   * The `hinted` flag used to ride the query string through recording → captured →
   * processing → the verdict. Every hop carried it except one: 04a Couldn't hear's
   * retry rebuilt the URL from scratch and dropped it. So a term that was hinted, then
   * misheard, then answered came back bucketed Unaided — the Recap crediting a cold
   * recall the student had been helped with. A fact about the run belongs in the run,
   * not in a URL that five screens have to remember to forward.
   */
  hinted?: number[]
  /** What the student typed, by term index. Absent for spoken turns. */
  typed?: Record<number, string>
  /**
   * The last typed answer actually sent for judging, by term index. A draft that equals
   * it has already been judged, so it is not put back in the box on a retry.
   */
  sentTyped?: Record<number, string>
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

export function startSession(opts?: { door?: string }) {
  const now = Date.now()
  const { sticky } = readSession()
  write({ outcomes: [], startedAt: now, lastAt: now, ...(sticky ? { sticky } : {}), ...(opts?.door ? { door: opts.door } : {}) })
}

/** Record that a hint was shown for a term. Idempotent. */
export function markHinted(index: number) {
  const state = readSession()
  if (state.hinted?.includes(index)) return
  write({ ...state, hinted: [...(state.hinted ?? []), index] })
}

/** Whether a hint was ever shown for this term. Pure; pass the state from useSession(). */
export function wasHinted(state: SessionState, index: number): boolean {
  return Boolean(state.hinted?.includes(index))
}

/** One term in a practice round, and how to practice it. */
export type PracticeItem = { index: number; mode: 'drill' | 'say' }

/**
 * The method 07a recommends, from what happened to the term (designer, 2026-10-09).
 * Shown the answer or skipped: the student did not have it, so rebuild it a piece at a
 * time in the drill. Got it with a hint: they nearly had it, so say it again.
 */
export function recommendedMode(bucket: Bucket, micTrouble = false): PracticeItem['mode'] {
  // A term the mic missed was never judged, so the first try is just saying it again.
  if (micTrouble) return 'say'
  return bucket === 'Hinted' ? 'say' : 'drill'
}

/** Where a practice item starts. */
function practiceItemHref(item: PracticeItem, state: SessionState): string {
  return item.mode === 'drill' ? '/drill/intro' : termHref(item.index, state)
}

/** Start a practice round on these items, in order. Returns where to go first. */
export function startPractice(items: PracticeItem[]): string {
  const state = readSession()
  if (!items.length) return '/session/recap'
  // Each practised term starts a fresh hint ladder; the run's misses on it are history.
  const misses = { ...(state.misses ?? {}) }
  for (const item of items) delete misses[item.index]
  const next = { ...state, practising: true, practiceQueue: items, misses, drillTerm: items[0].mode === 'drill' ? items[0].index : state.drillTerm }
  write(next)
  return practiceItemHref(items[0], next)
}

/**
 * The term at the head of the round is done: drop it and go to the next one, or back
 * to the Recap when the round is finished. Call from a tap handler, never in render.
 */
export function advancePractice(): string {
  const state = readSession()
  const rest = (state.practiceQueue ?? []).slice(1)
  if (!rest.length) {
    write({ ...state, practiceQueue: undefined })
    return '/session/recap'
  }
  const next = { ...state, practiceQueue: rest, drillTerm: rest[0].mode === 'drill' ? rest[0].index : state.drillTerm }
  write(next)
  return practiceItemHref(rest[0], next)
}

/** Enter or leave a practice round from 07a. */
export function setPractising(on: boolean) {
  const state = readSession()
  if (Boolean(state.practising) === on) return
  write({ ...state, practising: on || undefined, ...(on ? {} : { practiceQueue: undefined }) })
}

/** Whether the student is practising rather than running the graded set. */
export function isPractising(state: SessionState = readSession()): boolean {
  return Boolean(state.practising)
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
 * Did this term's answer come from the keyboard when the mic was available?
 *
 * sprint-context.md: "Typed answers are reduced, but only when voice was available."
 * A student whose mic is denied keeps the full value — the reduction is for choosing
 * the keyboard, not for being unable to speak, and `sticky` is how the build tells
 * those apart.
 */
export function typedByChoice(state: SessionState, index: number): boolean {
  // What was SENT, not what sits in the box: an unsent draft answered nothing.
  return Boolean(state.sentTyped?.[index]) && !isSticky(state) && !state.micFault?.includes(index)
}

/** Count a judged miss for a term. Call from the tap handler that routes to 05 Miss. */
export function recordMiss(index: number) {
  const state = readSession()
  write({ ...state, misses: { ...(state.misses ?? {}), [index]: (state.misses?.[index] ?? 0) + 1 } })
}

/** How many judged misses a term has had this run. Pure; pass the state from useSession(). */
export function missCount(state: SessionState, index: number): number {
  return state.misses?.[index] ?? 0
}

/** The first term with no outcome yet, for "Pick up where you left off". */
export function firstUnanswered(state: SessionState): number | undefined {
  return TERMS.find((t) => !state.outcomes.some((o) => o.index === t.index))?.index
}

/** Mark that the mic failed on this term. Called by 04a Couldn't hear on arrival. */
export function markMicFault(index: number) {
  const state = readSession()
  if (state.micFault?.includes(index)) return
  write({ ...state, micFault: [...(state.micFault ?? []), index] })
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

/**
 * What a term is worth, given its bucket and the first judged tap. `total` is base plus
 * calibration, floored at 0 for the live in-flow figure — the negative case is charged
 * to the session total in sessionTotals, so a term never displays below zero.
 *
 * Pass: `xpFor('Unaided', tap?.wasSure)` → { base: 10, calibration: 1, total: 11 } when
 * they tapped either way (sure and unsure pay the same since 2026-10-12). Miss after a
 * Sure: base 0, calibration 0 (sureWrong costs nothing since 2026-09-23), total 0.
 */
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
 * the run already knows about it (whether the student was sure).
 *
 * The confidence adjustment comes from the tap stored by recordConfidence, never from
 * `opts.wasSure`: that option only feeds the Recap sort, and it can arrive from a tap
 * that preceded a couldn't-hear, which must not be scored. Until 03 Processing calls
 * recordConfidence, calibration is 0 everywhere — exactly today's behaviour.
 */
export function recordOutcome(
  index: number,
  bucket: Bucket,
  opts?: { repeated?: boolean; wasSure?: boolean; micTrouble?: boolean },
): TermOutcome {
  const state = readSession()
  const prior = state.outcomes.find((o) => o.index === index)
  // A practice round does not rewrite the run it is practising. Returning the existing
  // outcome keeps every caller's contract without touching the record.
  if (state.practising && prior) return prior
  const tap = state.confidence?.[index]
  const wasSure = tap?.wasSure ?? opts?.wasSure ?? prior?.wasSure
  // A term the student was shown a hint for cannot come back Unaided, whatever route it
  // took to get here. The screens still pass the bucket they believe in; this is the
  // backstop, because the evidence lives in the run rather than in the caller.
  const settled: Bucket = bucket === 'Unaided' && wasHinted(state, index) ? 'Hinted' : bucket
  // Reduced when the student chose the keyboard over a working mic.
  const xp = bucketXp(settled, typedByChoice(state, index)) + (opts?.repeated ? XP.repeat : 0)
  const calibration = tap ? calibrationFor(tap.wasSure, tap.right) : 0
  const outcome: TermOutcome = {
    index,
    bucket: settled,
    xp,
    repeated: opts?.repeated,
    wasSure,
    calibration,
    typed: Boolean(state.sentTyped?.[index]) || undefined,
    micTrouble: opts?.micTrouble || undefined,
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
  // By the tap, not the amount: the two pay the same since 2026-10-12.
  const unsureRight = state.outcomes.filter((o) => (o.calibration ?? 0) > 0 && !o.wasSure).length
  const sureRight = state.outcomes.filter((o) => (o.calibration ?? 0) > 0 && o.wasSure).length
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
 * Next step after a term resolves: the following term, or the Recap after the last.
 *
 * Decided 2026-10-08 by the designer: no requeue. A missed term used to come back once,
 * cold, at /session/lock-in after the set. Now the run goes straight to the Recap, and
 * the Recap's "Practice what I missed" is the student's choice to go back to it.
 */
export function nextAfter(index: number): string {
  const state = readSession()
  // In a practice round, the next practice item — or the Recap once, at the end.
  if (state.practising) return advancePractice()
  // A door run is one definition: done, back to home with the chip — via its own
  // result when it ended without a pass, so a skip or a reveal is not met with a
  // celebration and nothing about the definition (designer, 2026-10-12, option 1a).
  if (state.door) {
    const bucket = state.outcomes.find((o) => o.index === index)?.bucket
    return bucket === 'Revealed' || bucket === 'Worth revisiting' ? '/door/missed' : '/home/unlock'
  }
  if (index < TOTAL_TERMS) return termHref(index + 1, state)
  return '/session/recap'
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
// Pass `state` from useSession() when calling during render: reading storage directly
// in render mismatched the server snapshot on hydration and never re-rendered on change
// (dev review, 2026-10-12). The default read is for tap handlers.
export function shownAnswer(index: number, verdict: Verdict, state: SessionState = readSession()): string {
  const typed = state.typed?.[index]
  if (typed && typed.trim()) return typed.trim()
  const term = getTerm(index)
  if (!term) return ''
  return verdict === 'Pass' ? term.transcript : term.partialTranscript
}

/**
 * The student's own typed draft for a term, or '' if they have not typed one.
 *
 * Distinct from `answerFor`, which falls back to the canned transcript — correct for
 * "show what was said", catastrophic for seeding an input. Reusing `answerFor` to keep
 * a draft across a route change opened the typing screen PRE-FILLED WITH THE CORRECT
 * ANSWER on a recall app, because with no draft stored the fallback fired. A student
 * in testing read it as the app having answered for her and Send passing it off as her
 * own. Anything that seeds an input reads this, never `answerFor`.
 */
//
// And only a draft that has NOT been sent. A sent answer has been judged; putting it
// back in the box on "Try again" (or on the next drill rung, which is the same term)
// let a student resend it without recalling anything (click-through, 2026-10-12). An
// unsent draft still survives Leave → "Keep learning". Pure; pass the state from
// useSession().
export function typedDraft(state: SessionState, index: number): string {
  const draft = state.typed?.[index]?.trim() ?? ''
  return draft && draft === state.sentTyped?.[index] ? '' : draft
}

/**
 * A spoken take on this term is being judged: forget any typed answer for it. Call from
 * 03 Processing's tap handler. Without this, a typed miss followed by a spoken pass kept
 * the typed text, so the pass echoed the old typed words, paid the typed-by-choice rate,
 * and the Recap called it typed (usability review, 2026-10-12).
 */
export function markSpokenTake(index: number) {
  const state = readSession()
  if (!state.typed?.[index] && !state.sentTyped?.[index]) return
  const typed = { ...(state.typed ?? {}) }
  const sentTyped = { ...(state.sentTyped ?? {}) }
  delete typed[index]
  delete sentTyped[index]
  write({ ...state, typed, sentTyped })
}

/** Record a typed answer as sent for judging. Call from Send, before routing. */
export function sendTypedAnswer(index: number, text: string) {
  const state = readSession()
  write({
    ...state,
    typed: { ...(state.typed ?? {}), [index]: text },
    sentTyped: { ...(state.sentTyped ?? {}), [index]: text.trim() },
  })
}

/** The typed answer if there is one, else the term's canned transcript. */
export function answerFor(index: number, state: SessionState = readSession()): string {
  const typed = state.typed?.[index]
  if (typed && typed.trim()) return typed.trim()
  return getTerm(index)?.transcript ?? ''
}
