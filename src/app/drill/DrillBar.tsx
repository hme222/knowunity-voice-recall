'use client'

import { AppBar, Chips, ProgressIndicator, SessionFraction } from '@/components'
import { CloseIcon } from '@/components/icons'
import { DRILL_TOTAL_RUNGS, progressFor } from '@/lib/session'

// The drill's top region. Carries the progress ring and fraction — the fixed-ladder
// fallback that the built frames show, shipped by decision. The doc's variable-length
// model drops both and leaves progress entirely to StrengthMeter; if the coverage
// judge is confirmed, this is the piece that goes.

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
      <SessionFraction current={step} total={DRILL_TOTAL_RUNGS} />
      <Chips Text="Drill" size="S" color="Primary" active={false} showRightIcon={false} />
    </>
  )
}
