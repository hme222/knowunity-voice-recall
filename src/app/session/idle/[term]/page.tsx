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
import styles from './idle.module.css'

// 01 Idle / Commit — Figma frame "01 Idle (refreshed 2)" (15672:26255).
// One state. "Commit" describes this screen; it is not a second state — see
// docs/sprint-context.md § "Core loop, decided".

export default function IdlePage({ params }: { params: Promise<{ term: string }> }) {
  const router = useRouter()
  const { term } = use(params)
  const index = Number(term)
  const current = getTerm(index)

  if (!current) {
    router.replace('/session/intro')
    return null
  }

  function skip() {
    recordOutcome(index, 'Worth revisiting')
    router.push(nextAfter(index))
  }

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
            <ProgressIndicator
              progress={progressFor(index)}
              thickness="16"
              label="Questions"
              current={index}
              total={TOTAL_TERMS}
            />
          </AppBar>
          <SessionFraction current={index} total={TOTAL_TERMS} />
        </>
      }
      bottomContent={
        <div className={styles.actions}>
          <MicButton state="Idle" onClick={() => router.push(`/session/recording/${index}`)} />
          <Button CTA="Type instead" variant="Secondary" size="M" onClick={() => router.push(`/text/turn?term=${index}`)} />
          <Button CTA="Skip" variant="Tertiary" size="M" onClick={skip} />
        </div>
      }
    >
      <div className={styles.body}>
        <ChatBubble showTitle title={current.title} body={current.prompt} />
        <div className={styles.mascot}>
          <MascotSlot size="2XL" expression="determined" />
        </div>
      </div>
    </ScreenShell>
  )
}
