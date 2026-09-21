'use client'

import { useRouter } from 'next/navigation'
import { Button, MascotSlot, RecallResult, ScreenShell, StrengthMeter, TrainingLog } from '@/components'
import { DRILL_TERM } from '@/lib/session'
import styles from '../drill.module.css'

// DD 08 Complete — Figma frame "DD 08 Complete — definition reassembles"
// (15782:12475). Meter full, Knowie's warm arrival, no badge.
//
// The training log shows however many passes actually happened. The frame's footer
// reads "all four takes"; that copy is a leftover from the fixed ladder and is not
// reproduced — the count is derived.
//
// No XP anywhere. Deliberate: the drill is practice, not scored performance.

const ROUNDS = [
  { label: 'Round 1 · Full definition' },
  { label: 'Round 2 · One word gone' },
  { label: 'Round 3 · Several gone' },
  { label: 'Round 4 · All you', final: true },
]

export default function DrillCompletePage() {
  const router = useRouter()
  return (
    <ScreenShell
      bottomContent={
        <div className={styles.stack}>
          <Button CTA="Done" variant="Primary" size="M" fullWidth onClick={() => router.push('/picker')} />
          <Button
            CTA="Try again"
            variant="Tertiary"
            size="M"
            fullWidth
            onClick={() => router.push('/drill/intro?returning=1')}
          />
        </div>
      }
    >
      <div className={styles.body}>
        <StrengthMeter fill={100} label="You said all of it unaided" />
        <p className={styles.note}>{DRILL_TERM.drillTitle ?? DRILL_TERM.title}</p>
        <div className={styles.centred}>
          <MascotSlot size="2XL" expression="laughing" />
        </div>
        <RecallResult
          state="Pass"
          title="That’s the whole thing. Yours."
          transcript={`“${DRILL_TERM.answer}”`}
        />
        <TrainingLog rounds={ROUNDS} onSelect={() => router.push('/drill/complete/round')} />
      </div>
    </ScreenShell>
  )
}
