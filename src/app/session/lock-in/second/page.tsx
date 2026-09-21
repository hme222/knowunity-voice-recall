'use client'

import { useRouter } from 'next/navigation'
import { AppBar, Button, MascotSlot, ProgressIndicator, RecallResult, ScreenShell, SessionFraction } from '@/components'
import { CloseIcon } from '@/components/icons'
import { TERMS, TOTAL_TERMS, useSession } from '@/lib/session'
import styles from '../lock-in.module.css'

// 06b Lock It In, second pass — Figma frame "06b Lock It In missed — second time,
// no further requeue" (15675:46215). Progress 100%. A quiet success, not a
// celebration: the definition is locked in and the session closes.
//
// There is no third attempt. A second miss ends here and the drill is offered on
// Recap — never entered mid-session (docs/sprint-context.md § "Core loop").

export default function LockInSecondPage() {
  const router = useRouter()
  const state = useSession()
  const missed = state.outcomes.find((o) => o.bucket === 'Worth revisiting')
  const term = TERMS.find((t) => t.index === missed?.index) ?? TERMS[0]

  return (
    <ScreenShell
      topNavigation={
        <>
          <AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Leave" onLeft={() => router.push('/session/exit')}>
            <ProgressIndicator progress="100" thickness="16" label="Questions" current={4} total={TOTAL_TERMS} />
          </AppBar>
          <SessionFraction current={4} total={TOTAL_TERMS} />
        </>
      }
      bottomContent={
        <Button CTA="Continue" variant="Primary" size="M" fullWidth onClick={() => router.push('/session/recap')} />
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="laughing" />
        <RecallResult state="Pass" title="Locked in. You got it this time." transcript={`“${term.transcript}”`} />
      </div>
    </ScreenShell>
  )
}
