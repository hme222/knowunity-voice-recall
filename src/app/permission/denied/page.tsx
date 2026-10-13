'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { micTurnedBackOn, safeInternalPath, setSticky } from '@/lib/session'
import { Button, MascotSlot, ScreenShell, TextBlock } from '@/components'
import styles from '../permission.module.css'

// Permission denied — a session-level choice, not a dead end. History: docs/code-history.md#h-043

function Denied() {
  const router = useRouter()
  // Back to the turn the student was on, typed, not always question 1.
  const params = useSearchParams()
  const alt = safeInternalPath(params.get('alt'), '/text/turn?term=1')
  const next = safeInternalPath(params.get('next'), '/session/recording/1')
  const [showHow, setShowHow] = useState(false)
  return (
    <ScreenShell
      bottomContent={
        <div className={styles.actions}>
          <Button
            CTA="Type this session"
            variant="Primary"
            size="M"
            fullWidth
            onClick={() => {
              // The decision has to outlive this turn. voice-ux.md §3: denied stays
              // denied for the session, and it used to survive exactly one screen.
              setSticky()
              router.push(`${alt}${alt.includes('?') ? '&' : '?'}sticky=1`)
            }}
          />
          <Button
            // Once the steps are open, the way back: the screen promised "speaking will
            // work straight away" and nothing ever undid the denial (engineering review).
            CTA={showHow ? 'I’ve turned it on' : 'How to turn the mic on'}
            variant="Secondary"
            size="M"
            fullWidth
            aria-expanded={showHow}
            onClick={() => {
              if (!showHow) return setShowHow(true)
              micTurnedBackOn()
              router.replace(next)
            }}
          />
        </div>
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="dazed" />
        <div className="screenTitle">
          <h1 className="screenTitleHeading">No mic, no problem</h1>
          <p className="screenTitleCaption">You can type your answers instead — same questions, same hints, and you keep the full XP.</p>
        </div>
        {showHow && (
          <TextBlock
            variant="S"
            title="Turning the mic back on"
            caption="Open Settings, then Privacy & Security, then Microphone, and switch Knowunity on. Come back here and speaking will work straight away."
          />
        )}
      </div>
    </ScreenShell>
  )
}

export default function DeniedPage() {
  return (
    <Suspense fallback={null}>
      <Denied />
    </Suspense>
  )
}
