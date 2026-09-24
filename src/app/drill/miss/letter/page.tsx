'use client'

import { useRouter } from 'next/navigation'
import { micRegionClass, Button, ChatBubble, Chips, HintCard, MascotSlot, MicButton, ScreenShell } from '@/components'
import { DRILL_MISSED_FIRST_LETTER, DRILL_MISSED_WORD, STUMBLES } from '@/lib/session'
import styles from '../../drill.module.css'
import { Cue } from '../../Cue'
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
        {/* Knowie speaking, not a second copy of the take. DD 07 already shows what
            the student said; repeating it here said nothing new and cost 156px on a
            screen that was already overflowing into the mic. */}
        <ChatBubble className={styles.fullWidth} body={STUMBLES.second.copy} />
        {/* The nudge belongs in the hint card, with the letter it promises. "Starts
            with" appeared on screen with no letter after it. */}
        <HintCard
          className={styles.fullWidth}
          label="Starts with"
          tone="missingWord"
          body={DRILL_MISSED_FIRST_LETTER}
        />
        {/* Drawn blank, same as the thinning passes. */}
        <Cue className={[styles.cueBody, styles.fullWidth].join(' ')} text={`…every bond’s ${blanked} are split evenly…`} />
        <div className={micRegionClass}>
          {/* Records, then advances. It used to jump straight to the next rung, so the
              mic was a Next button wearing a microphone. */}
          <MicButton state="Idle" onClick={() => router.push('/drill/recording?step=2&stumble=letter')} />
        </div>
      </div>
    </ScreenShell>
  )
}
