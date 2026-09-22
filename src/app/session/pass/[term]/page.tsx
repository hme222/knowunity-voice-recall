'use client'

import { Suspense, use, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { goToExit } from '@/lib/navigation'
import { AppBar, Button, MascotSlot, ProgressIndicator, RecallResult, ScreenShell, SessionFraction } from '@/components'
import { CloseIcon } from '@/components/icons'
import { answerFor, getTerm, nextAfter, outcomeFor, progressFor, recordOutcome, revisitsPending, useSession, TOTAL_TERMS, XP } from '@/lib/session'
import styles from '../../result.module.css'

// 04 Pass — Figma frame "04 Pass" (15672:24247). Knowie's in-character reaction, not a
// graded badge. The transcript is echoed back as the proof (docs/sprint-context.md
// § Concept). XP is shown live here, one of the two screens where it is earned.

function PassScreen({ index }: { index: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const wasSure = searchParams.get('sure') === '1'
  const current = getTerm(index)
  const hinted = searchParams.get('hinted') === '1'
  const state = useSession()
  const outcome = outcomeFor(state, index)
  const calibration = outcome?.calibration ?? 0

  useEffect(() => {
    recordOutcome(index, hinted ? 'Hinted' : 'Unaided', { wasSure })
  }, [index, hinted, wasSure])

  if (!current) {
    router.replace('/session/intro')
    return null
  }

  return (
    <ScreenShell
      topNavigation={
        <>
          <AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Leave" onLeft={() => goToExit(router)}>
            <ProgressIndicator progress={progressFor(index)} thickness="16" label="Questions" current={index} total={TOTAL_TERMS} />
          </AppBar>
          <SessionFraction current={index} total={TOTAL_TERMS} moreToCome={revisitsPending()} />
        </>
      }
      bottomContent={
        <div className={styles.actions}>
          <p className={styles.xp}>{`\u26a1 +${outcome?.xp ?? (hinted ? XP.hinted : XP.unaided)}`}</p>
          {/* What the confidence tap was worth. Without this the tap is asked for and
              then never mentioned again. */}
          {calibration !== 0 && (
            <p className={styles.calibration}>
              {calibration > 0
                ? `+${calibration} · ${outcome?.wasSure ? 'called it' : 'knew more than you thought'}`
                : `${calibration} · you were sure`}
            </p>
          )}
          <Button CTA="Continue" variant="Primary" size="M" fullWidth onClick={() => router.push(nextAfter(index))} />
        </div>
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="excited" className={styles.mascotCentred} />
        <RecallResult state="Pass" title={current.passTitle} transcript={`“${answerFor(index)}”`} />
        {/* Removed for the same reason as 05 Miss: the card above already shows "You
            said" and the transcript, and the `passed` sheet renders that one string and
            nothing else. No leak here, just a control spent on nothing. */}
      </div>
    </ScreenShell>
  )
}

export default function PassPage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = use(params)
  return (
    <Suspense fallback={null}>
      <PassScreen index={Number(term)} />
    </Suspense>
  )
}
