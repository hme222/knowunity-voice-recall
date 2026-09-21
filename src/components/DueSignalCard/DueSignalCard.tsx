import type { ButtonHTMLAttributes } from 'react'
import { Clock } from 'lucide-react'
import { MicGlyphIcon } from '../icons'
import styles from './DueSignalCard.module.css'

// Mirrors the Figma component `dueSignalCard` (15812:15287). `DueLabel` is its one
// text property.
//
// The simpler one-quiz case. With several due, the swipeable swipeChip carousel
// supersedes it on the flow — this is kept because one quiz due doesn't need a pager.

export type DueSignalCardProps = {
  /** Figma `DueLabel`, e.g. "Quiz due 9/15". */
  DueLabel: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

export function DueSignalCard({ DueLabel, className, type = 'button', ...rest }: DueSignalCardProps) {
  return (
    <button {...rest} type={type} className={[styles.root, className].filter(Boolean).join(' ')}>
      <span className={styles.badge} aria-hidden="true">
        <Clock />
      </span>
      <span className={styles.label}>{DueLabel}</span>
      <span className={styles.action}>
        <span className={styles.actionGlyph} aria-hidden="true">
          <MicGlyphIcon />
        </span>
        Say It Back
      </span>
    </button>
  )
}
