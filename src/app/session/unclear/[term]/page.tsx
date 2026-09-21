'use client'

import { Suspense, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppBar, Button, MascotSlot, ProgressIndicator, RecallResult, ScreenShell, SessionFraction } from '@/components'
import { CloseIcon } from '@/components/icons'
import { getTerm, nextAfter, progressFor, recordOutcome, TOTAL_TERMS } from '@/lib/session'
import styles from '../../result.module.css'

// 04a Couldn't hear — Figma frame "04a Couldn't hear (refreshed)" (15672:24583).
// A third, visually neutral result: system failure, not a wrong answer. No XP, because
// nothing has been resolved yet. dazed is reserved for exactly this state — a puzzled
// Knowie reads as the app being confused, not the student failing.

function UnclearScreen({ index }: { index: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const wasSure = searchParams.get('sure') === '1'
  const current = getTerm(index)
  const attempt = Number(searchParams.get('attempt') ?? '1')

  if (!current) {
    router.replace('/session/intro')
    return null
  }

  function retry() {
    router.push(`/session/recording/${index}?attempt=${attempt + 1}`)
  }

  function skip() {
    recordOutcome(index, 'Worth revisiting', { wasSure })
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
        <div className={styles.actions}>
          <Button CTA="Type instead" variant="Secondary" size="M" fullWidth onClick={() => router.push(`/text/turn?term=${index}`)} />
          <Button CTA="Skip" variant="Tertiary" size="M" fullWidth onClick={skip} />
        </div>
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="dazed" className={styles.mascotCentred} />
        {/* RecallResult supplies the one documented retry tag for CouldntHear. A second
            chip here bound to the same handler meant two differently-labelled controls
            doing one thing. */}
        <RecallResult
          state="CouldntHear"
          title="That one didn’t come through."
          transcript={`Say the definition of ${current.name.toLowerCase()} again, a little closer to the mic.`}
          onRetry={retry}
        />
      </div>
    </ScreenShell>
  )
}

export default function UnclearPage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = use(params)
  return (
    <Suspense fallback={null}>
      <UnclearScreen index={Number(term)} />
    </Suspense>
  )
}
