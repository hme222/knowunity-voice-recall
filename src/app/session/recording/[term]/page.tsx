'use client'

import { Suspense, use, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AppBar,
  Button,
  MicButton,
  ProgressIndicator,
  RecordingStatus,
  ScreenShell,
  SessionFraction,
} from '@/components'
import { CloseIcon } from '@/components/icons'
import { getTerm, progressFor, TOTAL_TERMS } from '@/lib/session'
import styles from './recording.module.css'

// 02 Recording — Figma frame "02 Recording" (15672:20100).
// Tap the mic to pause or resume; "Done speaking" ends the take and goes to review.
// There is no cancel here — 02a Captured already offers Re-record, so discarding a
// take is one tap through a screen that exists (SPEC.md § "Explicitly out of scope").
//
// The take's duration selects the verdict downstream. It is carried in the query so it
// survives the navigation without needing session state for a value used once.

function RecordingScreen({ index }: { index: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = getTerm(index)
  // Carried through the take, not dropped: `attempt` is what lets the scripted
  // couldn't-hear fire once rather than forever, and `hinted` is what makes the
  // Hinted bucket reachable at all.
  const attempt = searchParams.get('attempt') ?? '1'
  const hinted = searchParams.get('hinted') === '1'
  // The say-it-back repeat after a reveal: a real take, then its own result screen.
  const isRepeat = searchParams.get('repeat') === '1'

  const [seconds, setSeconds] = useState(0)
  const [paused, setPaused] = useState(false)
  const startedAt = useRef(0)

  useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)
    return () => window.clearInterval(id)
  }, [paused])

  if (!current) {
    router.replace('/session/intro')
    return null
  }

  function done() {
    const took = Date.now() - startedAt.current
    if (isRepeat) {
      router.push(`/session/repeat/${index}`)
      return
    }
    const q = new URLSearchParams({ ms: String(took), attempt })
    if (hinted) q.set('hinted', '1')
    router.push(`/session/captured/${index}?${q}`)
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
            onLeft={() => router.push('/session/exit')}
          >
            <ProgressIndicator
              progress={progressFor(index)}
              thickness="16"
              label="Questions"
              current={index}
              total={TOTAL_TERMS}
            />
          </AppBar>
          <SessionFraction current={index} total={TOTAL_TERMS} />
        </>
      }
      bottomContent={
        <div className={styles.actions}>
          <RecordingStatus seconds={seconds} paused={paused} />
          <Button CTA="Done speaking" variant="Primary" size="M" fullWidth onClick={done} />
        </div>
      }
    >
      <div className={styles.body}>
        <div className={styles.micWrap}>
          <span className={styles.ring} aria-hidden="true" />
          <span className={styles.ring} aria-hidden="true" />
          <span className={styles.ring} aria-hidden="true" />
          {/* A real Paused state as of 2026-09-21. The accepted risk that "nothing on
              screen changes when paused" failed its own gate: the fill was identical
              and the pulse ring kept animating while the caption said stopped. */}
          <MicButton
            state={paused ? 'Paused' : 'Listening'}
            onClick={() => setPaused((p) => !p)}
          />
        </div>
      </div>
    </ScreenShell>
  )
}

export default function RecordingPage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = use(params)
  return (
    <Suspense fallback={null}>
      <RecordingScreen index={Number(term)} />
    </Suspense>
  )
}
