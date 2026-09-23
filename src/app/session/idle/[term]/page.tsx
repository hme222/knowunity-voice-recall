'use client'

import { Suspense, use, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { goToExit } from '@/lib/navigation'
import {
  actionRowClass,
  micRegionClass,
  AppBar,
  Button,
  ChatBubble,
  MascotSlot,
  MicButton,
  ProgressIndicator,
  ScreenShell,
  SessionFraction,
} from '@/components'
import { CloseIcon } from '@/components/icons'
import { ensureSessionStarted, getTerm, nextAfter, progressFor, recordOutcome, revisitsPending, TOTAL_TERMS, useSticky } from '@/lib/session'
import styles from './idle.module.css'

// 01 Idle / Commit — Figma frame "01 Idle (refreshed 2)" (15672:26255).
// One state. "Commit" describes this screen; it is not a second state — see
// docs/sprint-context.md § "Core loop, decided".

function IdleScreen({ index }: { index: number }) {
  const router = useRouter()
  // `door` marks a run that arrived from an entry door rather than from the chip. It
  // rides the whole take so the run can land on the door's own result.
  const door = useSearchParams().get('door')
  const doorQuery = door ? `?door=${door}` : ''
  const current = getTerm(index)
  // voice-ux.md §3: a denied mic stays denied for the session. It used to survive one
  // turn — /text/turn then Continue handed the student straight back to a mic screen.
  const sticky = useSticky()
  useEffect(() => {
    if (sticky) router.replace(`/text/turn?term=${index}&sticky=1`)
  }, [sticky, index, router])
  // Start the session clock here rather than only on 00 Intro. The doors go straight
  // to /session/idle/1?door=…, so a door run never ran startSession and the Recap's
  // Time chip read 0:00 on a session the student had just spent minutes on. 01 Idle is
  // the first screen of every entry path; the helper no-ops once the clock is running,
  // so terms 2-4 do not restart it.
  useEffect(() => {
    ensureSessionStarted()
  }, [])

  if (sticky) return null

  if (!current) {
    router.replace('/session/intro')
    return null
  }

  function skip() {
    recordOutcome(index, 'Worth revisiting')
    router.push(nextAfter(index))
  }

  return (
    <ScreenShell
      topNavigation={
        <>
          <AppBar
            variant="leftIconButtonOnly"
            leftIcon={<CloseIcon />}
            leftLabel="Leave"
            onLeft={() => goToExit(router)}
          >
            <ProgressIndicator
              progress={progressFor(index)}
              thickness="16"
              label="Questions"
              current={index}
              total={TOTAL_TERMS}
            />
          </AppBar>
          <SessionFraction current={index} total={TOTAL_TERMS} moreToCome={revisitsPending()} />
        </>
      }
      bottomContent={
        <div className={styles.actions}>
          {/* Two buttons, not three. The frame has no "I don't know this one"; the
              blank state is still reached from /text/turn, so nothing is orphaned. */}
          {/* The typed turn has offered this since it was built; the spoken turn only
              had Skip, so a student who genuinely did not know had to record nothing
              or take the no-XP exit. Same escape, both paths. */}
          <Button
            CTA="I don't know this one"
            variant="Tertiary"
            size="S"
            fullWidth
            onClick={() => router.push(`/session/blank/${index}`)}
          />
          <div className={actionRowClass}>
            <Button
              CTA="Type instead"
              variant="Secondary"
              size="M"
              onClick={() => router.push(`/text/turn?term=${index}`)}
            />
            <Button CTA="Skip" variant="Tertiary" size="M" onClick={skip} />
          </div>
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
        <MascotSlot size="2XL" expression="excited" />
        <ChatBubble
          className={styles.bubble}
          showTitle
          title="Explain: "
          titleAccent={current.name}
          body={current.prompt}
        />
        {/* One fixed mic region, on every voice screen. The control used to sit at
            eight different heights and jump 91px on the very tap that starts
            recording. sprint-context.md, 2026-09-22. */}
        <div className={micRegionClass}>
          <MicButton state="Idle" onClick={() => router.push(`/session/recording/${index}${doorQuery}`)} />
        </div>
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
