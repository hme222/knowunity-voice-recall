'use client'

import { useRouter } from 'next/navigation'
import {
  actionRowClass,
  AppBar,
  Button,
  ChatBubble,
  MascotSlot,
  ProgressIndicator,
  ScreenShell,
} from '@/components'
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
      topNavigation={
        <AppBar variant="leftIconButtonOnly" leftLabel="Back" onLeft={() => router.push('/')}>
          <ProgressIndicator progress="25" thickness="16" label="Chat" current={1} total={4} />
        </AppBar>
      }
      bottomContent={
        <div className={actionRowClass}>
          <Button
            CTA="Type instead"
            variant="Secondary"
            size="M"
            onClick={() => router.push('/text/turn?term=1')}
          />
          <Button CTA="Skip" variant="Tertiary" size="M" onClick={() => router.push('/home/unlock')} />
        </div>
      }
    >
      <div className={styles.body}>
        <p className={styles.xp}>{'⚡ 2 XP'}</p>
        <div className={styles.content}>
          <MascotSlot size="2XL" expression="determined" />
        </div>
        <ChatBubble
          showTitle
          title="Chat, content-aware"
          body="Placeholder — prefilled off a real conversation."
        />
        <div className={styles.micZone}>
          <Button
            CTA="Say it back"
            variant="Secondary"
            size="M"
            onClick={() => router.push(proveItHref('chat'))}
          />
        </div>
      </div>
    </ScreenShell>
  )
}
