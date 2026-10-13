'use client'

import { use, useEffect, useRef } from 'react'
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
import { getTerm, markMicFault, recordConfidence, shownAnswer, verdictFor, useSession } from '@/lib/session'
import { confidenceGrace } from '@/lib/motion'
import styles from './captured.module.css'

// 02a Captured — Figma frame "02a Captured — review before sending" (15785:13098).
// Sits between Recording and the verdict: the student sees what was heard BEFORE
// anything is judged, so a mishear reads as "the app misheard me", not "I failed"
// (sprint-context § Screens).
//
// Combined with the confidence ask, 2026-10-12 (designer, option 2b from the senior
// review). Every attempt used to be record → submit → this screen → "Looks right" →
// processing → "How sure are you?" → verdict: six beats before feedback, on a loop
// with a 70% completion target. Now the transcript and the confidence question share
// one screen, so both principles survive — the words before the judging, the call
// before the verdict — with one beat fewer. Processing is a short wait with no ask.

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
  const answerRef = useRef<(sure?: boolean) => void>(() => {})
  useEffect(() => {
    answerRef.current = answer
  })
  // The ask stays optional (designer, 2026-10-09): unanswered, the turn moves on after
  // confidenceGrace with no confidence recorded, as it did on Processing.
  useEffect(() => {
    const id = window.setTimeout(() => answerRef.current(), confidenceGrace())
    return () => window.clearTimeout(id)
  }, [])

  useRedirect(!current, '/session/intro')

  if (!current) return null

  function answer(sure?: boolean) {
    if (answeredRef.current) return
    answeredRef.current = true
    // The same call Processing used to make, with the verdict this take will get.
    if (sure !== undefined) recordConfidence(index, sure, verdictFor(index, ms, Number(attempt)))
    const q = new URLSearchParams(forward)
    if (sure !== undefined) q.set('sure', sure ? '1' : '0')
    router.push(`/session/processing/${index}?${q}`)
  }

  return (
    <ScreenShell
      topNavigation={<SessionBar index={index} door={door} />}
      bottomContent={<ConfidenceAsk onAnswer={answer} />}
    >
      <div className={styles.body}>
        {/* Knowie has just heard you and is holding it up — "here's what I heard". */}
        <MascotSlot size="2XL" expression="excited" />
        <RecallResultCaptured
          className={styles.card}
          title="Here&rsquo;s what I heard."
          transcript={shownAnswer(index, verdictFor(index, ms, Number(attempt)), state)}
        />
        {/* The corrections sit with the words they correct, not in the action zone,
            which now holds the confidence call. "Type instead" after a mishear is the
            app's fault, so it is marked as mic trouble and keeps the full value. */}
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
              markMicFault(index)
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
