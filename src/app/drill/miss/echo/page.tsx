'use client'

import { useRouter } from 'next/navigation'
import { Button, Chips, MascotSlot, MicButton, RecallResult, ScreenShell, StrengthMeter } from '@/components'
import { DRILL_MISSED_WORD, DRILL_TERM, STUMBLES } from '@/lib/session'
import styles from '../../drill.module.css'
import { DrillBar } from '../../DrillBar'

// DD 07c — third stumble, echo. Figma frame "DD 07c Miss — 3rd stumble (echo)"
// (15810:11151).
//
// The task bends until it is always completable: Knowie gives the word, the student
// repeats it. THE LOOP TERMINATES HERE — that is the point of the scaffold. A stuck
// student cannot cycle forever, because the third rung is a task nobody can fail.
//
// Echoing barely fills the meter, because echoing is not unaided recall. That is the
// honest trade: the student always gets out, and the meter never lies about how.

export default function DrillEchoPage() {
  const router = useRouter()
  return (
    <ScreenShell
      topNavigation={<DrillBar step={2} onExit={() => router.push('/picker')} />}
      bottomContent={
        <div className={styles.actions}>
          <MicButton state="Idle" label={`Say ${DRILL_MISSED_WORD} out loud`} onClick={() => router.push('/drill/pass/3')} />
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
        <StrengthMeter fill={30} label="Echoing isn't unaided — but it gets you moving" />
        <p className={styles.note}>{DRILL_TERM.drillTitle ?? DRILL_TERM.title}</p>
        <MascotSlot size="2XL" expression="laughing" />
        <Chips Text={STUMBLES.third.verdict} size="S" color="Coral" active showRightIcon={false} />
        <RecallResult state="Miss" title={STUMBLES.third.copy} transcript="After me" />
        <p className={styles.echoWord}>&ldquo;{DRILL_MISSED_WORD}&rdquo;</p>
        <p className={styles.note}>Now you</p>
        <p className={styles.note}>Say &ldquo;{DRILL_MISSED_WORD}&rdquo; out loud.</p>
      </div>
    </ScreenShell>
  )
}
