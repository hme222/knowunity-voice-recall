'use client'

import { use, useEffect } from 'react'
import { useRedirect } from '@/lib/navigation'
import { useRouter } from 'next/navigation'
import { SessionBar } from '../../SessionBar'
import {
  micRegionClass,
  Button,
  ChatBubble,
  MascotSlot,
  MicButton,
  MicCaption,
  ScreenShell,
} from '@/components'
import { getTerm, micGate, useSticky, SUBJECT } from '@/lib/session'
import styles from '../../interrupt.module.css'

// A genuinely blank term — not a near-miss, nothing at all. History: docs/code-history.md#h-048

export default function BlankPage({ params }: { params: Promise<{ term: string }> }) {
  const router = useRouter()
  const sticky = useSticky()
  const { term } = use(params)
  const index = Number(term)

  // voice-ux.md §3: a denied mic stays denied for the SESSION, not for one turn. History: docs/code-history.md#h-049
  useEffect(() => {
    if (sticky) router.replace(`/text/turn?term=${index}&sticky=1`)
  }, [sticky, index, router])

  const current = getTerm(index)
  useRedirect(!current, '/session/resume')
  if (sticky) return null

  if (!current) return null

  return (
    <ScreenShell
      mic={
        <div className={micRegionClass}>
          {/* One encouraged attempt, then the answer — voice-ux.md marks this state Must and specifies exactly that. History: docs/code-history.md#h-050 */}
          <MicButton state="Idle" label="Say whatever you've got" onClick={() => router.push(micGate(`/session/recording/${index}?blank=1`, `/text/turn?term=${index}`))} />
          {/* The encouragement moved under the mic so the question can stay on screen. */}
          <MicCaption label="Drawing a blank?" body="Say whatever you’ve got, even half of it." />
        </div>
      }
      topNavigation={<SessionBar index={index} />}
      bottomContent={
        <div className={styles.actions}>
          {/* This screen removed the typing option at the exact moment a student said
              they were stuck — speak or be shown the answer, nothing in between. */}
          {/* Text-weight, not a filled bar: the mic is the primary action and the filled
              "Type instead" outweighed it (senior review, 2026-10-12). Still full width
              and in the same place on every voice screen. */}
          <Button
            CTA="Type instead"
            variant="Tertiary"
            size="M"
            fullWidth
            onClick={() => router.push(`/text/turn?term=${index}`)}
          />
          {/* "Reveal answer", the miss screen's name for the same move (craft critic, 2026-10-13). */}
          <Button CTA="Reveal answer" variant="Tertiary" size="M" fullWidth onClick={() => router.push(`/session/reveal/${index}`)} />
        </div>
      }
    >
      <div className={styles.body}>
        {/* `laughing`, not `determined`, from 2026-10-07 by the designer: the half-lidded
            face read as frustrated at a student who had just said they were stuck.
            design-system.md § Knowie expressions. */}
        <MascotSlot size="2XL" expression="laughing" />
        {/* The question stays in context — designer, 2026-10-08. The bubble used to be
            replaced by the encouragement, so a student who said "I don't know this one"
            lost sight of what "this one" was. Same bubble as 01 Idle. */}
        <ChatBubble className={styles.bubble} showTitle title={`${SUBJECT} · Explain: `} titleAccent={current.name} body={current.prompt} />
      </div>
    </ScreenShell>
  )
}
