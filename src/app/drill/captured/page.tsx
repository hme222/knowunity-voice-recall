'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Chips, MascotSlot, ScreenShell, StrengthMeter } from '@/components'
import { drillRung, DRILL_TERM } from '@/lib/session'
import { DrillBar } from '../DrillBar'
import styles from '../drill.module.css'
import captured from '../../session/captured/[term]/captured.module.css'

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
            CTA="Re-record"
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
        <MascotSlot size="2XL" expression="excited" />
        <div className={captured.card}>
          <div className={captured.tag}>
            <Chips
              Text="Try again"
              size="S"
              color="Coral"
              active
              showRightIcon={false}
              onClick={() => router.push(`/drill/recording?step=${step}`)}
            />
          </div>
          <p className={captured.title}>Here&rsquo;s what I heard. Send it, or say it again.</p>
          <p className={captured.label}>You said</p>
          <p className={captured.transcript}>&ldquo;{DRILL_TERM.transcript}&rdquo;</p>
        </div>
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
