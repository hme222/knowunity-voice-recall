'use client'

import { Suspense, use, useEffect, useRef, useState } from 'react'
import { useRedirect } from '@/lib/navigation'
import { useRouter, useSearchParams } from 'next/navigation'
import { SessionBar } from '../../SessionBar'
import { ProcessingBeat, ScreenShell } from '@/components'
import { getTerm, isPractising, markEarned, markSpokenTake, verdictFor, recordMiss, useSession } from '@/lib/session'
import { doorResultHref } from '@/app/door/doors'
import { processingDwell, slowThreshold } from '@/lib/motion'
import styles from './processing.module.css'

// 03 Processing — Figma frame "03 Processing" (15672:20190), plus the confidence tap
// decided 2026-09-20. The verdict is already determined by the take's duration; the
// tap is what advances the turn, so the signal can't be contaminated by knowing the
// outcome. Knowie breathes throughout so the screen never reads as stuck.

function ProcessingScreen({ index }: { index: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = getTerm(index)
  const ms = Number(searchParams.get('ms') ?? '0')
  const attempt = Number(searchParams.get('attempt') ?? '1')
  const hinted = searchParams.get('hinted') === '1'
  const state = useSession()
  // The run's door from the store when the URL dropped it: Miss → Try again never
  // forwarded it, so a door run that missed then passed got the session's 04 Pass
  // (engineering review, 2026-10-13).
  const door = searchParams.get('door') ?? state.door ?? null
  const practising = isPractising(state)

  // The second state SPEC lists: judge slow past target. History: docs/code-history.md#h-062
  const unusable = verdictFor(index, ms, attempt, { practising }) === 'CouldntHear'

  const [slow, setSlow] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setSlow(true), slowThreshold())
    return () => window.clearTimeout(id)
  }, [])

  // Straight through on an unusable take, after the same judging beat, so the timing
  // never leaks the outcome before the screen does.
  useEffect(() => {
    if (!unusable) return
    const id = window.setTimeout(
      // The door rides through a mishear too, so a quiz run stays a quiz run.
      // replace, not push: a judging beat must not sit in history, or browser back
      // replays it (engineering review, 2026-10-13).
      () => router.replace(`/session/unclear/${index}?attempt=${attempt}${door ? `&door=${door}` : ''}`),
      processingDwell(),
    )
    return () => window.clearTimeout(id)
  }, [unusable, index, attempt, router, door])

  // `sure` is undefined when the student never answered: the ask is optional (designer,
  // 2026-10-09), so after confidenceGrace the turn moves on with no confidence recorded
  // — no reward and no cost, rather than guessing one for them.
  function answer(sure?: boolean) {
    // Once only. The grace timer and a tap can both land (a tap in the last frame
    // before confidenceGrace), and a second run recorded the miss twice and pushed
    // twice (senior review, 2026-10-12: "make sure a double tap can't strand a student").
    if (answeredRef.current) return
    answeredRef.current = true
    const verdict = verdictFor(index, ms, attempt, { practising })
    // This take was spoken: a typed answer from an earlier try no longer speaks for it.
    markSpokenTake(index)
    // A tap that is given costs or pays something — the Design Brief's own test is "overconfidence has to cost something",… History: docs/code-history.md#h-063
    const doorResult = verdict === 'Pass' ? doorResultHref(door) : null
    if (doorResult) {
      router.replace(doorResult)
      return
    }
    const route =
      verdict === 'Pass' ? 'pass' : verdict === 'Miss' ? 'miss' : 'unclear'
    if (verdict === 'Miss') recordMiss(index)
    if (verdict === 'Pass') markEarned(index, 'Pass')
    const q = new URLSearchParams({ attempt: String(attempt) })
    if (sure !== undefined) q.set('sure', sure ? '1' : '0')
    if (hinted) q.set('hinted', '1')
    // replace: back from the verdict must not re-run this beat. It used to, and each
    // replay called recordMiss again, walking the hint ladder with no take.
    router.replace(`/session/${route}/${index}?${q}`)
  }

  // No ask here any more: the confidence call moved to 02a Captured, beside the
  // transcript (designer, 2026-10-12, option 2b). This is the judging beat, and it moves
  // on by itself after it, carrying the call Captured recorded. Through a ref, so the
  // re-render at the slow threshold does not restart the clock.
  const sureParam = searchParams.get('sure')
  const sure = sureParam === null ? undefined : sureParam === '1'
  const answerRef = useRef<(sure?: boolean) => void>(() => {})
  const answeredRef = useRef(false)
  useEffect(() => {
    answerRef.current = answer
  })
  useEffect(() => {
    if (unusable) return
    const id = window.setTimeout(() => answerRef.current(sure), processingDwell())
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unusable])

  useRedirect(!current, '/session/resume')

  if (!current) return null

  return (
    <ScreenShell
      className={styles.root}
      topNavigation={<SessionBar index={index} door={door} />}
      // Reserve the action zone before the question arrives. History: docs/code-history.md#h-064
      showBottomNavSlot
      bottomContent={<div className={styles.confidence} />}
    >
      <ProcessingBeat
        line={
          slow
            ? 'Still thinking — hang on, this one is taking a moment.'
            : 'Let me check that against the definition…'
        }
      />
    </ScreenShell>
  )
}

export default function ProcessingPage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = use(params)
  return (
    <Suspense fallback={null}>
      <ProcessingScreen index={Number(term)} />
    </Suspense>
  )
}
