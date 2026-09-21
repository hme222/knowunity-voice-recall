'use client'

import { useRouter } from 'next/navigation'
import { Button, SwipeChip } from '@/components'
import { TOTAL_TERMS, useSession } from '@/lib/session'
import { HomeShell } from '../HomeShell'
import styles from '../home.module.css'

// Home, unlocked, no plan — Figma frame "Home — Say It Back chip in composer"
// (15745:15889). The chip sits among Scan / Summarize / Flashcards / Quiz with no
// schedule attached. A student with no plan never sees the due card, so there is no
// mixed message and no competing entry point.

export default function UnlockedHomePage() {
  const router = useRouter()
  const state = useSession()
  const partway = state.outcomes.length > 0 && state.outcomes.length < TOTAL_TERMS
  return (
    <HomeShell>
      <div className={styles.composer}>
        <div className={styles.chipRow}>
          {['Scan', 'Summarize', 'Flashcards', 'Quiz'].map((tool) => (
            <Button key={tool} CTA={tool} variant="Secondary" size="S" />
          ))}
        </div>
        {partway && (
          <Button
            CTA="Pick up where you left off"
            variant="Secondary"
            size="M"
            fullWidth
            onClick={() => router.push('/session/resume')}
          />
        )}
        <SwipeChip onClick={() => router.push('/picker')} />
        <Button
          CTA="Add a quiz due date (demo: plan active)"
          variant="Tertiary"
          size="M"
          fullWidth
          onClick={() => router.push('/home/due')}
        />
      </div>
    </HomeShell>
  )
}
