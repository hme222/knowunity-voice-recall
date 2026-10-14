'use client'

import { useRouter } from 'next/navigation'
import { micRegionClass, AppBar, Button, ChatBubble, MascotSlot, MicButton, MicCaption, ProgressIndicator, ScreenShell } from '@/components'
import { getTerm, startSession, SUBJECT } from '@/lib/session'
import { doorMicHref } from '../doors'
import styles from '../door.module.css'

// Door 2, the exam plan — Figma frame "Exam plan (placeholder — existing door, refreshed)" (15672:23959). History: docs/code-history.md#h-005

export default function ExamPlanDoor() {
  const router = useRouter()

  return (
    <ScreenShell
      mic={
        <div className={micRegionClass}>
          {/* No "Skip question" here. The action row below already carries "Skip" to
              the same destination, so this screen offered one escape twice under two
              names, 109px apart. */}
          <MicButton state="Idle" onClick={() => {
            startSession({ door: 'exam-plan' })
            router.push(doorMicHref('exam-plan'))
          }} />
          {/* BELOW the mic, out of the flow. The region aligns its children to the top
              so the control sits at one height on every voice screen, which laid this
              caption out BESIDE the button — both starting at y466, the caption clipping
              its upper edge. Same placement the recording screens use. */}
          {/* The mic's accessible name, word for word (UX critic, 2026-10-12): "Tap to answer"
              beside a control named "Start speaking" gave a voice-control user a label
              to say that matched nothing (WCAG 2.5.3). */}
          <MicCaption body="Start speaking" />
        </div>
      }
      topNavigation={
        <AppBar variant="leftAndRightButton" leftLabel="Back" onLeft={() => router.push('/home/unlock')} rightText="Skip" onRightText={() => router.push('/home/unlock')}>
          <ProgressIndicator progress="25" thickness="16" label="Plan steps" current={1} total={4} />
        </AppBar>
      }
      bottomContent={
        <Button CTA="Type instead" variant="Secondary" size="M" fullWidth onClick={() => {
            // Typing is the same one-definition door run as speaking (dev review).
            startSession({ door: 'exam-plan' })
            router.push('/text/turn?term=1')
          }} />
      }
    >
      <div className={styles.body}>
        <div className={styles.content}>
          {/* The screen's h1, for screen readers; the visible title is in the bubble. */}
          <h1 className="srOnly">{`${SUBJECT}: ${getTerm(1)?.name}`}</h1>
          <MascotSlot size="2XL" expression="excited" />
        </div>
        {/* The session's own question card (senior review, 2026-10-12): a long formal
            paragraph here read as a different product from the "Explain: X" cards the
            student meets one tap later. */}
        <ChatBubble showTitle title={`${SUBJECT} · Explain: `} titleAccent={getTerm(1)?.name ?? ''} body={`${(getTerm(1)?.prompt ?? '').split('. ')[0]}.`} />
      </div>
    </ScreenShell>
  )
}
