'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { goToExit } from '@/lib/navigation'
import {
  micRegionClass,
  AppBar,
  Button,
  ChatBubble,
  Chips,
  MascotSlot,
  MicButton,
  ProgressIndicator,
  ScreenShell,
  SessionFraction,
} from '@/components'
import { CloseIcon } from '@/components/icons'
import { markRequeued, revisitPlan, TERMS, TOTAL_TERMS, useSession, useSticky } from '@/lib/session'
import styles from './lock-in.module.css'

// 06 Lock It In — Figma frame "06 Lock It In (cold re-presentation)" (15672:20688).
// A missed term comes back later in the same session rather than resolving on one
// attempt.
//
// THE FRAME IS WRONG HERE and is not reproduced. It puts this screen at 75% with the
// fraction reading 3/4, as if the requeue were term 3. It is not — it happens after
// term 4, so the built sequence ran 4/4 at 100%, then back to 3/4 at 75%, then 100%
// again. The bar moved backwards, which is why the end of the session was impossible
// to gauge. The numbered pass is genuinely finished by now, so the bar stays full and
// this reads as its own round. See sprint-context.md § "Process notes".
//
// Which term returns is derived from the run: the first one bucketed Worth revisiting.

function LockInScreen() {
  const router = useRouter()
  const state = useSession()
  const sticky = useSticky()
  const pending = state.outcomes.find((o) => o.bucket === 'Worth revisiting' && !o.requeued)

  // WHICH term is being locked in, remembered for the life of the screen.
  //
  // This used to read `pending` straight through to the mic, with `?? TERMS[0]` as a
  // defensive fallback, and the fallback was load-bearing by accident: marking on
  // arrival writes to the session, the write notifies listeners, useSession re-renders,
  // and `!o.requeued` no longer matches — so the screen marked the missed term as
  // requeued and in the same breath forgot which term it was, re-asking term 1. The
  // student was re-tested on something they had already passed while the term they
  // actually missed was silently closed. session.ts:766 warns about exactly this shape
  // for 06b; 06 never adopted the fix.
  //
  // `requeuedOutcome()` is not the answer here either: with more than one term owed a
  // revisit it finds the first requeued outcome, not the one this visit marked. So the
  // index is captured once and held.
  // `?term=` is the authority; `pending` is only the fallback for a deep link that
  // arrived without one. Reading it from the route is what makes it immune to the
  // marking below, which is the whole bug: it changes the session in a way that used to
  // invalidate the screen's own lookup mid-visit.
  const routed = Number(useSearchParams().get('term'))
  const term = TERMS.find((t) => t.index === (Number.isFinite(routed) && routed > 0 ? routed : pending?.index))

  useEffect(() => {
    // One requeue only. Marking on arrival means the term can't come back again.
    if (term) markRequeued(term.index)
  }, [term])
  const plan = revisitPlan()

  // A denied mic stays denied here too. This screen was mic-only, so a student who had
  // already been moved to typing for the whole session hit a wall at the requeue.
  useEffect(() => {
    if (sticky && term) router.replace(`/text/turn?term=${term.index}&sticky=1`)
  }, [sticky, term, router])

  // No term to lock in means there is nothing for this screen to do. It used to show
  // term 1 rather than say so.
  useEffect(() => {
    if (!term) router.replace('/session/recap')
  }, [term, router])

  if (!term || sticky) return null

  return (
    <ScreenShell
      topNavigation={
        <>
          <AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Leave" onLeft={() => goToExit(router)}>
            <ProgressIndicator progress="100" thickness="16" label="Questions" current={TOTAL_TERMS} total={TOTAL_TERMS} />
          </AppBar>
          <SessionFraction label={`Revisit ${plan.index} of ${plan.total}`} />
        </>
      }
      bottomContent={
        <div className={styles.actions}>
          {/* The requeue was mic-only. Every other turn in the session offers a way to
              answer without speaking; the one that asks the student to prove they have
              learned something did not. */}
          <Button
            CTA="Type instead"
            variant="Secondary"
            size="M"
            fullWidth
            onClick={() => router.push(`/text/turn?term=${term.index}`)}
          />
          <Button CTA="Skip" variant="Tertiary" size="M" fullWidth onClick={() => router.push('/session/lock-in/second')} />
        </div>
      }
    >
      <div className={styles.body}>
        {/* Mascot FIRST, then the badge and the bubble — the order every sibling in this
            family uses (01 Idle, blank, reveal, 06b Lock It In second). 06 was the one
            screen that put Knowie underneath the text, which is the exact arrangement
            01 Idle's own comment describes as a bug it already fixed: "the build had the
            bubble first and the mascot pushed to the bottom, which left a 170px hole
            between them and put Knowie beside the mic instead of over the question."
            Nothing marked 06 as an intentional exception, because it was not one. */}
        <MascotSlot size="2XL" expression="determined" />
        <div className={styles.badge}>
          <Chips Text="Back for round two" size="S" color="Primary" active showLeftIcon={false} showRightIcon={false} />
        </div>
        <ChatBubble
          showTitle
          title={`${term.name} was tricky. Want to lock it in?`}
          body={"Try the full answer once more, unaided this time. Totally optional."}
        />
        {/* One fixed mic region, on every voice screen. The control used to sit at
            eight different heights and jump 91px on the very tap that starts
            recording. sprint-context.md, 2026-09-22. */}
        <div className={micRegionClass}>
          <MicButton state="Idle" onClick={() => router.push(`/session/recording/${term.index}?attempt=2&requeued=1`)} />
        </div>
      </div>
    </ScreenShell>
  )
}

export default function LockInPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <LockInScreen />
    </Suspense>
  )
}
