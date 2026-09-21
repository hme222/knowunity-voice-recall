'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AppBar,
  Button,
  ChatBubble,
  ProgressIndicator,
  ScreenShell,
  SessionFraction,
} from '@/components'
import { CloseIcon } from '@/components/icons'
import { getTerm, progressFor, TOTAL_TERMS } from '@/lib/session'
import styles from '../text.module.css'

// The text fallback turn. Not a "nice to have": some students can't speak, and many
// more can't speak right now — a library, a shared room, a bus. voice-ux Principle 5.
//
// No Recording or Processing equivalent is needed. The student types, submits, a brief
// checking beat covers judging, and the same result branches follow.
//
// `sticky=1` arrives from a denied mic: the mic can't work, so it isn't re-offered.
// Situational typing (from 01 Idle's "Type instead") reverts to the mic next term.

function TextTurnScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const index = Number(searchParams.get('term') ?? '1')
  const sticky = searchParams.get('sticky') === '1'
  const current = getTerm(index)
  const [answer, setAnswer] = useState('')

  if (!current) {
    router.replace('/session/intro')
    return null
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
        <div className={styles.actions}>
          <Button
            CTA="Send"
            variant="Primary"
            size="M"
            fullWidth
            state={answer.trim() ? 'Default' : 'Disabled'}
            onClick={() => router.push(`/text/checking?term=${index}${sticky ? '&sticky=1' : ''}`)}
          />
          {!sticky && (
            <Button
              CTA="Say it instead"
              variant="Tertiary"
              size="M"
              fullWidth
              onClick={() => router.push(`/session/idle/${index}`)}
            />
          )}
        </div>
      }
    >
      <div className={styles.body}>
        <ChatBubble showTitle title={current.title} body={current.prompt} />
        <label>
          <span className="sr-only">Your answer</span>
          <textarea
            className={styles.field}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer…"
            aria-label="Your answer"
          />
        </label>
      </div>
    </ScreenShell>
  )
}

export default function TextTurnPage() {
  return (
    <Suspense fallback={null}>
      <TextTurnScreen />
    </Suspense>
  )
}
