'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { goToExit } from '@/lib/navigation'
import {
  micRegionClass,
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
import { getTerm, nextAfter, progressFor, recordOutcome, revisitsPending, TOTAL_TERMS, useSticky } from '@/lib/session'
import styles from './reveal.module.css'

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
  const sticky = useSticky()

  // voice-ux.md §3: a denied mic stays denied for the SESSION, not for one turn. This
  // screen was mic-only, so a student already moved to typing could reach it from
  // /text/turn's "I don't know this one" and be handed a microphone they had refused —
  // the recording screen then rendered "LISTENING" with a running timer on a mic with
  // no permission. 01 Idle has had this redirect all along; blank and reveal did not.
  useEffect(() => {
    if (sticky) router.replace(`/text/turn?term=${index}&sticky=1`)
  }, [sticky, index, router])

  if (sticky) return null
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
          <AppBar variant="leftIconButtonOnly" leftIcon={<CloseIcon />} leftLabel="Leave" onLeft={() => goToExit(router)}>
            <ProgressIndicator progress={progressFor(index)} thickness="16" label="Questions" current={index} total={TOTAL_TERMS} />
          </AppBar>
          <SessionFraction current={index} total={TOTAL_TERMS} moreToCome={revisitsPending()} />
        </>
      }
      bottomContent={
        <Button CTA="Skip" variant="Tertiary" size="M" fullWidth onClick={moveOn} />
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="determined" />
        {/* One bubble, not two. The title said "Now say it back.", the second bubble said
            "Say it back, in your own words" and the mic is named "Say it back" — the same
            sentence three times, and the 72px it cost is what pushed this screen past the
            region. The only word the second bubble added was "own", so it moved up. */}
        <ChatBubble
          showTitle
          title="Here’s the answer. Now say it back, in your own words."
          body={current.answer}
          className={styles.bubble}
        />
        {/* One fixed mic region, on every voice screen. The control used to sit at
            eight different heights and jump 91px on the very tap that starts
            recording. sprint-context.md, 2026-09-22. */}
        <div className={micRegionClass}>
          <MicButton state="Idle" label="Say it back" onClick={() => router.push(`/session/recording/${index}?repeat=1`)} />
        </div>
      </div>
    </ScreenShell>
  )
}
