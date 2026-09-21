'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MascotSlot, ScreenShell } from '@/components'
import { processingDwell } from '@/lib/motion'
import styles from '../text.module.css'

// The typed path's equivalent of Processing — a brief "checking" beat, no confidence
// tap and no recording states. Short because there is no transcription round trip to
// cover, only judging.

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

  useEffect(() => {
    const id = window.setTimeout(
      () =>
        router.push(
          drillStep
            ? verdict === 'pass'
              ? `/drill/pass/${Number(drillStep) + 1}`
              : '/drill/miss'
            : `/session/${verdict}/${index}`,
        ),
      processingDwell(),
    )
    return () => window.clearTimeout(id)
  }, [index, router, verdict, drillStep])

  return (
    <ScreenShell>
      <div className={styles.checking}>
        <div className={styles.mascot}>
          <MascotSlot size="2XL" expression="determined" />
        </div>
        <p className={styles.line}>Checking that against the definition&hellip;</p>
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
