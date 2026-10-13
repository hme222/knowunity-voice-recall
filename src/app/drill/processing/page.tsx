'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Chips, ProcessingBeat, ScreenShell } from '@/components'
import { CheckIcon } from '@/components/icons'
import { DRILL_TOTAL_RUNGS, markEarned, readSession } from '@/lib/session'
import { DrillBar } from '../DrillBar'
import { processingDwell, verdictHold } from '@/lib/motion'
import styles from '../drill.module.css'

// DD 03 Processing — Figma frame "DD 03 Processing" (15782:11891). History: docs/code-history.md#h-022

function DrillProcessing() {
  const router = useRouter()
  const step = Number(useSearchParams().get('step') ?? '1')
  // A round that passed says so before the next opens: "Got it", held for a beat.
  // Rounds used to pass silently straight to the next (craft critic, 2026-10-13).
  const [got, setGot] = useState(false)
  const last = step >= DRILL_TOTAL_RUNGS

  useEffect(() => {
    let hold = 0
    const id = window.setTimeout(() => {
      // The mock advances a rung each pass. Pass 2 stumbles, so the scaffold
      // is reachable without hunting for it. replace: back must not re-judge.
      if (step === 2) return router.replace('/drill/miss')
      // The drill's receipt: /drill/complete pays +2 against it, once (9a).
      if (last) markEarned(readSession().drillTerm ?? 1, 'Drill')
      setGot(true)
      hold = window.setTimeout(() => router.replace(last ? '/drill/complete' : `/drill/pass/${step + 1}`), verdictHold())
    }, processingDwell())
    return () => {
      window.clearTimeout(id)
      window.clearTimeout(hold)
    }
  }, [step, last, router])

  return (
    <ScreenShell
      topNavigation={<DrillBar step={step} onExit={() => router.push('/picker')} />}
      // Reserved though this screen has no actions, which is the scaffold's own rule:
      // "a region that is on still reserves its height even with nothing in it, which
      // is what keeps the action zone in the same place from screen to screen". Without
      // it this wait sat 60px below the other two.
      showBottomNavSlot
    >
      {/* Same wait composition as 03 Processing and the typed beat. */}
      <ProcessingBeat
        line={got ? (last ? 'Got it. That’s the whole definition.' : `Got it. On to round ${step + 1}.`) : 'Checking how much of that was you…'}
        working={!got}
        above={
          got ? (
            <div className={styles.verdictRow}>
              <Chips Text="Got it" size="S" color="Primary" active showLeftIcon leftIcon={<CheckIcon />} showRightIcon={false} />
            </div>
          ) : undefined
        }
      />
    </ScreenShell>
  )
}

export default function DrillProcessingPage() {
  return (
    <Suspense fallback={null}>
      <DrillProcessing />
    </Suspense>
  )
}
