'use client'

import { useRouter } from 'next/navigation'
import { Button, HintCard, MascotSlot, ScreenShell, StrengthMeter } from '@/components'
import { drillRung } from '@/lib/session'
import { DrillBar } from '../DrillBar'
import styles from '../drill.module.css'

// DD 07 — first stumble. Figma frame "DD 07 Miss — local correction, keep going"
// (15782:12362).
//
// Reveal the missed word, retake the pass. The meter HOLDS — it does not drop. A
// student must never watch progress go backwards for asking for help, which is the
// second of the two rules the whole variable-length design rests on.

export default function DrillMissPage() {
  const router = useRouter()
  const rung = drillRung(2)

  return (
    <ScreenShell
      topNavigation={<DrillBar step={2} onExit={() => router.push('/picker')} />}
      bottomContent={
        <div className={styles.stack}>
          <Button
            CTA="Take the pass again"
            variant="Primary"
            size="M"
            fullWidth
            onClick={() => router.push('/drill/miss/letter')}
          />
          <Button CTA="Leave the drill" variant="Tertiary" size="M" fullWidth onClick={() => router.push('/picker')} />
        </div>
      }
    >
      <div className={styles.body}>
        {/* Parked, not reduced. */}
        <StrengthMeter fill={rung?.coverage ?? 25} label="Held while you get this one" />
        <MascotSlot size="2XL" expression="determined" />
        <HintCard body="The word you missed was “evenly”. Take the pass again from the top." />
        <p className={styles.note}>Nothing lost — the meter waits for you.</p>
      </div>
    </ScreenShell>
  )
}
