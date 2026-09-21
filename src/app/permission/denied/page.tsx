'use client'

import { useRouter } from 'next/navigation'
import { Button, MascotSlot, ScreenShell, TextBlock } from '@/components'
import styles from '../permission.module.css'

// Permission denied — a session-level choice, not a dead end.
// voice-ux Principle 3: design the "No". The student must still have a way forward,
// and that way is the text fallback. Telling them what they're missing and how to
// re-enable is the difference between a fork and a trap.
//
// Denied makes text sticky for the session: the mic can't work, so re-offering it
// every term would be asking someone to do something they've already said they can't.

export default function DeniedPage() {
  const router = useRouter()
  return (
    <ScreenShell
      bottomContent={
        <div className={styles.actions}>
          <Button
            CTA="Type this session"
            variant="Primary"
            size="M"
            fullWidth
            onClick={() => router.push('/text/turn?sticky=1')}
          />
          <Button
            CTA="How to turn the mic on"
            variant="Secondary"
            size="M"
            fullWidth
            onClick={() => router.push('/permission/primer')}
          />
        </div>
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="dazed" />
        <TextBlock
          variant="L"
          title="No mic, no problem"
          caption="You can type your answers instead — same questions, same hints, and you keep the full XP. To speak them later, turn the microphone on for Knowunity in Settings › Privacy › Microphone."
        />
      </div>
    </ScreenShell>
  )
}
