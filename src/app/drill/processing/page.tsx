'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProcessingBeat, ScreenShell } from '@/components'
import { DRILL_TOTAL_RUNGS, markEarned, readSession } from '@/lib/session'
import { DrillBar } from '../DrillBar'
import { processingDwell } from '@/lib/motion'

// DD 03 Processing — Figma frame "DD 03 Processing" (15782:11891). History: docs/code-history.md#h-022

function DrillProcessing() {
  const router = useRouter()
  const step = Number(useSearchParams().get('step') ?? '1')

  useEffect(() => {
    const id = window.setTimeout(() => {
      // The mock advances a rung each pass. Pass 2 stumbles, so the scaffold
      // is reachable without hunting for it.
      if (step === 2) router.push('/drill/miss')
      else if (step >= DRILL_TOTAL_RUNGS) {
        // The drill's receipt: /drill/complete pays +2 against it, once (9a).
        markEarned(readSession().drillTerm ?? 1, 'Drill')
        router.push('/drill/complete')
      }
      else router.push(`/drill/pass/${step + 1}`)
    }, processingDwell())
    return () => window.clearTimeout(id)
  }, [step, router])

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
        line="Checking how much of that was you…"
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
