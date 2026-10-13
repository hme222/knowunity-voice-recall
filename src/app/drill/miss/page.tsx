'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { actionRowClass, Button, Chips, HintCard, MascotSlot, RecallResult, ScreenShell } from '@/components'
import { STUMBLES, useDrillTerm, useSession } from '@/lib/session'
import { DrillBar } from '../DrillBar'
import styles from '../drill.module.css'

// DD 07 — first stumble. History: docs/code-history.md#h-020

function DrillMiss() {
  const router = useRouter()
  const drillTerm = useDrillTerm()
  const state = useSession()
  // A typed take shows what was typed, under "You wrote", with the neutral chip: the
  // canned stumble ("…every bond's… evenly…") is the spoken mock's, and quoting it at
  // someone who typed something else broke the echo (UX critic, 2026-10-13).
  const typedText = useSearchParams().get('typed') === '1' ? state.sentTyped?.[drillTerm.index] : undefined

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
        </div>
      }
    >
      <div className={styles.frameBody}>
        <MascotSlot size="2XL" expression="thinking" />
        <div className={[styles.fullWidth, styles.verdictRow].join(' ')} aria-hidden="true">
          <Chips
            Text={typedText ? 'Not quite yet' : STUMBLES.first.verdict}
            size="S"
            color={typedText ? 'Primary' : 'Partial'}
            active={!typedText}
            showLeftIcon={false}
            showRightIcon={false}
          />
        </div>
        {/* RecallResult state="Neutral" — promoted from the inline card that three
            drill screens were duplicating. The drill is practice, not scored
            performance, so a miss here is not painted as an error. */}
        <RecallResult
          className={styles.fullWidth}
          state="Neutral"
          verdict={typedText ? 'Not quite yet' : STUMBLES.first.verdict}
          title={typedText ? 'Not all there yet. Here’s the word to build on.' : STUMBLES.first.copy}
          transcript={`“${typedText ?? drillTerm.drill.partial}”`}
          label={typedText ? 'You wrote' : undefined}
        />
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

export default function DrillMissPage() {
  return (
    <Suspense fallback={null}>
      <DrillMiss />
    </Suspense>
  )
}
