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
import { startSession } from '@/lib/session'
import { proveItHref } from '../doors'
import styles from '../door.module.css'

// Door 3, chat — Figma frame "Chat (placeholder — existing door, refreshed)"
// (15672:24166). The content-aware door: the offer is prefilled off a real
// conversation, so it arrives already about something.
//
// The frame shows the XP line above the mascot. It is the only door that does, because
// chat is the one that already has a running XP context around it.

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
          <MicCaption body="Tap to answer" />
        </div>
      }
      topNavigation={
        <AppBar variant="leftAndRightButton" leftLabel="Back" onLeft={() => router.push('/home/unlock')} rightText="Skip" onRightText={() => router.push('/home/unlock')}>
          <ProgressIndicator progress="25" thickness="16" label="Chat" current={1} total={4} />
        </AppBar>
      }
      bottomContent={
        <Button CTA="Type instead" variant="Secondary" size="M" fullWidth onClick={() => router.push('/text/turn?term=1')} />
      }
    >
      <div className={styles.body}>
        <p className={styles.xp}>{'⚡ 2 XP'}</p>
        <div className={styles.content}>
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
