'use client'

import { useRouter } from 'next/navigation'
import { actionRowClass, Button, Chips, HintCard, MascotSlot, RecallResult, ScreenShell, StrengthMeter } from '@/components'
import { DRILL_MISSED_WORD, DRILL_TERM, drillRung, STUMBLES } from '@/lib/session'
import { DrillBar } from '../DrillBar'
import styles from '../drill.module.css'

// DD 07 — first stumble. Figma frame "DD 07 Miss — local correction, keep going"
// (15782:12362).
//
// Reveal the missed word, retake the pass. The meter HOLDS — it does not drop. A
// student must never watch progress go backwards for asking for help, which is the
// second of the two rules the whole variable-length design rests on.
//
// The transcript trails off mid-sentence, as on the frame: it shows where they got to,
// which is what makes the missed word land.

export default function DrillMissPage() {
  const router = useRouter()
  const rung = drillRung(2)

  return (
    <ScreenShell
      topNavigation={<DrillBar step={2} onExit={() => router.push('/picker')} />}
      bottomContent={
        <div className={styles.stack}>
          {/* Two real choices side by side, the way 05 Miss does it. Stacked
              full-width they made a 192px zone and clipped 60px off the body. */}
          <div className={actionRowClass}>
            <Button
              CTA="Show full definition"
              variant="Secondary"
              size="M"
              onClick={() => router.push('/drill/pass/1')}
            />
            <Button
              CTA="Try again"
              variant="Primary"
              size="M"
              onClick={() => router.push('/drill/miss/letter')}
            />
          </div>
          <Button CTA="Skip" variant="Tertiary" size="S" fullWidth onClick={() => router.push('/picker')} />
        </div>
      }
    >
      <div className={styles.body}>
        {/* Parked, not reduced. */}
        <StrengthMeter fill={rung?.coverage ?? 25} label="Held while you get this one" />
        <p className={styles.note}>{DRILL_TERM.drillTitle ?? DRILL_TERM.title}</p>
        <MascotSlot size="2XL" expression="determined" />
        <Chips Text={STUMBLES.first.verdict} size="S" color="Partial" active showLeftIcon={false} showRightIcon={false} className={styles.verdictChip} />
        <RecallResult
          state="Miss"
          title={STUMBLES.first.copy}
          transcript={"“Formal charge is the charge on an atom when every bond’s… um…”"}
        />
        <HintCard body={`The missing word — ${DRILL_MISSED_WORD}`} />
      </div>
    </ScreenShell>
  )
}
