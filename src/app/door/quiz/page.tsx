'use client'

import { useRouter } from 'next/navigation'
import { AppBar, Button, MascotSlot, ProgressIndicator, ScreenShell } from '@/components'
import { startSession } from '@/lib/session'
import { MicGlyphIcon } from '@/components/icons'
import { proveItHref } from '../doors'
import styles from '../door.module.css'

// Door 1, Quiz complete — Figma frame "Quiz complete — Prove It Again, Option 1 (CHOSEN, refreshed from production)" (15672:24061). History: docs/code-history.md#h-007

export default function QuizCompleteDoor() {
  const router = useRouter()

  return (
    <ScreenShell
      topNavigation={
        <AppBar variant="leftIconButtonOnly" leftLabel="Back" onLeft={() => router.push('/home/unlock')}>
          {/* The frame's bar is at 25% — the quiz behind this screen, not our session. */}
          <ProgressIndicator progress="25" thickness="16" label="Quiz" current={1} total={4} />
        </AppBar>
      }
      bottomContent={
        <div className={styles.doorActions}>
          <Button CTA="Not now" variant="Tertiary" size="M" onClick={() => router.push('/home/unlock')} />
          <Button
            CTA="Say It Back"
            variant="Primary"
            size="M"
            showLeftIcon
            leftIcon={<MicGlyphIcon />}
            // Through the mic primer: this is the first time the guided path meets the
            // mic, and voice-ux Principle 3 says never fire the OS ask cold.
            onClick={() => {
              startSession({ door: 'quiz' })
              router.push(proveItHref('quiz'))
            }}
          />
        </div>
      }
    >
      <div className={styles.body}>
        <div className={styles.content}>
          {/* "Quiz complete! 9/10 correct." is a celebration, and this is the FIRST screen of
            the prototype. It opened on the working face. */}
          <MascotSlot size="2XL" expression="laughing" />
          {/* The frame draws these as loose text nodes at Headline S over Body M
              Regular, not as a textBlock. TextBlock's L renders 44px. */}
          <div className="screenTitle">
            <h1 className="screenTitleHeading">Quiz complete!</h1>
            <p className="screenTitleCaption">9/10 on your Chemistry quiz. Say one definition back: formal charge.</p>
          </div>
        </div>
      </div>
    </ScreenShell>
  )
}
