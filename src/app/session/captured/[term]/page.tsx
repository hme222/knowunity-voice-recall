'use client'

import { use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { goToExit } from '@/lib/navigation'
import { Suspense } from 'react'
import {
  AppBar,
  Button,
  MascotSlot,
  ProgressIndicator,
  RecallResultCaptured,
  ScreenShell,
  SessionFraction,
} from '@/components'
import { CloseIcon } from '@/components/icons'
import { getTerm, progressFor, revisitsPending, TOTAL_TERMS } from '@/lib/session'
import styles from './captured.module.css'

// 02a Captured — Figma frame "02a Captured — review before sending" (15785:13098).
// Copy verbatim from the frame. Sits between Recording and Processing: the student
// confirms what was heard before anything is judged.

function CapturedScreen({ index }: { index: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = getTerm(index)
  // Forwarded wholesale rather than picked apart: dropping one of these is what broke
  // the chain before.
  const forward = new URLSearchParams({
    ms: searchParams.get('ms') ?? '0',
    attempt: searchParams.get('attempt') ?? '1',
  })
  if (searchParams.get('hinted') === '1') forward.set('hinted', '1')
  const door = searchParams.get('door')
  if (door) forward.set('door', door)
  const attempt = searchParams.get('attempt') ?? '1'
  const hinted = searchParams.get('hinted') === '1'

  if (!current) {
    router.replace('/session/intro')
    return null
  }

  return (
    <ScreenShell
      topNavigation={
        <>
          <AppBar
            variant="leftIconButtonOnly"
            leftIcon={<CloseIcon />}
            leftLabel="Leave"
            onLeft={() => goToExit(router)}
          >
            <ProgressIndicator
              progress={progressFor(index)}
              thickness="16"
              label="Questions"
              current={index}
              total={TOTAL_TERMS}
            />
          </AppBar>
          <SessionFraction current={index} total={TOTAL_TERMS} moreToCome={revisitsPending()} />
        </>
      }
      bottomContent={
        <div className={styles.actions}>
          <Button
            CTA="Looks right"
            variant="Primary"
            size="M"
            fullWidth
            onClick={() => router.push(`/session/processing/${index}?${forward}`)}
          />
          <Button
            CTA="Say it again"
            variant="Secondary"
            size="M"
            fullWidth
            onClick={() => router.push(`/session/recording/${index}?attempt=${attempt}${hinted ? '&hinted=1' : ''}${door ? `&door=${door}` : ''}`)}
          />
        </div>
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="determined" />
        <RecallResultCaptured
          className={styles.card}
          title="Here&rsquo;s what I heard. Send it, or say it again."
          transcript={current.transcript}
          /* No `tag` chip. The action zone below already offers "Say it again" and
             "Looks right" — the frame's pair — so an in-card chip repeating one of them
             put two controls with the same label on one screen. One action, one
             control. Logged in component-gaps.md. */
        />
      </div>
    </ScreenShell>
  )
}

export default function CapturedPage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = use(params)
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <CapturedScreen index={Number(term)} />
    </Suspense>
  )
}
