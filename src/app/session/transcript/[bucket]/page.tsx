'use client'

import { Suspense, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { returnBack } from '@/lib/navigation'
import { BottomSheet, PickerRow, ScreenShell, TextBlock } from '@/components'
import { answerFor, getTerm, TERMS } from '@/lib/session'
import styles from '../../../drill/drill.module.css'

// The transcript sheet, reachable from the Miss result's eye icon and every Recap row.
// Its own branch screen, per the sheet rule.
//
// It ADAPTS by bucket, because not every term has a transcript:
//   passed   → what the student said
//   revealed → the attempt plus the answer they were given
//   skipped  → the answer alone, since nothing was said
// One sheet, three content states. Without this, Recap would have rows that open
// nothing, or an eye icon on some rows and not others.

const COPY = {
  passed: {
    title: 'What you said',
    subtitle: 'Word for word, as Knowie heard it.',
  },
  revealed: {
    title: 'What you said, and the answer',
    subtitle: 'Your attempt first, then the definition you were shown.',
  },
  skipped: {
    title: 'The answer',
    subtitle: "You skipped this one, so there's no take to play back.",
  },
} as const

type Bucket = keyof typeof COPY

function TranscriptScreen({ bucket }: { bucket: string }) {
  const router = useRouter()
  const key = (bucket in COPY ? bucket : 'passed') as Bucket
  // WHICH row was opened. This was TERMS[0], so every row on Recap and every "See the
  // full transcript" opened term 1's transcript — the sheet always showed the wrong
  // term unless you happened to be on the first one.
  const index = Number(useSearchParams().get('term') ?? '1')
  const term = getTerm(index) ?? TERMS[0]
  const copy = COPY[key]

  return (
    <ScreenShell
      showBottomSheetBackground
      bottomSheetOnly={
      <BottomSheet Title={copy.title} subtitle={copy.subtitle} onDismiss={() => returnBack(router, '/session/recap')}>
          {key !== 'skipped' && (
            <>
              <PickerRow raised variant="topic" label={`“${answerFor(term.index)}”`} />
            </>
          )}
          {key !== 'passed' && <PickerRow raised variant="topic" label={term.answer} />}
          <p className={styles.note}>{term.title}</p>
        </BottomSheet>
      }
    >
      <TextBlock variant="L" title="Session recap" showCaption={false} />

    </ScreenShell>
  )
}

export default function TranscriptPage({ params }: { params: Promise<{ bucket: string }> }) {
  const { bucket } = use(params)
  return (
    <Suspense fallback={null}>
      <TranscriptScreen bucket={bucket} />
    </Suspense>
  )
}
