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
      <span className={paused ? 'sr-only' : styles.label} role="status" aria-live="polite">
        {paused ? 'Paused' : 'Listening'}
      </span>
      <span className={styles.timer}>{formatElapsed(seconds * 1000)}</span>
      {/* Gone while paused: the mic shows the pause symbol, which says it on its own
          (designer, 2026-10-08). */}
      {!paused && <span className={styles.caption}>Tap to pause</span>}
    </div>
  )
}
