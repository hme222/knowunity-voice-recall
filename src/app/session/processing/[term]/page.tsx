'use client'

import { Suspense, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppBar, MascotSlot, ProgressIndicator, ScreenShell, SessionFraction, Button } from '@/components'
import { CloseIcon } from '@/components/icons'
import { getTerm, progressFor, TOTAL_TERMS, verdictFor } from '@/lib/session'
import styles from './processing.module.css'

// 03 Processing — Figma frame "03 Processing" (15672:20190), plus the confidence tap
// decided 2026-09-20. The verdict is already determined by the take's duration; the
// tap is what advances the turn, so the signal can't be contaminated by knowing the
// outcome. Knowie breathes throughout so the screen never reads as stuck.

function ProcessingScreen({ index }: { index: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = getTerm(index)
  const ms = Number(searchParams.get('ms') ?? '0')
  const attempt = Number(searchParams.get('attempt') ?? '1')

  if (!current) {
    router.replace('/session/intro')
    return null
  }

  function answer(sure: boolean) {
    const verdict = verdictFor(index, ms, attempt)
    const route =
      verdict === 'Pass' ? 'pass' : verdict === 'Miss' ? 'miss' : 'unclear'
    router.push(`/session/${route}/${index}?sure=${sure ? '1' : '0'}&attempt=${attempt}`)
  }

  return (
    <ScreenShell
      className={styles.root}
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
        <div className={styles.confidence}>
          <p className={styles.ask}>How sure are you?</p>
          <div className={styles.pair}>
            <Button CTA="Sure" variant="Secondary" size="M" fullWidth onClick={() => answer(true)} />
            <Button CTA="Not sure" variant="Secondary" size="M" fullWidth onClick={() => answer(false)} />
          </div>
        </div>
      }
    >
      <div className={styles.body}>
        <div className={styles.mascot}>
          <MascotSlot size="2XL" expression="determined" />
        </div>
        <p className={styles.line}>Let me check that against the definition&hellip;</p>
        <div className={styles.dots} aria-hidden="true">
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      </div>
    </ScreenShell>
  )
}

export default function ProcessingPage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = use(params)
  return (
    <Suspense fallback={null}>
      <ProcessingScreen index={Number(term)} />
    </Suspense>
  )
}
