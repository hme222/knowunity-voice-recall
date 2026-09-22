'use client'

import { useRouter } from 'next/navigation'
import { Button, MascotSlot, ScreenShell, StatChip } from '@/components'
import { sessionTotals, TOTAL_TERMS, useSession } from '@/lib/session'
import styles from '../interrupt.module.css'

// Session resume. Implied by banking per-term XP on leaving — the Design Brief says
// progress saves and returning resumes, and nothing in the 39 frames covers returning.
//
// The XP already earned is shown because that is the point: leaving cost the +5
// finishing bonus, not the work.

export default function ResumePage() {
  const router = useRouter()
  const state = useSession()
  const totals = sessionTotals(state)
  const done = state.outcomes.length
  const next = Math.min(done + 1, TOTAL_TERMS)

  return (
    <ScreenShell
      bottomContent={
        <div className={styles.actions}>
          <Button
            CTA="Pick up where you left off"
            variant="Primary"
            size="M"
            fullWidth
            onClick={() => router.push(`/session/idle/${next}`)}
          />
          <Button CTA="Start fresh" variant="Tertiary" size="M" fullWidth onClick={() => router.push('/session/intro')} />
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
