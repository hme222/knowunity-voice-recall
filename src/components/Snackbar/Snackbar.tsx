import type { ReactNode } from 'react'
import { Chips } from '../Chips/Chips'
import { SquareIcon } from '../icons'
import styles from './Snackbar.module.css'

// Mirrors the Figma component set `snackbar` (9003:8995): icon, label, hidden button
// container, and a chip, in one row on a background.inverse card.

export const SNACKBAR_VARIANTS = ['Default', 'Success', 'Error'] as const

export type SnackbarProps = {
  /** Figma `Text`: up to two lines. */
  Text: string
  /** Figma `variant`. Drives the chip colour. */
  variant?: (typeof SNACKBAR_VARIANTS)[number]
  /** The leading icon; falls back to the `square` placeholder. */
  icon?: ReactNode
  /** The chip's text. Figma samples "1/2 words". */
  chipText?: string
  /** Figma's hidden "Button Container": a Tertiary S action, shown when set. */
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function Snackbar({ Text: text, variant = 'Default', icon, chipText = '1/2 words', actionLabel, onAction, className }: SnackbarProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-variant={variant} role="status">
      <div className={styles.card}>
        <span className={styles.icon}>{icon ?? <SquareIcon />}</span>
        <div className={styles.container}>
          <p className={styles.label}>{text}</p>
          {actionLabel && (
            <button type="button" className={styles.action} onClick={onAction}>
              {actionLabel}
            </button>
          )}
        </div>
        {/* Figma: a chips S / active instance with its fill overridden per variant. */}
        <Chips className={styles.chip} size="S" active Text={chipText} showLeftIcon={false} showRightIcon={false} tabIndex={-1} aria-hidden="true" />
      </div>
    </div>
  )
}
