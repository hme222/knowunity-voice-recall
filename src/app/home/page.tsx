'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components'
import { DOORS } from '../door/doors'
import { HomeShell } from './HomeShell'
import styles from './home.module.css'

// Home, before first encounter. The baseline, and the state that was missing from all
// 39 frames: they assume the chip is already there.
//
// Corrected 2026-09-20 — an earlier version of sprint-context said the chip is
// "present in every home state". It isn't. Say It Back does not exist on home until
// the student has met it once, by any door.
//
// Moved off "/" 2026-09-21. This is not the start of the flow and never could be:
// the feature does not exist on this screen. "/" is the quiz-complete door, which is
// where a student actually meets Say It Back. This is here so the baseline state is
// still reachable and the other two doors still have a home to sit on.

export default function HomePage() {
  const router = useRouter()
  return (
    <HomeShell>
      <div className={styles.composer}>
        <div className={styles.chipRow}>
          {/* The real app's tools. They are reference chrome, not controls we own, and
              they were rendering as <button>s that did nothing — a row of four
              promises. Non-interactive spans now; nothing looks tappable unless it is.
              sprint-context.md, 2026-09-22. */}
          {['Scan', 'Summarize', 'Flashcards', 'Quiz'].map((tool) => (
            <span key={tool} className={styles.toolChip}>
              {tool}
            </span>
          ))}
        </div>
        {/* No Say It Back chip. The only way to meet the feature is through a door.
            These three stand in for arriving at one in the real app. */}
        <p className={styles.doorsNote}>Say It Back isn&rsquo;t here yet. It appears after you meet it:</p>
        <div className={styles.doors}>
          {DOORS.map((door) => (
            <Button
              key={door.id}
              CTA={door.homeLabel}
              variant="Tertiary"
              size="M"
              fullWidth
              onClick={() => router.push(door.href)}
            />
          ))}
        </div>
      </div>
    </HomeShell>
  )
}
