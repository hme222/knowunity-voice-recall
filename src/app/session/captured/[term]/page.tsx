'use client'

import { use, useRef, useState } from 'react'
import { useRedirect } from '@/lib/navigation'
import { useRouter, useSearchParams } from 'next/navigation'
import { SessionBar } from '../../SessionBar'
import { Suspense } from 'react'
import {
  Button,
  ConfidenceAsk,
  MascotSlot,
  RecallResultCaptured,
  ScreenShell,
} from '@/components'
import { getTerm, isPractising, recordConfidence, shownAnswer, verdictFor, useSession, nextAfter, recordOutcome } from '@/lib/session'
import styles from './captured.module.css'

// 02a Captured — Figma frame "02a Captured — review before sending" (15785:13098). History: docs/code-history.md#h-051

function CapturedScreen({ index }: { index: number }) {
  const router = useRouter()
  const state = useSession()
  const searchParams = useSearchParams()
  const current = getTerm(index)
  // Forwarded wholesale rather than picked apart: dropping one of these is what broke
  // the chain before.
  const forward = new URLSearchParams({
    ms: searchParams.get('ms') ?? '0',
    attempt: searchParams.get('attempt') ?? '1',
  })
  if (searchParams.get('hinted') === '1') forward.set('hinted', '1')
  const door = searchParams.get('door')
  if (door) forward.set('door', door)
  const attempt = searchParams.get('attempt') ?? '1'
  const hinted = searchParams.get('hinted') === '1'
  const ms = Number(searchParams.get('ms') ?? '0')

  // Once only: a double tap on "Looks good" must not judge twice.
  const answeredRef = useRef(false)
  // The confidence call, optional and small (designer, 2026-10-13): a pair of chips
  // under the card, read when the student taps "Looks good". Untapped, nothing is
  // scored, as "Just check it" did.
  const [sure, setSure] = useState<boolean | undefined>(undefined)
  // The ask stays optional (designer, 2026-10-09) through a "Skip", not a timer. A
  // 10s auto-advance put dead air on every unanswered turn (Duolingo design review)
  // and moved a screen-reader user on mid-transcript (WCAG 2.2.1; Knowunity
  // engineering review), so the student moves it on, with or without an answer.

  useRedirect(!current, '/session/resume')

  if (!current) return null

  function answer(sure?: boolean) {
    if (answeredRef.current) return
    answeredRef.current = true
    // The same call Processing used to make, with the verdict this take will get.
    if (sure !== undefined) recordConfidence(index, sure, verdictFor(index, ms, Number(attempt), { practising: isPractising(state) }))
    const q = new URLSearchParams(forward)
    if (sure !== undefined) q.set('sure', sure ? '1' : '0')
    // replace: Captured and Processing are one beat; back from the verdict should not
    // land on either and re-fire its timer.
    router.replace(`/session/processing/${index}?${q}`)
  }

  return (
    <ScreenShell
      topNavigation={
        // The same Skip as 01 Idle, so the top bar does not change shape across the
        // turn (coherence critic, 2026-10-13).
        <SessionBar
          index={index}
          door={door}
          onSkip={() => {
            recordOutcome(index, 'Worth revisiting')
            router.push(nextAfter(index))
          }}
        />
      }
      // Two answers to "is that what you said?", as the frame had them (designer,
      // 2026-10-13: the ask-in-the-zone version was "awful"). "Not quite right" goes
      // back to the question, where the student can say it again or type, and Knowie
      // owns the mishear there ("My mistake. Say it again.", designer, 2026-10-14).
      bottomContent={
        <div className={styles.actions}>
          <Button CTA="Looks good" variant="Primary" size="M" fullWidth onClick={() => answer(sure)} />
          <Button
            CTA="That’s not what I said"
            variant="Tertiary"
            size="S"
            fullWidth
            onClick={() => {
              answeredRef.current = true
              router.push(`/session/idle/${index}?attempt=${attempt}&misheard=1${hinted ? '&hinted=1' : ''}${door ? `&door=${door}` : ''}`)
            }}
          />
        </div>
      }
    >
      <div className={styles.body}>
        {/* Knowie has just heard you and is holding it up — "here's what I heard". */}
        <MascotSlot size="2XL" expression="excited" />
        <RecallResultCaptured
          className={styles.card}
          title="Here&rsquo;s what I heard."
          transcript={shownAnswer(index, verdictFor(index, ms, Number(attempt), { practising: isPractising(state) }), state)}
        />
        {/* How sure, optional: the app's own buttons, the picked one shown as chosen
            (designer, 2026-10-14: the small chips "don't match the aesthetic"). */}
        <ConfidenceAsk className={styles.card} value={sure} onChange={setSure} />
      </div>
    </ScreenShell>
  )
}

export default function CapturedPage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = use(params)
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <CapturedScreen index={Number(term)} />
    </Suspense>
  )
}
