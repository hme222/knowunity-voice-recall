'use client'

import { Suspense, use, useEffect, useState } from 'react'
import { useRedirect } from '@/lib/navigation'
import { useRouter, useSearchParams } from 'next/navigation'
import { SessionBar } from '../../SessionBar'
import { Button, Chips, MascotSlot, PassNotches, RecallResult, ScreenShell } from '@/components'
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
  // The take that missed, when this pass came after one: shown faded above this one, so
  // the screen proves the improvement, not just the result (designer, 2026-10-13,
  // reach 1). A first-time pass has no "before" and looks as it always did.
  const firstTake = state.firstTakes?.[index]
  // The payoff is staged (reach C1): the verdict, then their own words as the proof. A
  // tap anywhere shows it all at once, so a student passing quickly never waits.
  const [staged, setStaged] = useState(true)
  const unaidedNow = !practising && !withHint
  // One XP figure: the term and the confidence call together (designer, 2026-10-14).
  // "⚡ +10" over "+1 XP" was two formats for one number.
  const base = outcome?.xp ?? (hinted ? XP.hinted : XP.unaided)
  const total = base + Math.max(0, calibration)

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
      // Knowie stays on a pass at its normal size, never shrunk (designer, 2026-10-14:
      // "Knowie needs to be normal size, make the correct card smaller"). On a short
      // screen the confidence sentence gives way instead; the XP total keeps the bonus.
      mascotGivesWay={false}
      topNavigation={<SessionBar index={index} />}
      bottomContent={
        <div className={styles.actions}>
          <Button CTA="Continue" variant="Primary" size="M" fullWidth onClick={() => router.push(nextAfter(index))} />
        </div>
      }
    >
      {/* Centred in the region: the payoff sat in the top half and the screen emptied
          out below it (senior review, 2026-10-12). */}
      {/* Tap anywhere to settle the staged payoff. A convenience, not a control: the
          transcript is in the DOM and announced from the start, only its paint waits. */}
      <div className={`${styles.body} ${styles.bodyCentred}`} onClick={() => setStaged(false)}>
        {/* Knowie reacts: one bounce on arrival, and the card rises after it (senior
            review, 2026-10-12: "Knowie never visibly reacts"). Not on a practice round,
            which is a second look, not a first win. */}
        {/* 2XL, the normal size, on every pass (designer, 2026-10-14). It was 3XL on a
            first-time pass, which pushed the card off a short screen and shrank Knowie. */}
        <MascotSlot size="2XL" expression={withHint || typed || practising ? 'approving' : 'laughing'} className={`${styles.mascotCentred} ${practising ? '' : styles.celebrate}`} />
        {/* A "Correct" chip, matching the partial's "Partially right": the verdict is
            not carried by the green card alone (designer, 2026-10-12). */}
        <div className={styles.verdictRow} aria-hidden="true">
          <Chips Text={verdict} size="S" color="Primary" active showLeftIcon leftIcon={<CheckIcon />} showRightIcon={false} />
        </div>
        {/* One line, label run in: as two lines it pushed the confidence sentence
            under the fold at 390x668. */}
        {firstTake && (
          <p className={styles.before}>
            <span className={styles.beforeLabel}>First try </span>
            {`“${firstTake}”`}
          </p>
        )}
        <RecallResult
          state="Pass"
          verdict={verdict}
          stagger={staged && !practising}
          title={current.passTitle}
          transcript={`“${answerFor(index, state)}”`}
          label={firstTake ? (typed ? 'Just now, you wrote' : 'Just now') : typed ? 'You wrote' : undefined}
          className={practising ? undefined : styles.rise}
          // Strength in unaided passes, never dropping (designer, 2026-10-14, option B).
          // An unaided pass in the run adds today's notch; a hinted one, or a practice
          // round, shows the meter as it stands.
          footer={<PassNotches filled={current.unaidedBefore + (unaidedNow ? 1 : 0)} fresh={unaidedNow} />}
        />
        {/* The XP and the confidence line live here, in the content, not in the action
            zone: there they pushed Continue 14px below every other single button
            (critic panel, 2026-10-12). */}
        {/* No XP line in a practice round: practice never rewrites the run, so the
            figure here was the earlier outcome's (+0 on a skipped term) (dev review). */}
        {/* The ⚡ is decoration; the figure is said as "plus 11 XP", never "high voltage". */}
        {!practising && (
          <p className={styles.xp}>
            <span aria-hidden="true">{'\u26a1 '}</span>
            {`+${total} XP`}
          </p>
        )}
        {/* What the confidence call did, in words: the number is in the total above. */}
        {!practising && calibration !== 0 && (
          <p className={styles.calibration} data-gives-way>
            {calibration > 0
              ? outcome?.wasSure
                ? 'Sure, and right. Bonus XP added.'
                : 'Not sure, but right. Bonus XP added.'
              : 'You felt sure about this one.'}
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
