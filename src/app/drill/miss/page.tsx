'use client'

import { useRouter } from 'next/navigation'
import { actionRowClass, Button, Chips, HintCard, MascotSlot, RecallResult, ScreenShell } from '@/components'
import { STUMBLES, useDrillTerm, advancePractice, isPractising } from '@/lib/session'
import { DrillBar } from '../DrillBar'
import styles from '../drill.module.css'

// DD 07 — first stumble. History: docs/code-history.md#h-020

export default function DrillMissPage() {
  const router = useRouter()
  const drillTerm = useDrillTerm()

  return (
    <ScreenShell
      topNavigation={<DrillBar step={2} onExit={() => router.push('/picker')} onSkip={() => router.push(isPractising() ? advancePractice() : '/picker')} />}
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
        <RecallResult className={styles.fullWidth} state="Neutral" title={STUMBLES.first.copy} transcript={`“${drillTerm.drill.partial}”`} />
        <HintCard
          className={styles.fullWidth}
          label="The missing word"
          tone="missingWord"
          body={drillTerm.drill.missedWord}
        />
      </div>
    </ScreenShell>
  )
}
