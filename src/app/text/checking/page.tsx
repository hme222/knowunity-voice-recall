'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, MascotSlot, ScreenShell } from '@/components'
import { processingDwell } from '@/lib/motion'
import { recordConfidence, verdictFor } from '@/lib/session'
import styles from '../text.module.css'

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
      // Same call 03 Processing makes, so a typed turn lands in the same ledger.
      recordConfidence(index, sure, verdictFor(index, len >= 40 ? 6000 : 3000, 1))
    }
    const q = new URLSearchParams({ sure: sure ? '1' : '0' })
    router.push(`/session/${verdict}/${index}?${q}`)
  }

  useEffect(() => {
    const id = window.setTimeout(() => (drillStep ? onward() : setAsking(true)), processingDwell())
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, router, verdict, drillStep])

  return (
    <ScreenShell
      bottomContent={
        asking ? (
          <div className={styles.confidence}>
            <p className={styles.ask}>How sure are you?</p>
            <div className={styles.pair}>
              <Button CTA="Sure" variant="Secondary" size="M" fullWidth onClick={() => onward(true)} />
              <Button CTA="Not sure" variant="Secondary" size="M" fullWidth onClick={() => onward(false)} />
            </div>
          </div>
        ) : undefined
      }
    >
      <div className={styles.checking}>
        <div className={styles.mascot}>
          <MascotSlot size="2XL" expression="determined" />
        </div>
        <p className={styles.line} role="status" aria-live="polite">
          {asking ? 'Before I show you — how did that feel?' : 'Checking that against the definition…'}
        </p>
      </div>
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
