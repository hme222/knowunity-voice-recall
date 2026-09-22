'use client'

import { Suspense, use, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { goToExit } from '@/lib/navigation'
import { AppBar, MascotSlot, ProgressIndicator, ScreenShell, SessionFraction, Button } from '@/components'
import { CloseIcon } from '@/components/icons'
import { getTerm, progressFor, recordConfidence, revisitsPending, verdictFor, TOTAL_TERMS } from '@/lib/session'
import { doorResultHref } from '@/app/door/doors'
import { slowThreshold } from '@/lib/motion'
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
  const door = searchParams.get('door')

  // The second state SPEC lists: judge slow past target. Copy escalates in place —
  // same screen, no state change, Knowie keeps breathing. voice-ux's triage calls for
  // "friendly, not a crash", and a new screen would read as an error.
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setSlow(true), slowThreshold())
    return () => window.clearTimeout(id)
  }, [])

  if (!current) {
    router.replace('/session/intro')
    return null
  }

  function answer(sure: boolean) {
    const verdict = verdictFor(index, ms, attempt)
    // The tap the screen has been blocking on now costs something. It was asked for,
    // waited for, and discarded — the Design Brief's own test is "overconfidence has to
    // cost something", and sure/not-sure produced identical screens and identical XP.
    recordConfidence(index, sure, verdict)
    // A run that came through a door and landed a Pass goes to that door's own result
    // rather than into the session, which it was never part of. A Miss or a mishear
    // falls through to the normal verdict screens: the help they offer is the same
    // help, and a door run that goes wrong should not be a dead end.
    const doorResult = verdict === 'Pass' ? doorResultHref(door) : null
    if (doorResult) {
      router.push(doorResult)
      return
    }
    const route =
      verdict === 'Pass' ? 'pass' : verdict === 'Miss' ? 'miss' : 'unclear'
    const q = new URLSearchParams({ sure: sure ? '1' : '0', attempt: String(attempt) })
    if (hinted) q.set('hinted', '1')
    router.push(`/session/${route}/${index}?${q}`)
  }

  return (
    <ScreenShell
      className={styles.root}
      topNavigation={
        <>
          <AppBar
            variant="leftIconButtonOnly"
            leftIcon={<CloseIcon />}
            leftLabel="Leave"
            onLeft={() => goToExit(router)}
          >
            <ProgressIndicator
              progress={progressFor(index)}
              thickness="16"
              label="Questions"
              current={index}
              total={TOTAL_TERMS}
            />
          </AppBar>
          <SessionFraction current={index} total={TOTAL_TERMS} moreToCome={revisitsPending()} />
        </>
      }
      bottomContent={
        <div className={styles.confidence}>
          <p className={styles.ask}>How sure are you?</p>
          <div className={styles.pair}>
            <Button CTA="Sure" variant="Secondary" size="M" fullWidth onClick={() => answer(true)} />
            <Button CTA="Not sure" variant="Secondary" size="M" fullWidth onClick={() => answer(false)} />
          </div>
          {slow && (
            <Button
              CTA="Having connection trouble?"
              variant="Tertiary"
              size="S"
              fullWidth
              onClick={() => router.push(`/session/offline?term=${index}`)}
            />
          )}
        </div>
      }
    >
      <div className={styles.body}>
        <div className={styles.mascot}>
          <MascotSlot size="2XL" expression="determined" />
        </div>
        <p className={styles.line} role="status" aria-live="polite">
          {slow
            ? 'Still thinking — hang on, this one is taking a moment.'
            : 'Let me check that against the definition…'}
        </p>
        <div className={styles.dots} aria-hidden="true">
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      </div>
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
