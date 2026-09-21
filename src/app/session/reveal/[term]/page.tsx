'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import {
  AppBar,
  Button,
  ChatBubble,
  MascotSlot,
  MicButton,
  ProgressIndicator,
  ScreenShell,
  SessionFraction,
} from '@/components'
import { CloseIcon } from '@/components/icons'
import { getTerm, nextAfter, progressFor, recordOutcome, TOTAL_TERMS } from '@/lib/session'
import styles from '../../result.module.css'

// 05a Reveal answer — Figma frame "05a Reveal answer result" (15752:17156), which
// matches the real reference IMG_7513: no verdict badge, a plain answer bubble, the
// offer to say it back, and a quiet way on.
//
// Revealed earns 0 (docs/sprint-context.md § "XP model", revised 2026-09-20). The
// optional repeat carries +3, because saying it unaided under a cue is retrieval and
// being told the answer is not. The repeat never changes the bucket: a revealed term
// stays revealed however well it is repeated.

export default function RevealPage({ params }: { params: Promise<{ term: string }> }) {
  const router = useRouter()
  const { term } = use(params)
  const index = Number(term)
  const current = getTerm(index)

  if (!current) {
    router.replace('/session/intro')
    return null
  }

  function moveOn() {
    recordOutcome(index, 'Revealed')
    router.push(nextAfter(index))
  }

  return (
    <ScreenShell
      topNavigation={
        <>
          <AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Leave" onLeft={() => router.push('/session/exit')}>
            <ProgressIndicator progress={progressFor(index)} thickness="16" label="Questions" current={index} total={TOTAL_TERMS} />
          </AppBar>
          <SessionFraction current={index} total={TOTAL_TERMS} />
        </>
      }
      bottomContent={
        <div className={styles.centred}>
          <MicButton state="Idle" label="Say it back" onClick={() => router.push(`/session/recording/${index}?repeat=1`)} />
          <Button CTA="Skip" variant="Tertiary" size="M" onClick={moveOn} />
        </div>
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="determined" />
        <ChatBubble showTitle title="Here’s the answer. Now say it back." body={current.answer} />
        <ChatBubble body="Say it back, in your own words" />
      </div>
    </ScreenShell>
  )
}
