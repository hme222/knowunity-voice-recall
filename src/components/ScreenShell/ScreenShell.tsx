import type { ReactNode } from 'react'
import styles from './ScreenShell.module.css'

// The React counterpart of the Figma `scaffold` component set, variant `size=iPhone 13`.
// Every screen in Complete Flow is an instance of it, so every screen here fills its slots
// rather than laying itself out. See SPEC.md § Conventions and docs/design-system.md
// § "The scaffold".

export type ScreenShellProps = {
  /** Figma `topNavigation`: the AppBar and, on session screens, the fraction beside it. */
  topNavigation?: ReactNode
  /** Figma `middleContent`: the screen's body. Scrolls if it outgrows the region. */
  children: ReactNode
  /** Figma `bottomContent`: the action zone. */
  bottomContent?: ReactNode
  /**
   * Figma's `bottomSheetOnly` slot. A sheet must live on its own branch screen and must
   * never be baked into a screen representing a default state — the scaffold's
   * `showBottomSheetBackground` toggle is deliberately not reproduced here.
   */
  bottomSheetOnly?: ReactNode
  className?: string
}

export function ScreenShell({
  topNavigation,
  children,
  bottomContent,
  bottomSheetOnly,
  className,
}: ScreenShellProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      {/* Panel Header — the status-bar region. Empty in the prototype; the real app's
          Status Bar is an external-library component we don't reproduce. */}
      <div className={styles.panelHeader} aria-hidden="true" />
      {topNavigation && <div className={styles.topNavigation}>{topNavigation}</div>}
      <main className={styles.middle}>{children}</main>
      {bottomContent && <div className={styles.bottom}>{bottomContent}</div>}
      {bottomSheetOnly ? <div>{bottomSheetOnly}</div> : <div className={styles.sheetOnly} aria-hidden="true" />}
    </div>
  )
}
