'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { goToExit } from '@/lib/navigation'
import { actionRowClass, AppBar, Button, ChatBubble, ProgressIndicator, ScreenShell, SessionFraction } from '@/components'
import { CloseIcon } from '@/components/icons'
import { getTerm, nextAfter, progressFor, recordOutcome, revisitsPending, setSticky, setTypedAnswer, TOTAL_TERMS, useSticky } from '@/lib/session'
import { DrillBar } from '../../drill/DrillBar'
import styles from '../text.module.css'

// The text fallback turn. Not a "nice to have": some students can't speak, and many
// more can't speak right now — a library, a shared room, a bus. voice-ux Principle 5.
//
// No Recording or Processing equivalent is needed. The student types, submits, a brief
// checking beat covers judging, and the same result branches follow.
//
// `sticky=1` arrives from a denied mic: the mic can't work, so it isn't re-offered.
// Situational typing (from 01 Idle's "Type instead") reverts to the mic next term.

function TextTurnScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const index = Number(searchParams.get('term') ?? '1')
  // A drill turn borrows this screen; without knowing that, Send routed into the
  // session and a student practising one definition came out inside a 4-term run on a
  // different term.
  const drillStep = searchParams.get('drill')
  const sessionSticky = useSticky()
  const urlSticky = searchParams.get('sticky') === '1'
  const sticky = urlSticky || sessionSticky
  const current = getTerm(index)
  const [answer, setAnswer] = useState('')

  // The URL flag and the session flag were two sources of truth that disagreed. This
  // screen treated `?sticky=1` as equal to the stored flag and hid "Use the mic
  // instead" on it — but `typedByChoice`, which decides whether the answer is priced at
  // +10 or the typed-by-choice +7, reads only the stored one. So a turn reached by URL
  // showed a student their mic was unavailable and then charged them for not using it.
  // In the built flow 01 Idle only redirects here once the flag is already stored, so
  // this never fired by clicking; it fires the moment anyone opens the route directly,
  // which on a prototype meant for review is a path that gets taken.
  useEffect(() => {
    if (urlSticky && !sessionSticky) setSticky()
  }, [urlSticky, sessionSticky])

  // The escapes the voice turn has. Without these a student on the denied-mic path had
  // exactly two controls, an X and a disabled Send, which breaks the brief's hard
  // constraint on the one screen written for a student who cannot speak.
  function skip() {
    recordOutcome(index, 'Worth revisiting')
    router.push(nextAfter(index))
  }

  if (!current) {
    router.replace('/session/intro')
    return null
  }

  return (
    <ScreenShell
      topNavigation={
        drillStep ? (
          // A drill turn borrows this screen, and it was wearing the session's chrome:
          // a "1/4" fraction and a Questions bar, on a screen reached from a drill the
          // student is one definition into. The drill's own bar says where they are.
          <DrillBar step={Number(drillStep)} onExit={() => router.push('/picker')} />
        ) : (
          <>
            <AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Leave" onLeft={() => goToExit(router)}>
              <ProgressIndicator progress={progressFor(index)} thickness="16" label="Questions" current={index} total={TOTAL_TERMS} />
            </AppBar>
            <SessionFraction current={index} total={TOTAL_TERMS} moreToCome={revisitsPending()} />
          </>
        )
      }
      bottomContent={
        <div className={styles.actions}>
          {/* One row, one link. This zone held FOUR stacked buttons and measured 248px
              against a 136 budget — Send, the voice escape, the blank escape and Skip,
              all full width, all equal weight. Send leads; the two escapes share the
              row beneath it; Skip is the quiet link the frames put last. */}
          <Button
            CTA="Send"
            variant="Primary"
            size="M"
            fullWidth
            state={answer.trim() ? 'Default' : 'Disabled'}
            onClick={() => {
              // Keep the student's own words: the result screens echo these back
              // instead of the fixture. See answerFor() in src/lib/session.ts.
              setTypedAnswer(index, answer)
              router.push(
                `/text/checking?term=${index}&len=${answer.trim().length}${sticky ? '&sticky=1' : ''}${drillStep ? `&drill=${drillStep}` : ''}`,
              )
            }}
          />
          <div className={actionRowClass}>
            {!sticky && (
              <Button
                CTA="Say it instead"
                variant="Tertiary"
                size="S"
                onClick={() => router.push(drillStep ? `/drill/pass/${drillStep}` : `/session/idle/${index}`)}
              />
            )}
            <Button
              CTA="I don't know this one"
              variant="Tertiary"
              size="S"
              onClick={() => router.push(`/session/blank/${index}`)}
            />
            <Button CTA="Skip" variant="Tertiary" size="S" onClick={skip} />
          </div>
        </div>
      }
    >
      <div className={styles.body}>
        <ChatBubble showTitle title={current.title} body={current.prompt} />
        <label>
          <span className="sr-only">Your answer</span>
          <textarea
            className={styles.field}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer…"
            aria-label="Your answer"
          />
        </label>
      </div>
    </ScreenShell>
  )
}

export default function TextTurnPage() {
  return (
    <Suspense fallback={null}>
      <TextTurnScreen />
    </Suspense>
  )
}
