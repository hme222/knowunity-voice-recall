'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { micRegionClass, Button, MicButton, RecordingStatus, ScreenShell, StrengthMeter } from '@/components'
import { drillRung } from '@/lib/session'
import { DrillBar } from '../DrillBar'
import styles from '../drill.module.css'

// DD 02 Recording — Figma frame "DD 02 Recording" (15782:11799). Same mic takeover as
// the core loop, with the definition still visible: the student is reading what's left
// and filling the gaps, so hiding the cue would change the task.

function DrillRecording() {
  const router = useRouter()
  const step = Number(useSearchParams().get('step') ?? '1')
  const rung = drillRung(step)
  const [seconds, setSeconds] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [paused])

  if (!rung) {
    router.replace('/drill/intro')
    return null
  }

  return (
    <ScreenShell
      topNavigation={<DrillBar step={step} onExit={() => router.push('/picker')} />}
      bottomContent={
        <div className={styles.actions}>
          <RecordingStatus seconds={seconds} paused={paused} />
          <Button
            CTA="Done speaking"
            variant="Primary"
            size="M"
            fullWidth
            onClick={() => router.push(`/drill/captured?step=${step}`)}
          />
        </div>
      }
    >
      <div className={styles.body}>
        <StrengthMeter fill={rung.coverage} label="How much you can say unaided" />
        <p className={styles.cue}>{rung.cue}</p>
        <div className={micRegionClass}>
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

export default function DrillRecordingPage() {
  return (
    <Suspense fallback={null}>
      <DrillRecording />
    </Suspense>
  )
}
