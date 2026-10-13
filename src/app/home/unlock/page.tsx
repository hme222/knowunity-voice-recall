'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { actionRowClass, Button, MascotSlot, SwipeChip } from '@/components'
import { MicGlyphIcon } from '@/components/icons'
import { useFocusTrap } from '@/lib/useFocusTrap'
import { HomeShell } from '../HomeShell'
import styles from '../home.module.css'

// Home, first-time reveal, after any door. History: docs/code-history.md#h-042

export default function UnlockPage() {
  const router = useRouter()
  // A real dialog: focus moves in and stays until it is dismissed.
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef)

  return (
    <HomeShell
      // The chip and "Try it now" open the picker, which points at the Chemistry quiz
      // the session runs (designer, 2026-10-13: "add the picker before Chemistry Say It
      // Back begins, and guide them to select the quiz"). They went straight to Q1.
      toolChip={<SwipeChip onClick={() => router.push('/picker')} />}
      popup={
        <div
          ref={dialogRef}
          tabIndex={-1}
          className={styles.unlockWrap}
          role="dialog"
          aria-modal="true"
          aria-labelledby="unlock-title"
        >
          {/* `giggling`: warm and calm. `amazed` stared over the card and pulled focus
              from it (designer, 2026-10-13: "looks insane… distracting"). */}
          <MascotSlot size="2XL" expression="giggling" className={styles.unlockPeek} />
          <div className={styles.unlockNote}>
            <p className={styles.unlockEyebrow}>
              <span className={styles.unlockEyebrowGlyph} aria-hidden="true">
                <MicGlyphIcon />
              </span>
              New on Knowunity
            </p>
            <h2 id="unlock-title" className={styles.unlockTitle}>Say It Back unlocked</h2>
            <p className="screenTitleCaption">
              Say a definition back in your own words to know it stuck. It lives on the chip below.
            </p>
            {/* Straight in, or later (senior review, 2026-10-12): "Got it" closed the
                popup and left the student to tap the chip as a second step. */}
            <div className={`${actionRowClass} ${styles.unlockActions}`}>
              {/* Primary first, so the dialog's initial focus lands on it. */}
              <Button CTA="Try it now" variant="Primary" size="M" fullWidth onClick={() => router.push('/picker')} />
              <Button CTA="Later" variant="Tertiary" size="M" onClick={() => router.push('/home/unlocked')} />
            </div>
          </div>
        </div>
      }
    >
      {null}
    </HomeShell>
  )
}
