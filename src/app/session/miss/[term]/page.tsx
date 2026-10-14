'use client'

import { Suspense, use, useEffect } from 'react'
import { useRedirect } from '@/lib/navigation'
import { useRouter, useSearchParams } from 'next/navigation'
import { SessionBar } from '../../SessionBar'
import {
  Button,
  Chips,
  HintCard,
  MascotSlot,
  RecallResult,
  ScreenShell,
  actionRowClass,
} from '@/components'
import { confidenceFor, getTerm, hintFor, markHinted, nextAfter, recordOutcome, shownAnswer, useSession, missCount } from '@/lib/session'
import { CueText } from '@/app/drill/Cue'
import styles from '../../result.module.css'

// 05 Miss + Hint — Figma frame "05 Miss + Hint (refreshed 2)" (15672:26357).
// The hint, then retry or reveal. The second miss adds the drill's first-letter gap
// (designer, 2026-10-13, option B); the third offers only the reveal. Skip is in the
// top bar, as on every turn screen.

function MissScreen({ index }: { index: number }) {
  // The hint is on this screen, so the run now contains a hint for this term. History: docs/code-history.md#h-056
  useEffect(() => {
    markHinted(index)
  }, [index])

  const router = useRouter()
  const searchParams = useSearchParams()
  const wasSure = searchParams.get('sure') === '1'
  const current = getTerm(index)
  // A typed answer too short to check (/text/checking sets it). No partial credit is
  // claimed for words the student never wrote.
  const thin = searchParams.get('thin') === '1'
  const state = useSession()
  // The rung comes from the run, not the URL (dev review, 2026-10-12): the typed path
  // dropped `attempt`, so its ladder never ended, and a mishear's retry bumped it.
  const attempt = Math.max(1, missCount(state, index))
  // The ladder now ends. "Try again" was offered at attempt 10 with byte-identical
  // copy; past REVEAL_AT_ATTEMPT the only way on is the reveal.
  const step = current ? hintFor(current, attempt) : undefined
  // Where the student is on the ladder, as the card's headline (designer, 2026-10-12, from the usability review). History: docs/code-history.md#h-057
  // A typed answer the mock cannot read; its canned partial does not apply (8a).
  const typedMiss = Boolean(state.sentTyped?.[index]) && !thin
  const partialCredit = !thin && !typedMiss && current?.partialKind !== 'wrong'
  const lastRung = step ? !step.canRetry : false
  const missHeadline = lastRung
    ? 'That’s three tries. Let’s look at the answer.'
    : attempt >= 2
      ? 'One more go, then I’ll show you the answer.'
      : thin
        ? 'Start from the hint, then have another go.'
        : typedMiss
          // The fixture title describes the canned spoken partial, not what was typed.
          // Not "Not there yet": the chip above already says "Not quite yet".
          ? 'Build on the hint below, then have another go.'
          : current?.missTitle ?? ''
  // Already incurred, not promised: the tap happened and the answer was wrong.
  const wasSureHere = Boolean(confidenceFor(state, index)?.wasSure)

  useRedirect(!current, '/session/resume')

  if (!current) return null

  function skip() {
    recordOutcome(index, 'Worth revisiting', { wasSure })
    router.push(nextAfter(index))
  }

  return (
    <ScreenShell
      // Knowie stays, smaller on a short screen (designer, 2026-10-13: "Knowie missing").
      topNavigation={<SessionBar index={index} onSkip={skip} />}
      bottomContent={
        <div className={styles.actions}>
          {/* Button tiers by role (designer, 2026-10-13): Try again moves forward, so
              it is the full-width Primary; Reveal answer gives up the attempt, so it is
              the Tertiary link centred beneath. The frame's side-by-side pair made
              Reveal a grey pill identical to 01 Idle's "Type instead". On the last
              rung Reveal is the only way on, so it is the Primary, centred. */}
          {step?.canRetry ? (
            <>
              {/* Try again goes to an IDLE beat, not a live mic. History: docs/code-history.md#h-058 */}
              <Button
                CTA="Try again"
                variant="Primary"
                size="M"
                fullWidth
                // Back the way they answered: a typed miss retries typed, with the hint,
                // not on the mic screen (UX critic, 2026-10-13).
                onClick={() => router.push(typedMiss ? `/text/turn?term=${index}&hinted=1` : `/session/idle/${index}?attempt=${step.nextAttempt}&hinted=1`)}
              />
              <Button CTA="Show the answer" variant="Tertiary" size="S" fullWidth onClick={() => router.push(`/session/reveal/${index}`)} />
            </>
          ) : (
            <div className={`${actionRowClass} ${styles.rowSingle}`}>
              <Button CTA="Show the answer" variant="Primary" size="M" onClick={() => router.push(`/session/reveal/${index}`)} />
            </div>
          )}
          {/* No "See the full transcript" here. History: docs/code-history.md#h-059 */}
          {/* "Skip", like the other ten. sprint-context: "Skip has one placement and one
              label… two labels for one escape was the clearer problem." This screen was
              the one holdout. The cost is disclosed by the Recap's own bucket, not by a
              label that exists on one screen out of eleven. */}
        </div>
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression={lastRung ? 'sad' : partialCredit ? 'thinking' : 'confused'} className={styles.mascotCentred} />
        {/* No PROVISIONAL XP here. History: docs/code-history.md#h-060 */}
        {/* No "Partially right" on the last rung: it sat over "That's three tries" and
            read as a contradiction (Duolingo design review, 2026-10-13). */}
        {/* The chip, and the confident miss named quietly on the same line: as a bold
            line of its own it outweighed the card's title (designer, 2026-10-13: "the
            UI looks off"). On the last rung, the note alone. */}
        {(!lastRung || wasSureHere) && (
          <div className={styles.verdictRow}>
            {!lastRung && (
              // The chip is visual; its words are announced in the card's live region.
              <span aria-hidden="true">
                <Chips
                  Text={partialCredit ? 'Partially right' : thin ? 'Not enough to check' : 'Not quite yet'}
                  size="S"
                  color={partialCredit ? 'Partial' : 'Primary'}
                  active={partialCredit}
                  showLeftIcon={false}
                  showRightIcon={false}
                />
              </span>
            )}
            {wasSureHere && <p className={styles.sureNote}>You felt sure about this one. Worth a second look.</p>}
          </div>
        )}

        {/* Attempt 2 drops "You said" so the hint is on screen without scrolling —
            designer, 2026-10-08. The first miss still echoes the take. */}
        {/* Neutral card, amber chip: "partially right" is not "wrong", and the red Miss
            card said it was. One look for a partial in both flows (designer,
            2026-10-12); the chip carries the verdict. */}
        <RecallResult
          state="Neutral"
          verdict={lastRung ? undefined : partialCredit ? 'Partially right' : thin ? 'Not enough to check' : 'Not quite yet'}
          title={missHeadline}
          transcript={`“${shownAnswer(index, 'Miss', state)}”`}
          label={state.sentTyped?.[index] ? 'You wrote' : undefined}
          // The student's own words on every rung (UX critic and reach, 2026-10-13): on
          // the second miss the chip sat over nothing, and the take is what the hint
          // is meant to be read against. The body scrolls at 390x668 if it must.
          showTranscript
        />
        {/* Rung 2 hands over more: the definition around the missed word, its first
            letter given and the rest a drawn blank, as the drill's letter rung does. */}
        {step?.gap && step.canRetry ? (
          <HintCard label="Fill the gap" body={<CueText text={step.gap} />} />
        ) : (
          <HintCard body={step?.hint ?? current.hint} />
        )}
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
