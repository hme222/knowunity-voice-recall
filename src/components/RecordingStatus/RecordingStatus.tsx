import { formatElapsed } from '@/lib/session'
import styles from './RecordingStatus.module.css'

// The three text elements on the recording screens: the LISTENING label, the elapsed
// timer, and the pause caption under the mic. Loose text nodes in Figma; one component
// here because all three describe the same state and must never disagree.
//
// It does NOT own the clock. The page ticks and passes `seconds` — a component that ran
// its own interval would make its story non-deterministic and flake the a11y run.
//
// Only the state word is live. The whole block was one role="status" region, so a
// screen reader re-read "Listening 0:05 Tap to pause" on every tick. The timer stays
// in the DOM and readable on demand; it just no longer announces itself each second.

export type RecordingStatusProps = {
  /** Elapsed recording time. The page owns the interval. */
  seconds: number
  /**
   * Paused dims the label. As of 2026-09-21 MicButton also has a real `Paused`
   * state, so the mic changes too: the accepted risk that "nothing else on screen
   * changes" failed the identical-states gate and was reversed.
   */
  paused?: boolean
  className?: string
}

export function RecordingStatus({ seconds, paused = false, className }: RecordingStatusProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-paused={paused}>
      <span className={styles.label} role="status" aria-live="polite">
        {paused ? 'Paused' : 'Listening'}
      </span>
      <span className={styles.timer}>{formatElapsed(seconds * 1000)}</span>
      <span className={styles.caption}>{paused ? 'Tap to resume' : 'Tap to pause'}</span>
    </div>
  )
}
