'use client'

import { useRouter } from 'next/navigation'
import { micRegionClass, Chips, HintCard, MascotSlot, MicButton, MicCaption, ScreenShell } from '@/components'
import { STUMBLES, useDrillTerm } from '@/lib/session'
import styles from '../../drill.module.css'
import { DrillBar } from '../../DrillBar'

// DD 07c — third stumble, echo. History: docs/code-history.md#h-018

export default function DrillEchoPage() {
  const router = useRouter()
  const drillTerm = useDrillTerm()
  return (
    <ScreenShell
      mic={
        <div className={micRegionClass}>
          {/* Records, then advances. This is the rung whose whole point is saying the
              word out loud with Knowie, and it used to complete without a take. */}
          <MicButton
            state="Idle"
            label={`Say ${drillTerm.drill.missedWord}`}
            onClick={() => router.push('/drill/recording?step=2&stumble=echo')}
          />
          {/* Knowie's line, under the mic it is asking the student to use (2026-10-12). */}
          <MicCaption body={STUMBLES.third.copy} />
        </div>
      }
      topNavigation={<DrillBar step={2} onExit={() => router.push('/picker')} />}
      // No "Come back to this one": Skip, top right, is the drill's one way past, as in
      // the session (designer, 2026-10-13, option A). The zone stays reserved so the mic
      // and the content do not move between rungs.
      showBottomNavSlot
    >
      <div className={styles.frameBody}>
        <MascotSlot size="2XL" expression="laughing" />
        <div className={[styles.fullWidth, styles.verdictRow].join(' ')}>
          <Chips
            Text={STUMBLES.third.verdict}
            size="S"
            color="Partial"
            active
            showLeftIcon={false}
            showRightIcon={false}
          />
        </div>
        <HintCard
          className={styles.fullWidth}
          label="Say this with me"
          tone="missingWord"
          body={drillTerm.drill.missedWord}
        />
      </div>
    </ScreenShell>
  )
}
