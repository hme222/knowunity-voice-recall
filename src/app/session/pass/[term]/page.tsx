'use client'

import { Suspense, use, useEffect } from 'react'
import { useRedirect } from '@/lib/navigation'
import { useRouter, useSearchParams } from 'next/navigation'
import { SessionBar } from '../../SessionBar'
import { Button, Chips, MascotSlot, RecallResult, ScreenShell } from '@/components'
import { CheckIcon } from '@/components/icons'
import { answerFor, getTerm, nextAfter, outcomeFor, recordOutcome, useSession, XP, isPractising } from '@/lib/session'
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
  const practising = isPractising(state)
  const calibration = outcome?.calibration ?? 0
  // The chip says how it was got, not only that it was (usability review, 2026-10-12):
  // a hinted or typed pass and a clean spoken one read identically but for the XP. The
  // bucket is the store's (it backstops a hint the URL dropped), except in practice,
  // where the stored outcome is the original run's, not this attempt's. Typed reads the
  // current attempt, which a spoken take clears.
  const withHint = hinted || (!practising && outcome?.bucket === 'Hinted')
  const typed = Boolean(state.sentTyped?.[index])
  const verdict = ['Correct', typed && 'typed', withHint && 'with a hint'].filter(Boolean).join(', ')

  useEffect(() => {
    recordOutcome(index, hinted ? 'Hinted' : 'Unaided', { wasSure })
  }, [index, hinted, wasSure])

  useRedirect(!current, '/session/intro')

  if (!current) return null

  return (
    <ScreenShell
      topNavigation={<SessionBar index={index} />}
      bottomContent={
        <div className={styles.actions}>
          <Button CTA="Continue" variant="Primary" size="M" fullWidth onClick={() => router.push(nextAfter(index))} />
        </div>
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="excited" className={styles.mascotCentred} />
        {/* A "Correct" chip, matching the partial's "Partially right": the verdict is
            not carried by the green card alone (designer, 2026-10-12). */}
        <div className={styles.verdictRow}>
          <Chips Text={verdict} size="S" color="Primary" active showLeftIcon leftIcon={<CheckIcon />} showRightIcon={false} />
        </div>
        <RecallResult state="Pass" title={current.passTitle} transcript={`“${answerFor(index, state)}”`} />
        {/* The XP and the confidence line live here, in the content, not in the action
            zone: there they pushed Continue 14px below every other single button
            (critic panel, 2026-10-12). */}
        {/* No XP line in a practice round: practice never rewrites the run, so the
            figure here was the earlier outcome's (+0 on a skipped term) (dev review). */}
        {!practising && <p className={styles.xp}>{`\u26a1 +${outcome?.xp ?? (hinted ? XP.hinted : XP.unaided)}`}</p>}
        {/* What the confidence tap was worth. Without this the tap is asked for and
            then never mentioned again. */}
        {!practising && calibration !== 0 && (
          <p className={styles.calibration}>
            {calibration > 0
              ? `+${calibration} · ${outcome?.wasSure ? 'called it' : 'knew more than you thought'}`
              : `${calibration} · you were sure`}
          </p>
        )}
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
