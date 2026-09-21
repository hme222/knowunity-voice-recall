'use client'

import { Suspense, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AppBar,
  Button,
  Chips,
  HintCard,
  MascotSlot,
  ProgressIndicator,
  RecallResult,
  ScreenShell,
  SessionFraction,
} from '@/components'
import { CloseIcon } from '@/components/icons'
import { getTerm, nextAfter, progressFor, recordOutcome, TOTAL_TERMS, XP } from '@/lib/session'
import styles from '../../result.module.css'

// 05 Miss + Hint — Figma frame "05 Miss + Hint (refreshed 2)" (15672:26357).
// One hint, then retry or reveal. There is no second hint (docs/sprint-context.md
// § "Not building this sprint"). Skip is a quiet Tertiary link below the primary pair,
// the placement resolved in the Skip/Reveal comparison.

function MissScreen({ index }: { index: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const wasSure = searchParams.get('sure') === '1'
  const current = getTerm(index)
  const attempt = Number(searchParams.get('attempt') ?? '1')

  if (!current) {
    router.replace('/session/intro')
    return null
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
          <p className={styles.xp}>{`+${XP.hinted} XP if you get it now`}</p>
          <Button
            CTA="Try again"
            variant="Primary"
            size="M"
            fullWidth
            onClick={() => router.push(`/session/recording/${index}?attempt=${attempt + 1}&hinted=1`)}
          />
          <Button
            CTA="Reveal answer"
            variant="Secondary"
            size="M"
            fullWidth
            onClick={() => router.push(`/session/reveal/${index}`)}
          />
          <Button CTA="Skip" variant="Tertiary" size="M" fullWidth onClick={skip} />
        </div>
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="determined" />
        <Chips Text="Partially right" size="S" color="Coral" active showRightIcon={false} />
        <RecallResult state="Miss" title={current.missTitle} transcript={`“${current.transcript}”`} />
        <HintCard body={current.hint} />
        <Button CTA="See the full transcript" variant="Tertiary" size="S" fullWidth onClick={() => router.push('/session/transcript/revealed')} />
      </div>
    </ScreenShell>
  )
}

export default function MissPage({ params }: { params: Promise<{ term: string }> }) {
  const { term } = use(params)
  return (
    <Suspense fallback={null}>
      <MissScreen index={Number(term)} />
    </Suspense>
  )
}
