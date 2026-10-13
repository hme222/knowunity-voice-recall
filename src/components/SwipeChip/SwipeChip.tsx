import type { ButtonHTMLAttributes } from 'react'
import { MicGlyphIcon } from '../icons'
import styles from './SwipeChip.module.css'

// Mirrors the Figma component `swipeChip` (15813:37232). History: docs/code-history.md#h-125

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
