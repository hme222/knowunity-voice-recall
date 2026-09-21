'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function RecordingPage({ params }: { params: Promise<{ term: string }> }) {
  const router = useRouter()
  const { term } = use(params)
  const index = Number(term)
  const current = getTerm(index)

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
    router.push(`/session/captured/${index}?ms=${took}`)
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
          <MicButton
            state={paused ? 'Captured' : 'Listening'}
            label={paused ? 'Paused, tap to resume' : undefined}
            onClick={() => setPaused((p) => !p)}
          />
        </div>
      </div>
    </ScreenShell>
  )
}
