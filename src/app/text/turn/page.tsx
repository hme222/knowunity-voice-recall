'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRedirect } from '@/lib/navigation'
import { useRouter, useSearchParams } from 'next/navigation'
import { SessionBar } from '../../session/SessionBar'
import { Button, ChatBubble, MascotSlot, ScreenShell, HintCard, TextInput } from '@/components'
import { Cue, CueText } from '@/app/drill/Cue'
import drillStyles from '../../drill/drill.module.css'
import { hintFor, missCount, getTerm, nextAfter, recordOutcome, setSticky, sendTypedAnswer, setTypedAnswer, typedDraft, useSticky, advancePractice, isPractising, questionTitle, useSession, drillRung, useDrillTerm } from '@/lib/session'
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
  const hinted = searchParams.get('hinted') === '1'
  const sessionSticky = useSticky()
  const urlSticky = searchParams.get('sticky') === '1'
  const sticky = urlSticky || sessionSticky
  const current = getTerm(index)
  // In a drill, the rung's own cue — "Define:" and the thinned definition — not the
  // session's "Explain:" question (UX critic, 2026-10-13).
  const drillTerm = useDrillTerm()
  const rung = drillStep ? drillRung(drillTerm, Number(drillStep)) : undefined
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
          {/* One link under Send: the way back to the mic. "I don't know this one"
              moved up to the question it answers (designer, 2026-10-14: two links on
              one row read as clutter), so this zone matches 01 Idle's. Typed mode after
              a denial was for the whole session; once the mic is back on, the student
              can return through the permission prompt (designer, 2026-10-13, option C). */}
          {sticky && !drillStep ? (
            <Button
              CTA="Mic back on? Speak instead"
              variant="Tertiary"
              size="S"
              fullWidth
              onClick={() =>
                router.push(
                  `/permission/prompt?next=${encodeURIComponent(`/session/recording/${index}`)}&alt=${encodeURIComponent(`/text/turn?term=${index}`)}`,
                )
              }
            />
          ) : !sticky ? (
            <Button
              CTA="Say it instead"
              variant="Tertiary"
              size="S"
              fullWidth
              onClick={() => router.push(drillStep ? `/drill/pass/${drillStep}` : `/session/idle/${index}`)}
            />
          ) : null}
        </div>
      }
    >
      <div className={styles.body}>
        {/* Knowie and the accented term, as on every voice screen. History: docs/code-history.md#h-096 */}
        <MascotSlot size="2XL" expression={rung ? 'thinking' : 'standby'} className={styles.mascotCentred} />
        {rung ? (
          <>
            <p className={`${drillStyles.termPill} ${styles.pill}`}>
              Define: <span className={drillStyles.termPillName}>{drillTerm.name}</span>
            </p>
            <div className={drillStyles.cueCard}>
              <Cue className={drillStyles.cueBody} text={rung.cue} />
            </div>
          </>
        ) : (
          <div className={styles.question}>
            <ChatBubble showTitle title={questionTitle(current.index, isPractising(state))} titleAccent={current.name} body={current.prompt} />
            {/* Under the question it answers, not in the action zone (designer,
                2026-10-14). Not in a drill: the blank path is the session's. */}
            <Button
              CTA="I don't know this one"
              variant="Tertiary"
              size="S"
              className={styles.dontKnow}
              onClick={() => router.push(`/session/blank/${index}`)}
            />
          </div>
        )}
        {/* A typed retry carries its hint, as the spoken retry does under the mic. */}
        {hinted && (() => {
          const gap = hintFor(current, missCount(state, index)).gap
          return gap ? <HintCard label="Fill the gap" body={<CueText text={gap} />} /> : <HintCard body={current.hint} />
        })()}
        {/* No helper line under the field: "Type your answer to send it." repeated the
            placeholder, and a disabled Send says the rest (designer, 2026-10-14). */}
        <TextInput
          variant="multi"
          label="Your answer"
          placeholder="Type your answer…"
          value={answer}
          onChange={(v) => { setAnswer(v); setTypedAnswer(index, v) }}
        />
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
