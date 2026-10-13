'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRedirect } from '@/lib/navigation'
import { useRouter, useSearchParams } from 'next/navigation'
import { SessionBar } from '../../session/SessionBar'
import { actionRowClass, Button, ChatBubble, MascotSlot, ScreenShell } from '@/components'
import { getTerm, nextAfter, recordOutcome, setSticky, sendTypedAnswer, setTypedAnswer, typedDraft, useSticky, SUBJECT, advancePractice, isPractising, useSession } from '@/lib/session'
import { DrillBar } from '../../drill/DrillBar'
import styles from '../text.module.css'

// The text fallback turn. History: docs/code-history.md#h-093

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
  // Seeded from the student's own draft, and from NOTHING ELSE. History: docs/code-history.md#h-094
  const state = useSession()
  const [edited, setAnswer] = useState<string | null>(null)
  const answer = edited ?? typedDraft(state, index)

  // The URL flag and the session flag were two sources of truth that disagreed. History: docs/code-history.md#h-095
  useEffect(() => {
    if (urlSticky && !sessionSticky) setSticky()
  }, [urlSticky, sessionSticky])

  // The escapes the voice turn has. Without these a student on the denied-mic path had
  // exactly two controls, an X and a disabled Send, which breaks the brief's hard
  // constraint on the one screen written for a student who cannot speak.
  function skip() {
    // Inside a drill, Skip leaves the drill as the drill's own Skip does. It used to
    // record a skip into the graded run and jump to session term 2 (dev review).
    if (drillStep) {
      router.push(isPractising() ? advancePractice() : '/picker')
      return
    }
    recordOutcome(index, 'Worth revisiting')
    router.push(nextAfter(index))
  }

  useRedirect(!current, '/session/resume')

  if (!current) return null

  return (
    <ScreenShell
      topNavigation={
        drillStep ? (
          <DrillBar step={Number(drillStep)} onExit={() => router.push('/picker')} onSkip={skip} />
        ) : (
          <SessionBar index={index} onSkip={skip} />
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
              sendTypedAnswer(index, answer)
              router.push(
                `/text/checking?term=${index}&len=${answer.trim().length}${sticky ? '&sticky=1' : ''}${drillStep ? `&drill=${drillStep}` : ''}`,
              )
            }}
          />
          {/* Centred, as 01 Idle centres "Type instead": the pair reads as one family
              (coherence critic, 2026-10-13). */}
          <div className={`${actionRowClass} ${styles.rowCentred}`}>
            {!sticky && (
              <Button
                CTA="Say it instead"
                variant="Tertiary"
                size="S"
                onClick={() => router.push(drillStep ? `/drill/pass/${drillStep}` : `/session/idle/${index}`)}
              />
            )}
            {/* Not in a drill: the blank path is the session's, and it records there. */}
            {!drillStep && (
              <Button
                CTA="I don't know this one"
                variant="Tertiary"
                size="S"
                onClick={() => router.push(`/session/blank/${index}`)}
              />
            )}
          </div>
        </div>
      }
    >
      <div className={styles.body}>
        {/* Knowie and the accented term, as on every voice screen. History: docs/code-history.md#h-096 */}
        <MascotSlot size="2XL" expression="excited" className={styles.mascotCentred} />
        <ChatBubble showTitle title={`${SUBJECT} · Explain: `} titleAccent={current.name} body={current.prompt} />
        <label>
          <textarea
            className={styles.field}
            value={answer}
            onChange={(e) => { setAnswer(e.target.value); setTypedAnswer(index, e.target.value) }}
            placeholder="Type your answer…"
            aria-label="Your answer"
          />
        </label>
      </div>
    </ScreenShell>
  )
}

// Keyed by term so the draft state starts fresh per question. Next keeps page state
// when only the query changes, so /text/turn?term=1 → ?term=2 used to carry term 1's
// typed text into term 2 (dev review, 2026-10-12).
function KeyedTextTurn() {
  const term = useSearchParams().get('term') ?? '1'
  return <TextTurnScreen key={term} />
}

export default function TextTurnPage() {
  return (
    <Suspense fallback={null}>
      <KeyedTextTurn />
    </Suspense>
  )
}
