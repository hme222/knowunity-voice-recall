'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, ChatBubble, MascotSlot, ScreenShell } from '@/components'
import { advancePractice, isPractising, useDrillTerm } from '@/lib/session'
import styles from '../drill.module.css'

// DD 00 / 00b — drill intro. History: docs/code-history.md#h-017

function DrillIntro() {
  const router = useRouter()
  const drillTerm = useDrillTerm()
  const returning = useSearchParams().get('returning') === '1'

  return (
    <ScreenShell
      bottomContent={
        <div className={styles.stack}>
          <Button CTA="Let’s go" variant="Primary" size="M" fullWidth onClick={() => router.push('/drill/pass/1')} />
          <Button CTA="Not now" variant="Tertiary" size="M" fullWidth onClick={() => router.push(isPractising() ? advancePractice() : '/picker')} />
        </div>
      }
    >
      <div className={styles.centred}>
        {/* The screen's h1, for screen readers; the visible title is in the bubble. */}
        <h1 className="srOnly">{`Drill: ${drillTerm.name}`}</h1>
        <MascotSlot size="2XL" expression={returning ? 'giggling' : 'excited'} />
        {returning ? (
          <ChatBubble
            showTitle
            title={drillTerm.drillTitle ?? drillTerm.title}
            body="Say it, miss a word, keep going. That's the whole thing."
          />
        ) : (
          <ChatBubble
            showTitle
            title="Definition drill"
            body={
              // Plainer (senior review, 2026-10-12): "no XP watching" read as unfinished.
              "Four rounds. Each one hides more of the definition until you can say it on your own. " +
              "Nothing\u2019s graded. Miss a word and I\u2019ll show you."
            }
          />
        )}
      </div>
    </ScreenShell>
  )
}

export default function DrillIntroPage() {
  return (
    <Suspense fallback={null}>
      <DrillIntro />
    </Suspense>
  )
}
