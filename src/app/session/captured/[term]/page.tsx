'use client'

import { use, useRef } from 'react'
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

  // Once only: the grace timer and a tap can both land.
  const answeredRef = useRef(false)
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
      // "Just check it" under the pair it declines, not above it in the content
      // (craft critic, 2026-10-13: the order read reversed).
      bottomContent={<ConfidenceAsk onAnswer={answer} onDecline={() => answer()} />}
    >
      <div className={styles.body}>
        {/* Knowie has just heard you and is holding it up — "here's what I heard". */}
        <MascotSlot size="2XL" expression="excited" />
        <RecallResultCaptured
          className={styles.card}
          title="Here&rsquo;s what I heard."
          transcript={shownAnswer(index, verdictFor(index, ms, Number(attempt), { practising: isPractising(state) }), state)}
        />
        {/* The corrections sit with the words they correct, not in the action zone,
            which now holds the confidence call. */}
        <div className={styles.fix}>
          <span className={styles.fixLabel}>Not what you said?</span>
          <Button
            CTA="Say it again"
            variant="Tertiary"
            size="S"
            onClick={() => {
              answeredRef.current = true
              router.push(`/session/recording/${index}?attempt=${attempt}${hinted ? '&hinted=1' : ''}${door ? `&door=${door}` : ''}`)
            }}
          />
          <Button
            CTA="Type instead"
            variant="Tertiary"
            size="S"
            onClick={() => {
              answeredRef.current = true
              // No markMicFault here: nothing failed — the take was heard and is on
              // screen. Marking it paid a typed answer the full 10 XP, so recording
              // anything and then typing beat the typed-by-choice rate (engineering
              // review, 2026-10-13). A real couldn't-hear still marks it, on 04a.
              router.push(`/text/turn?term=${index}`)
            }}
          />
        </div>
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
