'use client'

import { use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import {
  AppBar,
  Button,
  Chips,
  MascotSlot,
  ProgressIndicator,
  ScreenShell,
  SessionFraction,
} from '@/components'
import { CloseIcon } from '@/components/icons'
import { getTerm, progressFor, TOTAL_TERMS } from '@/lib/session'
import styles from './captured.module.css'

// 02a Captured — Figma frame "02a Captured — review before sending" (15785:13098).
// Copy verbatim from the frame. Sits between Recording and Processing: the student
// confirms what was heard before anything is judged.

function CapturedScreen({ index }: { index: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = getTerm(index)
  const ms = searchParams.get('ms') ?? '0'

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
          <Button
            CTA="Looks right"
            variant="Primary"
            size="M"
            fullWidth
            onClick={() => router.push(`/session/processing/${index}?ms=${ms}`)}
          />
          <Button
            CTA="Re-record"
            variant="Secondary"
            size="M"
            fullWidth
            onClick={() => router.push(`/session/recording/${index}`)}
          />
        </div>
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="determined" />
        <div className={styles.card}>
          <div className={styles.tag}>
            <Chips
              Text="Try again"
              size="S"
              color="Coral"
              active
              showRightIcon={false}
              onClick={() => router.push(`/session/recording/${index}`)}
            />
          </div>
          <p className={styles.title}>Here&rsquo;s what I heard. Send it, or say it again.</p>
          <p className={styles.label}>You said</p>
          <p className={styles.transcript}>&ldquo;{current.transcript}&rdquo;</p>
        </div>
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
