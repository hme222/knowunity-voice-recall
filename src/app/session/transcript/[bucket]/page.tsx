'use client'

import { Suspense, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { returnBack } from '@/lib/navigation'
import { BottomSheet, ScreenShell } from '@/components'
import { answerFor, getTerm, shownAnswer, TERMS, useSession } from '@/lib/session'
import styles from '../../../drill/drill.module.css'

// The transcript sheet, reachable from the Miss result's eye icon and every Recap row. History: docs/code-history.md#h-084

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
  // A typed pass: nothing was heard, so the sheet does not say it was.
  typed: {
    title: 'What you typed',
    subtitle: 'Word for word, as you typed it.',
  },
  // A skip after the mic failed: the app's fault, not a choice (dev review, 2026-10-12).
  mic: {
    title: 'The answer',
    subtitle: "The mic missed this one, so there's no take to play back.",
  },
} as const

type Bucket = keyof typeof COPY

function TranscriptScreen({ bucket }: { bucket: string }) {
  const router = useRouter()
  const state = useSession()
  const asked = (bucket in COPY ? bucket : 'passed') as Bucket
  // WHICH row was opened. This was TERMS[0], so every row on Recap and every "See the
  // full transcript" opened term 1's transcript — the sheet always showed the wrong
  // term unless you happened to be on the first one.
  const params = useSearchParams()
  const index = Number(params.get('term') ?? '1')
  const term = getTerm(index) ?? TERMS[0]
  const key: Bucket =
    asked === 'skipped' && params.get('mic') === '1'
      ? 'mic'
      : asked === 'passed' && params.get('typed') === '1'
        ? 'typed'
        : asked
  const copy = COPY[key]

  return (
    <ScreenShell
      showBottomSheetBackground
      bottomSheetOnly={
      <BottomSheet Title={copy.title} subtitle={copy.subtitle} onDismiss={() => returnBack(router, '/session/recap')}>
          {key !== 'skipped' && key !== 'mic' && (
            <>
              {/* A quote, not a control. This was a PickerRow, which renders a <button> — so
                the whole transcript became a tappable thing's accessible name, and the
                tap did nothing. */}
              {/* Revealed quotes the attempt that missed (typed, or the partial take), not
                  the full canned answer it never had (dev review, 2026-10-12). */}
              <p className={styles.quote}>{`“${key === 'revealed' ? shownAnswer(term.index, 'Miss', state) : answerFor(term.index, state)}”`}</p>
            </>
          )}
          {key !== 'passed' && key !== 'typed' && <p className={styles.quote}>{term.answer}</p>}
          <p className={styles.note}>{term.title}</p>
        </BottomSheet>
      }
    >
      <div className="screenTitle">
          <h1 className="screenTitleHeading">Session recap</h1>
        </div>

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
