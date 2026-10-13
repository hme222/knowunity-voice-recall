import { beforeEach, describe, expect, it } from 'vitest'
import {
  keyPhrase,
  runXp,
  SCRIPTED_COULDNT_HEAR_TERM,
  typedVerdict,
  markDrilled,
  startReview,
  sessionTotals,
  markEarned,
  spendEarned,
  safeInternalPath,
  micTurnedBackOn,
  recommendedMode,
  micGate,
  setMicGranted,
  advancePractice,
  calibrationFor,
  firstUnanswered,
  getTerm,
  hintFor,
  markMicFault,
  markSpokenTake,
  missCount,
  missedWordContext,
  nextAfter,
  readSession,
  recordMiss,
  recordOutcome,
  REVEAL_AT_ATTEMPT,
  setPractising,
  setSticky,
  sendTypedAnswer,
  setTypedAnswer,
  typedDraft,
  startPractice,
  startSession,
  TERMS,
  TOTAL_TERMS,
  verdictFor,
  XP,
} from './session'

// The session store reads window.sessionStorage. Plain Node has neither, so each test
// gets a fresh in-memory one.
function stubStorage() {
  const data = new Map<string, string>()
  const sessionStorage = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, String(v)),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
  }
  ;(globalThis as unknown as { window: unknown }).window = { sessionStorage }
}

beforeEach(() => {
  stubStorage()
  startSession()
})

describe('verdictFor (the mock)', () => {
  it('maps hold time to a verdict: <2s couldn’t hear, 2–5s miss, 5s+ pass', () => {
    expect(verdictFor(3, 1999, 1)).toBe('CouldntHear')
    expect(verdictFor(3, 2000, 1)).toBe('Miss')
    expect(verdictFor(3, 4999, 1)).toBe('Miss')
    expect(verdictFor(3, 5000, 1)).toBe('Pass')
  })
  it('scripts a mishear on one term’s first attempt only, never term 1', () => {
    expect(verdictFor(SCRIPTED_COULDNT_HEAR_TERM, 9000, 1)).toBe('CouldntHear')
    expect(verdictFor(SCRIPTED_COULDNT_HEAR_TERM, 9000, 2)).toBe('Pass')
    expect(verdictFor(1, 9000, 1)).toBe('Pass')
  })
})

describe('hintFor (the ladder ends)', () => {
  it('offers Try again until REVEAL_AT_ATTEMPT, then only the reveal', () => {
    const term = TERMS[0]
    for (let n = 1; n < REVEAL_AT_ATTEMPT; n++) expect(hintFor(term, n).canRetry).toBe(true)
    expect(hintFor(term, REVEAL_AT_ATTEMPT).canRetry).toBe(false)
  })
})

describe('miss count (the rung lives in the run)', () => {
  it('counts judged misses per term', () => {
    recordMiss(2)
    recordMiss(2)
    expect(missCount(readSession(), 2)).toBe(2)
    expect(missCount(readSession(), 3)).toBe(0)
  })
  it('starts a fresh ladder for each practised term', () => {
    recordMiss(3)
    startPractice([{ index: 3, mode: 'say' }])
    expect(missCount(readSession(), 3)).toBe(0)
  })
})

describe('nextAfter (routing)', () => {
  it('walks a full session term by term, then to the Recap', () => {
    expect(nextAfter(1)).toBe('/session/idle/2')
    expect(nextAfter(TOTAL_TERMS)).toBe('/session/recap')
  })
  it('ends a door run after its one definition', () => {
    startSession({ door: 'quiz' })
    recordOutcome(1, 'Hinted')
    expect(nextAfter(1)).toBe('/home/unlock')
  })
  it('shows a door run that ended without a pass its own result first', () => {
    startSession({ door: 'chat' })
    recordOutcome(1, 'Revealed')
    expect(nextAfter(1)).toBe('/door/missed')
    startSession({ door: 'quiz' })
    recordOutcome(1, 'Worth revisiting')
    expect(nextAfter(1)).toBe('/door/missed')
  })
  it('runs a practice round in order and returns to the Recap once', () => {
    startPractice([
      { index: 3, mode: 'say' },
      { index: 1, mode: 'drill' },
    ])
    expect(nextAfter(3)).toBe('/drill/intro')
    expect(readSession().drillTerm).toBe(1)
    expect(advancePractice()).toBe('/session/recap')
  })
  it('routes a mic-denied run to the typed turn', () => {
    setSticky()
    expect(nextAfter(1)).toBe('/text/turn?term=2&sticky=1')
  })
})

