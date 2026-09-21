import type { ButtonHTMLAttributes } from 'react'
import { MicGlyphIcon } from '../icons'
import styles from './SwipeChip.module.css'

// Mirrors the Figma component `swipeChip` (15813:37232). Props carry the Figma names
// where they exist: `QuizLabel` and `Count` are its two text properties.
//
// This is the Say It Back chip on home. With a plan and a due date it gains the amber
// border and the count badge; without one it is the plain composer chip. Two states of
// one component, not two components — the same relationship the chip and the
// due-signal card have (docs/sprint-context.md § "Where it lives").

export type SwipeChipProps = {
  /** Figma `QuizLabel`: the term and its due date, e.g. "Formal charge · due 9/15". */
  QuizLabel?: string
  /** Figma `Count`: how many more are waiting. "+2", "+1", or "last one". */
  Count?: string
  /** Plan-active. Drives the amber due border; false is the no-plan baseline chip. */
  due?: boolean
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

export function SwipeChip({ QuizLabel, Count, due = false, className, type = 'button', ...rest }: SwipeChipProps) {
  const isLast = Count?.toLowerCase().includes('last')
  return (
    <button
      {...rest}
      type={type}
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-due={due}
    >
      <span className={styles.glyph}>
        <MicGlyphIcon />
      </span>
      <span className={styles.text}>
        <span className={styles.label}>Say It Back</span>
        {QuizLabel && <span className={styles.sub}>{QuizLabel}</span>}
      </span>
      {Count && (
        <span className={styles.count} data-last={isLast}>
          {Count}
        </span>
      )}
    </button>
  )
}
