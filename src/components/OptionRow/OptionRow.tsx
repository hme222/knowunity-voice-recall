import type { ButtonHTMLAttributes } from 'react'
import styles from './OptionRow.module.css'

// Mirrors the Figma component set `optionRow` (15651:10687): one `state` variant, one `label` text.

export const OPTION_ROW_STATES = ['Default', 'Selected', 'Correct', 'Incorrect'] as const
export type OptionRowState = (typeof OPTION_ROW_STATES)[number]

export type OptionRowProps = {
  /** Figma `label`: the answer copy. */
  label: string
  /** Figma `state`. Correct / Incorrect only after the student commits. */
  state?: OptionRowState
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

export function OptionRow({ label, state = 'Default', className, type = 'button', ...rest }: OptionRowProps) {
  const verdict = state === 'Correct' || state === 'Incorrect'
  return (
    <button
      {...rest}
      type={type}
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-state={state}
      aria-pressed={state === 'Selected'}
      aria-disabled={verdict || undefined}
    >
      <span className={styles.label}>{label}</span>
    </button>
  )
}
