'use client'

import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { MascotSlot, ScreenShell } from '@/components'
import {
  FlashcardsIcon,
  MenuIcon,
  MicGlyphIcon,
  NavChatIcon,
  NavSearchIcon,
  NavTargetIcon,
  NavTrophyIcon,
  PlusIcon,
  QuizIcon,
  ScanIcon,
  StreakBoltIcon,
  StreakFlameIcon,
  SummarizeIcon,
  TimerIcon,
  WifiIcon,
} from '@/components/icons'
import { HOME_GREETING, STUDENT_INITIAL } from '@/lib/session'
import styles from './home.module.css'

// The host app's home, built to Figma frame "Home card — where Say It Back lives,
// native and unmodified" (15674:34093).
//
// It used to be a stand-in: a left-aligned greeting and two grey "Your study plan" /
// "Recent notes" boxes that appear on no frame. The point of this screen is that Say
// It Back is judged where it actually lives, and a placeholder cannot show that — the
// chip's competition for attention IS the design question. So this is the frame:
// status bar, app bar with the streak chips, Knowie over a centred greeting, the tool
// chips, the composer, the tab bar. Say It Back's own surfaces arrive as `children`,
// in the frame's slot, 64 below the greeting.
//
// Two honest differences, both recorded in the build report:
//   - The tool and tab glyphs in Figma are bespoke multi-colour artwork exported as
//     rasters. These are the Lucide equivalents, which is the house icon convention.
//   - The frame's chips row stacks duplicates at identical positions (Flashcards and
//     Summarize each appear twice, one under the other). That is a layering artifact,
//     not six chips: the distinct set, in the frame's order, is what renders here.

/** iOS status bar. Real chrome on the frame, so real chrome here. */
function StatusBar() {
  return (
    <div className={styles.statusBar} aria-hidden="true">
      <span className={styles.statusTime}>09:41</span>
      <span className={styles.statusRight}>
        <span className={styles.signal}>
          <i /><i /><i /><i />
        </span>
        <span className={styles.wifi}><WifiIcon /></span>
        <span className={styles.battery}>
          <span className={styles.batteryFill} />
        </span>
      </span>
    </div>
  )
}

/** The frame's appBar: menu, the PRO and streak chips, the timer. */
function HomeAppBar() {
  return (
    <div className={styles.appBar}>
      <button type="button" className={styles.appBarButton} aria-label="Menu">
        <span className={styles.appBarGlyph}><MenuIcon /></span>
      </button>
      <div className={styles.statusChips}>
        <span className={styles.proChip}>
          <span className={styles.proBadge}>PRO</span>
          <span className={styles.proLabel}>Upgrade</span>
        </span>
        <span className={styles.streakChip} data-tone="blue">
          <span className={styles.streakGlyph}><StreakBoltIcon /></span>
          <span className={styles.streakCount}>2</span>
        </span>
        <span className={styles.streakChip} data-tone="coral">
          <span className={styles.streakGlyph}><StreakFlameIcon /></span>
          <span className={styles.streakCount}>3</span>
        </span>
      </div>
      <button type="button" className={styles.appBarButton} aria-label="Study timer">
        <span className={styles.appBarGlyph}><TimerIcon /></span>
      </button>
    </div>
  )
}

const TOOLS = [
  { label: 'Scan', Glyph: ScanIcon },
  { label: 'Flashcards', Glyph: FlashcardsIcon },
  { label: 'Quiz', Glyph: QuizIcon },
  { label: 'Summarize', Glyph: SummarizeIcon },
  { label: 'Chemistry prep', Glyph: SummarizeIcon },
]

const TABS = [
  { label: 'Chat', Glyph: NavChatIcon },
  { label: 'Search', Glyph: NavSearchIcon },
  { label: 'Goals', Glyph: NavTargetIcon },
  { label: 'Awards', Glyph: NavTrophyIcon },
]

