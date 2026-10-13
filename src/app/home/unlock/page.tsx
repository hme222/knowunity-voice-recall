'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { startRun } from '@/lib/session'
import { actionRowClass, Button, MascotSlot, SwipeChip } from '@/components'
import { MicGlyphIcon } from '@/components/icons'
import { useFocusTrap } from '@/lib/useFocusTrap'
import { HomeShell } from '../HomeShell'
import styles from '../home.module.css'

// Home, first-time reveal, after any door. Home with the Say It Back chip in its place
// in the tool row, dimmed under a popup that says the feature is unlocked and why; the
// chip alone stays lit, so "the chip below" points at something (designer, 2026-10-12:
// a popup that darkens the rest of the screen). Reached by every door's back arrow and
// its "Not now" — showing Say It Back is what unlocks it, not completing it.

export default function UnlockPage() {
  const router = useRouter()
  // A real dialog: focus moves in and stays until it is dismissed.
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef)

  return (
    <HomeShell
      // The chip is the way in: it starts the session at 00 Intro, the second screen of
      // the prototype (designer, 2026-10-12). It went to the picker.
      toolChip={<SwipeChip onClick={() => router.push(startRun())} />}
      popup={
        <div
          ref={dialogRef}
          tabIndex={-1}
          className={styles.unlockWrap}
          role="dialog"
          aria-modal="true"
          aria-labelledby="unlock-title"
        >
          {/* `excited`: the invitation face (design-system.md § Mascot poses). */}
          <MascotSlot size="2XL" expression="excited" className={styles.unlockPeek} />
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
              <Button CTA="Try it now" variant="Primary" size="M" fullWidth onClick={() => router.push(startRun())} />
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
