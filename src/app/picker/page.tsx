'use client'

import { useRouter } from 'next/navigation'
import { AppBar, PickerRow, ScreenShell, TextBlock } from '@/components'
import { CloseIcon } from '@/components/icons'
import { PICKER_TOPICS, TERMS, useSession } from '@/lib/session'
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
  const state = useSession()
  const attempted = new Set(state.outcomes.map((o) => o.index))
  const drillable = TERMS.filter((t) => attempted.has(t.index))

  return (
    <ScreenShell
      topNavigation={
        <AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Back" onLeft={() => router.back()} />
      }
    >
      <div className={styles.body}>
        <TextBlock variant="L" title="What do you want to explain?" showCaption={false} />

        <section className={styles.group}>
          <h2 className={styles.groupLabel}>Topics</h2>
          {PICKER_TOPICS.map((topic) => (
            <PickerRow
              key={topic.label}
              variant="topic"
              label={topic.label}
              onClick={() => router.push('/session/intro')}
            />
          ))}
          <p className={styles.note}>
            From the quiz that unlocked Say It Back, plus anything you&rsquo;ve revised since.
          </p>
        </section>

        <section className={styles.group}>
          <h2 className={styles.groupLabel}>Drill a definition</h2>
          {drillable.map((t) => (
            <PickerRow
              key={t.index}
              variant="drill"
              label={t.name}
              state={state.outcomes.find((o) => o.index === t.index)?.bucket === 'Unaided' ? 'sharp' : 'drill'}
              onClick={() => router.push('/drill/intro')}
            />
          ))}
          {drillable.length === 0 && (
            <p className={styles.note}>
              Definitions you&rsquo;ve already tried show up here. Run a session first.
            </p>
          )}
        </section>
      </div>
    </ScreenShell>
  )
}
