'use client'

import { useRouter } from 'next/navigation'
import { micRegionClass, Button, Chips, HintCard, MascotSlot, MicButton, MicCaption, ScreenShell } from '@/components'
import { STUMBLES, micGate, missedWordContext, useDrillTerm } from '@/lib/session'
import styles from '../../drill.module.css'
import { Cue } from '../../Cue'
import { DrillBar } from '../../DrillBar'

// DD 07b — second stumble on the SAME word. History: docs/code-history.md#h-019

export default function DrillLetterPage() {
  const router = useRouter()
  const drillTerm = useDrillTerm()
  const blanked = `${drillTerm.drill.missedWord[0]}${'_'.repeat(drillTerm.drill.missedWord.length - 1)}`

  return (
    <ScreenShell
      mic={
        <div className={micRegionClass}>
          {/* Records, then advances. It used to jump straight to the next rung, so the
              mic was a Next button wearing a microphone. */}
          <MicButton state="Idle" onClick={() => router.push(micGate('/drill/recording?step=2&stumble=letter', `/text/turn?term=${drillTerm.index}&drill=2`))} />
          {/* Knowie's line, under the mic it is asking the student to use (2026-10-12). */}
          <MicCaption body={STUMBLES.second.copy} />
        </div>
      }
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
        <div className={[styles.fullWidth, styles.verdictRow].join(' ')}>
          <Chips
            Text={STUMBLES.second.verdict}
            size="S"
            color="Partial"
            active
            showLeftIcon={false}
            showRightIcon={false}
          />
        </div>
        {/* The nudge belongs in the hint card, with the letter it promises. "Starts
            with" appeared on screen with no letter after it. */}
        <HintCard
          className={styles.fullWidth}
          label="Starts with"
          tone="missingWord"
          body={drillTerm.drill.missedWord[0]}
        />
        {/* Drawn blank, same as the thinning passes. */}
        <Cue className={[styles.cueBody, styles.fullWidth].join(' ')} text={missedWordContext(drillTerm, blanked)} />
      </div>
    </ScreenShell>
  )
}
