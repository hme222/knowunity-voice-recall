import type { ButtonHTMLAttributes } from 'react'
import { MicIcon } from '../icons'
import styles from './MicButton.module.css'

// Mirrors the Figma component set `micButton` (15648:10629): one `state` variant.

export const MIC_BUTTON_STATES = ['Idle', 'Listening', 'Paused', 'Captured', 'Disabled'] as const
export type MicButtonState = (typeof MIC_BUTTON_STATES)[number]

const LABELS: Record<MicButtonState, string> = {
  Idle: 'Start speaking',
  Listening: 'Listening, tap to pause',
  Paused: 'Paused, tap to resume',
  Captured: 'Answer captured',
  Disabled: 'Microphone unavailable',
}

export type MicButtonProps = {
  /** Figma `state`. */
  state?: MicButtonState
  /** Accessible name override; defaults per state. */
  label?: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled' | 'aria-label'>

// Only Listening is a pressed state. A paused recorder is not capturing, and the pulse
// ring is suppressed in Paused so motion never contradicts the caption.
export function MicButton({ state = 'Idle', label, className, type = 'button', ...rest }: MicButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-state={state}
      disabled={state === 'Disabled'}
      aria-label={label ?? LABELS[state]}
      // Both recording states are the SAME toggle. Reporting `pressed` only while
      // Listening made the paused mic announce as a plain button — the state where
      // knowing it is a toggle matters most, because resuming is the way out.
      aria-pressed={state === 'Listening' ? true : state === 'Paused' ? false : undefined}
    >
      {state === 'Listening' && <span className={styles.pulse} aria-hidden="true" />}
      <span className={styles.glyph}><MicIcon /></span>
    </button>
  )
}
