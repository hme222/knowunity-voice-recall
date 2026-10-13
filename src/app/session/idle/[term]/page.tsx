'use client'

import { Suspense, use, useEffect } from 'react'
import { useRedirect } from '@/lib/navigation'
import { useRouter, useSearchParams } from 'next/navigation'
import { SessionBar } from '../../SessionBar'
import {
  micRegionClass,
  Button,
  ChatBubble,
  MascotSlot,
  MicButton,
  MicCaption,
  ScreenShell,
} from '@/components'
import { ensureSessionStarted, getTerm, hintFor, micGate, missCount, isPractising, nextAfter, recordOutcome, useSession, useSticky } from '@/lib/session'
import { CueText } from '@/app/drill/Cue'
import styles from './idle.module.css'

// 01 Idle / Commit — Figma frame "01 Idle (refreshed 2)" (15672:26255).
// One state. "Commit" describes this screen; it is not a second state — see
// docs/sprint-context.md § "Core loop, decided".

function IdleScreen({ index }: { index: number }) {
  const router = useRouter()
  // `door` marks a run that arrived from an entry door rather than from the chip. It
  // rides the whole take so the run can land on the door's own result.
  const params = useSearchParams()
  const door = params.get('door')
  // A retry after a hint arrives HERE rather than straight into a live mic. The hint
  // rides along so it is still on screen while the student composes, and the attempt
  // number so the ladder does not reset.
  const retryAttempt = params.get('attempt')
  const hinted = params.get('hinted') === '1'
  const forward = new URLSearchParams()
  if (door) forward.set('door', door)
  if (retryAttempt) forward.set('attempt', retryAttempt)
  if (hinted) forward.set('hinted', '1')
  const onward = forward.toString() ? `?${forward}` : ''
  const current = getTerm(index)
  // voice-ux.md §3: a denied mic stays denied for the session. It used to survive one
  // turn — /text/turn then Continue handed the student straight back to a mic screen.
  const sticky = useSticky()
  const state = useSession()
  const practising = isPractising(state)
  // The rung the last miss reached: from the second, the retry carries the gap.
  const gap = current && hinted ? hintFor(current, missCount(state, index)).gap : undefined
  useEffect(() => {
    if (sticky) router.replace(`/text/turn?term=${index}&sticky=1`)
  }, [sticky, index, router])
  // Start the session clock here rather than only on 00 Intro. History: docs/code-history.md#h-054
  useEffect(() => {
    ensureSessionStarted()
  }, [])

  useRedirect(!current, '/session/resume')
  if (sticky) return null

  if (!current) return null

  function skip() {
    recordOutcome(index, 'Worth revisiting')
    router.push(nextAfter(index))
  }

  return (
    <ScreenShell
      mic={
        <div className={micRegionClass}>
          <MicButton state="Idle" onClick={() => router.push(micGate(`/session/recording/${index}${onward}`, `/text/turn?term=${index}`))} />
          {/* The hint lives UNDER the mic, not as a card above it — locked by the
              designer 2026-10-07. As a card it could not fit: at 390x668 the question
              alone fills the content box, and the hint scrolled out of sight. Here it
              is on screen at every height, beside the control it is for. */}
          {/* No "Start speaking" caption on a first try (designer, 2026-10-13): the mic
              speaks for itself and its accessible name is still "Start speaking". The
              caption under the mic is kept for the hint on a retry. */}
          {hinted && gap ? (
            <MicCaption label="Fill the gap" body={<CueText text={gap} />} />
          ) : hinted ? <MicCaption label="Hint" body={current.hint} /> : null}
        </div>
      }
      topNavigation={<SessionBar index={index} door={door} onSkip={skip} label={practising ? `Practice · ${current.name}` : undefined} />}
      bottomContent={
        <div className={styles.actions}>
          {/* The typed turn has offered this since it was built; the spoken turn only
              had Skip, so a student who genuinely did not know had to record nothing
              or take the no-XP exit. Same escape, both paths. */}
          {/* Type instead first, full width, in the same place on every voice screen;
              Skip is top right in the SessionBar (designer, 2026-10-08). */}
          {/* Secondary over a Tertiary link: the designer's hierarchy, restored
              2026-10-13. The senior review had made it text-weight (2026-10-12). */}
          <Button
            CTA="Type instead"
            variant="Secondary"
            size="M"
            fullWidth
            onClick={() => router.push(`/text/turn?term=${index}`)}
          />
          <Button
            CTA="I don't know this one"
            variant="Tertiary"
            size="S"
            fullWidth
            onClick={() => router.push(`/session/blank/${index}`)}
          />
        </div>
      }
    >
      <div className={styles.body}>
        {/* Mascot ABOVE the bubble, as the frame has it. The build had the bubble
            first and the mascot pushed to the bottom by margin-top:auto, which left a
            170px hole between them and put Knowie beside the mic instead of over the
            question. */}
        {/* `excited` from 2026-09-23. This is the ask — "Explain: formal charge" — and
            the half-lidded working face read as unimpressed at the student before they
            had said anything. The invitation faces are the excited ones. */}
        <MascotSlot size="2XL" expression={hinted ? 'thinking' : 'standby'} />
        <ChatBubble
          className={styles.bubble}
          showTitle
          title="Explain: "
          titleAccent={current.name}
          body={current.prompt}
        />
      </div>
    </ScreenShell>
  )
}

export default function IdlePage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = use(params)
  return (
    <Suspense fallback={null}>
      <IdleScreen index={Number(term)} />
    </Suspense>
  )
}
