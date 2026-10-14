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
import { confidenceFor, getTerm, micGate, nextAfter, recordOutcome, useSession, useSticky, XP } from '@/lib/session'
import styles from './reveal.module.css'

// 05a Reveal answer — Figma frame "05a Reveal answer result" (15752:17156), which matches the real reference IMG_7513:… History: docs/code-history.md#h-081

export default function RevealPage({ params }: { params: Promise<{ term: string }> }) {
  const router = useRouter()
  const { term } = use(params)
  const index = Number(term)
  const sticky = useSticky()
  const wasSure = Boolean(confidenceFor(useSession(), index)?.wasSure)

  // voice-ux.md §3: a denied mic stays denied for the SESSION, not for one turn. History: docs/code-history.md#h-082
  useEffect(() => {
    if (sticky) router.replace(`/text/turn?term=${index}&sticky=1`)
  }, [sticky, index, router])

  const current = getTerm(index)
  useRedirect(!current, '/session/resume')
  if (sticky) return null

  if (!current) return null

  function moveOn() {
    recordOutcome(index, 'Revealed')
    router.push(nextAfter(index))
  }

  return (
    <ScreenShell
      mic={
        <div className={micRegionClass}>
          <MicButton state="Idle" label="Say it back" onClick={() => router.push(micGate(`/session/recording/${index}?repeat=1`, `/text/turn?term=${index}`))} />
          {/* Labelled and marked optional (senior review, 2026-10-12): an unlabelled mic
              against "Continue" top right read as two competing ways on. Continue is the
              quiet way past; this says what the mic is for and what it is worth. */}
          <MicCaption label="Optional" body={`Say it back in your own words for +${XP.repeat} XP`} />
        </div>
      }
      topNavigation={<SessionBar index={index} />}
      // "Continue" in the action zone, as a pill like every other Continue (craft critic,
      // 2026-10-13: text here, a pill on Pass), but Secondary: the say-it-back mic is the
      // invitation and this is the quiet way past it. The top-right slot only ever means
      // Skip (coherence critic, 2026-10-13).
      bottomContent={<Button CTA="Continue" variant="Secondary" size="M" fullWidth onClick={moveOn} />}
    >
      <div className={styles.body}>
        {/* `excited`: the answer, and an invitation to say it back; the miss before was `sad` (designer, 2026-10-14: the face changes with the moment, so no two screens in a row look the same). */}
        <MascotSlot size="2XL" expression="excited" />
        {/* One bubble, not two. The title said "Now say it back.", the second bubble said
            "Say it back, in your own words" and the mic is named "Say it back" — the same
            sentence three times, and the 72px it cost is what pushed this screen past the
            region. The only word the second bubble added was "own", so it moved up. */}
        <ChatBubble
          showTitle
          // One line: the invitation lives once, under the mic it is for. Two lines
          // here put the screen 4px past the region at 390x668 (system critic).
          title="Here’s the answer."
          body={current.answer}
          className={styles.bubble}
        />
        {/* The confident miss, named at the answer (Duolingo design review). */}
        {wasSure && <p className={styles.sure}>You were sure. This one&rsquo;s worth remembering.</p>}
      </div>
    </ScreenShell>
  )
}
