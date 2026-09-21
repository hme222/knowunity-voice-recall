'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components'
import { HomeShell } from './home/HomeShell'
import styles from './home/home.module.css'

// Home, before first encounter. The baseline, and the state that was missing from all
// 39 frames: they assume the chip is already there.
//
// Corrected 2026-09-20 — an earlier version of sprint-context said the chip is
// "present in every home state". It isn't. Say It Back does not exist on home until
// the student has met it once, by any door.

export default function HomePage() {
  const router = useRouter()
  return (
    <HomeShell>
      <div className={styles.composer}>
        <div className={styles.chipRow}>
          {['Scan', 'Summarize', 'Flashcards', 'Quiz'].map((tool) => (
            <Button key={tool} CTA={tool} variant="Secondary" size="S" />
          ))}
        </div>
        {/* No Say It Back chip. The only way to meet the feature is through a door:
            a quiz's Prove It, the exam plan, or chat. */}
        <Button
          CTA="Finish a quiz (demo: unlock Say It Back)"
          variant="Tertiary"
          size="M"
          fullWidth
          onClick={() => router.push('/home/unlock')}
        />
      </div>
    </HomeShell>
  )
}
