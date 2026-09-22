'use client'

import { Suspense, use } from 'react'
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
import { answerFor, getTerm, hintFor, nextAfter, progressFor, recordOutcome, revisitsPending, TOTAL_TERMS } from '@/lib/session'
import styles from '../../result.module.css'

// 05 Miss + Hint — Figma frame "05 Miss + Hint (refreshed 2)" (15672:26357).
// One hint, then retry or reveal. There is no second hint (docs/sprint-context.md
// § "Not building this sprint"). Skip is a quiet Tertiary link below the primary pair,
// the placement resolved in the Skip/Reveal comparison.

function MissScreen({ index }: { index: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const wasSure = searchParams.get('sure') === '1'
  const current = getTerm(index)
  const attempt = Number(searchParams.get('attempt') ?? '1')
  // The ladder now ends. "Try again" was offered at attempt 10 with byte-identical
  // copy; past REVEAL_AT_ATTEMPT the only way on is the reveal.
  const step = current ? hintFor(current, attempt) : undefined

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
            {step?.canRetry && (
              <Button
                CTA="Try again"
                variant="Primary"
                size="M"
                onClick={() => router.push(`/session/recording/${index}?attempt=${step.nextAttempt}&hinted=1`)}
              />
            )}
          </div>
          {/* No "See the full transcript" here. The card above already shows "You
              said" and the transcript, so it repeated what was on screen — and it
              opened the REVEALED sheet, which appends the definition. A tertiary link
              was handing over the answer that "Reveal answer" exists to give, except
              Reveal pays 0 XP while this route left the +7 and Try again intact.
              The sheet is still reached from every Recap row. */}
          <Button CTA="Skip · no XP" variant="Tertiary" size="S" fullWidth onClick={skip} />
        </div>
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="determined" className={styles.mascotCentred} />
        {/* No XP here. It read "⚡ +7" in the same slot and style as the earned "+10"
            on 04 Pass, while Reveal pays 0 and Skip says "no XP" — a promise dressed as
            a balance. XP is shown where it is earned: Pass, the repeat, and Recap.
            sprint-context.md, 2026-09-22. */}
        <Chips Text="Partially right" size="S" color="Partial" active showLeftIcon={false} showRightIcon={false} />
        <RecallResult state="Miss" title={current.missTitle} transcript={`“${answerFor(index)}”`} />
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
