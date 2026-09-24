'use client'

import { Suspense, use, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { goToExit } from '@/lib/navigation'
import {
  AppBar,
  Button,
  Chips,
  HintCard,
  MascotSlot,
  ProgressIndicator,
  RecallResult,
  ScreenShell,
  SessionFraction,
  actionRowClass,
} from '@/components'
import { CloseIcon } from '@/components/icons'
import { calibrationFor, confidenceFor, getTerm, hintFor, markHinted, nextAfter, progressFor, recordOutcome, revisitsPending, shownAnswer, TOTAL_TERMS, useSession } from '@/lib/session'
import styles from '../../result.module.css'

// 05 Miss + Hint — Figma frame "05 Miss + Hint (refreshed 2)" (15672:26357).
// One hint, then retry or reveal. There is no second hint (docs/sprint-context.md
// § "Not building this sprint"). Skip is a quiet Tertiary link below the primary pair,
// the placement resolved in the Skip/Reveal comparison.

function MissScreen({ index }: { index: number }) {
  // The hint is on this screen, so the run now contains a hint for this term. Recorded
  // here rather than forwarded down the URL chain: 04a Couldn't hear's retry rebuilds
  // the query from scratch and used to lose `hinted`, so a term that was hinted, then
  // misheard, then answered came back bucketed Unaided and the Recap credited a cold
  // recall the student had been helped with.
  useEffect(() => {
    markHinted(index)
  }, [index])

  const router = useRouter()
  const searchParams = useSearchParams()
  const wasSure = searchParams.get('sure') === '1'
  const current = getTerm(index)
  const attempt = Number(searchParams.get('attempt') ?? '1')
  const state = useSession()
  // The ladder now ends. "Try again" was offered at attempt 10 with byte-identical
  // copy; past REVEAL_AT_ATTEMPT the only way on is the reveal.
  const step = current ? hintFor(current, attempt) : undefined
  // Already incurred, not promised: the tap happened and the answer was wrong.
  const sureCost = confidenceFor(state, index)?.wasSure ? calibrationFor(true, false) : 0

  if (!current) {
    router.replace('/session/intro')
    return null
  }

  function skip() {
    recordOutcome(index, 'Worth revisiting', { wasSure })
    router.push(nextAfter(index))
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
          {/* Attempts 1 and 2 were byte-identical: one hint, same copy, same buttons.
              A second hint is out of scope (sprint-context § "Not building this
              sprint"), so this invents none — it says where the student is on the
              ladder. It lives in the action zone because at the end of the body it
              rendered below the fold, which differentiates a DOM dump and nothing a
              student can see. */}
          {step?.canRetry && attempt >= 2 && (
            <p className={styles.ladderNote}>One more go, then I&rsquo;ll show you the answer.</p>
          )}
          {/* The frame's `primaryRow`: two buttons side by side, with Skip as plain
              text beneath. The XP line moves up into the content region, where the
              frame puts it in the app bar area rather than the action zone. */}
          <div className={actionRowClass}>
            {/* Reveal is the Secondary and Try again is the Primary, per the frame
                and SPEC #5. They were inverted, which made giving up the emphasised
                choice on a screen whose whole job is to invite another attempt. */}
            <Button
              CTA="Reveal answer"
              variant={step?.canRetry ? 'Secondary' : 'Primary'}
              size="M"
              onClick={() => router.push(`/session/reveal/${index}`)}
            />
            {/* Try again goes to an IDLE beat, not a live mic. It used to push straight
                to /session/recording, so the timer was already running when the screen
                arrived — no chance to gather yourself right after being told you were
                wrong, and the hint you were about to use vanished with the screen. Two
                students in testing named it as the moment they would put the phone
                down, and one lost a 19-second take to it, mostly silence. 01 Idle
                carries the hint through and starts when the student taps. */}
            {step?.canRetry && (
              <Button
                CTA="Try again"
                variant="Primary"
                size="M"
                onClick={() => router.push(`/session/idle/${index}?attempt=${step.nextAttempt}&hinted=1`)}
              />
            )}
          </div>
          {/* No "See the full transcript" here. The card above already shows "You
              said" and the transcript, so it repeated what was on screen — and it
              opened the REVEALED sheet, which appends the definition. A tertiary link
              was handing over the answer that "Reveal answer" exists to give, except
              Reveal pays 0 XP while this route left the +7 and Try again intact.
              The sheet is still reached from every Recap row. */}
          {/* "Skip", like the other ten. sprint-context: "Skip has one placement and one
              label… two labels for one escape was the clearer problem." This screen was
              the one holdout. The cost is disclosed by the Recap's own bucket, not by a
              label that exists on one screen out of eleven. */}
          <Button CTA="Skip" variant="Tertiary" size="M" fullWidth onClick={skip} />
        </div>
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="determined" className={styles.mascotCentred} />
        {/* No PROVISIONAL XP here. "⚡ +7" sat in the same slot and style as the earned
            "+10" on 04 Pass while Reveal pays 0 — a promise dressed as a balance.
            sprint-context.md, 2026-09-22.

            The confidence cost is different and stays: being sure and wrong is already
            settled, not a promise, and hiding it would mean the one screen where that
            cost is incurred never mentions it. */}
        <div className={styles.verdictRow}>
          <Chips Text="Partially right" size="S" color="Partial" active showLeftIcon={false} showRightIcon={false} />
          {sureCost ? <p className={styles.calibration}>{`${sureCost} · you were sure`}</p> : null}
        </div>
        <RecallResult state="Miss" title={current.missTitle} transcript={`“${shownAnswer(index, 'Miss')}”`} />
        <HintCard body={step?.hint ?? current.hint} />
      </div>
    </ScreenShell>
  )
}

export default function MissPage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = use(params)
  return (
    <Suspense fallback={null}>
      <MissScreen index={Number(term)} />
    </Suspense>
  )
}
