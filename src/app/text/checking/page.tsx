'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ConfidenceAsk, ProcessingBeat, ScreenShell } from '@/components'
import { confidenceGrace, processingDwell } from '@/lib/motion'
import { SessionBar } from '../../session/SessionBar'
import { DRILL_TOTAL_RUNGS, markEarned, recordConfidence, recordMiss, useSession } from '@/lib/session'
import { doorResultHref } from '@/app/door/doors'

// The typed path's equivalent of 03 Processing. History: docs/code-history.md#h-089

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

  // Once only: the grace timer and a tap can both land, and a double tap on Sure ran
  // this twice — recordMiss twice for one miss (engineering review, 2026-10-13).
  const doneRef = useRef(false)
  const state = useSession()

  const onward = (sure?: boolean) => {
    if (doneRef.current) return
    doneRef.current = true
    if (drillStep) {
      // The last rung finishes the drill, as the spoken path does. Typed, rung 4's pass
      // pushed /drill/pass/5, which does not exist, and bounced to the drill intro.
      const step = Number(drillStep)
      if (verdict === 'pass' && step >= DRILL_TOTAL_RUNGS) markEarned(state.drillTerm ?? index, 'Drill')
      router.replace(verdict === 'pass' ? (step >= DRILL_TOTAL_RUNGS ? '/drill/complete' : `/drill/pass/${step + 1}`) : '/drill/miss')
      return
    }
    if (sure !== undefined) {
      // Same call 03 Processing makes, so a typed turn lands in the same ledger — but with THIS path's own verdict, not a duration fed through the spoken mock. History: docs/code-history.md#h-090
      recordConfidence(index, sure, verdict === 'pass' ? 'Pass' : 'Miss')
    }
    const q = new URLSearchParams()
    if (sure !== undefined) q.set('sure', sure ? '1' : '0')
    if (verdict === 'miss' && thin) q.set('thin', '1')
    if (verdict === 'miss') recordMiss(index)
    if (verdict === 'pass') {
      // A door run's typed pass goes to the door's own result, as a spoken one does.
      const doorResult = doorResultHref(state.door ?? null)
      if (doorResult) {
        router.replace(doorResult)
        return
      }
      markEarned(index, 'Pass')
    }
    router.replace(`/session/${verdict}/${index}?${q}`)
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
      // Reserve the action zone before the question arrives. History: docs/code-history.md#h-091
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
