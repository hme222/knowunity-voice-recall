import { formatElapsed } from '@/lib/session'
import styles from './RecordingStatus.module.css'

// The three text elements on the recording screens: the LISTENING label, the elapsed timer, and the pause caption under the mic. History: docs/code-history.md#h-110

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
      {/* Paused: no visible word — the mic's pause symbol is enough (designer,
          2026-10-09). It stays for screen readers, since this is the live status and
          the only announcement that recording stopped. */}
      {/* `srOnly`, the global: this said 'sr-only', a class that does not exist, so the
          word rendered unstyled and two critics disagreed on whether it showed. */}
      <span className={paused ? 'srOnly' : styles.label} role="status" aria-live="polite">
        {paused ? 'Paused' : 'Listening'}
      </span>
      <span className={styles.timer}>{formatElapsed(seconds * 1000)}</span>
      {/* What a tap does, in both states. Paused used to show nothing here, leaving the
          way back to the pause symbol alone (UX critic, 2026-10-13). Hidden from
          readers: the mic's own name says it. */}
      <span className={styles.caption} aria-hidden="true">{paused ? 'Tap to resume' : 'Tap to pause'}</span>
    </div>
  )
}
