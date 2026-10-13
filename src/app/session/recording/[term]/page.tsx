'use client'

import { Suspense, use, useEffect, useRef, useState } from 'react'
import { useRedirect } from '@/lib/navigation'
import { useRouter, useSearchParams } from 'next/navigation'
import { SessionBar } from '../../SessionBar'
import {
  Button,
  ChatBubble,
  MicButton,
  RecordingStatus,
  ScreenShell,
} from '@/components'
import { getTerm, isPractising, markEarned, verdictFor, SUBJECT } from '@/lib/session'
import styles from './recording.module.css'

// 02 Recording — Figma frame "02 Recording" (15672:20100). History: docs/code-history.md#h-072

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
  const isBlank = searchParams.get('blank') === '1'
  // Which entry door this run came from, if any. See src/app/door/doors.ts.
  const door = searchParams.get('door')

  const [seconds, setSeconds] = useState(0)
  const [paused, setPaused] = useState(false)
  // Start of the CURRENT un-paused stretch, plus everything banked before it. History: docs/code-history.md#h-073
  const segmentStart = useRef(0)
  const banked = useRef(0)
  const doneRef = useRef(false)

  useEffect(() => {
    segmentStart.current = Date.now()
    banked.current = 0
  }, [])

  useEffect(() => {
    if (paused) return
    // Resuming opens a new stretch; the pause handler banked the one before it.
    segmentStart.current = Date.now()
    const id = window.setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)
    return () => window.clearInterval(id)
  }, [paused])

  /** Un-paused milliseconds so far. Matches what the timer has been counting. */
  function elapsed() {
    return banked.current + (paused ? 0 : Date.now() - segmentStart.current)
  }

  function togglePause() {
    // Bank OUTSIDE the updater. A functional updater must be pure, and React 19's
    // StrictMode calls it twice in development precisely to catch one that is not —
    // which this was, so every pause banked its stretch twice and a 3.7s take scored
    // 10.1s. `paused` here is this render's value and is correct at click time.
    if (!paused) banked.current += Date.now() - segmentStart.current
    setPaused((was) => !was)
  }

  useRedirect(!current, '/session/resume')

  if (!current) return null

  function startOver() {
    banked.current = 0
    segmentStart.current = Date.now()
    setSeconds(0)
    setPaused(false)
  }

  function done() {
    // Once only: a double tap on Submit pushed the next screen twice.
    if (doneRef.current) return
    doneRef.current = true
    const took = elapsed()
    // A blank turn is not judged. The student said they knew none of it, made the
    // attempt anyway, and voice-ux's rule for this state is "one encouraged attempt,
    // then reveal" — so there is no verdict to compute and nothing for the mishear
    // mock to catch.
    if (isBlank) {
      router.push(`/session/reveal/${index}`)
      return
    }
    if (isRepeat) {
      // A say-it-back is paid (+3), so it has to be a take: under the couldn't-hear
      // floor it goes back to the reveal to try again, and pays nothing. A 0.3s tap used
      // to earn "That's it, in your own voice" (engineering review, 2026-10-13).
      if (verdictFor(index, took, 2) === 'CouldntHear') {
        router.replace(`/session/reveal/${index}`)
        return
      }
      markEarned(index, 'Repeat')
      router.replace(`/session/repeat/${index}`)
      return
    }
    const q = new URLSearchParams({ ms: String(took), attempt })
    if (hinted) q.set('hinted', '1')
    if (door) q.set('door', door)
    // A take the mock already knows is unusable does NOT get a review screen. History: docs/code-history.md#h-074
    if (verdictFor(index, took, Number(attempt), { practising: isPractising() }) === 'CouldntHear') {
      router.push(`/session/processing/${index}?${q}`)
      return
    }
    router.push(`/session/captured/${index}?${q}`)
  }

  return (
    <ScreenShell
      className={styles.root}
      // In ScreenShell's mic slot, like every idle voice screen, so the control is at
      // the same height on the tap that starts the recording.
      mic={
        <div className={styles.micWrap} data-paused={paused || undefined}>
          {/* The rings are centred on the MIC, not on the region. History: docs/code-history.md#h-075 */}
          <div className={styles.micStack}>
          <span className={styles.ring} aria-hidden="true" />
          <span className={styles.ring} aria-hidden="true" />
          <span className={styles.ring} aria-hidden="true" />
          {/* A real Paused state as of 2026-09-21. The accepted risk that "nothing on
              screen changes when paused" failed its own gate: the fill was identical
              and the pulse ring kept animating while the caption said stopped. */}
          <MicButton
            state={paused ? 'Paused' : 'Listening'}
            onClick={togglePause}
          />
          </div>
          {/* With the mic, not 235px away in the action zone. "Tap to pause" was
              separated from the thing you tap, and the status stack pushed the zone to
              148 against a 136 budget. */}
          <div className={styles.micCaption}>
            <RecordingStatus seconds={seconds} paused={paused} />
          </div>
        </div>
      }
      topNavigation={<SessionBar index={index} door={door} />}
      bottomContent={
        <div className={styles.actions}>
          <Button CTA="Submit" variant="Primary" size="M" fullWidth onClick={done} />
          {/* Discard and re-record before anything is sent (voice-ux Must; Duolingo
              design review, 2026-10-13): a fumbled first sentence never has to be
              submitted. Resets the take in place, still listening. */}
          <Button CTA="Start over" variant="Tertiary" size="S" fullWidth onClick={startOver} />
        </div>
      }
    >
      {/* The question stays on screen while the student answers it — decided 2026-10-08
          by the designer. The frame's full-screen mic takeover dropped it, so the
          student was explaining a term they could no longer see. */}
      <div className={styles.body}>
        {current && <ChatBubble className={styles.bubble} showTitle title={`${SUBJECT} · Explain: `} titleAccent={current.name} body={current.prompt} />}
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
