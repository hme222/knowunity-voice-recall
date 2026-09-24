'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
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
import { HOME_GREETING } from '@/lib/session'
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

export function HomeShell({ children }: { children: ReactNode }) {
  // The middle scrolls and the chrome does not, so the shell's own overflow measurement
  // never sees this region. Same ResizeObserver, same data attribute, same fade.
  const midRef = useRef<HTMLDivElement>(null)
  const [overflowing, setOverflowing] = useState(false)
  const measure = useCallback(() => {
    const el = midRef.current
    if (el) setOverflowing(el.scrollHeight - el.clientHeight > 1)
  }, [])
  useEffect(() => {
    measure()
    const el = midRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    for (const child of Array.from(el.children)) ro.observe(child)
    return () => ro.disconnect()
  }, [measure, children])

  return (
    <ScreenShell
      panelHeader={<StatusBar />}
      topNavigation={<HomeAppBar />}
    >
      <div className={styles.body}>
        {/* middleContent on the frame: centred, gap 64 between the greeting group and
            whatever Say It Back surface this route is showing. */}
        <div ref={midRef} className={styles.middle} data-overflowing={overflowing || undefined}>
          <div className={styles.hero}>
            <div className={styles.mascotGroup}>
              {/* The frame's ground ellipse under Knowie. Decorative. */}
              <span className={styles.groundShadow} aria-hidden="true" />
              <MascotSlot size="3XL" expression="excited" />
            </div>
            <h1 className={styles.greeting}>{HOME_GREETING}</h1>
          </div>
          <div className={styles.slot}>{children}</div>
        </div>

        {/* bottomContent on the frame. Not ScreenShell's action zone: that is fixed at
            136 for the session flow, and this stack is taller. Home is outside that
            flow and has never used the zone, so the invariant is untouched. */}
        <div className={styles.chrome}>
          <div className={styles.tools}>
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
              <MascotSlot size="XL" expression="excited" className={styles.avatarPose} />
            </button>
          </nav>
          <div className={styles.homeIndicator} aria-hidden="true">
            <span />
          </div>
        </div>
      </div>
    </ScreenShell>
  )
}
