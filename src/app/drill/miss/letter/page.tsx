'use client'

import { useRouter } from 'next/navigation'
import { Button, Chips, HintCard, MascotSlot, MicButton, RecallResult, ScreenShell, StrengthMeter } from '@/components'
import { DRILL_MISSED_WORD, STUMBLES } from '@/lib/session'
import styles from '../../drill.module.css'
import { DrillBar } from '../../DrillBar'

// DD 07b — second stumble on the SAME word. Figma frame "DD 07b Miss — 2nd stumble
// (first letter)" (15810:11025).
//
// The word stays visible with its first letter shown: a prompt, not a giveaway. The
// meter barely moves, because a prompted recall is not an unaided one.
//
// Scaffold state resets per definition, per session — which needs a per-word stumble
// count, unconfirmed with engineering (docs/sprint-context.md open question 8).

export default function DrillLetterPage() {
  const router = useRouter()
  const blanked = `${DRILL_MISSED_WORD[0]}${'_'.repeat(DRILL_MISSED_WORD.length)}`

  return (
    <ScreenShell
      topNavigation={<DrillBar step={2} onExit={() => router.push('/picker')} />}
      bottomContent={
        <Button
          CTA="Come back to this one"
          variant="Tertiary"
          size="M"
          fullWidth
          onClick={() => router.push('/picker')}
        />
      }
    >
      <div className={styles.body}>
        <StrengthMeter fill={28} label="Barely moved — this one was prompted" />
        <MascotSlot size="XL" expression="determined" className={styles.mascotCentred} />
        <Chips Text={STUMBLES.second.verdict} size="S" color="Partial" active showLeftIcon={false} showRightIcon={false} className={styles.verdictChip} />
        <RecallResult state="Miss" title={STUMBLES.second.copy} transcript="Starts with" />
        {/* The blanked cue IS the first-letter hint. A HintCard restating it cost
            120px and pushed the mic below the fold. */}
        <HintCard body={`…every bond’s ${blanked} are split evenly…`} />
        {/* The mic sits with the prompt it answers, not in the action zone: 132px of
            this screen was being clipped, and the card it sliced was the hint. */}
        <div className={styles.micZone}>
          <MicButton state="Idle" onClick={() => router.push('/drill/miss/echo')} />
        </div>
      </div>
    </ScreenShell>
  )
}
