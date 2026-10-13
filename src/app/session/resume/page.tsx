'use client'

import { useRouter } from 'next/navigation'
import { Button, MascotSlot, ScreenShell, StatChip } from '@/components'
import { sessionTotals, TOTAL_TERMS, useSession, firstUnanswered, termHref, startRun } from '@/lib/session'
import styles from '../interrupt.module.css'

// Session resume. Implied by banking per-term XP on leaving — the Design Brief says progress saves and returning… History: docs/code-history.md#h-080

export default function ResumePage() {
  const router = useRouter()
  const state = useSession()
  const totals = sessionTotals(state)
  const done = state.outcomes.length
  // The first term with no outcome, not `done + 1`: outcomes are not always terms 1..n
  // in order (dev review, 2026-10-12). Through termHref, so a mic-denied run resumes
  // typed.
  const next = firstUnanswered(state)

  // Nothing to resume: no session, or one already finished. Home only offers this screen
  // partway, but opened directly it read "0 of 4 done" over a resume button
  // (click-through, 2026-10-12), and a finished run's button reopened the last term.
  if (done === 0 || next === undefined) {
    const finished = done > 0
    return (
      <ScreenShell
        bottomContent={
          <div className={styles.actions}>
            {finished ? (
              <Button CTA="See your recap" variant="Primary" size="M" fullWidth onClick={() => router.push('/session/recap')} />
            ) : (
              <Button CTA="Start a session" variant="Primary" size="M" fullWidth onClick={() => router.push(startRun())} />
            )}
            <Button CTA="Back to home" variant="Tertiary" size="M" fullWidth onClick={() => router.push('/home/unlocked')} />
          </div>
        }
      >
        <div className={styles.body}>
          <MascotSlot size="2XL" expression="determined" />
          <div className="screenTitle">
            <h1 className="screenTitleHeading">{finished ? 'You finished this one' : 'Nothing to pick up'}</h1>
            <p className="screenTitleCaption">
              {finished ? `All ${TOTAL_TERMS} done. Your recap has how it went.` : 'There’s no session in progress.'}
            </p>
          </div>
        </div>
      </ScreenShell>
    )
  }

  return (
    <ScreenShell
      bottomContent={
        <div className={styles.actions}>
          <Button
            CTA="Pick up where you left off"
            variant="Primary"
            size="M"
            fullWidth
            onClick={() => router.push(termHref(next, state))}
          />
          <Button CTA="Start fresh" variant="Tertiary" size="M" fullWidth onClick={() => router.push(startRun())} />
        </div>
      }
    >
      <div className={styles.body}>
        {/* Welcome back. Picking up where you left off is a small good moment. */}
        <MascotSlot size="2XL" expression="excited" />
        <div className="screenTitle">
          <h1 className="screenTitleHeading">You were partway through</h1>
          <p className="screenTitleCaption">
            {`${done} of ${TOTAL_TERMS} done. Your XP is safe — only the finishing bonus is still up for grabs.`}
          </p>
        </div>
        <StatChip stat="XP" value={`+${totals.earned}`} />
      </div>
    </ScreenShell>
  )
}
