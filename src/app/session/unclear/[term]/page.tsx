'use client'

import { Suspense, use, useEffect } from 'react'
import { useRedirect } from '@/lib/navigation'
import { useRouter, useSearchParams } from 'next/navigation'
import { SessionBar } from '../../SessionBar'
import { micRegionClass, Button, ChatBubble, MascotSlot, MicButton, MicCaption, RecallResult, ScreenShell } from '@/components'
import { getTerm, micGate, nextAfter, recordOutcome, markMicFault, isPractising, questionTitle, useSession } from '@/lib/session'
import styles from './unclear.module.css'

// 04a Couldn't hear — Figma frame "04a Couldn't hear (refreshed)" (15672:24583).
// A third, visually neutral result: system failure, not a wrong answer. No XP, because
// nothing has been resolved yet. dazed is reserved for exactly this state — a puzzled
// Knowie reads as the app being confused, not the student failing.

function UnclearScreen({ index }: { index: number }) {
  const router = useRouter()
  const sessionState = useSession()
  const searchParams = useSearchParams()
  const wasSure = searchParams.get('sure') === '1'
  const current = getTerm(index)
  const attempt = Number(searchParams.get('attempt') ?? '1')
  const door = searchParams.get('door')
  // A second mishear is a different situation from the first. History: docs/code-history.md#h-085
  const repeated = attempt >= 2
  // The mic failed on this term, so typing it from here is not typing by choice: it
  // pays in full (designer, 2026-10-12).
  useEffect(() => {
    markMicFault(index)
  }, [index])

  useRedirect(!current, '/session/resume')

  if (!current) return null

  function retry() {
    router.push(micGate(`/session/recording/${index}?attempt=${attempt + 1}${door ? `&door=${door}` : ''}`, `/text/turn?term=${index}`))
  }

  function skip() {
    // Mic trouble, not a miss: the app failed here (designer, 2026-10-12).
    recordOutcome(index, 'Worth revisiting', { wasSure, micTrouble: true })
    router.push(nextAfter(index))
  }

  return (
    <ScreenShell
      mic={
        <div className={micRegionClass}>
          <MicButton state="Idle" label="Say it again" onClick={retry} />
          {/* The retry, named where it is (senior review, 2026-10-12). */}
          <MicCaption body="Say it again" />
        </div>
      }
      // Knowie stays (designer, 2026-10-14: "bring back Knowie on I didn't catch that"):
      // on a short screen the repeated question gives way, never the mascot.
      mascotGivesWay={false}
      topNavigation={<SessionBar index={index} door={door} onSkip={skip} />}
      bottomContent={
        <div className={styles.actions}>
          {/* On a repeat mishear typing leads, because the mic has now failed twice. */}
          <Button
            CTA="Type instead"
            variant={repeated ? 'Primary' : 'Secondary'}
            size="M"
            fullWidth
            onClick={() => router.push(`/text/turn?term=${index}`)}
          />
        </div>
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="dazed" />
        {/* No `onRetry` tag. This screen's whole job is "say it again" and the retry was
            a text chip inside the card, with the mic nowhere on a screen recovering
            from a voice failure. The control below IS the retry, so the tag would be a
            second control doing one thing — which is what the tag was added to avoid. */}
        <RecallResult
          className={styles.card}
          state="CouldntHear"
          title={repeated ? 'Still not coming through.' : 'I didn’t catch that.'}
          transcript={
            repeated
              // Was "…Type X instead, or try once more", which narrated the two
              // controls already on the screen. The line's job is to say whose fault
              // it is; the mic and "Type instead" say what to do about it.
              ? `Twice now. That’s the mic, not you.`
              // Attempt 1 is a say-again, not a retry of the answer: the mic missed it, so
              // the same answer is fine (designer, 2026-10-08).
              : `The mic didn’t pick you up. Say the same answer again, a little closer.`
          }
        />
        {/* The question stays (Knowunity design review, 2026-10-13; live 26 keeps it):
            Under the status, which is the screen's message, so at 390x668 it is the
            question that scrolls, not the reassurance. Without it the screen was a lone error card after six seconds of talking. */}
        {/* Gives way when it cannot fit (390x668): a card cut to its top edge read as
            a stray outline (craft and system critics, 2026-10-13). The reassurance
            above is the screen's message; the question is on the next take's screen. */}
        <div data-gives-way className={styles.card}>
          <ChatBubble showTitle title={questionTitle(current.index, isPractising(sessionState))} titleAccent={current.name} body={current.prompt} />
        </div>

        {/* The same fixed region as every other voice screen, so the control the
            student is being asked to use again is exactly where they last used it. */}
      </div>
    </ScreenShell>
  )
}

export default function UnclearPage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = use(params)
  return (
    <Suspense fallback={null}>
      <UnclearScreen index={Number(term)} />
    </Suspense>
  )
}
