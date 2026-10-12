'use client'

import { AppBar, ProgressIndicator, SessionFraction } from '@/components'
import { CloseIcon } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { DRILL_TOTAL_RUNGS, isPractising, progressFor, setPractising, useDrillTerm } from '@/lib/session'

// The drill's top region. Carries the progress ring and fraction — the fixed-ladder
// fallback that the built frames show, shipped by decision. The doc's variable-length
// model drops both and leaves progress entirely to StrengthMeter; if the coverage
// judge is confirmed, this is the piece that goes.

/** The frame shows no fraction on the first rung, only the ring. Neither DD 01
    (15782:11696) nor DD 07 (15782:12362) carries a "Drill" chip under the bar; it was
    an addition and is removed. */
export function DrillBar({ step, onExit, onSkip }: { step: number; onExit: () => void; onSkip?: () => void }) {
  const router = useRouter()
  const term = useDrillTerm()
  // Leaving a drill inside a practice round goes back to the Recap it came from, and
  // ends the round, rather than to the picker.
  const leave = () => {
    if (!isPractising()) return onExit()
    setPractising(false)
    router.push('/session/recap')
  }
  return (
    <>
      {/* The screen's h1, for screen readers. See SessionBar. */}
      <h1 className="srOnly">{`Drill: ${term.name}, round ${step} of ${DRILL_TOTAL_RUNGS}`}</h1>
      {/* Skip top right when the screen offers it, as in the session's SessionBar. */}
      <AppBar
        variant={onSkip ? 'leftAndRightButton' : 'leftIconButtonOnly'}
        leftIcon={<CloseIcon />}
        leftLabel="Leave"
        onLeft={leave}
        rightText="Skip"
        onRightText={onSkip}
      >
        <ProgressIndicator
          progress={progressFor(step)}
          thickness="16"
          label="Passes"
          current={step}
          total={DRILL_TOTAL_RUNGS}
        />
      </AppBar>
      {step > 1 && <SessionFraction current={step} total={DRILL_TOTAL_RUNGS} />}
    </>
  )
}
