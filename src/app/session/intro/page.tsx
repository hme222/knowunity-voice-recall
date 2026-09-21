'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppBar, Button, ChatBubble, MascotSlot, ProgressIndicator, ScreenShell, SessionFraction } from '@/components'
import { CloseIcon } from '@/components/icons'
import { startSession, TOTAL_TERMS } from '@/lib/session'
import styles from './intro.module.css'

// 00 Intro — Figma frame "00 Intro (refreshed)" (15672:24268).
// One state. Copy is verbatim from the frame.

export default function IntroPage() {
  const router = useRouter()

  // Clears any previous run so 07 Recap reports this one. In an effect, never during
  // render — sessionStorage touched in the render pass breaks hydration.
  useEffect(() => {
    startSession()
  }, [])

  return (
    <ScreenShell
      topNavigation={
        <>
          <AppBar
            variant="leftIconButtonOnly"
            leftIcon={<CloseIcon />}
            leftLabel="Leave"
            onLeft={() => router.push('/session/exit')}
          >
            <ProgressIndicator progress="25" thickness="16" label="Questions" current={1} total={TOTAL_TERMS} />
          </AppBar>
          <SessionFraction current={1} total={TOTAL_TERMS} />
        </>
      }
      bottomContent={
        <Button
          CTA="Let's go"
          variant="Primary"
          size="M"
          fullWidth
          onClick={() => router.push('/session/idle/1')}
        />
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="determined" />
        <ChatBubble
          showTitle
          title="Say It Back"
          body="After you study a section, explain the key ideas out loud, in your own words. Speaking proves you actually know it, not just recognize it. Knowie listens and tells you how it landed."
        />
      </div>
    </ScreenShell>
  )
}
