'use client'

import { useRouter } from 'next/navigation'
import { micRegionClass, Button, Chips, HintCard, MascotSlot, MicButton, RecallResult, ScreenShell } from '@/components'
import { DRILL_MISSED_WORD, DRILL_PARTIAL, STUMBLES } from '@/lib/session'
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
//
// Built on DD 07's shape. The word to echo is the card's body, at echo size, so the
// one thing the student has to say is the one thing the card is for.

export default function DrillEchoPage() {
  const router = useRouter()
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
        <MascotSlot size="2XL" expression="laughing" />
        <Chips
          Text={STUMBLES.third.verdict}
          size="S"
          color="Partial"
          active
          showLeftIcon={false}
          showRightIcon={false}
        />
        {/* RecallResult state="Neutral" — promoted from the inline card that three
            drill screens were duplicating. The drill is practice, not scored
            performance, so a miss here is not painted as an error. */}
        {/* Same correction as DD 07b: this card is labelled "You said", so putting the
            word Knowie is ASKING for in it told the student they had already said it. */}
        <RecallResult className={styles.fullWidth} state="Neutral" title={STUMBLES.third.copy} transcript={`“${DRILL_PARTIAL}”`} />
        <HintCard
          className={styles.fullWidth}
          label="Say this with me"
          tone="missingWord"
          body={DRILL_MISSED_WORD}
        />
        <div className={micRegionClass}>
          {/* Records, then advances. This is the rung whose whole point is saying the
              word out loud with Knowie, and it used to complete without a take. */}
          <MicButton
            state="Idle"
            label={`Say ${DRILL_MISSED_WORD} out loud`}
            onClick={() => router.push('/drill/recording?step=2&stumble=echo')}
          />
        </div>
      </div>
    </ScreenShell>
  )
}
