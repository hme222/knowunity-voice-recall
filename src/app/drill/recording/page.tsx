'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRedirect } from '@/lib/navigation'
import { useRouter, useSearchParams } from 'next/navigation'
import { micRegionClass, Button, MicButton, RecordingStatus, ScreenShell } from '@/components'
import { drillRung, useDrillTerm } from '@/lib/session'
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

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [paused])

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
            onClick={() => setPaused((p) => !p)}
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
            CTA="Submit"
            variant="Primary"
            size="M"
            fullWidth
            onClick={() => router.push(afterTake)}
          />
        </div>
      }
    >
      <div className={styles.body}>
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
