'use client'

import { Suspense, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AppBar,
  Button,
  ChatBubble,
  MascotSlot,
  MicButton,
  ProgressIndicator,
  ScreenShell,
  SessionFraction,
  actionRowClass,
} from '@/components'
import { CloseIcon } from '@/components/icons'
import { getTerm, nextAfter, progressFor, recordOutcome, TOTAL_TERMS } from '@/lib/session'
import styles from './idle.module.css'

// 01 Idle / Commit — Figma frame "01 Idle (refreshed 2)" (15672:26255).
// One state. "Commit" describes this screen; it is not a second state — see
// docs/sprint-context.md § "Core loop, decided".

function IdleScreen({ index }: { index: number }) {
  const router = useRouter()
  // `door` marks a run that arrived from an entry door rather than from the chip. It
  // rides the whole take so the run can land on the door's own result.
  const door = useSearchParams().get('door')
  const doorQuery = door ? `?door=${door}` : ''
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
          {/* The frame puts two buttons side by side in an 88px action zone, with the
              mic up in middleContent. Stacking three full-width buttons here needed
              204px against a 120 budget and spilled over the content below. */}
          <div className={actionRowClass}>
            <Button
              CTA="Type instead"
              variant="Secondary"
              size="M"
              fullWidth
              onClick={() => router.push(`/text/turn?term=${index}`)}
            />
            <Button CTA="Skip" variant="Tertiary" size="M" fullWidth onClick={skip} />
          </div>
          <Button
            CTA="I don't know this one"
            variant="Tertiary"
            size="S"
            fullWidth
            onClick={() => router.push(`/session/blank/${index}`)}
          />
        </div>
      }
    >
      <div className={styles.body}>
        <ChatBubble showTitle title={current.title} body={current.prompt} />
        <div className={styles.mascot}>
          <MascotSlot size="2XL" expression="determined" />
        </div>
        {/* The frame places micButton in middleContent at y=334, not in the action
            zone. It is content, not chrome. */}
        <MicButton state="Idle" onClick={() => router.push(`/session/recording/${index}${doorQuery}`)} />
      </div>
    </ScreenShell>
  )
}

export default function IdlePage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = use(params)
  return (
    <Suspense fallback={null}>
      <IdleScreen index={Number(term)} />
    </Suspense>
  )
}
