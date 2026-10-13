'use client'

import { Suspense, use, useEffect } from 'react'
import { useRedirect } from '@/lib/navigation'
import { useRouter, useSearchParams } from 'next/navigation'
import { SessionBar } from '../../SessionBar'
import { Button, Chips, MascotSlot, RecallResult, ScreenShell } from '@/components'
import { CheckIcon } from '@/components/icons'
import { answerFor, getTerm, nextAfter, outcomeFor, readSession, recordOutcome, spendEarned, termHref, useSession, XP, isPractising } from '@/lib/session'
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
  // The chip says how it was got, not only that it was (usability review, 2026-10-12): a hinted or typed pass and a clean spoken one read identically but for the XP. History: docs/code-history.md#h-061
  const withHint = hinted || (!practising && outcome?.bucket === 'Hinted')
  const typed = Boolean(state.sentTyped?.[index])
  const verdict = ['Correct', typed && 'typed', withHint && 'with a hint'].filter(Boolean).join(', ')

  // Pays only against a judged take's receipt (engineering review, 2026-10-13). Opened
  // cold, with no receipt and nothing passed on this term, it goes back to the question
  // rather than recording an Unaided +10 for a term never attempted.
  useEffect(() => {
    if (spendEarned(index, 'Pass')) {
      recordOutcome(index, hinted ? 'Hinted' : 'Unaided', { wasSure })
      return
    }
    const prior = outcomeFor(readSession(), index)
    if (!prior || (prior.bucket !== 'Unaided' && prior.bucket !== 'Hinted')) router.replace(termHref(index))
  }, [index, hinted, wasSure, router])

  useRedirect(!current, '/session/resume')

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
      {/* Centred in the region: the payoff sat in the top half and the screen emptied
          out below it (senior review, 2026-10-12). */}
      <div className={`${styles.body} ${styles.bodyCentred}`}>
        {/* Knowie reacts: one bounce on arrival, and the card rises after it (senior
            review, 2026-10-12: "Knowie never visibly reacts"). Not on a practice round,
            which is a second look, not a first win. */}
        {/* 3XL on a first-time pass: the win is the one moment Knowie is bigger than
            the ask, and the space under the card was empty anyway. Gives way on short
            screens like every other mascot. */}
        <MascotSlot size={practising ? '2XL' : '3XL'} expression="excited" className={`${styles.mascotCentred} ${practising ? '' : styles.celebrate}`} />
        {/* A "Correct" chip, matching the partial's "Partially right": the verdict is
            not carried by the green card alone (designer, 2026-10-12). */}
        <div className={styles.verdictRow}>
          <Chips Text={verdict} size="S" color="Primary" active showLeftIcon leftIcon={<CheckIcon />} showRightIcon={false} />
        </div>
        <RecallResult state="Pass" title={current.passTitle} transcript={`“${answerFor(index, state)}”`} className={practising ? undefined : styles.rise} />
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
            {/* A sentence at reading size, not "+1 · called it" at 11px: the confidence
                call is the brief's own mechanic and was the least visible thing on the
                screen (senior review, 2026-10-12). */}
            {calibration > 0
              ? outcome?.wasSure
                ? `You said you were sure, and you were. +${calibration} XP`
                : `You weren’t sure, and you nailed it. +${calibration} XP`
              : `You were sure about this one. ${calibration} XP`}
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
