'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ConfidenceAsk, ProcessingBeat, ScreenShell } from '@/components'
import { confidenceGrace, processingDwell } from '@/lib/motion'
import { SessionBar } from '../../session/SessionBar'
import { recordConfidence, recordMiss } from '@/lib/session'

// The typed path's equivalent of 03 Processing.
//
// IT NOW ASKS THE CONFIDENCE QUESTION TOO. It used to be "a brief checking beat, no
// confidence tap", and that opened a hole in the one mechanic the Design Brief asks
// for by name: a typist could never be confidently wrong, so the -3 never applied to
// them and Recap's confidently-wrong sort was blind to typed answers. The cost the
// brief demands could be dodged by typing. Verified before the fix: a typed pass
// stored `wasSure:false, calibration:0` with no tap recorded at all.
//
// sprint-context.md § "Added 2026-09-20" says the tap "occupies a wait the design
// already had to cover" — this screen is exactly such a wait, so asking here follows
// that decision rather than bending it. The dwell still runs first, so the question
// arrives after the judging beat, never before it.
//
// A drill turn is exempt: the drill is not graded and has no XP, so there is nothing
// for a confidence signal to price.

function CheckingScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const index = Number(searchParams.get('term') ?? '1')
  // The typed path's mock, parallel to the spoken one: recording duration selects the
  // verdict there, answer length here. A typed miss has to be reachable — a path that
  // can only ever pass isn't a judged path at all.
  const len = Number(searchParams.get('len') ?? '0')
  const verdict = len >= 40 ? 'pass' : 'miss'
  // Too short to have said anything checkable ("idk lol"). The miss screen then says so
  // instead of crediting part of a definition the student never wrote (designer,
  // 2026-10-12, from the critic panel).
  const thin = len < 15
  // A drill turn returns to the drill. It used to land in /session/pass and the
  // student continued into a 4-term session they never started.
  const drillStep = searchParams.get('drill')

  const [asking, setAsking] = useState(false)

  const onward = (sure?: boolean) => {
    if (drillStep) {
      router.push(verdict === 'pass' ? `/drill/pass/${Number(drillStep) + 1}` : '/drill/miss')
      return
    }
    if (sure !== undefined) {
      // Same call 03 Processing makes, so a typed turn lands in the same ledger — but
      // with THIS path's own verdict, not a duration fed through the spoken mock.
      //
      // It used to synthesise a fake take (`verdictFor(index, len >= 40 ? 6000 : 3000, 1)`)
      // and `verdictFor` returns CouldntHear unconditionally for the scripted mishear
      // term on attempt 1, while `recordConfidence` drops a CouldntHear on the grounds
      // that a take nobody heard is not evidence about belief. Both are right on their
      // own terms and wrong together: on term 1 of every typed run the screen asked how
      // sure the student was and threw the answer away. A typed answer cannot be
      // misheard, so this path has no business asking the mishear mock anything.
      recordConfidence(index, sure, verdict === 'pass' ? 'Pass' : 'Miss')
    }
    const q = new URLSearchParams()
    if (sure !== undefined) q.set('sure', sure ? '1' : '0')
    if (verdict === 'miss' && thin) q.set('thin', '1')
    if (verdict === 'miss') recordMiss(index)
    router.push(`/session/${verdict}/${index}?${q}`)
  }

  // Too short to check means no confidence question either (usability review,
  // 2026-10-12): asking how sure someone is about "a charge", then saying there was
  // nothing to check, is the question 03 Processing already declines for an unusable take.
  useEffect(() => {
    const id = window.setTimeout(() => (drillStep || thin ? onward() : setAsking(true)), processingDwell())
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, router, verdict, drillStep])

  // The ask is optional here too, as on 03 Processing (designer, 2026-10-12): after
  // confidenceGrace with no tap, move on and record no confidence.
  useEffect(() => {
    if (!asking) return
    const id = window.setTimeout(() => onward(), confidenceGrace())
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asking])

  return (
    <ScreenShell
      topNavigation={<SessionBar index={index} />}
      // Reserve the action zone before the question arrives. ScreenShell's own doc
      // says this flag exists so "a region that is on still reserves its height even
      // with nothing in it, which is what keeps the action zone in the same place from
      // screen to screen" — and here it keeps it in the same place from MOMENT to
      // moment: without it the wait jumped 60px the instant the ask appeared.
      showBottomNavSlot
      bottomContent={
        asking ? <ConfidenceAsk onAnswer={onward} /> : undefined
      }
    >
      <ProcessingBeat
        line={asking ? 'Before I show you — how did that feel?' : 'Checking that against the definition…'}
      />
    </ScreenShell>
  )
}

export default function CheckingPage() {
  return (
    <Suspense fallback={null}>
      <CheckingScreen />
    </Suspense>
  )
}
