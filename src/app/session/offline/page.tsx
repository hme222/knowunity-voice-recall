'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { goToExit } from '@/lib/navigation'
import { Button, MascotSlot, ScreenShell, Snackbar, TextBlock } from '@/components'
import styles from '../interrupt.module.css'

// Network dropped mid-take. The take is held and retried on reconnect rather than
// discarded — it respects the effort already spent, the same principle the journey map
// applies to switching to typing mid-answer.
//
// Deliberately NOT routed to Couldn't hear: that state blames the student's speech,
// and a connection fault is not their speech. voice-ux Principle 4 is about keeping
// "the app misheard me" separate from "I failed"; this keeps "the network dropped"
// separate from both.

function OfflineScreen() {
  const router = useRouter()
  const index = Number(useSearchParams().get('term') ?? '1')
  return (
    <ScreenShell
      bottomContent={
        <div className={styles.actions}>
          <Button
            CTA="Try sending again"
            variant="Primary"
            size="M"
            fullWidth
            onClick={() => router.push(`/session/processing/${index}`)}
          />
          <Button CTA="Leave for now" variant="Tertiary" size="M" fullWidth onClick={() => goToExit(router)} />
        </div>
      }
    >
      <div className={styles.body}>
        <div className={styles.mascot}>
          <MascotSlot size="2XL" expression="determined" />
        </div>
        <TextBlock
          variant="L"
          title="Saving your answer"
          caption="You've lost connection, so this one is waiting rather than lost. It'll send as soon as you're back."
        />
        <Snackbar Text="No connection — your answer is held." variant="Error" chipText="Waiting" />
      </div>
    </ScreenShell>
  )
}

export default function OfflinePage() {
  return (
    <Suspense fallback={null}>
      <OfflineScreen />
    </Suspense>
  )
}
