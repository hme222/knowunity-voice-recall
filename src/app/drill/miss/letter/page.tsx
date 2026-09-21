'use client'

import { useRouter } from 'next/navigation'
import { Button, Chips, HintCard, MascotSlot, MicButton, RecallResult, ScreenShell, StrengthMeter } from '@/components'
import { DRILL_MISSED_WORD, DRILL_TERM, STUMBLES } from '@/lib/session'
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
        <div className={styles.actions}>
          <MicButton state="Idle" onClick={() => router.push('/drill/miss/echo')} />
          <Button
            CTA="Come back to this one"
            variant="Tertiary"
            size="M"
            onClick={() => router.push('/picker')}
          />
        </div>
      }
    >
      <div className={styles.body}>
        <StrengthMeter fill={28} label="Barely moved — this one was prompted" />
        <p className={styles.note}>{DRILL_TERM.drillTitle ?? DRILL_TERM.title}</p>
        <MascotSlot size="2XL" expression="determined" />
        <Chips Text={STUMBLES.second.verdict} size="S" color="Coral" active showRightIcon={false} />
        <RecallResult state="Miss" title={STUMBLES.second.copy} transcript="Starts with" />
        <p className={styles.cue}>…every bond&rsquo;s {blanked} are split evenly…</p>
        <HintCard body={`First letter — ${DRILL_MISSED_WORD[0]}`} />
      </div>
    </ScreenShell>
  )
}
