import type { ReactNode } from 'react'
import styles from './BottomSheet.module.css'

// Mirrors the Figma component `bottomSheet` (15813:37265). `Title` is its text property.
//
// THE RULE, not just the shape: a sheet lives on its own branch screen and must never
// be baked into a screen that represents a default state. That mistake has been made
// three times in the Figma file, and the scaffold's `showBottomSheetBackground`
// toggle is deliberately not reproduced in ScreenShell for the same reason.
//
// Content rows need `background.raised`: an optionRow inside a sheet resolves to the
// sheet's own fill and vanishes. PickerRow takes a `raised` prop for this.

export type BottomSheetProps = {
  /** Figma `Title`. */
  Title: string
  /** Optional line under the title. */
  subtitle?: string
  children: ReactNode
  /** Tapping the scrim. A sheet must always be dismissible. */
  onDismiss?: () => void
  className?: string
}

export function BottomSheet({ Title, subtitle, children, onDismiss, className }: BottomSheetProps) {
  return (
    <div
      className={styles.scrim}
      onClick={onDismiss}
      role="presentation"
    >
      <div
        className={[styles.sheet, className].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={Title}
        onClick={(e) => e.stopPropagation()}
      >
        <span className={styles.grabber} aria-hidden="true" />
        <h2 className={styles.title}>{Title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}
