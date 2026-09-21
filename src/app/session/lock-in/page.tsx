'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  AppBar,
  Button,
  ChatBubble,
  Chips,
  MascotSlot,
  MicButton,
  ProgressIndicator,
  ScreenShell,
  SessionFraction,
} from '@/components'
import { CloseIcon } from '@/components/icons'
import { markRequeued, TERMS, TOTAL_TERMS, useSession } from '@/lib/session'
import styles from './lock-in.module.css'

// 06 Lock It In — Figma frame "06 Lock It In (cold re-presentation)" (15672:20688).
// A missed term comes back later in the same session rather than resolving on one
// attempt. Progress sits at 75% on the frame; the fraction reads 3/4.
//
// Which term returns is derived from the run: the first one bucketed Worth revisiting.

export default function LockInPage() {
  const router = useRouter()
  const state = useSession()
  const missed = state.outcomes.find((o) => o.bucket === 'Worth revisiting' && !o.requeued)
  const term = TERMS.find((t) => t.index === missed?.index) ?? TERMS[0]

  // One requeue only. Marking on arrival means the term can't come back again.
  useEffect(() => {
    if (missed) markRequeued(missed.index)
  }, [missed])

  return (
    <ScreenShell
      topNavigation={
        <>
          <AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Leave" onLeft={() => router.push('/session/exit')}>
            <ProgressIndicator progress="75" thickness="16" label="Questions" current={3} total={TOTAL_TERMS} />
          </AppBar>
          <SessionFraction current={3} total={TOTAL_TERMS} />
        </>
      }
      bottomContent={
        <div className={styles.actions}>
          <MicButton state="Idle" onClick={() => router.push(`/session/recording/${term.index}?attempt=2`)} />
          <Button CTA="Skip" variant="Tertiary" size="M" onClick={() => router.push('/session/lock-in/second')} />
        </div>
      }
    >
      <div className={styles.body}>
        <div className={styles.badge}>
          <Chips Text="Back for round two" size="S" color="pro" active showRightIcon={false} />
        </div>
        <ChatBubble
          showTitle
          title="That one was tricky. Want to lock it in?"
          body={"Try the full answer once more, unaided this time and you’ll see this one again later in the session. Totally optional."}
        />
        <MascotSlot size="2XL" expression="determined" />
      </div>
    </ScreenShell>
  )
}
