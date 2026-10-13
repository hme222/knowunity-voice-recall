'use client'

import { AppBar, ProgressIndicator, SessionFraction } from '@/components'
import { CloseIcon } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { advancePractice, DRILL_TOTAL_RUNGS, isPractising, progressFor, setPractising, useDrillTerm } from '@/lib/session'

// The drill's top region, in the session's grammar (designer, 2026-10-13, option A):
// the line under the ring names where you are — "Drill · Formal charge · 2/4" against
// the session's "Chemistry · 1/4" — and Skip sits top right on every turn the student
// acts on. It used to show a bare "2/4" or nothing, and Skip on one screen only.
// The judging beats (processing, typed checking) pass `skip={false}`, as the session's
// processing has no Skip either.

export function DrillBar({
  step,
  onExit,
  onSkip,
  skip = true,
}: {
  step: number
  onExit: () => void
  /** Override Skip. By default it leaves the drill: the next practice item, or the picker. */
  onSkip?: () => void
  /** False on a judging beat. */
  skip?: boolean
}) {
  const router = useRouter()
  const term = useDrillTerm()
  // Leaving a drill inside a practice round goes back to the Recap it came from, and
  // ends the round, rather than to the picker.
  const leave = () => {
    if (!isPractising()) return onExit()
    setPractising(false)
    router.push('/session/recap')
  }
  const skipDrill = onSkip ?? (() => router.push(isPractising() ? advancePractice() : '/picker'))
  return (
    <>
      {/* The screen's h1, for screen readers. See SessionBar. */}
      <h1 className="srOnly">{`Drill: ${term.name}, round ${step} of ${DRILL_TOTAL_RUNGS}`}</h1>
      <AppBar
        variant={skip ? 'leftAndRightButton' : 'leftIconButtonOnly'}
        leftIcon={<CloseIcon />}
        leftLabel="Leave"
        onLeft={leave}
        rightText="Skip"
        onRightText={skip ? skipDrill : undefined}
      >
        <ProgressIndicator
          progress={progressFor(step)}
          thickness="16"
          label="Passes"
          current={step}
          total={DRILL_TOTAL_RUNGS}
        />
      </AppBar>
      <SessionFraction label={`Drill · ${term.name} · ${step}/${DRILL_TOTAL_RUNGS}`} />
    </>
  )
}
