'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, ChatBubble, MascotSlot, ScreenShell } from '@/components'
import { advancePractice, isPractising, useDrillTerm } from '@/lib/session'
import styles from '../drill.module.css'

// DD 00 / 00b — drill intro. Figma frames "DD 00 Entry framing (first time ever)"
// (15782:12588) and "DD 00b Entry framing (returning, compressed)" (15782:12675).
//
// Two states on one route: first run explains the mechanic, the return visit is
// compressed to the one rule. Static on purpose so it becomes a ritual.
//
// No XP is mentioned anywhere, deliberately — the drill is practice, not scored
// performance. If XP is ever added here, this copy needs rewriting.

function DrillIntro() {
  const router = useRouter()
  const drillTerm = useDrillTerm()
  const returning = useSearchParams().get('returning') === '1'

  return (
    <ScreenShell
      bottomContent={
        <div className={styles.stack}>
          <Button CTA="Let’s go" variant="Primary" size="M" fullWidth onClick={() => router.push('/drill/pass/1')} />
          <Button CTA="Skip" variant="Tertiary" size="M" fullWidth onClick={() => router.push(isPractising() ? advancePractice() : '/picker')} />
        </div>
      }
    >
      <div className={styles.centred}>
        {/* The screen's h1, for screen readers; the visible title is in the bubble. */}
        <h1 className="srOnly">{`Drill: ${drillTerm.name}`}</h1>
        <MascotSlot size="2XL" expression={returning ? 'laughing' : 'determined'} />
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
