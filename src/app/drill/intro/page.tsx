'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, ChatBubble, MascotSlot, ScreenShell } from '@/components'
import { DRILL_TERM } from '@/lib/session'
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
  const returning = useSearchParams().get('returning') === '1'

  return (
    <ScreenShell
      bottomContent={
        <div className={styles.stack}>
          <Button CTA="Start drilling" variant="Primary" size="M" fullWidth onClick={() => router.push('/drill/pass/1')} />
          <Button CTA="Not now" variant="Tertiary" size="M" fullWidth onClick={() => router.push('/picker')} />
        </div>
      }
    >
      <div className={styles.centred}>
        <MascotSlot size="2XL" expression={returning ? 'laughing' : 'determined'} />
        {returning ? (
          <ChatBubble
            showTitle
            title={DRILL_TERM.title}
            body="Say it, miss a word, keep going. That's the whole thing."
          />
        ) : (
          <ChatBubble
            showTitle
            title="Drill it out loud"
            body="Say the whole definition. Each time you get it, a few words disappear — until you're saying it with nothing on screen. No grade, no XP. You're done when you can say it unaided."
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
