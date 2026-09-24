'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, MascotSlot, RecallResultCaptured, ScreenShell, StrengthMeter } from '@/components'
import { DRILL_PARTIAL, DRILL_TERM, drillRung } from '@/lib/session'
import { DrillBar } from '../DrillBar'
import styles from '../drill.module.css'

// DD 02a Captured — Figma frame "DD 02a Captured — review before sending"
// (15782:12956). The same review beat as the core loop, for the same reason: it keeps
// the meter honest, because a mishear must not be scored as a gap in knowledge.

function DrillCaptured() {
  const router = useRouter()
  const step = Number(useSearchParams().get('step') ?? '1')
  const rung = drillRung(step)

  if (!rung) {
    router.replace('/drill/intro')
    return null
  }

  return (
    <ScreenShell
      topNavigation={<DrillBar step={step} onExit={() => router.push('/picker')} />}
      bottomContent={
        <div className={styles.stack}>
          <Button
            CTA="Looks right"
            variant="Primary"
            size="M"
            fullWidth
            onClick={() => router.push(`/drill/processing?step=${step}`)}
          />
          <Button
            CTA="Say it again"
            variant="Secondary"
            size="M"
            fullWidth
            onClick={() => router.push(`/drill/recording?step=${step}`)}
          />
        </div>
      }
    >
      <div className={styles.body}>
        <StrengthMeter fill={rung.coverage} label="How much you can say unaided" />
        {/* A review-before-sending beat, not a win — nothing has been judged yet. 02a
            Captured in the core loop is already determined, so the same beat wore two
            different faces in two flows. */}
        <MascotSlot size="2XL" expression="excited" className={styles.mascotCentred} />
        <RecallResultCaptured
          title="Here&rsquo;s what I heard. Send it, or say it again."
          // Step 2 is the scripted stumble, so this shows the take that screen will quote.
          // It used to show the clean transcript, have the student tap "Looks right",
          // and then DD 07 quoted them saying something worse.
          transcript={step === 2 ? DRILL_PARTIAL : DRILL_TERM.transcript}
          /* No `tag` chip. The action zone below already offers "Say it again" and
             "Looks right" — the frame's pair — so an in-card chip repeating one of them
             put two controls with the same label on one screen. One action, one
             control. Logged in component-gaps.md. */
        />
      </div>
    </ScreenShell>
  )
}

export default function DrillCapturedPage() {
  return (
    <Suspense fallback={null}>
      <DrillCaptured />
    </Suspense>
  )
}
