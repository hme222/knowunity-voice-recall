import type { ReactNode } from 'react'
import styles from './ScreenShell.module.css'

// The React counterpart of the Figma `scaffold` component set, variant `size=iPhone 13`.
// Every screen in Complete Flow is an instance of it, so every screen here fills its
// slots rather than laying itself out. See SPEC.md § Conventions and
// docs/design-system.md § "The scaffold".
//
// The three booleans mirror the Figma component's own toggles. Per design-system.md:
// "These control visibility, they don't remove the underlying slot" — so a region that
// is on still reserves its height even with nothing in it, which is what keeps the
// action zone in the same place from screen to screen.

export type ScreenShellProps = {
  /** Figma `topNavigation`: the AppBar and, on session screens, the fraction beside it. */
  topNavigation?: ReactNode
  /**
   * Figma `showTopNavSlot`. Figma defaults it to true on every instance; here it
   * defaults to whether there is anything to show, so a screen with no app bar — home,
   * picker, the exit sheet — doesn't reserve 56px of nothing. Pass `true` explicitly to
   * reserve the region while it is empty, which is what Figma's default does.
   */
  showTopNavSlot?: boolean
  /** Figma `middleContent`: the screen's body. Scrolls if it outgrows the region. */
  children: ReactNode
  /** Figma `bottomContent`: the action zone. */
  bottomContent?: ReactNode
  /** Figma `showBottomNavSlot`. Same defaulting rule as `showTopNavSlot`. */
  showBottomNavSlot?: boolean
  /**
   * Figma `bottomSheetOnly`. A sheet must live on its own branch screen and must never
   * be baked into a screen representing a default state.
   */
  bottomSheetOnly?: ReactNode
  /**
   * Figma `showBottomSheetBackground`: the scrim behind a sheet.
   *
   * THE RULE THIS CARRIES. Turning it on marks the screen as a sheet branch, not a
   * default state. `docs/sprint-context.md` § "Process notes" records three separate
   * occasions where a sheet was baked into a screen meant to represent a normal state,
   * and the advice there is to check any screen using this flag specifically. Code
   * can't enforce a routing rule, so: if this is on, the route should exist only to
   * show that sheet.
   */
  showBottomSheetBackground?: boolean
  className?: string
}

export function ScreenShell({
  topNavigation,
  showTopNavSlot,
  children,
  bottomContent,
  showBottomNavSlot,
  bottomSheetOnly,
  showBottomSheetBackground = false,
  className,
}: ScreenShellProps) {
  const topOn = showTopNavSlot ?? topNavigation != null
  const bottomOn = showBottomNavSlot ?? bottomContent != null

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-sheet={showBottomSheetBackground}>
      {/* Panel Header — the status-bar region. Empty in the prototype; the real app's
          Status Bar is an external-library component we don't reproduce. */}
      <div className={styles.panelHeader} aria-hidden="true" />
      {topOn && <div className={styles.topNavigation}>{topNavigation}</div>}
      <main className={styles.middle}>{children}</main>
      {bottomOn && <div className={styles.bottom}>{bottomContent}</div>}
      {/* Figma's `Bottom-sheet background`: a full-bleed scrim that dims everything
          above it. It sits under bottomSheetOnly so the sheet reads over it. */}
      {showBottomSheetBackground && <div className={styles.sheetScrim} aria-hidden="true" />}
      {bottomSheetOnly ? (
        <div className={styles.sheetSlot}>{bottomSheetOnly}</div>
      ) : (
        <div className={styles.sheetOnly} aria-hidden="true" />
      )}
    </div>
  )
}
