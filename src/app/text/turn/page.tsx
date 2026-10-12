'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRedirect } from '@/lib/navigation'
import { useRouter, useSearchParams } from 'next/navigation'
import { SessionBar } from '../../session/SessionBar'
import { actionRowClass, Button, ChatBubble, MascotSlot, ScreenShell } from '@/components'
import { getTerm, nextAfter, recordOutcome, setSticky, sendTypedAnswer, setTypedAnswer, typedDraft, useSticky, SUBJECT, advancePractice, isPractising, useSession } from '@/lib/session'
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
  // Seeded from the student's own draft, and from NOTHING ELSE. The draft lived in
  // component state only, so Leave → "Keep learning" came back to an empty box on a
  // flow whose exit screen says "Your progress is saved"; it is written on every
  // keystroke now, which is what makes coming back mean anything.
  //
  // The first version of this seeded from `answerFor`, which falls back to the canned
  // transcript — so on a first visit the box opened pre-filled with the correct answer.
  // I verified the round trip (type, leave, return) and never opened the screen cold,
  // which is the only path where the fallback fires.
  // The saved draft comes from the store (same snapshot on server and client), until the
  // student types; reading storage in the initializer mismatched on hydration (dev
  // review, 2026-10-12).
  const state = useSession()
  const [edited, setAnswer] = useState<string | null>(null)
  const answer = edited ?? typedDraft(state, index)

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
    // Inside a drill, Skip leaves the drill as the drill's own Skip does. It used to
    // record a skip into the graded run and jump to session term 2 (dev review).
    if (drillStep) {
      router.push(isPractising() ? advancePractice() : '/picker')
      return
    }
    recordOutcome(index, 'Worth revisiting')
    router.push(nextAfter(index))
  }

  useRedirect(!current, '/session/intro')

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
          <div className={actionRowClass}>
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
        {/* Knowie and the accented term, as on every voice screen. The typed path rendered
            the title as one flat white string and had no mascot at all — voice-ux calls
            text "an equal path, not a downgrade", and it was visibly the lesser one.
            ChatBubble's own doc records why the accent exists: without it "the one word
            the screen is about had no emphasis at all". */}
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