describe('startSession (every run starts clean)', () => {
  it('drops a stale practice round and keeps the mic-denied flag', () => {
    setSticky()
    startPractice([{ index: 2, mode: 'drill' }])
    startSession()
    const s = readSession()
    expect(s.practising).toBeUndefined()
    expect(s.practiceQueue).toBeUndefined()
    expect(s.sticky).toBe(true)
  })
  it('remembers the door only for a door run', () => {
    startSession({ door: 'chat' })
    expect(readSession().door).toBe('chat')
    startSession()
    expect(readSession().door).toBeUndefined()
  })
})

describe('recordOutcome (XP)', () => {
  it('pays an unaided spoken pass in full', () => {
    expect(recordOutcome(2, 'Unaided').xp).toBe(XP.unaided)
  })
  it('pays a typed-by-choice pass at the hinted rate', () => {
    sendTypedAnswer(2, 'a typed answer that is long enough to pass the mock')
    const outcome = recordOutcome(2, 'Unaided')
    expect(outcome.xp).toBe(XP.hinted)
    expect(outcome.typed).toBe(true)
  })
  it('pays a typed pass in full after the mic failed on that term', () => {
    markMicFault(2)
    sendTypedAnswer(2, 'a typed answer that is long enough to pass the mock')
    expect(recordOutcome(2, 'Unaided').xp).toBe(XP.unaided)
  })
  it('pays a spoken pass in full after an earlier typed miss on that term', () => {
    sendTypedAnswer(2, 'too short')
    markSpokenTake(2)
    const outcome = recordOutcome(2, 'Unaided')
    expect(outcome.xp).toBe(XP.unaided)
    expect(outcome.typed).toBeUndefined()
  })
  it('never rewrites the run during practice', () => {
    recordOutcome(2, 'Revealed')
    setPractising(true)
    expect(recordOutcome(2, 'Unaided').bucket).toBe('Revealed')
  })
})

describe('the confidence tap', () => {
  it('pays sure and unsure the same, and costs nothing when wrong', () => {
    expect(calibrationFor(true, true)).toBe(calibrationFor(false, true))
    expect(calibrationFor(true, false)).toBe(0)
  })
})

describe('firstUnanswered (resume)', () => {
  it('finds the first term without an outcome, not done + 1', () => {
    recordOutcome(1, 'Unaided')
    recordOutcome(3, 'Unaided')
    expect(firstUnanswered(readSession())).toBe(2)
  })
})

describe('missedWordContext (the drill’s nudge)', () => {
  it('builds the fragment around each term’s own missed word', () => {
    for (const t of TERMS) {
      const fragment = missedWordContext(t, '___')
      expect(fragment).toContain('___')
      expect(fragment).not.toContain(t.drill.missedWord)
    }
    expect(missedWordContext(getTerm(4)!, '___').endsWith('…')).toBe(false)
  })
})

describe('typedDraft (what seeds the typed box)', () => {
  it('keeps an unsent draft and drops one that was already sent', () => {
    startSession()
    setTypedAnswer(2, 'half a thought')
    expect(typedDraft(readSession(), 2)).toBe('half a thought')
    sendTypedAnswer(2, 'half a thought ')
    // Judged already: a retry opens empty, but the answer is still echoed.
    expect(typedDraft(readSession(), 2)).toBe('')
    expect(readSession().typed?.[2]).toBe('half a thought ')
    setTypedAnswer(2, 'a new try')
    expect(typedDraft(readSession(), 2)).toBe('a new try')
  })
})

describe('micGate (contextual permission)', () => {
  it('asks first, then goes straight to the recording once allowed, across runs', () => {
    const gated = micGate('/session/recording/1', '/text/turn?term=1')
    expect(gated.startsWith('/permission/primer?next=')).toBe(true)
    expect(decodeURIComponent(gated)).toContain('alt=/text/turn?term=1')
    setMicGranted()
    expect(micGate('/session/recording/1', '/text/turn?term=1')).toBe('/session/recording/1')
    startSession()
    expect(readSession().micGranted).toBe(true)
  })
})

describe('recommendedMode (what Practice suggests)', () => {
  it('keeps the base rule: revealed or skipped drills, hinted says it again', () => {
    expect(recommendedMode('Revealed')).toBe('drill')
    expect(recommendedMode('Worth revisiting')).toBe('drill')
    expect(recommendedMode('Hinted')).toBe('say')
    expect(recommendedMode('Revealed', true)).toBe('say')
  })
  it('rule A: sure and still needed help drills, even when hinted', () => {
    expect(recommendedMode('Hinted', false, { wasSure: true })).toBe('drill')
  })
  it('rule C: a typed answer says it again, aloud', () => {
    expect(recommendedMode('Revealed', false, { typed: true })).toBe('say')
  })
  it('rule A wins over rule C', () => {
    expect(recommendedMode('Revealed', false, { wasSure: true, typed: true })).toBe('drill')
  })
})

