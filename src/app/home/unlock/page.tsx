'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button, SwipeChip } from '@/components'
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
      toolChip={<SwipeChip onClick={() => router.push('/picker')} />}
      popup={
        <div
          ref={dialogRef}
          tabIndex={-1}
          className={styles.unlockNote}
          role="dialog"
          aria-modal="true"
          aria-labelledby="unlock-title"
        >
          <div className="screenTitle">
            <h2 id="unlock-title" className="screenTitleHeading">Say It Back feature unlocked</h2>
            <p className="screenTitleCaption">
              Saying a definition back in your own words is the quickest way to know it stuck. Tap the chip below anytime.
            </p>
          </div>
          <Button CTA="Got it" variant="Primary" size="M" fullWidth onClick={() => router.push('/home/unlocked')} />
        </div>
      }
    >
      {null}
    </HomeShell>
  )
}
