'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SessionBar } from '../SessionBar'
import { Button, ChatBubble, MascotSlot, ScreenShell } from '@/components'
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
      topNavigation={<SessionBar index={0} label={`${TOTAL_TERMS} definitions`} />}
      bottomContent={
        <Button
          CTA="Let's go"
          variant="Primary"
          size="M"
          fullWidth
          onClick={() => router.push('/permission/primer')}
        />
      }
    >
      <div className={styles.body}>
        {/* The invitation that opens the whole feature. It wore the same face as 03
            Processing, which is the working state — the first thing Knowie does should not
            look like concentrating. */}
        <MascotSlot size="2XL" expression="excited" />
        <ChatBubble
          showTitle
          title="Say It Back: "
          titleAccent="Chemistry bonding"
          // The subject is named before anything starts — designer, 2026-10-08; one
          // subject for the whole set from 2026-10-09. The
          // "anything you miss comes back once at the end" line went with the requeue.
          body={`After you study a section, say the key ideas back in your own words. Speaking proves you actually know it, not just recognize it. Knowie listens and tells you how it landed.\n\n${TOTAL_TERMS} definitions, starting with formal charge.`}
        />
      </div>
    </ScreenShell>
  )
}
