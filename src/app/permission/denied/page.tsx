'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setSticky } from '@/lib/session'
import { Button, MascotSlot, ScreenShell, TextBlock } from '@/components'
import styles from '../permission.module.css'

// Permission denied — a session-level choice, not a dead end.
// voice-ux Principle 3: design the "No". The student must still have a way forward,
// and that way is the text fallback. Telling them what they're missing and how to
// re-enable is the difference between a fork and a trap.
//
// Denied makes text sticky for the session: the mic can't work, so re-offering it
// every term would be asking someone to do something they've already said they can't.

export default function DeniedPage() {
  const router = useRouter()
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
              router.push('/text/turn?term=1&sticky=1')
            }}
          />
          <Button
            CTA={showHow ? 'Got it' : 'How to turn the mic on'}
            variant="Secondary"
            size="M"
            fullWidth
            aria-expanded={showHow}
            onClick={() => setShowHow((v) => !v)}
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
