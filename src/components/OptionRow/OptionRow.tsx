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
  /**
   * True when this row is one option in a single-choice group, e.g. the exit sheet's
   * eight reasons. It then announces as a radio rather than as an independent toggle —
   * eight `aria-pressed` buttons with no group told a screen reader there were eight
   * separate switches, when the question only ever takes one answer. The PARENT must
   * carry `role="radiogroup"` and a label.
   */
  inGroup?: boolean
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

export function OptionRow({ label, state = 'Default', inGroup = false, className, type = 'button', ...rest }: OptionRowProps) {
  const verdict = state === 'Correct' || state === 'Incorrect'
  return (
    <button
      {...rest}
      type={type}
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-state={state}
      role={inGroup ? 'radio' : undefined}
      aria-checked={inGroup ? state === 'Selected' : undefined}
      aria-pressed={inGroup ? undefined : state === 'Selected'}
      aria-disabled={verdict || undefined}
    >
      <span className={styles.label}>{label}</span>
    </button>
  )
}
