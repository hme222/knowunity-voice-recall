import type { ButtonHTMLAttributes } from 'react'
import { MicGlyphIcon } from '../icons'
import styles from './PickerRow.module.css'

// Mirrors Figma's `pickerTopicRow` (15813:37270) and `pickerDrillRow` (15813:37281),
// which are the same row differing only in their left content. One component with a
// `variant` rather than two: two components differing by one child is two names for
// one thing.

export const PICKER_ROW_VARIANTS = ['topic', 'drill'] as const
export type PickerRowVariant = (typeof PICKER_ROW_VARIANTS)[number]

export const PICKER_ROW_STATES = ['drill', 'sharp'] as const
export type PickerRowState = (typeof PICKER_ROW_STATES)[number]

export type PickerRowProps = {
  /** `topic` opens a full recall session; `drill` opens Definition Drill Down. */
  variant?: PickerRowVariant
  /** Figma `Topic` on the topic row, `Term` on the drill row. */
  label: string
  /**
   * Drill rows only. `drill` = amber "Worth a drill", `sharp` = green "Keep it sharp".
   * Only definitions the student has already attempted appear as drill rows at all.
   */
  state?: PickerRowState
  /** Sits on a raised surface, e.g. inside a bottomSheet where surface would vanish. */
  raised?: boolean
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

const PILL_COPY: Record<PickerRowState, string> = {
  drill: 'Worth a drill',
  sharp: 'Keep it sharp',
}

export function PickerRow({
  variant = 'topic',
  label,
  state,
  raised = false,
  className,
  type = 'button',
  ...rest
}: PickerRowProps) {
  return (
    <button
      {...rest}
      type={type}
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-raised={raised}
    >
      <span className={styles.left}>
        <span className={variant === 'drill' ? styles.term : styles.topic}>{label}</span>
        {variant === 'drill' && state && (
          <span className={styles.pill} data-state={state}>
            {PILL_COPY[state]}
          </span>
        )}
      </span>
      <span className={styles.mic} aria-hidden="true">
        <MicGlyphIcon className={styles.micGlyph} />
      </span>
    </button>
  )
}
