'use client'

import { AppBar, ProgressIndicator, SessionFraction } from '@/components'
import { CloseIcon } from '@/components/icons'
import { DRILL_TOTAL_RUNGS, progressFor } from '@/lib/session'

// The drill's top region. Carries the progress ring and fraction — the fixed-ladder
// fallback that the built frames show, shipped by decision. The doc's variable-length
// model drops both and leaves progress entirely to StrengthMeter; if the coverage
// judge is confirmed, this is the piece that goes.

/** The frame shows no fraction on the first rung, only the ring. Neither DD 01
    (15782:11696) nor DD 07 (15782:12362) carries a "Drill" chip under the bar; it was
    an addition and is removed. */
export function DrillBar({ step, onExit }: { step: number; onExit: () => void }) {
  return (
    <>
      <AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Leave" onLeft={onExit}>
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
