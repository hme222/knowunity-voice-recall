'use client'

import { useRouter } from 'next/navigation'
import { returnBack } from '@/lib/navigation'
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
        <AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Back" onLeft={() => returnBack(router, '/session/recap')} />
      }
      bottomContent={
        <div className={styles.actions}>
          <Button CTA="Drill the definition out loud" variant="Secondary" size="M" fullWidth onClick={() => router.push('/drill/intro')} />
          <Button CTA="Say it back again" variant="Secondary" size="M" fullWidth onClick={() => router.push('/session/idle/1')} />
          <Button CTA="Not now" variant="Tertiary" size="M" fullWidth onClick={() => router.push('/session/recap')} />
        </div>
      }
    >
      <ChatBubble
        showTitle
        title="How do you want to practice?"
        body={
          missed.length === 1
            ? `One term to go back over: ${getTerm(missed[0].index)?.name}.`
            : `${missed.length} terms to go back over.`
        }
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
