'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BottomSheet, Button, MascotSlot, ScreenShell } from '@/components'
import { safeInternalPath } from '@/lib/session'
import { questionOf } from '../QuestionBehind'
import { QuestionBehind } from '../QuestionBehind'
import styles from '../permission.module.css'

// Mic permission primer, asked IN CONTEXT (designer, 2026-10-12, option 1b from the senior review). History: docs/code-history.md#h-044

function Primer() {
  const router = useRouter()
  const params = useSearchParams()
  // Internal paths only: these ride the query string (engineering review).
  const next = safeInternalPath(params.get('next'), '/session/recording/1')
  const alt = safeInternalPath(params.get('alt'), '/text/turn?term=1')
  const forward = `next=${encodeURIComponent(next)}&alt=${encodeURIComponent(alt)}`
  return (
    <ScreenShell
      showBottomSheetBackground
      bottomSheetOnly={
        <BottomSheet
          Title="Knowie needs your mic"
          subtitle="To hear your answer. It only listens while you’re recording, and you can always type instead."
          // Back to the question, never router.back(): on a cold load that leaves the
          // app (navigation.ts). The question is where the mic tap came from.
          onDismiss={() => router.replace(questionOf(next))}
        >
          {/* Knowie in the sheet, as the live app's own mic sheets carry their mascot art
              (screenshots 49, 52; Knowunity design review). From public/knowie, no new art. */}
          <div className={styles.sheetMascot}>
            <MascotSlot size="2XL" expression="excited" />
          </div>
          <div className={styles.actions}>
            <Button CTA="Turn on the mic" variant="Primary" size="M" fullWidth onClick={() => router.push(`/permission/prompt?${forward}`)} />
            {/* Secondary: the other way to answer, as on 01 Idle (button tiers by role, 2026-10-13). */}
            <Button CTA="Type instead" variant="Secondary" size="M" fullWidth onClick={() => router.push(alt)} />
          </div>
        </BottomSheet>
      }
    >
      <QuestionBehind next={next} />
    </ScreenShell>
  )
}

export default function PrimerPage() {
  return (
    <Suspense fallback={null}>
      <Primer />
    </Suspense>
  )
}
