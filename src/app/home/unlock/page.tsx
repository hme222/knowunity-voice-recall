'use client'

import { useRouter } from 'next/navigation'
import { Button, MascotSlot, SwipeChip, TextBlock } from '@/components'
import { HomeShell } from '../HomeShell'
import styles from '../home.module.css'

// Home, first-time reveal — Figma frame "Home unlock — Say It Back revealed (first
// time)" (15810:13020). Home dims and the composer chip is spotlighted with an earned
// "you've unlocked Say It Back". Shown once.
//
// It fires on the first encounter by any door — Prove It shown on quiz complete, the
// exam-plan step, or chat. It is the showing that unlocks, not the completing.

export default function UnlockPage() {
  const router = useRouter()
  return (
    <HomeShell>
      <div className={styles.spotlightScrim}>
        <div className={styles.spotlit}>
          <SwipeChip onClick={() => router.push('/home/unlocked')} />
        </div>
        <div className={styles.coachCard}>
          <MascotSlot size="3XL" expression="laughing" />
          <TextBlock
            variant="L"
            title="You've unlocked Say It Back"
            caption="Explain a term out loud and Knowie tells you how it landed. It lives here in your composer from now on."
          />
          <Button CTA="Got it" variant="Primary" size="M" fullWidth onClick={() => router.push('/home/unlocked')} />
        </div>
      </div>
    </HomeShell>
  )
}
