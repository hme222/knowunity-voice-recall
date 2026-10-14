'use client'

import { useRouter } from 'next/navigation'
import {
  micRegionClass,
  AppBar,
  Button,
  ChatBubble,
  MascotSlot,
  MicButton,
  MicCaption,
  ProgressIndicator,
  ScreenShell,
} from '@/components'
import { getTerm, startSession, SUBJECT } from '@/lib/session'
import { doorMicHref } from '../doors'
import styles from '../door.module.css'

// Door 3, chat — Figma frame "Chat (placeholder — existing door, refreshed)" (15672:24166). History: docs/code-history.md#h-001

export default function ChatDoor() {
  const router = useRouter()

  return (
    <ScreenShell
      mic={
        <div className={micRegionClass}>
          <MicButton state="Idle" onClick={() => {
            startSession({ door: 'chat' })
            router.push(doorMicHref('chat'))
          }} />
          {/* BELOW the mic, out of the flow — see the exam-plan door. */}
          {/* The mic's accessible name, word for word (UX critic, 2026-10-12): "Tap to answer"
              beside a control named "Start speaking" gave a voice-control user a label
              to say that matched nothing (WCAG 2.5.3). */}
          <MicCaption body="Start speaking" />
        </div>
      }
      topNavigation={
        <AppBar variant="leftAndRightButton" leftLabel="Back" onLeft={() => router.push('/home/unlock')} rightText="Skip" onRightText={() => router.push('/home/unlock')}>
          <ProgressIndicator progress="25" thickness="16" label="Chat" current={1} total={4} />
        </AppBar>
      }
      bottomContent={
        <Button CTA="Type instead" variant="Secondary" size="M" fullWidth onClick={() => {
            // Typing is the same one-definition door run as speaking (dev review).
            startSession({ door: 'chat' })
            router.push('/text/turn?term=1')
          }} />
      }
    >
      <div className={styles.body}>
        {/* Gives way at 390x668 after Knowie, so the bubble is never cut mid-line. */}
        <p className={styles.xp} data-gives-way>{'⚡ 2 XP'}</p>
        {/* The screen's h1, for screen readers; the visible title is in the bubble.
            Outside the mascot's wrapper, so the wrapper is Knowie alone and goes with
            Knowie at 390x668 — with the h1 inside, its 48px of padding stayed. */}
        <h1 className="srOnly">{`${SUBJECT}: ${getTerm(1)?.name}`}</h1>
        <div className={styles.content}>
          <MascotSlot size="2XL" expression="excited" />
        </div>
        <ChatBubble
          showTitle
          title="You were just asking about formal charge"
          // One line shorter: at 390x668 the second sentence was cut mid-line.
          body="Say it back in your own words. It’s the quickest way to know it stuck."
        />
        {/* A mic, in the shared region, like the exam-plan door. It was a Secondary
            Button — two doors offering the same thing two ways, and the one that opens
            a voice feature did it without showing a mic. */}
      </div>
    </ScreenShell>
  )
}
