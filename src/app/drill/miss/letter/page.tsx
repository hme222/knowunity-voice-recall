'use client'

import { useRouter } from 'next/navigation'
import { Button, Chips, MascotSlot, MicButton, ScreenShell } from '@/components'
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
//
// Built on DD 07's shape: mascot, verdict, neutral result card, the prompt card, then
// the mic alone. The graded red card and the full-bleed meter are not in this family.

export default function DrillLetterPage() {
  const router = useRouter()
  const blanked = `${DRILL_MISSED_WORD[0]}${'_'.repeat(DRILL_MISSED_WORD.length - 1)}`

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
      <div className={styles.frameBody}>
        <MascotSlot size="2XL" expression="determined" />
        <Chips
          Text={STUMBLES.second.verdict}
          size="S"
          color="Partial"
          active
          showLeftIcon={false}
          showRightIcon={false}
        />
        <div className={[styles.resultCard, styles.fullWidth].join(' ')}>
          <p className={styles.resultTitle}>{STUMBLES.second.copy}</p>
          <p className={styles.resultLabel}>Starts with</p>
          <p className={styles.resultBody}>
            &hellip;every bond&rsquo;s {blanked} are split evenly&hellip;
          </p>
        </div>
        <div className={styles.frameMic}>
          <MicButton state="Idle" onClick={() => router.push('/drill/miss/echo')} />
        </div>
      </div>
    </ScreenShell>
  )
}
