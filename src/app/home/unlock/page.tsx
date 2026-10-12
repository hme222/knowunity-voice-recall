'use client'

import { useRouter } from 'next/navigation'
import { Button, ChatBubble, SwipeChip } from '@/components'
import { HomeShell } from '../HomeShell'
import styles from '../home.module.css'

// Home, first-time reveal. Was Figma frame "Home unlock — Say It Back revealed (first
// time)" (15810:13020): home dimmed under a scrim, a floating chip, a coach card.
//
// Rebuilt 2026-10-12 (designer): home as it is, with the Say It Back chip already in
// its place in the tool row, and a note above it saying the feature is unlocked and
// why. The dimmed modal hid the very home it was introducing, and its floating chip
// pointed at nowhere the chip actually lives. Reached by the back arrow on every door
// and by a door's "Not now": showing Say It Back is what unlocks it, not completing it.

export default function UnlockPage() {
  const router = useRouter()
  return (
    <HomeShell toolChip={<SwipeChip onClick={() => router.push('/picker')} />}>
      <div className={styles.unlockNote}>
        <ChatBubble
          showTitle
          title="Say It Back feature unlocked"
          body="Saying a definition back in your own words is the quickest way to know it stuck. Tap the chip below anytime."
        />
        <Button CTA="Got it" variant="Secondary" size="M" fullWidth onClick={() => router.push('/home/unlocked')} />
      </div>
    </HomeShell>
  )
}
