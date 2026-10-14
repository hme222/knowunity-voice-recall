'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRedirect } from '@/lib/navigation'
import { useRouter, useSearchParams } from 'next/navigation'
import { actionRowClass, micRegionClass, Button, MascotSlot, MicButton, RecordingStatus, ScreenShell } from '@/components'
import { DRILL_COULDNT_HEAR_UNDER_MS, drillRung, useDrillTerm } from '@/lib/session'
import { DrillBar } from '../DrillBar'
import styles from '../drill.module.css'

// DD 02 Recording — Figma frame "DD 02 Recording" (15782:11799). Same mic takeover as
// the core loop, with the definition still visible: the student is reading what's left
// and filling the gaps, so hiding the cue would change the task.

function DrillRecording() {
  const router = useRouter()
  const drillTerm = useDrillTerm()
  const step = Number(useSearchParams().get('step') ?? '1')
  // Where Done speaking goes. History: docs/code-history.md#h-023
  const stumble = useSearchParams().get('stumble')
  const afterTake =
    stumble === 'letter' ? '/drill/miss/echo' : stumble === 'echo' ? '/drill/pass/3' : `/drill/captured?step=${step}`
  const rung = drillRung(drillTerm, step)
  const [seconds, setSeconds] = useState(0)
  const [paused, setPaused] = useState(false)
  // Un-paused time, measured as the session's recording measures it, so a sub-2s take
  // can be caught as a mishear rather than judged (UX critic, 2026-10-13).
  const segmentStart = useRef(0)
  const banked = useRef(0)

  useEffect(() => {
    if (paused) return
    segmentStart.current = Date.now()
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [paused])

  function togglePause() {
    if (!paused) banked.current += Date.now() - segmentStart.current
    setPaused((was) => !was)
  }

  function submit() {
    const took = banked.current + (paused ? 0 : Date.now() - segmentStart.current)
    // Under the couldn't-hear floor, every take goes to Captured, which says so; a
    // stumble take rides along so "Say it again" returns to the same rung.
    if (took < DRILL_COULDNT_HEAR_UNDER_MS) {
      router.push(`/drill/captured?step=${step}&ms=${took}${stumble ? `&stumble=${stumble}` : ''}`)
      return
    }
    router.push(afterTake.startsWith('/drill/captured') ? `${afterTake}&ms=${took}` : afterTake)
  }

  useRedirect(!rung, '/drill/intro')

  if (!rung) return null

  return (
    <ScreenShell
      mic={
        <div className={[micRegionClass, styles.micWithCaption].join(' ')}>
          {/* A real Paused state as of 2026-09-21. The accepted risk that "nothing on
              screen changes when paused" failed its own gate: the fill was identical
              and the pulse ring kept animating while the caption said stopped. */}
          <MicButton
            state={paused ? 'Paused' : 'Listening'}
            onClick={togglePause}
          />
          {/* With the mic, as on 02 Recording. */}
          <div className={styles.micCaption}>
            <RecordingStatus seconds={seconds} paused={paused} />
          </div>
        </div>
      }
      topNavigation={<DrillBar step={step} onExit={() => router.push('/picker')} />}
      bottomContent={
        <div className={styles.actions}>
          <Button
            CTA="Send"
            variant="Primary"
            size="M"
            fullWidth
            onClick={submit}
          />
          {/* The session's recording escapes, here too (UX critic, 2026-10-13): discard
              and re-record before sending, or answer this rung by typing. */}
          <div className={`${actionRowClass} ${styles.rowCentred}`}>
            <Button
              CTA="Start over"
              variant="Tertiary"
              size="S"
              onClick={() => {
                banked.current = 0
                segmentStart.current = Date.now()
                setSeconds(0)
                setPaused(false)
              }}
            />
            <Button CTA="Type instead" variant="Tertiary" size="S" onClick={() => router.push(`/text/turn?term=${drillTerm.index}&drill=${step}`)} />
          </div>
        </div>
      }
    >
      <div className={styles.body}>
        {/* Knowie on every screen, the drill rung's face (designer, 2026-10-14). */}
        <MascotSlot size="2XL" expression="amazed" className={styles.mascotCentred} />
        <p className={styles.cue}>{rung.cue}</p>
      </div>
    </ScreenShell>
  )
}

export default function DrillRecordingPage() {
  return (
    <Suspense fallback={null}>
      <DrillRecording />
    </Suspense>
  )
}
