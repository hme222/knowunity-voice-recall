'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BottomSheet, Button, ScreenShell } from '@/components'
import { QuestionBehind } from '../QuestionBehind'
import styles from '../permission.module.css'

// Mic permission primer, asked IN CONTEXT (designer, 2026-10-12, option 1b from the
// senior review). It used to be a full screen between 00 Intro and question 1, so a
// student met four screens of Knowie and a paragraph before the first question. Now
// the question comes first, and this sheet opens over it on the first mic tap — the
// moment the mic is needed. voice-ux Principle 3: never fire the OS request cold.
// Modelled on Babbel, which asks at the speaking-practice moment.
//
// `next` is where the mic tap was going; `alt` the typed route for "Type instead".

function Primer() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') ?? '/session/recording/1'
  const alt = params.get('alt') ?? '/text/turn?term=1'
  const forward = `next=${encodeURIComponent(next)}&alt=${encodeURIComponent(alt)}`
  return (
    <ScreenShell
      showBottomSheetBackground
      bottomSheetOnly={
        <BottomSheet
          Title="Knowie needs your mic"
          subtitle="To hear your answer. It only listens while you’re recording, and you can always type instead."
          onDismiss={() => router.back()}
        >
          <div className={styles.actions}>
            <Button CTA="Turn on the mic" variant="Primary" size="M" fullWidth onClick={() => router.push(`/permission/prompt?${forward}`)} />
            <Button CTA="Type instead" variant="Tertiary" size="M" fullWidth onClick={() => router.push(alt)} />
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
