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
import { proveItHref } from '../doors'
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
            router.push(proveItHref('chat'))
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
        <Button CTA="Type instead" variant="Tertiary" size="M" fullWidth onClick={() => {
            // Typing is the same one-definition door run as speaking (dev review).
            startSession({ door: 'chat' })
            router.push('/text/turn?term=1')
          }} />
      }
    >
      <div className={styles.body}>
        <p className={styles.xp}>{'⚡ 2 XP'}</p>
        <div className={styles.content}>
          {/* The screen's h1, for screen readers; the visible title is in the bubble. */}
          <h1 className="srOnly">{`${SUBJECT}: ${getTerm(1)?.name}`}</h1>
          <MascotSlot size="2XL" expression="determined" />
        </div>
        <ChatBubble
          showTitle
          title="You were just asking about formal charge"
          body="Want to say it back in your own words? It's the quickest way to know it stuck."
        />
        {/* A mic, in the shared region, like the exam-plan door. It was a Secondary
            Button — two doors offering the same thing two ways, and the one that opens
            a voice feature did it without showing a mic. */}
      </div>
    </ScreenShell>
  )
}
