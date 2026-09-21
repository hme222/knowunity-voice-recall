import { formatElapsed } from '@/lib/session'
import styles from './RecordingStatus.module.css'

// The three text elements on the recording screens: the LISTENING label, the elapsed
// timer, and the pause caption under the mic. Loose text nodes in Figma; one component
// here because all three describe the same state and must never disagree.
//
// It does NOT own the clock. The page ticks and passes `seconds` — a component that ran
// its own interval would make its story non-deterministic and flake the a11y run.

export type RecordingStatusProps = {
  /** Elapsed recording time. The page owns the interval. */
  seconds: number
  /**
   * Paused dims the label rather than changing the mic. Accepted risk, recorded in
   * SPEC.md § Open 12: MicButton has no Paused state, so nothing else on screen
   * changes when the student taps. If pause turns out to matter, the fix is a real
   * MicButton state, not more caption copy.
   */
  paused?: boolean
  className?: string
}

export function RecordingStatus({ seconds, paused = false, className }: RecordingStatusProps) {
  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-paused={paused}
      role="status"
      aria-live="polite"
    >
      <span className={styles.label}>{paused ? 'Paused' : 'Listening'}</span>
      <span className={styles.timer}>{formatElapsed(seconds * 1000)}</span>
      <span className={styles.caption}>{paused ? 'Tap to resume' : 'Tap to pause'}</span>
    </div>
  )
}
