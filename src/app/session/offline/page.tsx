'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { goToExit } from '@/lib/navigation'
import { Button, MascotSlot, ScreenShell, Snackbar } from '@/components'
import { RefreshGlyphIcon } from '@/components/icons'
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
  const params = useSearchParams()
  const index = Number(params.get('term') ?? '1')
  // The same take, handed back exactly as it arrived. A retry must resolve to the
  // verdict the original take earned — the network dropping is not new evidence about
  // how the student spoke, and this screen exists to keep those two apart
  // (voice-ux Principle 4).
  const held = new URLSearchParams({
    ms: params.get('ms') ?? '0',
    attempt: params.get('attempt') ?? '1',
  })
  if (params.get('hinted') === '1') held.set('hinted', '1')
  const door = params.get('door')
  if (door) held.set('door', door)
  return (
    <ScreenShell
      bottomContent={
        <div className={styles.actions}>
          <Button
            CTA="Try sending again"
            variant="Primary"
            size="M"
            fullWidth
            onClick={() => router.push(`/session/processing/${index}?${held}`)}
          />
          <Button CTA="Leave for now" variant="Tertiary" size="M" fullWidth onClick={() => goToExit(router)} />
        </div>
      }
    >
      <div className={styles.body}>
        <div className={styles.mascot}>
          {/* The connection dropped. Same class as 04a Couldn't hear — the app failed, not the
            student — and dazed is the pose that says so. It was wearing the working face
            while telling the student something had gone wrong. */}
          <MascotSlot size="2XL" expression="dazed" />
        </div>
        <div className="screenTitle">
          <h1 className="screenTitleHeading">Saving your answer</h1>
          <p className="screenTitleCaption">You’ve lost connection, so this one is waiting rather than lost. It’ll send as soon as you’re back.</p>
        </div>
        <Snackbar Text="No connection — your answer is held." variant="Error" icon={<RefreshGlyphIcon />} chipText="Waiting" />
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
