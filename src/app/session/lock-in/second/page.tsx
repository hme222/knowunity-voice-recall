'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { goToExit } from '@/lib/navigation'
import { AppBar, Button, ChatBubble, MascotSlot, ProgressIndicator, RecallResult, ScreenShell, SessionFraction } from '@/components'
import { CloseIcon } from '@/components/icons'
import { answerFor, revisitPlan, TERMS, TOTAL_TERMS, useSession } from '@/lib/session'
import styles from '../lock-in.module.css'

// 06b Lock It In, second pass — Figma frame "06b Lock It In missed — second time,
// no further requeue" (15675:46215). Progress 100%. A quiet success, not a
// celebration: the definition is locked in and the session closes.
//
// There is no third attempt. A second miss ends here and the drill is offered on
// Recap — never entered mid-session (docs/sprint-context.md § "Core loop").

function LockInSecondScreen() {
  const router = useRouter()
  // Did they actually take the second attempt, or leave? Arriving from 06's Skip is
  // not a pass, and the screen used to congratulate them either way: "Locked in. You
  // got it this time." over a transcript they never produced. A recall check that
  // rewards skipping is not a recall check.
  const answered = useSearchParams().get('answered') === '1'
  
  const state = useSession()
  const missed = state.outcomes.find((o) => o.bucket === 'Worth revisiting')
  const term = TERMS.find((t) => t.index === missed?.index) ?? TERMS[0]
  const plan = revisitPlan()

  return (
    <ScreenShell
      topNavigation={
        <>
          <AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Leave" onLeft={() => goToExit(router)}>
            <ProgressIndicator progress="100" thickness="16" label="Questions" current={TOTAL_TERMS} total={TOTAL_TERMS} />
          </AppBar>
          <SessionFraction label={plan.total > 1 ? `Revisit ${plan.total} of ${plan.total}` : 'Last one'} />
        </>
      }
      bottomContent={
        <Button CTA="Continue" variant="Primary" size="M" fullWidth onClick={() => router.push('/session/recap')} />
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression={answered ? 'excited' : 'determined'} />
        {answered ? (
          <RecallResult
            state="Pass"
            title="Locked in. You got it this time."
            transcript={`“${answerFor(term.index)}”`}
          />
        ) : (
          // Not RecallResult: its CouldntHear state renders a "Try again" chip, and
          // with no onRetry it is an inert label offering something this screen exists
          // to rule out — there is no third attempt.
          <ChatBubble
            showTitle
            title="Left this one for next time."
            body="It stays on your list, and you keep the XP you earned on the others."
          />
        )}
      </div>
    </ScreenShell>
  )
}

export default function LockInSecondPage() {
  return (
    <Suspense fallback={null}>
      <LockInSecondScreen />
    </Suspense>
  )
}