describe('engineering-review fixes', () => {
  it('never replays the scripted mishear in a practice round', () => {
    expect(verdictFor(SCRIPTED_COULDNT_HEAR_TERM, 9000, 1, { practising: true })).toBe('Pass')
  })
  it('pays a pass only against a judged take, once', () => {
    expect(spendEarned(3, 'Pass')).toBe(false)
    markEarned(3, 'Pass')
    expect(spendEarned(3, 'Repeat')).toBe(false)
    expect(spendEarned(3, 'Pass')).toBe(true)
    expect(spendEarned(3, 'Pass')).toBe(false)
  })
  it('only follows internal paths from the query string', () => {
    expect(safeInternalPath('/text/turn?term=2', '/x')).toBe('/text/turn?term=2')
    expect(safeInternalPath('https://example.com', '/x')).toBe('/x')
    expect(safeInternalPath('//example.com', '/x')).toBe('/x')
    expect(safeInternalPath(null, '/x')).toBe('/x')
  })
  it('undoes a denied mic', () => {
    setSticky()
    micTurnedBackOn()
    expect(readSession().sticky).toBeUndefined()
    expect(readSession().micGranted).toBe(true)
  })
})

describe('2a / 8a / 9a', () => {
  it('a miss joins the review list, survives a new run, and a pass clears it', () => {
    recordOutcome(2, 'Revealed')
    recordOutcome(3, 'Worth revisiting')
    expect(readSession().reviewQueue).toEqual([2, 3])
    startSession()
    expect(readSession().reviewQueue).toEqual([2, 3])
    recordOutcome(2, 'Hinted')
    expect(readSession().reviewQueue).toEqual([3])
  })
  it('a review is a say-again round of exactly the queued terms', () => {
    recordOutcome(3, 'Revealed')
    expect(startReview()).toBe('/session/idle/3')
    expect(readSession().practiceQueue).toEqual([{ index: 3, mode: 'say' }])
    expect(readSession().outcomes).toEqual([])
  })
  it('a drill pays XP.drill once per term, inside the total', () => {
    recordOutcome(1, 'Unaided')
    markDrilled(2)
    markDrilled(2)
    const t = sessionTotals(readSession())
    expect(t.drillXp).toBe(XP.drill)
    expect(t.earned).toBe(XP.unaided + XP.drill)
  })
  it('marks electronegativity’s partial take as a wrong idea, the others as partial', () => {
    expect(TERMS.filter((t) => t.partialKind === 'wrong').map((t) => t.name)).toEqual(['Electronegativity'])
  })
})

describe('typedVerdict (the typed mock)', () => {
  it('needs length AND a key idea of the term', () => {
    expect(typedVerdict(2, 'Some sort of charge thing about atoms I think, honestly')).toBe('miss')
    expect(typedVerdict(2, 'Two atoms sharing a pair of electrons between them')).toBe('pass')
    expect(typedVerdict(2, 'sharing')).toBe('miss')
  })
})

describe('the second hint rung (option B)', () => {
  it('adds the drill’s first-letter gap from the second miss, not the first', () => {
    const term = TERMS[0]
    expect(hintFor(term, 1).gap).toBeUndefined()
    expect(hintFor(term, 1).level).toBe(1)
    const two = hintFor(term, 2)
    expect(two.level).toBe(2)
    expect(two.gap).toContain('e________')
    expect(two.gap).not.toContain(term.drill.missedWord)
  })
})

describe('first takes (reach 1: before/after on a retry pass)', () => {
  it('keeps the take from the first miss, not later ones', () => {
    sendTypedAnswer(2, 'first wrong guess here')
    recordMiss(2)
    sendTypedAnswer(2, 'second wrong guess')
    recordMiss(2)
    expect(readSession().firstTakes?.[2]).toBe('first wrong guess here')
  })
  it('is cleared for a practised term, which starts fresh', () => {
    recordMiss(3)
    startPractice([{ index: 3, mode: 'say' }])
    expect(readSession().firstTakes?.[3]).toBeUndefined()
  })
})

describe('banked XP (Start fresh keeps it)', () => {
  it('banks the replaced run’s XP when a new run starts', () => {
    recordOutcome(1, 'Unaided')
    const earned = runXp(readSession())
    expect(earned).toBe(XP.unaided)
    startSession()
    expect(readSession().outcomes).toHaveLength(0)
    expect(readSession().bankedXp).toBe(earned)
    startSession()
    expect(readSession().bankedXp).toBe(earned)
  })
})

describe('keyPhrase (reach 2: the student’s own words on the Recap)', () => {
  it('quotes the words around the matched key idea', () => {
    sendTypedAnswer(2, 'It is when two atoms share a pair of electrons between them both')
    expect(keyPhrase(2, readSession())).toContain('share')
  })
  it('is empty when nothing matches, never a fixture word', () => {
    sendTypedAnswer(2, 'no idea at all really')
    expect(keyPhrase(2, readSession())).toBe('')
  })
})
