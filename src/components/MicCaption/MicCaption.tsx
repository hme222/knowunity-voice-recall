import type { ReactNode } from 'react'
import styles from './MicCaption.module.css'

// No Figma counterpart. Built 2026-10-07 from three inline copies: the 01 Idle retry
// hint, and "Tap to answer" on the chat and exam-plan doors. Format locked by the
// designer the same day.

export type MicCaptionProps = {
  /** The line under the mic: a hint, or what tapping it does. A node only when the
      line carries drawn blanks (the second-rung gap on a retry). */
  body: ReactNode
  /** Optional label above the body, e.g. "Hint". Omit for a plain caption. */
  label?: string
  className?: string
}

/**
 * A caption pinned under the mic, in the bottom 80 of the mic region — the space 02
 * Recording keeps for its status line. Put it inside the `micRegionClass` wrapper,
 * after the `MicButton`. It is out of the flow, so the mic stays at the one height
 * every voice screen shares.
 */
export function MicCaption({ body, label, className }: MicCaptionProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      {label && <p className={styles.label}>{label}</p>}
      <p className={styles.body}>{body}</p>
    </div>
  )
}
