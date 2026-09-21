'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Button, MascotSlot, MicButton, ScreenShell, StrengthMeter } from '@/components'
import { drillRung, DRILL_TERM } from '@/lib/session'
import { DrillBar } from '../../DrillBar'
import styles from '../../drill.module.css'

// DD 01 / 04 / 05 / 06 — the thinning passes. Figma frames 15782:11696, 11950, 12053,
// 12259. One route with a [step] rather than four near-identical files: the screens
// differ only in their cue and meter value.
//
// The meter fills by unaided coverage, not by which pass this is — that is the whole
// design. Knowie grows a step each pass: within-session muscle, reset per definition.

export default function DrillPassPage({ params }: { params: Promise<{ step: string }> }) {
  const router = useRouter()
  const { step } = use(params)
  const n = Number(step)
  const rung = drillRung(n)

  if (!rung) {
    router.replace('/drill/intro')
    return null
  }

  return (
    <ScreenShell
      topNavigation={<DrillBar step={n} onExit={() => router.push('/picker')} />}
      bottomContent={
        <div className={styles.actions}>
          <MicButton state="Idle" onClick={() => router.push(`/drill/recording?step=${n}`)} />
          <Button CTA="Leave the drill" variant="Tertiary" size="M" onClick={() => router.push('/picker')} />
        </div>
      }
    >
      <div className={styles.body}>
        <StrengthMeter fill={rung.coverage} label="How much you can say unaided" />
        <p className={styles.cue}>{rung.cue}</p>
        <p className={styles.note}>{DRILL_TERM.title}</p>
        <div className={styles.centred}>
          <MascotSlot size="2XL" expression="determined" />
        </div>
      </div>
    </ScreenShell>
  )
}
