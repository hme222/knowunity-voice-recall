'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MascotSlot, ScreenShell } from '@/components'
import { useFocusTrap } from '@/lib/useFocusTrap'
import styles from '../permission.module.css'

// The primer with a drawn iOS permission sheet on top. The prototype has no microphone
// and the real dialog will never fire, so it is drawn — otherwise Allow / Don't Allow
// is an asserted fork rather than one a reviewer can take, and the denied path (a Must
// state) stays unreachable.

export default function PromptPage() {
  const router = useRouter()
  // The other real dialog in the app, and it had the same defect BottomSheet did:
  // aria-modal="true" with focus left on <body> and the screen behind it still in the
  // tab order, so nothing announced that a dialog had opened and Tab walked out of it.
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef)

  return (
    <ScreenShell>
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="determined" />
        <div className="screenTitle">
          <h1 className="screenTitleHeading">Ready to say it out loud?</h1>
        </div>
      </div>

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
            <button className={styles.dialogButton} onClick={() => router.push('/permission/denied')}>
              Don&rsquo;t Allow
            </button>
            <button className={styles.dialogButton} onClick={() => router.push('/session/idle/1')}>
              Allow
            </button>
          </div>
        </div>
      </div>
    </ScreenShell>
  )
}
