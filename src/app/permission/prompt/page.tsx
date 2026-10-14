'use client'

import { Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ScreenShell } from '@/components'
import { micTurnedBackOn, safeInternalPath } from '@/lib/session'
import { QuestionBehind } from '../QuestionBehind'
import { useFocusTrap } from '@/lib/useFocusTrap'
import styles from '../permission.module.css'

// The drawn iOS permission sheet, over the question the student tapped the mic for. The prototype has no microphone
// and the real dialog will never fire, so it is drawn — otherwise Allow / Don't Allow
// is an asserted fork rather than one a reviewer can take, and the denied path (a Must
// state) stays unreachable.

function Prompt() {
  const router = useRouter()
  const params = useSearchParams()
  const next = safeInternalPath(params.get('next'), '/session/recording/1')
  const alt = safeInternalPath(params.get('alt'), '/text/turn?term=1')
  // The other real dialog in the app, and it had the same defect BottomSheet did:
  // aria-modal="true" with focus left on <body> and the screen behind it still in the
  // tab order, so nothing announced that a dialog had opened and Tab walked out of it.
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef)

  return (
    <ScreenShell>
      {/* The question stays behind the OS sheet, as behind the primer. */}
      <h1 className="srOnly">Microphone permission</h1>
      <QuestionBehind next={next} />

      <div
        ref={dialogRef}
        tabIndex={-1}
        className={styles.scrim}
        role="dialog"
        aria-modal="true"
        aria-label="Microphone permission"
      >
        <div className={styles.dialog}>
          <div className={styles.dialogBody}>
            <p className={styles.dialogTitle}>&ldquo;Knowunity&rdquo; Would Like to Access the Microphone</p>
            <p className={styles.dialogBodyText}>
              Knowie listens while you explain a term out loud, so it can tell you how it landed.
            </p>
          </div>
          <div className={styles.dialogActions}>
            <button className={styles.dialogButton} onClick={() => router.push(`/permission/denied?next=${encodeURIComponent(next)}&alt=${encodeURIComponent(alt)}`)}>
              Don&rsquo;t Allow
            </button>
            <button className={styles.dialogButton} onClick={() => {
                // Allowed: straight into the recording the student tapped for, not back
                // to the idle screen to tap again. Clears a session's denial too: this is
                // also the way back from typed mode ("Mic back on? Say it instead").
                micTurnedBackOn()
                router.replace(next)
              }}>
              Allow
            </button>
          </div>
        </div>
      </div>
    </ScreenShell>
  )
}

export default function PromptPage() {
  return (
    <Suspense fallback={null}>
      <Prompt />
    </Suspense>
  )
}
