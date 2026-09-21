'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { MascotSlot, ScreenShell, StrengthMeter } from '@/components'
import { drillRung, DRILL_TOTAL_RUNGS } from '@/lib/session'
import { DrillBar } from '../DrillBar'
import styles from '../drill.module.css'

// DD 03 Processing — Figma frame "DD 03 Processing" (15782:11891).
//
// Load-bearing in a way the core loop's Processing is not: this is where the pass is
// scored for unaided coverage, and that score drives the meter. If the coverage judge
// can't be built, this step becomes a pass counter and most of the drill's copy is
// wrong. See docs/sprint-context.md open question 7.
//
// No confidence tap here. That exists to make Recap honest about belief, and the drill
// has no Recap and no XP.

function DrillProcessing() {
  const router = useRouter()
  const step = Number(useSearchParams().get('step') ?? '1')
  const rung = drillRung(step)

  useEffect(() => {
    const id = window.setTimeout(() => {
      // The mock advances a rung each pass. Every third pass stumbles, so the scaffold
      // is reachable without hunting for it.
      if (step === 2) router.push('/drill/miss')
      else if (step >= DRILL_TOTAL_RUNGS) router.push('/drill/complete')
      else router.push(`/drill/pass/${step + 1}`)
    }, 1400)
    return () => window.clearTimeout(id)
  }, [step, router])

  return (
    <ScreenShell topNavigation={<DrillBar step={step} onExit={() => router.push('/picker')} />}>
      <div className={styles.body}>
        <StrengthMeter fill={rung?.coverage ?? 0} label="Scoring what you said unaided" />
        <div className={styles.centred}>
          <div className={styles.mascot}>
            <MascotSlot size="2XL" expression="determined" />
          </div>
          <p className={styles.note}>Checking how much of that was you&hellip;</p>
        </div>
      </div>
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
