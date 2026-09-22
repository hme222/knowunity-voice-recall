'use client'

import { useRouter } from 'next/navigation'
import { AppBar, PickerRow, ScreenShell } from '@/components'
import { CloseIcon } from '@/components/icons'
import { PICKER_DRILLS, PICKER_TOPICS } from '@/lib/session'
import styles from './picker.module.css'

// Picker — Figma frame "Picker page — Say It Back + drill down" (15810:11285).
// Where a student chooses what to practise: a topic for a full recall session, or a
// single definition to drill out loud.
//
// Gated, decided 2026-09-20: topic rows offer only revised material, drill rows only
// definitions already attempted. Because the chip can be unlocked from the chat door
// where nothing was revised, the picker is seeded with the material from whichever
// session unlocked it — so the first visit is never empty. The seeded row says how it
// got there, which is what stops one stale row reading as a broken picker.

export default function PickerPage() {
  const router = useRouter()
  return (
    <ScreenShell
      topNavigation={
        <AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Close" onLeft={() => router.push('/home/unlocked')} />
      }
    >
      <div className={styles.body}>
        <div className="screenTitle">
          <h1 className="screenTitleHeading">Say It Back</h1>
          <p className="screenTitleCaption">Run a recall session, or drill one definition out loud.</p>
        </div>
        <input className={styles.search} type="search" placeholder="Search your topics" aria-label="Search your topics" />

        <section className={styles.group}>
          <h2 className={styles.groupLabel}>Or pick a topic</h2>
          {PICKER_TOPICS.map((topic) => (
            <PickerRow
              key={topic.label}
              variant="topic"
              label={topic.label}
              onClick={() => router.push('/session/intro')}
            />
          ))}

        </section>

        <section className={styles.group}>
          <h2 className={styles.groupLabel}>Drill a definition</h2>
          <p className={styles.note}>
            Definitions you&rsquo;ve attempted. Amber ones need the most work.
          </p>
          {PICKER_DRILLS.map((d) => (
            <PickerRow
              key={d.label}
              variant="drill"
              label={d.label}
              state={d.state}
              onClick={() => router.push('/drill/intro')}
            />
          ))}
        </section>
      </div>
    </ScreenShell>
  )
}
