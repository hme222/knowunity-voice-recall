'use client'

import { useRouter } from 'next/navigation'
import { AppBar, Button, ChatBubble, OptionRow, ScreenShell } from '@/components'
import { CloseIcon } from '@/components/icons'
import { getTerm, useSession } from '@/lib/session'
import styles from '../recap.module.css'

// 07a Practice what I missed — Figma frame "07a Practice what I missed — choose how"
// (15785:13615). The hinge between the core loop and the drill: where Recap's
// "worth revisiting" bucket becomes an action.
//
// The drill is OFFERED here, never entered mid-session (decided 2026-09-20), so
// DD 00's opt-in framing stands.

export default function PracticePage() {
  const router = useRouter()
  const state = useSession()

  const missed = state.outcomes.filter((o) => o.bucket !== 'Unaided')

  return (
    <ScreenShell
      topNavigation={
        <AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Back" onLeft={() => router.back()} />
      }
      bottomContent={
        <div className={styles.actions}>
          <Button CTA="Run them again now" variant="Tertiary" size="M" fullWidth onClick={() => router.push('/session/idle/1')} />
          <Button CTA="Drill one out loud" variant="Tertiary" size="M" fullWidth onClick={() => router.push('/drill/intro')} />
        </div>
      }
    >
      <ChatBubble
        showTitle
        title="Practice what I missed"
        body="These are the ones that needed help. Run them again in a session, or drill a single definition until you own it."
      />
      <div className={styles.buckets}>
        {missed.map((o) => (
          <OptionRow key={o.index} label={getTerm(o.index)?.name ?? ''} state="Default" onClick={() => router.push('/drill/intro')} />
        ))}
        {missed.length === 0 && state && <p className={styles.empty}>You got everything unaided. Nothing to practise.</p>}
      </div>
    </ScreenShell>
  )
}