export function HomeShell({ children, toolChip, popup }: {
  children: ReactNode
  /**
   * Say It Back's composer chip, once unlocked. It lives in the tool row, first, per
   * sprint-context § "Where it lives": "among Scan/Summarize/Flashcards/Quiz in the
   * existing home composer". It used to render in the middle slot under the greeting,
   * where a short viewport pushed it below the fold and home looked chipless.
   */
  toolChip?: ReactNode
  /**
   * A popup over home: the whole screen dims under it, except the Say It Back chip,
   * which stays lit in the tool row so the popup can point at it (designer, 2026-10-12).
   */
  popup?: ReactNode
}) {
  // The middle scrolls and the chrome does not, so the shell's own overflow measurement
  // never sees this region. Same ResizeObserver, same data attribute, same fade.
  const midRef = useRef<HTMLDivElement>(null)
  const [overflowing, setOverflowing] = useState(false)
  // Knowie at 3XL if the middle fits as designed; 2XL if that is enough; out if not —
  // the unlock note and Say It Back's surfaces are what home is for. Decided from the
  // layout as designed, with the flag lifted for one synchronous read, so it cannot
  // flip-flop.
  const [compact, setCompact] = useState<0 | 1 | 2>(0)
  // Scrolling only moves the fade; the Knowie step needs no re-measure for it (dev review).
  const measureFade = useCallback(() => {
    const el = midRef.current
    if (el) setOverflowing(el.scrollTop + el.clientHeight < el.scrollHeight - 1)
  }, [])
  const measure = useCallback(() => {
    const el = midRef.current
    if (!el) return
    const applied = el.getAttribute('data-compact')
    if (applied) el.removeAttribute('data-compact')
    const overAsDesigned = el.scrollHeight - el.clientHeight
    const mascot = el.querySelector<HTMLElement>('[data-mascot]')
    const full = mascot?.offsetHeight ?? 0
    if (applied) el.setAttribute('data-compact', applied)
    const root = getComputedStyle(document.documentElement)
    const small = parseFloat(root.getPropertyValue('--size-primitive-illustration-1500'))
    setCompact(overAsDesigned <= 1 ? 0 : overAsDesigned <= full - small + 1 ? 1 : 2)
    setOverflowing(el.scrollTop + el.clientHeight < el.scrollHeight - 1)
  }, [])
  useLayoutEffect(() => {
    measure()
    const el = midRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    for (const child of Array.from(el.children)) {
      ro.observe(child)
      for (const grandchild of Array.from(child.children)) ro.observe(grandchild)
    }
    let live = true
    document.fonts?.ready.then(() => live && measure())
    return () => {
      live = false
      ro.disconnect()
    }
  }, [measure, children])

  return (
    <ScreenShell
      // Home runs its own Knowie step (3XL, 2XL, out); the shell's would measure the same
      // mascot a second time (dev review, 2026-10-12).
      mascotGivesWay={false}
      panelHeader={<StatusBar />}
      topNavigation={<HomeAppBar />}
    >
      <div className={styles.body} data-popup={popup ? '' : undefined}>
        {/* middleContent on the frame: centred, gap 32 (the frame's 64, tightened 2026-10-12) between the greeting group and
            whatever Say It Back surface this route is showing. */}
        <div
          ref={midRef}
          className={styles.middle}
          data-overflowing={overflowing || undefined}
          data-compact={compact || undefined}
          onScroll={measureFade}
        >
          <div className={styles.hero}>
            <div className={styles.mascotGroup}>
              {/* The frame's ground ellipse under Knowie. Decorative. */}
              <span className={styles.groundShadow} aria-hidden="true" />
              <MascotSlot size="3XL" expression="excited" className={styles.mascot} />
            </div>
            <h1 className={styles.greeting}>{HOME_GREETING}</h1>
          </div>
          {/* The popup sits in home's own content slot, above the tool row in the flow,
              lifted over the dim. Centred on the whole screen it overlapped the lit chip
              it points at on a 390x668 phone once it grew a badge (2026-10-12). */}
          <div className={styles.slot}>{popup ? <div className={styles.popupCard}>{popup}</div> : children}</div>
        </div>

        {/* bottomContent on the frame. Not ScreenShell's action zone: that is fixed at
            136 for the session flow, and this stack is taller. Home is outside that
            flow and has never used the zone, so the invariant is untouched. */}
        <div className={styles.chrome}>
          <div className={styles.tools}>
            {toolChip && <span className={styles.toolChipSlot}>{toolChip}</span>}
            {TOOLS.map(({ label, Glyph }) => (
              <button type="button" key={label} className={styles.tool}>
                <span className={styles.toolGlyph}><Glyph /></span>
                <span className={styles.toolLabel}>{label}</span>
              </button>
            ))}
          </div>

          <div className={styles.composer}>
            <button type="button" className={styles.composerNew} aria-label="New">
              <span className={styles.composerGlyph}><PlusIcon /></span>
            </button>
            <div className={styles.composerField}>
              <span className={styles.composerPlaceholder}>Ask anything</span>
              <span className={styles.composerMic} aria-hidden="true"><MicGlyphIcon /></span>
            </div>
          </div>

          <nav className={styles.tabBar} aria-label="App sections">
            {TABS.map(({ label, Glyph }) => (
              <button type="button" key={label} className={styles.tab} aria-label={label}>
                <span className={styles.tabGlyph}><Glyph /></span>
              </button>
            ))}
            <button type="button" className={styles.avatar} aria-label="Profile">
              <span className={styles.avatarInitial} aria-hidden="true">{STUDENT_INITIAL}</span>
            </button>
          </nav>
          <div className={styles.homeIndicator} aria-hidden="true">
            <span />
          </div>
        </div>
        {popup && <div className={styles.popupScrim} aria-hidden="true" />}
      </div>
    </ScreenShell>
  )
}
