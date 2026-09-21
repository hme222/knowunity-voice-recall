'use client'

import { useRouter } from 'next/navigation'
import { actionRowClass, AppBar, Button, MascotSlot, ProgressIndicator, ScreenShell, TextBlock } from '@/components'
import { MicGlyphIcon } from '@/components/icons'
import { proveItHref } from '../doors'
import styles from '../door.module.css'

// Door 1, Quiz complete — Figma frame "Quiz complete — Prove It Again, Option 1
// (CHOSEN, refreshed from production)" (15672:24061).
//
// THIS IS THE FIRST SCREEN OF THE PROTOTYPE. Say It Back has no chip on home until a
// door has shown it, so the flow cannot start on home — it starts here, at the end of
// something the student was already doing.
//
// Both actions lead to the reveal: it is the showing that unlocks, not the completing
// (docs/sprint-context.md § "Where it lives").

export default function QuizCompleteDoor() {
  const router = useRouter()

  return (
    <ScreenShell
      topNavigation={
        <AppBar variant="leftIconButtonOnly" leftLabel="Back" onLeft={() => router.push('/')}>
          {/* The frame's bar is at 25% — the quiz behind this screen, not our session. */}
          <ProgressIndicator progress="25" thickness="16" label="Quiz" current={1} total={4} />
        </AppBar>
      }
      bottomContent={
        <div className={actionRowClass}>
          <Button CTA="Not now" variant="Tertiary" size="M" onClick={() => router.push('/home/unlock')} />
          <Button
            CTA="Prove it"
            variant="Primary"
            size="M"
            showLeftIcon
            leftIcon={<MicGlyphIcon />}
            onClick={() => router.push(proveItHref('quiz'))}
          />
        </div>
      }
    >
      <div className={styles.body}>
        <div className={styles.content}>
          <MascotSlot size="2XL" expression="determined" />
          <TextBlock variant="L" title="Quiz complete!" caption="9/10 correct. Want to prove one sticks?" />
        </div>
      </div>
    </ScreenShell>
  )
}
