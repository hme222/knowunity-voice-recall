'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { micTurnedBackOn, safeInternalPath, setSticky } from '@/lib/session'
import { AppBar, Button, MascotSlot, ScreenShell } from '@/components'
import { CloseIcon } from '@/components/icons'
import { questionOf } from '../QuestionBehind'
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
      // A close, as the primer's sheet has: back to the question, the choice left for
      // later (UX critic, 2026-10-14: the screen had no way out but its two buttons).
      topNavigation={<AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Close" onLeft={() => router.replace(questionOf(next))} />}
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
        {/* The only recovery guidance on the screen, so at reading size, as steps.
            TextBlock S set it at 9px (UX critic, 2026-10-13). */}
        {showHow && (
          <section className={styles.how} aria-labelledby="how-heading">
            <h2 id="how-heading" className={styles.howTitle}>Turning the mic back on</h2>
            <ol className={styles.howSteps}>
              <li>Open Settings.</li>
              <li>Go to Privacy &amp; Security, then Microphone.</li>
              <li>Switch Knowunity on, then come back here.</li>
            </ol>
          </section>
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
