'use client'

import { useRouter } from 'next/navigation'
import { actionRowClass, Button, Chips, HintCard, MascotSlot, RecallResult, ScreenShell } from '@/components'
import { DRILL_MISSED_WORD, STUMBLES } from '@/lib/session'
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
//
// REBUILT TO THE FRAME 2026-09-21, two differences worth naming:
//   1. NO METER. The frame does not show one here at all. The built screen carried one
//      labelled "Held while you get this one", which was explaining an absence.
//   2. The result card is NEUTRAL. RecallResult state="Miss" paints it #532831 with a
//      red title; the frame is a grey card with a white title. The drill is practice,
//      not scored performance, so a miss here is not an error and must not be dressed
//      as one. Built inline — see component-gaps.md.

export default function DrillMissPage() {
  const router = useRouter()

  return (
    <ScreenShell
      topNavigation={<DrillBar step={2} onExit={() => router.push('/picker')} />}
      bottomContent={
        <div className={styles.stack}>
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
      <div className={styles.frameBody}>
        <MascotSlot size="2XL" expression="determined" />
        <Chips
          Text={STUMBLES.first.verdict}
          size="S"
          color="Partial"
          active
          showLeftIcon={false}
          showRightIcon={false}
        />
        {/* RecallResult state="Neutral" — promoted from the inline card that three
            drill screens were duplicating. The drill is practice, not scored
            performance, so a miss here is not painted as an error. */}
        <RecallResult className={styles.fullWidth} state="Neutral" title={STUMBLES.first.copy} transcript={`“Formal charge is the charge on an atom when every bond’s… um…”`} />
        <HintCard
          className={styles.fullWidth}
          label="The missing word"
          tone="missingWord"
          body={DRILL_MISSED_WORD}
        />
      </div>
    </ScreenShell>
  )
}
