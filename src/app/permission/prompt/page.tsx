'use client'

import { useRouter } from 'next/navigation'
import { MascotSlot, ScreenShell, TextBlock } from '@/components'
import styles from '../permission.module.css'

// The primer with a drawn iOS permission sheet on top. The prototype has no microphone
// and the real dialog will never fire, so it is drawn — otherwise Allow / Don't Allow
// is an asserted fork rather than one a reviewer can take, and the denied path (a Must
// state) stays unreachable.

export default function PromptPage() {
  const router = useRouter()
  return (
    <ScreenShell>
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="determined" />
        <TextBlock variant="XL" title="Ready to say it out loud?" showCaption={false} />
      </div>

      <div className={styles.scrim} role="dialog" aria-modal="true" aria-label="Microphone permission">
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
