'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  AppBar,
  Button,
  MascotSlot,
  ProgressIndicator,
  RecallResult,
  ScreenShell,
  SessionFraction,
  Snackbar,
} from '@/components'
import { CheckIcon, CloseIcon } from '@/components/icons'
import { getTerm, nextAfter, progressFor, recordOutcome, TOTAL_TERMS, XP } from '@/lib/session'
import styles from '../../result.module.css'

// Say-it-back result — the optional repeat after a reveal. No Figma frame; behaviour
// from the Design Brief's kickoff spec ("after a hinted pass or a reveal, an optional
// chance to repeat the full answer unaided") and the XP decision of 2026-09-20.
// Worth +3, bucket unchanged: rehearsal, not a re-verdict.

export default function RepeatPage({ params }: { params: Promise<{ term: string }> }) {
  const router = useRouter()
  const { term } = use(params)
  const index = Number(term)
  const current = getTerm(index)

  useEffect(() => {
    recordOutcome(index, 'Revealed', { repeated: true })
  }, [index])

  if (!current) {
    router.replace('/session/intro')
    return null
  }

  return (
    <ScreenShell
      topNavigation={
        <>
          <AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Leave" onLeft={() => router.push('/session/exit')}>
            <ProgressIndicator progress={progressFor(index)} thickness="16" label="Questions" current={index} total={TOTAL_TERMS} />
          </AppBar>
          <SessionFraction current={index} total={TOTAL_TERMS} />
        </>
      }
      bottomContent={
        <Button CTA="Next question" variant="Primary" size="M" fullWidth onClick={() => router.push(nextAfter(index))} />
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="laughing" />
        <RecallResult
          state="Pass"
          title="That's it, in your own voice."
          transcript={`“${current.transcript}”`}
        />
        <Snackbar Text="Said back unaided." variant="Success" icon={<CheckIcon />} chipText={`+${XP.repeat} XP`} />
      </div>
    </ScreenShell>
  )
}
