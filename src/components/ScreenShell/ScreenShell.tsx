'use client'

import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import styles from './ScreenShell.module.css'

// The React counterpart of the Figma `scaffold` component set, variant `size=iPhone 13`. History: docs/code-history.md#h-117

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
  /**
   * The mic, in its own region between middleContent and the action zone. Wrap it in
   * `micRegionClass`. It used to live INSIDE middleContent, pinned with sticky, so any
   * content that ran long scrolled underneath the control — measured at 390x668 it sat
   * over the text on nine voice screens and over the buttons on two. Outside the
   * scroller, content cannot reach it, and it lands at one height on every screen.
   */
  mic?: ReactNode
  /**
   * Whether Knowie steps out when the content does not fit (default true). Off for a
   * screen whose content is MEANT to scroll, like the Recap's term list, where the
   * overflow is the list and not a sign the words are being crowded (designer,
   * 2026-10-09: "bring back Knowie in recap").
   *
   * `'shrink'`: Knowie never leaves; when the content does not fit it drops to the
   * smallest size (XL) and the rest scrolls. For a screen where Knowie IS the moment —
   * 04 Pass (designer, 2026-10-13: "on the correct page can we see Knowie").
   */
  mascotGivesWay?: boolean | 'shrink'
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
  mic,
  // Knowie stays, at one size, on every screen (designer, 2026-10-14: "I want Knowie
  // on all screens… adjust so Knowie stays the same size"). Off by default now; a
  // short screen drops its `data-gives-way` content, then scrolls.
  mascotGivesWay = false,
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
  // A short frame (under component.scaffold.shortHeight, e.g. 390x668) tightens the
  // room around the mic and the section gaps, so Knowie can stay at one size on every
  // screen (designer, 2026-10-14). Measured on the shell's own box, not the window,
  // so it holds inside the desktop phone frame too.
  const rootRef = useRef<HTMLDivElement>(null)
  const [short, setShort] = useState(false)
  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const limit = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--component-scaffold-short-height')) || 844
    const check = () => setShort(el.getBoundingClientRect().height < limit() * (parseFloat(getComputedStyle(document.documentElement).fontSize) / 16))
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const [overflowing, setOverflowing] = useState(false)
  // When the content does not fit, Knowie gives way before the words do: 0 = as designed, 2 = out. History: docs/code-history.md#h-118
  const hasMic = mic != null
  const measureFade = useCallback(() => {
    const el = middleRef.current
    if (el) setOverflowing(el.scrollTop + el.clientHeight < el.scrollHeight - 1)
  }, [])
  // 3 = Knowie out AND anything the screen marks `data-gives-way` (a repeated question,
  // an XP line): the second thing to go, so a short screen never clips a card mid-way
  // (system critic, 2026-10-13: unclear, the chat door at 390x668).
  // 1 = Knowie at its smallest size, kept: only for `mascotGivesWay="shrink"`.
  // 'm' = one step first: a 3XL Knowie tries 2XL before dropping to XL. Adding the
  // Pass card's strength notches tipped 04 Pass over at 390x844, and Knowie fell from
  // 200 straight to 64 for want of 30px (2026-10-14).
  // 'y' = Knowie stays as drawn and only `data-gives-way` content goes: for a screen
  // that says Knowie never yields (`mascotGivesWay={false}`) but still has something
  // optional to drop (designer, 2026-10-14: Knowie back on "I didn't catch that").
  // 'y2' = as 'y', and then `data-gives-way="last"` content too: a second, later step,
  // so the Recap drops its climb before its "How it adds up" (2026-10-14).
  const [mascotStage, setMascotStage] = useState<0 | 'm' | 1 | 2 | 3 | 'y' | 'y2'>(0)
  const measure = useCallback(() => {
    const el = middleRef.current
    if (!el) return
    // "More below", not "can scroll": at the end of the content the fade lifts, or the
    // last thing on the screen stays half-faded — the Recap's closing takeaway did.
    setOverflowing(el.scrollTop + el.clientHeight < el.scrollHeight - 1)
    const mascot = mascotGivesWay ? el.querySelector<HTMLElement>('[data-mascot]') : null
    const yielding = el.querySelector<HTMLElement>('[data-gives-way]')
    if (!mascot && !yielding) {
      setMascotStage(0)
      return
    }
    // Measure each stage as it would render, then put back what was there.
    const applied = el.getAttribute('data-mascot-stage')
    const overAt = (stage: string | null) => {
      if (stage) el.setAttribute('data-mascot-stage', stage)
      else el.removeAttribute('data-mascot-stage')
      return el.scrollHeight - el.clientHeight
    }
    const stage =
      overAt(null) <= 1
        ? 0
        : !mascot
          ? overAt('y') <= 1 || !el.querySelector('[data-gives-way="last"]')
            ? 'y'
            : 'y2'
          : mascotGivesWay === 'shrink'
          ? overAt('m') <= 1
            ? 'm'
            : 1
          : !yielding || overAt('2') <= 1
            ? 2
            : 3
    if (applied) el.setAttribute('data-mascot-stage', applied)
    else el.removeAttribute('data-mascot-stage')
    setMascotStage(stage)
  }, [mascotGivesWay])
  // Layout effect, not effect: the stage has to land before the first paint, or a short
  // screen flashes a full-size Knowie and then drops it.
  useLayoutEffect(() => {
    measure()
    const el = middleRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    // Two levels, not one. Most screens wrap their content in a `flex: 1` body, which
    // does not change size when what is inside it grows — so when Greed VF finished
    // loading and the question bubble got taller, nothing observed fired and the
    // explain screen kept a full-size Knowie over the question at 390x668.
    for (const child of Array.from(el.children)) {
      ro.observe(child)
      for (const grandchild of Array.from(child.children)) ro.observe(grandchild)
    }
    // And once the webfont is in, whatever moved.
    let live = true
    document.fonts?.ready.then(() => live && measure())
    return () => {
      live = false
      ro.disconnect()
    }
  }, [measure, children])

  return (
    <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(' ')} data-sheet={showBottomSheetBackground} data-short={short || undefined}>
      {/* Panel Header — the status-bar region, and a real slot as of 2026-09-23. History: docs/code-history.md#h-119 */}
      <div className={styles.panelHeader} aria-hidden={panelHeader ? undefined : true}>
        {panelHeader}
      </div>
      {topOn && <div className={styles.topNavigation}>{topNavigation}</div>}
      <main
        ref={middleRef}
        className={styles.middle}
        data-overflowing={overflowing || undefined}
        data-has-mic={hasMic || undefined}
        data-mascot-stage={mascotStage || undefined}
      
        onScroll={measureFade}>
        {children}
      </main>
      {mic != null && <div className={styles.micSlot}>{mic}</div>}
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
