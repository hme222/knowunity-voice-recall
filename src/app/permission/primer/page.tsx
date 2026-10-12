'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getTerm, SUBJECT } from '@/lib/session'
import { Button, MascotSlot, ScreenShell } from '@/components'
import styles from '../permission.module.css'

// Mic permission primer. No Figma frame — this exists only as a journey-map node.
// voice-ux Principle 3: never fire the OS request cold. Prime it with our own screen
// that explains the value, triggered by a clear user action, then let the OS dialog
// appear. Modelled on Babbel, which asks at the speaking-practice moment.

function Primer() {
  const router = useRouter()
  // A door run carries its door through the mic grant, so it still lands on the door's
  // own result. The start screen's guided path arrives here from the quiz door.
  const door = useSearchParams().get('door')
  return (
    <ScreenShell
      bottomContent={
        <div className={styles.actions}>
          <Button
            CTA="Turn on the mic"
            variant="Primary"
            size="M"
            fullWidth
            onClick={() => router.push(door ? `/permission/prompt?door=${door}` : '/permission/prompt')}
          />
          <Button CTA="Not now" variant="Tertiary" size="M" fullWidth onClick={() => router.push('/text/turn')} />
        </div>
      }
    >
      <div className={styles.body}>
        {/* "Ready to say it out loud?" is an invitation, not a wait. */}
        <MascotSlot size="2XL" expression="excited" />
        <div className="screenTitle">
          {/* From the quiz, the primer says what carries over — the same Chemistry, one
              question, now out loud — before it asks for the mic (designer, 2026-10-11). */}
          <h1 className="screenTitleHeading">{door === 'quiz' ? 'Now say it back' : 'Ready to say it back?'}</h1>
          <p className="screenTitleCaption">
            {door === 'quiz'
              ? `Same ${SUBJECT} quiz, one question: explain ${getTerm(1)?.name.toLowerCase()} in your own words. Knowie needs your mic to hear you, and only listens while you’re recording. You can always type instead.`
              : 'Knowie needs your mic to hear your answer. It only listens while you’re recording, and nothing is kept anywhere else. You can always type instead.'}
          </p>
        </div>
      </div>
    </ScreenShell>
  )
}

export default function PrimerPage() {
  return (
    <Suspense fallback={null}>
      <Primer />
    </Suspense>
  )
}
