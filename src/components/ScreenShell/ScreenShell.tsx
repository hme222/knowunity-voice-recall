'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
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
  /**
   * Figma `Panel Header`: the status-bar region. Left empty on every session screen —
   * the real app's Status Bar is an external-library component we don't reproduce —
   * but home is built to a frame that has one, so the region is a slot rather than a
   * reserved 48 of nothing. Its height is fixed either way.
   */
  panelHeader?: ReactNode
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

/** The frames' side-by-side action row. Screens compose it into `bottomContent`. */
export const actionRowClass = styles.actionRow

/**
 * The mic's fixed region, at the foot of middleContent. Every voice screen wraps its
 * MicButton in this so the control sits at one height across the whole flow — it used
 * to sit at eight, and to jump 91px on the tap that starts recording.
 */
export const micRegionClass = styles.micRegion

export function ScreenShell({
  panelHeader,
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

  // Whether the content region has more below the fold. Drives the fade; a half-row is
  // not an affordance. Measured rather than guessed, and re-measured on resize and
  // whenever the content changes, because most of these screens are state-dependent.
  const middleRef = useRef<HTMLElement>(null)
  const [overflowing, setOverflowing] = useState(false)
  const measure = useCallback(() => {
    const el = middleRef.current
    if (el) setOverflowing(el.scrollHeight - el.clientHeight > 1)
  }, [])
  useEffect(() => {
    measure()
    const el = middleRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    for (const child of Array.from(el.children)) ro.observe(child)
    return () => ro.disconnect()
  }, [measure, children])

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-sheet={showBottomSheetBackground}>
      {/* Panel Header — the status-bar region, and a real slot as of 2026-09-23. It was
          a reserved 48 of nothing on the reasoning that the real app's Status Bar is an
          external-library component. Home is built to a frame that HAS one, and with no
          slot the status bar had to go into topNavigation, which is a fixed 56 with
          overflow:hidden — so it pushed the app bar out and the app bar simply vanished.
          The scaffold has this region; the shell now exposes it. */}
      <div className={styles.panelHeader} aria-hidden={panelHeader ? undefined : true}>
        {panelHeader}
      </div>
      {topOn && <div className={styles.topNavigation}>{topNavigation}</div>}
      <main ref={middleRef} className={styles.middle} data-overflowing={overflowing || undefined}>
        {children}
      </main>
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
