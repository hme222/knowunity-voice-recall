'use client'

import { use, useEffect } from 'react'
import { useRedirect } from '@/lib/navigation'
import { useRouter } from 'next/navigation'
import { SessionBar } from '../../SessionBar'
import {
  Button,
  MascotSlot,
  RecallResult,
  ScreenShell,
  Snackbar,
} from '@/components'
import { CheckIcon } from '@/components/icons'
import { getTerm, isPractising, nextAfter, recordOutcome, useSession, XP } from '@/lib/session'
import styles from '../../result.module.css'

// Say-it-back result — the optional repeat after a reveal. No Figma frame; behaviour
// from the Design Brief's kickoff spec ("after a hinted pass or a reveal, an optional
// chance to repeat the full answer unaided") and the XP decision of 2026-09-20.
// Worth +3, bucket unchanged: rehearsal, not a re-verdict.

export default function RepeatPage({ params }: { params: Promise<{ term: string }> }) {
  const router = useRouter()
  // Practice pays nothing, so the chip says so instead of +3 (dev review, 2026-10-12).
  const practising = isPractising(useSession())
  const { term } = use(params)
  const index = Number(term)
  const current = getTerm(index)

  useEffect(() => {
    recordOutcome(index, 'Revealed', { repeated: true })
  }, [index])

  useRedirect(!current, '/session/intro')

  if (!current) return null

  return (
    <ScreenShell
      topNavigation={<SessionBar index={index} />}
      bottomContent={
        // "Continue", as on 04 Pass and 06b — the same nextAfter(index) call, and these
        // screens are near-twins. It read "Next question" here alone.
        <Button CTA="Continue" variant="Primary" size="M" fullWidth onClick={() => router.push(nextAfter(index))} />
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="excited" className={styles.mascotCentred} />
        <RecallResult
          state="Pass"
          title="That's it, in your own voice."
          transcript={`“${current.transcript}”`}
        />
        {/* NOT "said back unaided". The student read the answer off 05a ten seconds
            earlier, so unaided is the one thing this was not, and praise a student
            knows they did not earn is worse than no praise. The +3 is for saying it
            back in their own words, which is a real retrieval act and is what this
            now claims. */}
        <Snackbar Text="Said it back in your own words." variant="Success" icon={<CheckIcon />} chipText={practising ? 'Practice' : `+${XP.repeat} XP`} />
      </div>
    </ScreenShell>
  )
}
