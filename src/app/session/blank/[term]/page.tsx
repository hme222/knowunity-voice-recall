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
  ScreenShell,
} from '@/components'
import { CloseIcon } from '@/components/icons'
import { getTerm, useSticky } from '@/lib/session'
import styles from '../../interrupt.module.css'

// A genuinely blank term — not a near-miss, nothing at all. This answers the Design
// Brief's first open question, which had gone unanswered: encourage one attempt, then
// reveal. A wrong attempt still beats silence for retrieval.
//
// Distinct from Skip, which stays a silent exit. Skip is avoidance; this is a student
// saying "I don't know this", which is different information.

export default function BlankPage({ params }: { params: Promise<{ term: string }> }) {
  const router = useRouter()
  const sticky = useSticky()
  const { term } = use(params)
  const index = Number(term)

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

  return (
    <ScreenShell
      topNavigation={
        <AppBar
          variant="leftIconButtonOnly"
          leftIcon={<CloseIcon />}
          leftLabel="Leave"
          onLeft={() => goToExit(router)}
        />
      }
      bottomContent={
        <div className={styles.actions}>
          {/* This screen removed the typing option at the exact moment a student said
              they were stuck — speak or be shown the answer, nothing in between. */}
          <Button
            CTA="Type instead"
            variant="Secondary"
            size="M"
            fullWidth
            onClick={() => router.push(`/text/turn?term=${index}`)}
          />
          <Button CTA="Just show me" variant="Tertiary" size="M" fullWidth onClick={() => router.push(`/session/reveal/${index}`)} />
        </div>
      }
    >
      <div className={styles.body}>
        <MascotSlot size="2XL" expression="determined" />
        <ChatBubble
          showTitle
          title="Drawing a blank?"
          body="Say whatever you've got — even half of it. Getting it wrong out loud sticks better than reading the answer, and nothing here is scored against you."
        />
        {/* One fixed mic region, on every voice screen. The control used to sit at
            eight different heights and jump 91px on the very tap that starts
            recording. sprint-context.md, 2026-09-22. */}
        <div className={micRegionClass}>
          <MicButton state="Idle" label="Say whatever you've got" onClick={() => router.push(`/session/recording/${index}`)} />
        </div>
      </div>
    </ScreenShell>
  )
}
